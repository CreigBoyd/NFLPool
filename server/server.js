import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import cron from 'node-cron';
import { initializeDatabase, pool, testConnection, cleanupExpiredTokens, closeDatabase } from './database.js';
import { 
  registerUser, 
  loginUser, 
  authenticateToken, 
  requireAdmin, 
  requestPasswordReset, 
  resetPassword,
  refreshAccessToken,
  logoutUser
} from './auth.js';
import { 
  validateEmail, 
  validateUsername, 
  validatePoolId, 
  validateGameId,
  validatePicks,
  validateFields,
  validatePagination
} from './validation.js';
import { errorHandler, asyncHandler, notFoundHandler, AppError } from './errorHandler.js';
import nodemailer from 'nodemailer';

dotenv.config();

// ============================================
// ENVIRONMENT VALIDATION
// ============================================
console.log('🔐 Validating environment configuration...');

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Security checks
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    console.error('❌ FATAL: JWT_SECRET must be changed in production');
    console.error('Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
  console.log('✅ JWT_SECRET is configured');
  
  if (!process.env.REFRESH_SECRET) {
    console.warn('⚠️  REFRESH_SECRET not set, using JWT_SECRET');
  }
} else {
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET in development');
  }
}

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️  SMTP not fully configured - email notifications will be disabled');
} else {
  console.log('✅ SMTP is configured');
}

if (!process.env.ADMIN_EMAIL) {
  console.warn('⚠️  ADMIN_EMAIL not set - new user notifications will not be sent');
} else {
  console.log('✅ Admin email is configured');
}

console.log('🔐 Environment validation complete\n');

// ============================================
// APP INITIALIZATION
// ============================================
// APP INITIALIZATION
const app = express();

app.set('trust proxy', true);

// Create HTTP server and PORT before initializing Socket.IO
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Normalize CLIENT_URL and build allowed origins list
const clientUrlEnv = process.env.CLIENT_URL || '';
let clientOrigin = null;
try {
  clientOrigin = clientUrlEnv ? new URL(clientUrlEnv).origin : null;
} catch (e) {
  console.warn('Invalid CLIENT_URL env var:', clientUrlEnv);
}

const allowedOrigins = [
  clientOrigin,
  'https://creigboyd.github.io',
  'http://localhost:5173',
  'http://localhost:3001'
].filter(Boolean).map(o => o.replace(/\/$/, ''));

// Socket.IO with normalized CORS origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});



// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Socket.IO
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// CORS Configuration
// CORS Configuration (dynamic, normalized origins)
app.use(cors({
  origin: (incomingOrigin, callback) => {
    // allow non-browser requests (no Origin header)
    if (!incomingOrigin) return callback(null, true);

    const normalized = incomingOrigin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    console.warn('Blocked CORS request from', incomingOrigin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true, // set false only if you never use cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure preflight responses include the CORS headers
app.options('*', cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, // 15 minutes max: 5, message: { error: 'Too many attempts, please try again later', errorCode: 'RATE_LIMIT' }, standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => ipKeyGenerator(req) });

const apiLimiter = rateLimit({ windowMs: 1 * 60 * 1000, // 1 minute max: 100, message: { error: 'Too many requests, please slow down', errorCode: 'RATE_LIMIT' }, standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => ipKeyGenerator(req) });

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ============================================
// EMAIL TRANSPORTER
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ============================================
// DATABASE INITIALIZATION
// ============================================
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// ============================================
// SOCKET.IO FOR REAL-TIME UPDATES
// ============================================
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-pool', (poolId) => {
    socket.join(`pool-${poolId}`);
    console.log(`User joined pool ${poolId}`);
  });

  socket.on('leave-pool', (poolId) => {
    socket.leave(`pool-${poolId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// ============================================
// CRON JOBS
// ============================================

// Cleanup expired tokens daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const result = await cleanupExpiredTokens();
    console.log('✅ Daily cleanup completed:', result);
  } catch (error) {
    console.error('❌ Daily cleanup failed:', error);
  }
});

// Update pool statuses every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await updatePoolStatuses();
  } catch (error) {
    console.error('❌ Pool status update failed:', error);
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', asyncHandler(async (req, res) => {
  const dbHealthy = await testConnection();
  
  if (!dbHealthy) {
    return res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ 
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '603E Pool API',
    version: '1.0.0',
    status: 'running'
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updatePoolStatuses() {
  try {
    const now = new Date();
    
    await pool.execute(`
      UPDATE pools 
      SET status = 'active' 
      WHERE status = 'upcoming' 
      AND start_date <= ?
    `, [now]);
    
    await pool.execute(`
      UPDATE pools 
      SET status = 'completed' 
      WHERE status = 'active' 
      AND end_date <= ?
    `, [now]);
  } catch (error) {
    console.error('Error updating pool statuses:', error);
  }
}

async function calculateUserScores(poolId) {
  try {
    const [picks] = await pool.execute(`
      SELECT 
        p.user_id,
        p.selected_team,
        p.confidence_points,
        g.home_team,
        g.away_team,
        g.home_score,
        g.away_score,
        g.status,
        CASE 
          WHEN g.status = 'completed' AND g.home_score IS NOT NULL AND g.away_score IS NOT NULL THEN
            CASE 
              WHEN (g.home_score > g.away_score AND p.selected_team = g.home_team) OR 
                   (g.away_score > g.home_score AND p.selected_team = g.away_team) THEN TRUE
              ELSE FALSE
            END
          ELSE NULL
        END as is_correct
      FROM picks p
      JOIN games g ON p.game_id = g.id
      WHERE g.pool_id = ?
    `, [poolId]);

    const userScores = {};
    picks.forEach(pick => {
      if (!userScores[pick.user_id]) {
        userScores[pick.user_id] = {
          total_points: 0,
          correct_picks: 0,
          total_picks: 0
        };
      }

      userScores[pick.user_id].total_picks++;

      if (pick.is_correct === true) {
        userScores[pick.user_id].correct_picks++;
        userScores[pick.user_id].total_points += pick.confidence_points || 1;
      }
    });

    for (const [userId, scores] of Object.entries(userScores)) {
      await pool.execute(`
        INSERT INTO user_scores (user_id, pool_id, total_points, correct_picks, total_picks)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          total_points = VALUES(total_points),
          correct_picks = VALUES(correct_picks),
          total_picks = VALUES(total_picks)
      `, [userId, poolId, scores.total_points, scores.correct_picks, scores.total_picks]);
    }
  } catch (error) {
    console.error('Error calculating user scores:', error);
    throw error;
  }
}

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new AppError('All fields required', 400, 'MISSING_FIELDS');
  }

  const result = await registerUser(username, email, password);

  if (result.success) {
    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } else {
    throw new AppError(result.error, 400, 'REGISTRATION_FAILED');
  }
}));

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Username and password required', 400, 'MISSING_FIELDS');
  }

  const result = await loginUser(username, password);

  if (result.success) {
    res.json(result);
  } else {
    throw new AppError(result.error, 401, 'LOGIN_FAILED');
  }
}));

app.post('/api/auth/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
  }

  const result = await refreshAccessToken(refreshToken);
  res.json(result);
}));

app.post('/api/auth/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user.userId;

  await logoutUser(userId, refreshToken);
  res.json({ message: 'Logged out successfully' });
}));

app.post('/api/auth/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  const { emailOrUsername } = req.body;

  if (!emailOrUsername) {
    throw new AppError('Email or username is required', 400, 'MISSING_FIELD');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    throw new AppError('Email service is not configured', 503, 'SERVICE_UNAVAILABLE');
  }

  const result = await requestPasswordReset(emailOrUsername);

  if (result.success) {
    res.json({ message: result.message });
  } else {
    throw new AppError(result.error, 400, 'PASSWORD_RESET_FAILED');
  }
}));

app.post('/api/auth/reset-password', authLimiter, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400, 'MISSING_FIELDS');
  }

  const result = await resetPassword(token, newPassword);

  if (result.success) {
    res.json({ message: result.message });
  } else {
    throw new AppError(result.error, 400, 'PASSWORD_RESET_FAILED');
  }
}));

// ============================================
// CONTACT ROUTES
// ============================================

app.post('/api/contact', validateFields(['name', 'email', 'subject', 'message']), asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!validateEmail(email)) {
    throw new AppError('Invalid email address', 400, 'INVALID_EMAIL');
  }

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
    subject: `[Contact Form] ${subject}`,
    text: `You have received a message from ${name} (${email}):\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
           <p><strong>Message:</strong></p>
           <p>${message.replace(/\n/g, '<br>')}</p>`,
  };

  await transporter.sendMail(mailOptions);
  res.json({ success: true, message: 'Message sent successfully' });
}));

// ============================================
// PROFILE ROUTES
// ============================================

app.get('/api/profile', authenticateToken, asyncHandler(async (req, res) => {
  const [users] = await pool.execute(
    'SELECT id, username, email, display_name, avatar_url, bio, phone, notification_preferences, created_at FROM users WHERE id = ?',
    [req.user.userId]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = users[0];
  
  if (user.notification_preferences) {
    try {
      if (typeof user.notification_preferences === 'string') {
        user.notification_preferences = JSON.parse(user.notification_preferences);
      }
    } catch (parseError) {
      console.error('Error parsing notification preferences:', parseError);
      user.notification_preferences = { email: true, push: false };
    }
  } else {
    user.notification_preferences = { email: true, push: false };
  }

  res.json(user);
}));

app.put('/api/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { display_name, bio, phone, notification_preferences } = req.body;

  const notificationPrefsString = notification_preferences ? 
    JSON.stringify(notification_preferences) : 
    JSON.stringify({ email: true, push: false });

  await pool.execute(
    'UPDATE users SET display_name = ?, bio = ?, phone = ?, notification_preferences = ? WHERE id = ?',
    [display_name || null, bio || null, phone || null, notificationPrefsString, req.user.userId]
  );

  res.json({ message: 'Profile updated successfully' });
}));

// ============================================
// POOL ROUTES
// ============================================

app.get('/api/pools/:poolId', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [pools] = await pool.execute(
    'SELECT id, name, week_number, season_year, start_date, end_date, status FROM pools WHERE id = ?',
    [poolId]
  );

  if (pools.length === 0) {
    throw new AppError('Pool not found', 404, 'POOL_NOT_FOUND');
  }

  res.json(pools[0]);
}));

app.get('/api/pools', authenticateToken, asyncHandler(async (req, res) => {
  await updatePoolStatuses();
  
  const [pools] = await pool.execute(
    'SELECT id, name, week_number, season_year, start_date, end_date, status FROM pools WHERE status IN ("upcoming", "active") ORDER BY start_date'
  );
  res.json(pools);
}));

app.get('/api/pools/paginated', authenticateToken, asyncHandler(async (req, res) => {
  const { page: rawPage, limit: rawLimit, status } = req.query;
  
  const validation = validatePagination(rawPage || 1, rawLimit || 10);
  if (!validation.valid) {
    throw new AppError('Invalid pagination parameters', 400, 'INVALID_PAGINATION');
  }
  
  const { page, limit } = validation;
  const offset = (page - 1) * limit;

  await updatePoolStatuses();
  
  let query = 'SELECT id, name, week_number, season_year, start_date, end_date, status FROM pools';
  let countQuery = 'SELECT COUNT(*) as total FROM pools';
  const params = [];
  
  if (status && ['upcoming', 'active', 'completed'].includes(status)) {
    query += ' WHERE status = ?';
    countQuery += ' WHERE status = ?';
    params.push(status);
  } else {
    query += ' WHERE status IN ("upcoming", "active")';
    countQuery += ' WHERE status IN ("upcoming", "active")';
  }
  
  query += ' ORDER BY start_date DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const [pools] = await pool.execute(query, params);
  const [countResult] = await pool.execute(countQuery, status ? [status] : []);
  
  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);
  
  res.json({
    pools,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}));

app.get('/api/pools/:poolId/games', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [games] = await pool.execute(
    'SELECT id, home_team, away_team, game_date, status, home_score, away_score, quarter, time_remaining, possession FROM games WHERE pool_id = ? ORDER BY game_date',
    [poolId]
  );
  res.json(games);
}));
app.get('/api/pools/:poolId/leaderboard/paginated', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const { page: rawPage, limit: rawLimit } = req.query;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const validation = validatePagination(rawPage || 1, rawLimit || 20);
  if (!validation.valid) {
    throw new AppError('Invalid pagination parameters', 400, 'INVALID_PAGINATION');
  }

  const { page, limit } = validation;
  const offset = (page - 1) * limit;

  const poolIdInt = parseInt(poolId, 10);

  const query = `
    SELECT 
      u.username,
      u.display_name,
      COALESCE(us.total_points, 0) as total_points,
      COALESCE(us.correct_picks, 0) as correct_picks,
      COALESCE(us.total_picks, 0) as total_picks,
      COALESCE(ROUND((us.correct_picks / NULLIF(us.total_picks, 0)) * 100, 1), 0) as accuracy
    FROM user_scores us
    JOIN users u ON us.user_id = u.id
    WHERE us.pool_id = ?
    ORDER BY us.total_points DESC, us.correct_picks DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM user_scores
    WHERE pool_id = ?
  `;

  const [leaderboard] = await pool.execute(query, [poolIdInt]);
  const [countResult] = await pool.execute(countQuery, [poolIdInt]);

  const total = countResult[0]?.total || 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    ...entry,
    rank: offset + index + 1
  }));

  res.json({
    leaderboard: rankedLeaderboard,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}));

app.get('/api/pools/:poolId/live-scores', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [scores] = await pool.execute(`
    SELECT g.*, gs.quarter, gs.time_remaining, gs.possession, gs.down_distance, gs.field_position, gs.last_updated
    FROM games g
    LEFT JOIN game_scores gs ON g.id = gs.game_id
    WHERE g.pool_id = ?
    ORDER BY g.game_date
  `, [poolId]);

  res.json(scores);
}));

app.get('/api/pools/:poolId/stats', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [pickStats] = await pool.execute(`
    SELECT 
      g.home_team,
      g.away_team,
      COUNT(CASE WHEN p.selected_team = g.home_team THEN 1 END) as home_picks,
      COUNT(CASE WHEN p.selected_team = g.away_team THEN 1 END) as away_picks,
      AVG(p.confidence_points) as avg_confidence
    FROM games g
    LEFT JOIN picks p ON g.id = p.game_id
    WHERE g.pool_id = ?
    GROUP BY g.id, g.home_team, g.away_team
  `, [poolId]);

  const [poolStats] = await pool.execute(`
    SELECT 
      COUNT(DISTINCT p.user_id) as total_participants,
      AVG(p.confidence_points) as avg_confidence,
      COUNT(p.id) as total_picks
    FROM picks p
    JOIN games g ON p.game_id = g.id
    WHERE g.pool_id = ?
  `, [poolId]);

  res.json({
    pickStats,
    poolStats: poolStats[0] || {}
  });
}));

app.post('/api/side-bets', authenticateToken, asyncHandler(async (req, res) => {
  const { title, description, bet_type, deadline, options, entry_fee, max_participants, is_private, pool_id } = req.body;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check creator has enough balance if there's an entry fee
    if (entry_fee && entry_fee > 0) {
      const [creator] = await connection.execute(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.userId]
      );
      
      if (creator[0].balance < entry_fee) {
        throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }
      
      // Deduct entry fee from creator
      await connection.execute(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [entry_fee, req.user.userId]
      );
    }

    const invite_code = is_private ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

    const [result] = await connection.execute(
      'INSERT INTO side_bets (created_by, title, description, bet_type, deadline, entry_fee, max_participants, is_private, invite_code, pool_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.userId, 
        title, 
        description, 
        bet_type, 
        deadline, 
        entry_fee || 0, 
        max_participants || null,
        is_private || false,
        invite_code, 
        pool_id || null
      ]
    );

    const sideBetId = result.insertId;

    // Insert options
    if ((bet_type === 'multiple_choice' || bet_type === 'binary') && options && Array.isArray(options)) {
      for (const option of options) {
        await connection.execute(
          'INSERT INTO side_bet_options (side_bet_id, option_text, odds) VALUES (?, ?, ?)',
          [sideBetId, option.text, option.odds || 1.00]
        );
      }
    }

    // Auto-join creator with entry fee recorded
    await connection.execute(
      'INSERT INTO side_bet_participants (side_bet_id, user_id, amount_wagered) VALUES (?, ?, ?)',
      [sideBetId, req.user.userId, entry_fee || 0]
    );

    await connection.commit();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('side-bet-created', { sideBetId, title, creator: req.user.username });

    res.status(201).json({ 
      message: 'Side bet created successfully', 
      sideBetId, 
      invite_code
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));


app.get('/api/side-bets', authenticateToken, async (req, res) => {
  const { status, pool_id } = req.query;

  let query = `
    SELECT sb.*, u.username as creator_name,
           COUNT(sbp.id) as participant_count,
           EXISTS(SELECT 1 FROM side_bet_participants WHERE side_bet_id = sb.id AND user_id = ?) as user_participating,
    (sb.created_by = ?) as is_creator
    FROM side_bets sb
    JOIN users u ON sb.created_by = u.id
    LEFT JOIN side_bet_participants sbp ON sb.id = sbp.side_bet_id
    WHERE (sb.is_private = FALSE OR sb.created_by = ? OR EXISTS(SELECT 1 FROM side_bet_participants WHERE side_bet_id = sb.id AND user_id = ?))
  `;

  const params = [req.user.userId, req.user.userId, req.user.userId, req.user.userId];

  if (status) {
    query += ' AND sb.status = ?';
    params.push(status);
  }

  if (pool_id) {
    query += ' AND sb.pool_id = ?';
    params.push(pool_id);
  }

  query += ' GROUP BY sb.id ORDER BY sb.created_at DESC';

  try {
    const [sideBets] = await pool.execute(query, params);
    res.json(sideBets);
  } catch (error) {
    console.error('Error fetching side bets:', error);
    res.status(500).json({ error: 'Failed to fetch side bets' });
  }
});

app.get('/api/side-bets/:sideBetId', authenticateToken, async (req, res) => {
  const { sideBetId } = req.params;

  try {
    // Get side bet details
    const [sideBets] = await pool.execute(
      'SELECT sb.*, u.username as creator_name FROM side_bets sb JOIN users u ON sb.created_by = u.id WHERE sb.id = ?',
      [sideBetId]
    );

    if (sideBets.length === 0) {
      return res.status(404).json({ error: 'Side bet not found' });
    }

    const sideBet = sideBets[0];

    // Get options if multiple choice
    if (sideBet.bet_type === 'multiple_choice') {
      const [options] = await pool.execute(
        'SELECT * FROM side_bet_options WHERE side_bet_id = ? ORDER BY id',
        [sideBetId]
      );
      sideBet.options = options;
    }

    // Get participants
    const [participants] = await pool.execute(
      'SELECT sbp.*, u.username, sbo.option_text FROM side_bet_participants sbp JOIN users u ON sbp.user_id = u.id LEFT JOIN side_bet_options sbo ON sbp.selected_option_id = sbo.id WHERE sbp.side_bet_id = ?',
      [sideBetId]
    );
    sideBet.participants = participants;

    res.json(sideBet);
  } catch (error) {
    console.error('Error fetching side bet:', error);
    res.status(500).json({ error: 'Failed to fetch side bet' });
  }
});

app.post('/api/side-bets/:sideBetId/join', authenticateToken, asyncHandler(async (req, res) => {
  const { sideBetId } = req.params;
  const { selected_option_id, prediction_value } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [sideBets] = await connection.execute(
      'SELECT * FROM side_bets WHERE id = ? AND status = "open" AND deadline > NOW()',
      [sideBetId]
    );

    if (sideBets.length === 0) {
      throw new AppError('Side bet not available', 400, 'BET_NOT_AVAILABLE');
    }

    const sideBet = sideBets[0];
    const entryFee = parseFloat(sideBet.entry_fee) || 0;

    // Check user balance
    if (entryFee > 0) {
      const [user] = await connection.execute(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (user[0].balance < entryFee) {
        throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      // Deduct entry fee
      await connection.execute(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [entryFee, req.user.userId]
      );
    }

    // Check max participants
    if (sideBet.max_participants) {
      const [count] = await connection.execute(
        'SELECT COUNT(*) as count FROM side_bet_participants WHERE side_bet_id = ?',
        [sideBetId]
      );

      if (count[0].count >= sideBet.max_participants) {
        throw new AppError('Side bet is full', 400, 'BET_FULL');
      }
    }

    // Join bet
    await connection.execute(
      'INSERT INTO side_bet_participants (side_bet_id, user_id, selected_option_id, prediction_value, amount_wagered) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE selected_option_id = VALUES(selected_option_id), prediction_value = VALUES(prediction_value)',
      [sideBetId, req.user.userId, selected_option_id, prediction_value, entryFee]
    );

    await connection.commit();

    // Real-time update
    const io = req.app.get('io');
    io.to(`side-bet-${sideBetId}`).emit('participant-joined', {
      username: req.user.username,
      sideBetId
    });

    res.json({ message: 'Successfully joined side bet' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.post('/api/side-bets/join-by-code', authenticateToken, async (req, res) => {
  const { invite_code } = req.body;

  try {
    const [sideBets] = await pool.execute(
      'SELECT id FROM side_bets WHERE invite_code = ? AND status = "open" AND deadline > NOW()',
      [invite_code]
    );

    if (sideBets.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }

    const sideBetId = sideBets[0].id;

    await pool.execute(
      'INSERT IGNORE INTO side_bet_participants (side_bet_id, user_id) VALUES (?, ?)',
      [sideBetId, req.user.userId]
    );

    res.json({ message: 'Successfully joined side bet', sideBetId });
  } catch (error) {
    console.error('Error joining side bet by code:', error);
    res.status(500).json({ error: 'Failed to join side bet' });
  }
});

// Add these routes to your server.js file after the existing side bets routes

// Admin: Get all side bets for management
app.get('/api/admin/side-bets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [sideBets] = await pool.execute(`
      SELECT 
        sb.*,
        u.username as creator_name,
        COUNT(DISTINCT sbp.user_id) as participant_count,
        SUM(sbp.amount_wagered) as total_pot
      FROM side_bets sb
      JOIN users u ON sb.created_by = u.id
      LEFT JOIN side_bet_participants sbp ON sb.id = sbp.side_bet_id
      GROUP BY sb.id
      ORDER BY sb.created_at DESC
    `);

    res.json(sideBets);
  } catch (error) {
    console.error('Error fetching side bets for admin:', error);
    res.status(500).json({ error: 'Failed to fetch side bets' });
  }
});

// Admin: Close a side bet (stop accepting new participants)
app.post('/api/admin/side-bets/:sideBetId/close', authenticateToken, requireAdmin, async (req, res) => {
  const { sideBetId } = req.params;

  try {
    await pool.execute(
      'UPDATE side_bets SET status = "closed" WHERE id = ?',
      [sideBetId]
    );

    res.json({ message: 'Side bet closed successfully' });
  } catch (error) {
    console.error('Error closing side bet:', error);
    res.status(500).json({ error: 'Failed to close side bet' });
  }
});

// Admin: Settle a side bet and calculate winners
app.post('/api/admin/side-bets/:sideBetId/settle', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { sideBetId } = req.params;
  const { winning_option_id, actual_result } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [sideBets] = await connection.execute('SELECT * FROM side_bets WHERE id = ?', [sideBetId]);
    if (sideBets.length === 0) {
      throw new AppError('Side bet not found', 404, 'NOT_FOUND');
    }

    const sideBet = sideBets[0];

    const [participants] = await connection.execute(
      'SELECT * FROM side_bet_participants WHERE side_bet_id = ?',
      [sideBetId]
    );

    const totalPot = participants.reduce((sum, p) => sum + parseFloat(p.amount_wagered || 0), 0);

    let winners = [];
    
    switch (sideBet.bet_type) {
      case 'binary':
      case 'multiple_choice':
        winners = participants.filter(p => p.selected_option_id == winning_option_id);
        break;
      case 'over_under':
      case 'prediction':
        winners = participants.filter(p => p.prediction_value == actual_result);
        break;
    }

    // Pay winners
    if (winners.length > 0 && totalPot > 0) {
      const payoutPerWinner = totalPot / winners.length;
      
      for (const winner of winners) {
        await connection.execute(
          'UPDATE side_bet_participants SET potential_payout = ? WHERE id = ?',
          [payoutPerWinner, winner.id]
        );

        // Add to user balance
        await connection.execute(
          'UPDATE users SET balance = balance + ? WHERE id = ?',
          [payoutPerWinner, winner.user_id]
        );
      }
    }

    await connection.execute(
      'UPDATE side_bets SET status = "settled", winning_option_id = ?, actual_result = ? WHERE id = ?',
      [winning_option_id, actual_result, sideBetId]
    );

    await connection.commit();

    // Real-time notification
    const io = req.app.get('io');
    io.emit('side-bet-settled', { sideBetId, winners: winners.length, totalPot });

    res.json({ 
      message: 'Side bet settled successfully',
      winners: winners.length,
      totalPot,
      payoutPerWinner: winners.length > 0 ? totalPot / winners.length : 0
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// Admin: Reopen a side bet (if settled by mistake)
app.post('/api/admin/side-bets/:sideBetId/reopen', authenticateToken, requireAdmin, async (req, res) => {
  const { sideBetId } = req.params;

  try {
    // Clear settlement data
    await pool.execute(
      'UPDATE side_bets SET status = "open", winning_option_id = NULL, actual_result = NULL WHERE id = ?',
      [sideBetId]
    );

    // Reset potential payouts
    await pool.execute(
      'UPDATE side_bet_participants SET potential_payout = 0 WHERE side_bet_id = ?',
      [sideBetId]
    );

    res.json({ message: 'Side bet reopened successfully' });
  } catch (error) {
    console.error('Error reopening side bet:', error);
    res.status(500).json({ error: 'Failed to reopen side bet' });
  }
});

// Admin: Delete a side bet
app.delete('/api/admin/side-bets/:sideBetId', authenticateToken, requireAdmin, async (req, res) => {
  const { sideBetId } = req.params;

  try {
    await pool.execute('DELETE FROM side_bets WHERE id = ?', [sideBetId]);
    res.json({ message: 'Side bet deleted successfully' });
  } catch (error) {
    console.error('Error deleting side bet:', error);
    res.status(500).json({ error: 'Failed to delete side bet' });
  }
});

// Get side bet results (for users to view after settlement)
app.get('/api/side-bets/:sideBetId/results', authenticateToken, async (req, res) => {
  const { sideBetId } = req.params;

  try {
    const [sideBets] = await pool.execute(
      'SELECT * FROM side_bets WHERE id = ?',
      [sideBetId]
    );

    if (sideBets.length === 0) {
      return res.status(404).json({ error: 'Side bet not found' });
    }

    const sideBet = sideBets[0];

    if (sideBet.status !== 'settled') {
      return res.status(400).json({ error: 'Side bet not yet settled' });
    }

    // Get winning option details
    if (sideBet.winning_option_id) {
      const [winningOption] = await pool.execute(
        'SELECT * FROM side_bet_options WHERE id = ?',
        [sideBet.winning_option_id]
      );
      sideBet.winning_option = winningOption[0];
    }

    // Get winners
    const [winners] = await pool.execute(`
      SELECT 
        sbp.*,
        u.username
      FROM side_bet_participants sbp
      JOIN users u ON sbp.user_id = u.id
      WHERE sbp.side_bet_id = ? AND sbp.potential_payout > 0
      ORDER BY sbp.potential_payout DESC
    `, [sideBetId]);

    res.json({
      sideBet,
      winners
    });
  } catch (error) {
    console.error('Error fetching side bet results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get user's picks for a pool (checking endpoint)
app.get('/api/pools/:poolId/my-picks', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const userId = req.user.userId;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [picks] = await pool.execute(`
    SELECT 
      p.id,
      p.game_id,
      p.selected_team,
      p.confidence_points,
      p.submitted_at
    FROM picks p
    WHERE p.user_id = ? AND p.pool_id = ?
  `, [userId, poolId]);

  res.json(picks);
}));

// ============================================
// PICKS ROUTES
// ============================================

app.post('/api/picks', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId, picks } = req.body;
  const userId = req.user.userId;

  if (!poolId || !picks || !Array.isArray(picks)) {
    throw new AppError('Invalid request: poolId and picks array required', 400, 'INVALID_REQUEST');
  }

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  // Validate picks array
  const [games] = await pool.execute('SELECT COUNT(*) as count FROM games WHERE pool_id = ?', [poolId]);
  const gameCount = games[0].count;
  
  const pickValidation = validatePicks(picks, gameCount);
  if (!pickValidation.valid) {
    throw new AppError(pickValidation.error, 400, 'INVALID_PICKS');
  }

  // Check pool status
  const [pools] = await pool.execute(
    'SELECT id, status, start_date FROM pools WHERE id = ?',
    [poolId]
  );

  if (pools.length === 0) {
    throw new AppError('Pool not found', 404, 'POOL_NOT_FOUND');
  }

  const poolData = pools[0];
  if (poolData.status === 'completed') {
    throw new AppError('Cannot submit picks for a completed pool', 400, 'POOL_COMPLETED');
  }

  if (new Date() > new Date(poolData.start_date)) {
    throw new AppError('Pool has already started - picks are locked', 400, 'POOL_LOCKED');
  }

  // Verify all games belong to this pool
  const gameIds = picks.map(p => p.gameId);
  const [validGames] = await pool.execute(
    `SELECT id, home_team, away_team FROM games WHERE pool_id = ? AND id IN (${gameIds.map(() => '?').join(',')})`,
    [poolId, ...gameIds]
  );

  if (validGames.length !== picks.length) {
    throw new AppError('Some games do not belong to this pool', 400, 'INVALID_GAMES');
  }

  // Validate team selections
  for (const pick of picks) {
    const game = validGames.find(g => g.id === pick.gameId);
    if (!game) {
      throw new AppError(`Game ${pick.gameId} not found`, 400, 'GAME_NOT_FOUND');
    }
    
    if (pick.selectedTeam !== game.home_team && pick.selectedTeam !== game.away_team) {
      throw new AppError(`Invalid team selection for game ${pick.gameId}`, 400, 'INVALID_TEAM');
    }
  }

  // Transaction to save picks
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Delete existing picks
    await connection.execute(
      'DELETE FROM picks WHERE user_id = ? AND pool_id = ?',
      [userId, poolId]
    );

    // Insert new picks
    for (const pick of picks) {
      await connection.execute(
        'INSERT INTO picks (user_id, pool_id, game_id, selected_team, confidence_points) VALUES (?, ?, ?, ?, ?)',
        [userId, poolId, pick.gameId, pick.selectedTeam, pick.confidencePoints]
      );
    }

    await connection.commit();

    res.json({
      message: 'Picks submitted successfully',
      totalPicks: picks.length,
      totalConfidence: picks.reduce((sum, p) => sum + p.confidencePoints, 0)
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// Get user's picks for a specific pool
app.get('/api/picks/:poolId', authenticateToken, asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const userId = req.user.userId;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [picks] = await pool.execute(`
    SELECT 
      p.id,
      p.game_id,
      p.selected_team,
      p.confidence_points,
      p.is_correct,
      p.submitted_at
    FROM picks p
    WHERE p.user_id = ? AND p.pool_id = ?
    ORDER BY p.game_id
  `, [userId, poolId]);

  res.json(picks);
}));

app.get('/api/my-picks', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const [picks] = await pool.execute(`
    SELECT 
      p.id as pool_id,
      p.name as pool_name,
      p.week_number,
      p.season_year,
      p.status as pool_status,
      p.start_date,
      p.end_date,
      g.id as game_id,
      g.home_team,
      g.away_team,
      g.game_date,
      g.home_score,
      g.away_score,
      g.status as game_status,
      picks.selected_team,
      picks.confidence_points,
      picks.is_correct,
      picks.submitted_at,
      CASE 
        WHEN g.status = 'completed' AND g.home_score IS NOT NULL AND g.away_score IS NOT NULL THEN
          CASE 
            WHEN (g.home_score > g.away_score AND picks.selected_team = g.home_team) OR 
                 (g.away_score > g.home_score AND picks.selected_team = g.away_team) THEN 'correct'
            ELSE 'incorrect'
          END
        ELSE 'pending'
      END as pick_result
    FROM picks 
    JOIN pools p ON picks.pool_id = p.id
    JOIN games g ON picks.game_id = g.id
    WHERE picks.user_id = ?
    ORDER BY p.season_year DESC, p.week_number DESC, g.game_date ASC
  `, [userId]);

  const picksByPool = picks.reduce((acc, pick) => {
    const poolKey = pick.pool_id;
    if (!acc[poolKey]) {
      acc[poolKey] = {
        pool: {
          id: pick.pool_id,
          name: pick.pool_name,
          week_number: pick.week_number,
          season_year: pick.season_year,
          status: pick.pool_status,
          start_date: pick.start_date,
          end_date: pick.end_date
        },
        picks: [],
        stats: {
          total: 0,
          correct: 0,
          incorrect: 0,
          pending: 0,
          totalPoints: 0
        }
      };
    }

    acc[poolKey].picks.push({
      game_id: pick.game_id,
      home_team: pick.home_team,
      away_team: pick.away_team,
      game_date: pick.game_date,
      home_score: pick.home_score,
      away_score: pick.away_score,
      game_status: pick.game_status,
      selected_team: pick.selected_team,
      confidence_points: pick.confidence_points,
      is_correct: pick.is_correct,
      submitted_at: pick.submitted_at,
      pick_result: pick.pick_result
    });

    acc[poolKey].stats.total++;
    if (pick.pick_result === 'correct') {
      acc[poolKey].stats.correct++;
      acc[poolKey].stats.totalPoints += pick.confidence_points || 1;
    } else if (pick.pick_result === 'incorrect') {
      acc[poolKey].stats.incorrect++;
    } else {
      acc[poolKey].stats.pending++;
    }

    return acc;
  }, {});

  res.json(Object.values(picksByPool));
}));



// ============================================
// ADMIN ROUTES
// ============================================

app.get('/api/admin/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const [users] = await pool.execute(
    'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(users);
}));

app.patch('/api/admin/users/:userId/status', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!validateUserId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!['approved', 'suspended', 'pending'].includes(status)) {
    throw new AppError('Invalid status', 400, 'INVALID_STATUS');
  }

  await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
  res.json({ message: 'User status updated' });
}));

app.get('/api/admin/side-bets/:sideBetId/details', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { sideBetId } = req.params;

  const [bet] = await pool.execute(`
    SELECT sb.*, u.username as creator_name
    FROM side_bets sb
    JOIN users u ON sb.created_by = u.id
    WHERE sb.id = ?
  `, [sideBetId]);

  if (bet.length === 0) {
    throw new AppError('Side bet not found', 404, 'NOT_FOUND');
  }

  const [participants] = await pool.execute(`
    SELECT 
      sbp.*,
      u.username,
      u.email,
      sbo.option_text
    FROM side_bet_participants sbp
    JOIN users u ON sbp.user_id = u.id
    LEFT JOIN side_bet_options sbo ON sbp.selected_option_id = sbo.id
    WHERE sbp.side_bet_id = ?
    ORDER BY sbp.joined_at DESC
  `, [sideBetId]);

  const [options] = await pool.execute(`
    SELECT 
      sbo.*,
      COUNT(sbp.id) as pick_count
    FROM side_bet_options sbo
    LEFT JOIN side_bet_participants sbp ON sbo.id = sbp.selected_option_id
    WHERE sbo.side_bet_id = ?
    GROUP BY sbo.id
  `, [sideBetId]);

  const totalPot = participants.reduce((sum, p) => sum + parseFloat(p.amount_wagered || 0), 0);

  res.json({
    bet: bet[0],
    participants,
    options,
    stats: {
      totalParticipants: participants.length,
      totalPot,
      averageWager: participants.length > 0 ? totalPot / participants.length : 0
    }
  });
}));

app.patch('/api/admin/users/:userId', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { username, email, role } = req.body;

  if (!validateUserId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (!validateUsername(username)) {
    throw new AppError('Invalid username format', 400, 'INVALID_USERNAME');
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
  }

  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400, 'INVALID_ROLE');
  }

  const [duplicates] = await pool.execute(
    'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
    [username, email, userId]
  );

  if (duplicates.length > 0) {
    throw new AppError('Username or email already exists', 409, 'DUPLICATE_USER');
  }

  await pool.execute(
    'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
    [username, email, role, userId]
  );

  res.json({ message: 'User updated successfully' });
}));

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!validateUserId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  if (parseInt(userId) === req.user.userId) {
    throw new AppError('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  res.json({ message: 'User deleted successfully' });
}));

app.post('/api/admin/pools', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { name, weekNumber, seasonYear, startDate, endDate, games } = req.body;

  if (!name || !weekNumber || !seasonYear || !startDate || !endDate || !games || !Array.isArray(games)) {
    throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
  }

  if (games.length === 0) {
    throw new AppError('At least one game is required', 400, 'NO_GAMES');
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new AppError('End date must be after start date', 400, 'INVALID_DATES');
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const [poolResult] = await connection.execute(
      'INSERT INTO pools (name, week_number, season_year, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, weekNumber, seasonYear, startDate, endDate, req.user.userId]
    );

    const poolId = poolResult.insertId;

    for (const game of games) {
      if (!game.homeTeam || !game.awayTeam || !game.gameDate) {
        throw new AppError('Invalid game data', 400, 'INVALID_GAME_DATA');
      }

      await connection.execute(
        'INSERT INTO games (pool_id, home_team, away_team, game_date) VALUES (?, ?, ?, ?)',
        [poolId, game.homeTeam, game.awayTeam, game.gameDate]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Pool created successfully', poolId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.get('/api/admin/pools/:poolId/picks', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { poolId } = req.params;

  if (!validatePoolId(poolId)) {
    throw new AppError('Invalid pool ID', 400, 'INVALID_POOL_ID');
  }

  const [picks] = await pool.execute(`
    SELECT 
      u.username,
      p.selected_team,
      p.confidence_points,
      p.is_correct,
      g.home_team,
      g.away_team,
      g.game_date
    FROM picks p
    JOIN users u ON p.user_id = u.id
    JOIN games g ON p.game_id = g.id
    WHERE p.pool_id = ?
    ORDER BY u.username, g.game_date
  `, [poolId]);

  res.json(picks);
}));

app.post('/api/admin/games/:gameId/update-score', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const { home_score, away_score, status, quarter, time_remaining, possession } = req.body;

  if (!validateGameId(gameId)) {
    throw new AppError('Invalid game ID', 400, 'INVALID_GAME_ID');
  }

  await pool.execute(
    'UPDATE games SET home_score = ?, away_score = ?, status = ? WHERE id = ?',
    [home_score, away_score, status, gameId]
  );

  await pool.execute(
    `INSERT INTO game_scores (game_id, quarter, time_remaining, home_score, away_score, possession) 
     VALUES (?, ?, ?, ?, ?, ?) 
     ON DUPLICATE KEY UPDATE 
       quarter = VALUES(quarter), 
       time_remaining = VALUES(time_remaining), 
       home_score = VALUES(home_score), 
       away_score = VALUES(away_score), 
       possession = VALUES(possession)`,
    [gameId, quarter, time_remaining, home_score, away_score, possession]
  );

  const [games] = await pool.execute('SELECT pool_id FROM games WHERE id = ?', [gameId]);
  if (games.length > 0) {
    const poolId = games[0].pool_id;

    const io = req.app.get('io');
    io.to(`pool-${poolId}`).emit('score-update', {
      gameId,
      home_score,
      away_score,
      status,
      quarter,
      time_remaining,
      possession
    });

    if (status === 'completed') {
      await calculateUserScores(poolId);
      io.to(`pool-${poolId}`).emit('scores-updated');
    }
  }

  res.json({ message: 'Score updated successfully' });
}));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await closeDatabase();
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log('\n🚀 Server started successfully!\n');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'nfl_pool'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
console.log('👤 Admin account configured via secure setup');
console.log('   Use credentials from your initial setup process');
  console.log(`🔄 WebSocket server ready for real-time updates`);
  console.log(`⏰ Cron jobs scheduled:`);
  console.log(`   - Token cleanup: Daily at 2 AM`);
  console.log(`   - Pool status update: Every 5 minutes\n`);
});