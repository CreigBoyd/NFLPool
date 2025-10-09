import readline from 'readline';
import bcrypt from 'bcryptjs';
import { securePasswordInput } from './passwordInput.js';

/**
 * Interactive CLI for setting up admin credentials
 * @returns {Promise<{username: string, email: string, password: string}>}
 */
export async function promptAdminCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  console.log('\n==============================================');
  console.log('  NFL POOL - FIRST TIME ADMIN SETUP');
  console.log('==============================================\n');
  console.log('No admin user found. Please create the initial admin account.\n');

  const username = await question('Enter admin username: ');
  const email = await question('Enter admin email: ');
  
  rl.close();

  // Password input with masking
  console.log('\nPassword requirements:');
  console.log('- Minimum 8 characters');
  console.log('- At least one uppercase letter');
  console.log('- At least one lowercase letter');
  console.log('- At least one number\n');
  
  const password = await securePasswordInput('Enter admin password: ');
  const confirmPassword = await securePasswordInput('Confirm admin password: ');

  // Validate inputs
  if (!username || username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  if (!email || !isValidEmail(email)) {
    throw new Error('Invalid email address');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (!isStrongPassword(password)) {
    throw new Error('Password does not meet security requirements');
  }

  return {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password
  };
}

/**
 * Get admin credentials from environment variables
 * @returns {{username: string, email: string, password: string} | null}
 */
export function getAdminCredentialsFromEnv() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  // All three must be present
  if (!username || !email || !password) {
    return null;
  }

  // Validate
  if (username.trim().length < 3) {
    throw new Error('ADMIN_USERNAME must be at least 3 characters long');
  }

  if (!isValidEmail(email)) {
    throw new Error('ADMIN_EMAIL is not a valid email address');
  }

  if (!isStrongPassword(password)) {
    throw new Error('ADMIN_PASSWORD does not meet security requirements (min 8 chars, uppercase, lowercase, number)');
  }

  return {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password
  };
}

/**
 * Create admin user in database
 * @param {Object} pool - Database connection pool
 * @param {Object} credentials - Admin credentials
 * @returns {Promise<number>} - Created user ID
 */
export async function createAdminUser(pool, credentials) {
  const { username, email, password } = credentials;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Insert admin user
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role, status, display_name) 
     VALUES (?, ?, ?, 'admin', 'approved', ?)`,
    [username, email, hashedPassword, username]
  );

  return result.insertId;
}

/**
 * Check if admin user exists
 * @param {Object} pool - Database connection pool
 * @returns {Promise<boolean>}
 */
export async function adminExists(pool) {
  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE role = "admin" LIMIT 1'
  );
  return rows.length > 0;
}

/**
 * Main setup function - orchestrates the admin setup process
 * @param {Object} pool - Database connection pool
 * @returns {Promise<void>}
 */
export async function setupAdmin(pool) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    // Check if admin already exists
    const hasAdmin = await adminExists(pool);
    
    if (hasAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    console.log('⚠️  No admin user found in database');

    let credentials;

    // Try to get credentials from environment variables first
    try {
      credentials = getAdminCredentialsFromEnv();
      
      if (credentials) {
        console.log('📝 Using admin credentials from environment variables');
      }
    } catch (error) {
      console.error(`❌ Error with environment variables: ${error.message}`);
      credentials = null;
    }

    // If no env credentials, prompt for them (only in non-production or if stdin is available)
    if (!credentials) {
      if (isProduction) {
        console.error('\n❌ PRODUCTION MODE: Cannot create admin user');
        console.error('Please set the following environment variables:');
        console.error('  - ADMIN_USERNAME');
        console.error('  - ADMIN_EMAIL');
        console.error('  - ADMIN_PASSWORD\n');
        throw new Error('Admin credentials must be provided via environment variables in production');
      }

      // Check if we can use interactive mode
      if (!process.stdin.isTTY) {
        console.error('\n❌ Cannot prompt for admin credentials (non-interactive mode)');
        console.error('Please set environment variables: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD\n');
        throw new Error('Admin credentials required but cannot prompt in non-interactive mode');
      }

      // Interactive prompt
      credentials = await promptAdminCredentials();
    }

    // Create the admin user
    const userId = await createAdminUser(pool, credentials);

    console.log('\n✅ Admin user created successfully!');
    
    // Only log credentials in development mode
    if (!isProduction) {
      console.log('\n==============================================');
      console.log('  ADMIN CREDENTIALS (SAVE THESE!)');
      console.log('==============================================');
      console.log(`Username: ${credentials.username}`);
      console.log(`Email:    ${credentials.email}`);
      console.log(`User ID:  ${userId}`);
      console.log('==============================================\n');
      console.log('⚠️  These credentials are only shown once!');
      console.log('⚠️  Store them securely and consider changing the password after first login.\n');
    } else {
      console.log('User ID:', userId);
      console.log('\n⚠️  Please store your admin credentials securely.\n');
    }

  } catch (error) {
    console.error('\n❌ Admin setup failed:', error.message);
    throw error;
  }
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {boolean}
 */
function isStrongPassword(password) {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false; // lowercase
  if (!/[A-Z]/.test(password)) return false; // uppercase
  if (!/[0-9]/.test(password)) return false; // number
  return true;
}

export default setupAdmin;