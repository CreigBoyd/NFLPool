import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { setupAdmin } from './adminSetup.js';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nfl_pool',
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database and create tables
export async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Create tables
    await createTables();
    
    // Add indexes for performance
    await addIndexes();
    
    // Ensure all profile columns exist
    await ensureProfileColumns();
    
    // Setup admin user (secure method)
    await setupAdmin(pool);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      status ENUM('pending', 'age_pending', 'approved', 'suspended') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      display_name VARCHAR(100) DEFAULT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      notification_preferences JSON DEFAULT NULL,
      balance DECIMAL(10,2) DEFAULT '100.00',
      reset_token VARCHAR(255) DEFAULT NULL,
      reset_token_expires DATETIME DEFAULT NULL,
      age_verified TINYINT(1) DEFAULT '0',
      date_of_birth DATE DEFAULT NULL,
      age_verification_date TIMESTAMP NULL DEFAULT NULL,
      admin_approved TINYINT(1) DEFAULT '0',
      approval_date TIMESTAMP NULL DEFAULT NULL,
      approved_by INT DEFAULT NULL,
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `;

  const createPasswordResetsTable = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createRefreshTokensTable = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      token VARCHAR(512) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createPoolsTable = `
    CREATE TABLE IF NOT EXISTS pools (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      week_number INT NOT NULL,
      season_year INT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `;

  const createGamesTable = `
    CREATE TABLE IF NOT EXISTS games (
      id INT PRIMARY KEY AUTO_INCREMENT,
      pool_id INT NOT NULL,
      home_team VARCHAR(50) NOT NULL,
      away_team VARCHAR(50) NOT NULL,
      game_date DATETIME NOT NULL,
      home_score INT DEFAULT NULL,
      away_score INT DEFAULT NULL,
      status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      quarter INT DEFAULT 1,
      time_remaining VARCHAR(10) DEFAULT '15:00',
      possession VARCHAR(50) DEFAULT NULL,
      FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
    )
  `;

  const createPicksTable = `
    CREATE TABLE IF NOT EXISTS picks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      pool_id INT NOT NULL,
      game_id INT NOT NULL,
      selected_team VARCHAR(50) NOT NULL,
      confidence_points INT DEFAULT 1,
      is_correct TINYINT(1) DEFAULT NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_game_pick (user_id, game_id)
    )
  `;

  const createUserScoresTable = `
    CREATE TABLE IF NOT EXISTS user_scores (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      pool_id INT NOT NULL,
      total_points INT DEFAULT 0,
      correct_picks INT DEFAULT 0,
      total_picks INT DEFAULT 0,
      calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_pool_score (user_id, pool_id)
    )
  `;

  const createGameScoresTable = `
    CREATE TABLE IF NOT EXISTS game_scores (
      id INT PRIMARY KEY AUTO_INCREMENT,
      game_id INT NOT NULL,
      quarter INT DEFAULT 1,
      time_remaining VARCHAR(10) DEFAULT NULL,
      home_score INT DEFAULT 0,
      away_score INT DEFAULT 0,
      possession VARCHAR(50) DEFAULT NULL,
      down_distance VARCHAR(20) DEFAULT NULL,
      field_position VARCHAR(10) DEFAULT NULL,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `;

  const createPoolStatsTable = `
    CREATE TABLE IF NOT EXISTS pool_stats (
      id INT PRIMARY KEY AUTO_INCREMENT,
      pool_id INT NOT NULL,
      most_picked_team VARCHAR(50) DEFAULT NULL,
      least_picked_team VARCHAR(50) DEFAULT NULL,
      average_confidence DECIMAL(5,2) DEFAULT NULL,
      total_participants INT DEFAULT 0,
      stats_data JSON DEFAULT NULL,
      calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
    )
  `;

  const createSideBetsTable = `
    CREATE TABLE IF NOT EXISTS side_bets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      created_by INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      pool_id INT DEFAULT NULL,
      bet_type ENUM('multiple_choice', 'prediction', 'over_under', 'yes_no') DEFAULT 'multiple_choice',
      status ENUM('open', 'closed', 'settled', 'cancelled') DEFAULT 'open',
      deadline DATETIME NOT NULL,
      entry_fee DECIMAL(10,2) DEFAULT '0.00',
      max_participants INT DEFAULT NULL,
      is_private TINYINT(1) DEFAULT '0',
      invite_code VARCHAR(10) DEFAULT NULL UNIQUE,
      winner_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE SET NULL,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `;

  const createSideBetOptionsTable = `
    CREATE TABLE IF NOT EXISTS side_bet_options (
      id INT PRIMARY KEY AUTO_INCREMENT,
      side_bet_id INT NOT NULL,
      option_text VARCHAR(255) NOT NULL,
      is_correct TINYINT(1) DEFAULT NULL,
      odds DECIMAL(5,2) DEFAULT '1.00',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (side_bet_id) REFERENCES side_bets(id) ON DELETE CASCADE
    )
  `;

  const createSideBetParticipantsTable = `
    CREATE TABLE IF NOT EXISTS side_bet_participants (
      id INT PRIMARY KEY AUTO_INCREMENT,
      side_bet_id INT NOT NULL,
      user_id INT NOT NULL,
      selected_option_id INT DEFAULT NULL,
      prediction_value DECIMAL(10,2) DEFAULT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payout DECIMAL(10,2) DEFAULT '0.00',
      amount_wagered DECIMAL(10,2) DEFAULT '0.00',
      potential_payout DECIMAL(10,2) DEFAULT '0.00',
      FOREIGN KEY (side_bet_id) REFERENCES side_bets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (selected_option_id) REFERENCES side_bet_options(id) ON DELETE SET NULL,
      UNIQUE KEY unique_user_side_bet (user_id, side_bet_id)
    )
  `;

  const createSideBetInvitesTable = `
    CREATE TABLE IF NOT EXISTS side_bet_invites (
      id INT PRIMARY KEY AUTO_INCREMENT,
      side_bet_id INT NOT NULL,
      invited_by INT NOT NULL,
      invited_user_id INT DEFAULT NULL,
      invited_email VARCHAR(100) DEFAULT NULL,
      status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
      invite_token VARCHAR(32) UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (side_bet_id) REFERENCES side_bets(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createWebsocketSessionsTable = `
    CREATE TABLE IF NOT EXISTS websocket_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.execute(createUsersTable);
    await pool.execute(createPasswordResetsTable);
    await pool.execute(createRefreshTokensTable);
    await pool.execute(createPoolsTable);
    await pool.execute(createGamesTable);
    await pool.execute(createPicksTable);
    await pool.execute(createUserScoresTable);
    await pool.execute(createGameScoresTable);
    await pool.execute(createPoolStatsTable);
    await pool.execute(createSideBetsTable);
    await pool.execute(createSideBetOptionsTable);
    await pool.execute(createSideBetParticipantsTable);
    await pool.execute(createSideBetInvitesTable);
    await pool.execute(createWebsocketSessionsTable);
    
    console.log('✅ All tables created/updated successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function addIndexes() {
  const indexes = [
    { table: 'picks', index: 'idx_picks_user_pool', definition: 'user_id, pool_id' },
    { table: 'picks', index: 'idx_picks_game', definition: 'game_id' },
    { table: 'games', index: 'idx_games_pool_status', definition: 'pool_id, status' },
    { table: 'games', index: 'idx_games_date', definition: 'game_date' },
    { table: 'user_scores', index: 'idx_user_scores_pool', definition: 'pool_id, total_points DESC' },
    { table: 'password_resets', index: 'idx_password_resets_token', definition: 'token' },
    { table: 'password_resets', index: 'idx_password_resets_expires', definition: 'expires_at' },
    { table: 'refresh_tokens', index: 'idx_refresh_tokens_token', definition: 'token' },
    { table: 'refresh_tokens', index: 'idx_refresh_tokens_user', definition: 'user_id' },
    { table: 'refresh_tokens', index: 'idx_refresh_tokens_expires', definition: 'expires_at' },
    { table: 'side_bets', index: 'idx_side_bets_status', definition: 'status, deadline' },
    { table: 'side_bets', index: 'idx_side_bets_code', definition: 'invite_code' },
    { table: 'pools', index: 'idx_pools_status', definition: 'status, start_date' },
    // Add these to your indexes array:
{ table: 'users', index: 'idx_age_verified', definition: 'age_verified' },
{ table: 'users', index: 'idx_admin_approved', definition: 'admin_approved' },
{ table: 'users', index: 'idx_status', definition: 'status' },
{ table: 'side_bet_participants', index: 'idx_participants_side_bet', definition: 'side_bet_id' },
{ table: 'side_bet_participants', index: 'idx_participants_user', definition: 'user_id' },
{ table: 'side_bet_participants', index: 'idx_side_bet_participants_user', definition: 'user_id' },
{ table: 'picks', index: 'idx_picks_pool_user', definition: 'pool_id, user_id' },
{ table: 'game_scores', index: 'idx_game_scores_game', definition: 'game_id' },
  ];

  try {
    for (const {table, index, definition} of indexes) {
      const [rows] = await pool.execute(`
        SELECT COUNT(1) AS count FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?
      `, [table, index]);

      if (rows[0].count === 0) {
        await pool.execute(`CREATE INDEX ${index} ON ${table} (${definition})`);
        console.log(`✅ Created index ${index} on table ${table}`);
      }
    }
    console.log('✅ Database indexes checked/created successfully');
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
  }
}

async function ensureProfileColumns() {
  const profileColumns = [
    {
      name: 'display_name',
      definition: 'display_name VARCHAR(100) DEFAULT NULL'
    },
    {
      name: 'avatar_url', 
      definition: 'avatar_url VARCHAR(255) DEFAULT NULL'
    },
    {
      name: 'bio',
      definition: 'bio TEXT DEFAULT NULL'
    },
    {
      name: 'phone',
      definition: 'phone VARCHAR(20) DEFAULT NULL'
    },
    {
      name: 'notification_preferences',
      definition: 'notification_preferences JSON DEFAULT NULL'
    }
  ];

  for (const column of profileColumns) {
    try {
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?
      `, [dbConfig.database, column.name]);

      if (columns.length === 0) {
        await pool.execute(`ALTER TABLE users ADD COLUMN ${column.definition}`);
      }
    } catch (error) {
      console.error(`Error checking/adding column ${column.name}:`, error);
    }
  }
}

// Cleanup expired tokens (called by cron job)
export async function cleanupExpiredTokens() {
  try {
    const [passwordResets] = await pool.execute(
      'DELETE FROM password_resets WHERE expires_at < NOW()'
    );
    
    const [refreshTokens] = await pool.execute(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    
    console.log(`✅ Cleaned up ${passwordResets.affectedRows} expired password resets and ${refreshTokens.affectedRows} expired refresh tokens`);
    return { passwordResets: passwordResets.affectedRows, refreshTokens: refreshTokens.affectedRows };
  } catch (error) {
    console.error('❌ Token cleanup failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
}

export { pool };
export default pool;