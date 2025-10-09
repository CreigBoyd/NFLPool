import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from './database.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { validateEmail, validateUsername, sanitizeInput } from './validation.js';
import { AppError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Password strength validation
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
}

export async function registerUser(username, email, password) {
  try {
    // Input validation
    if (!validateUsername(username)) {
      return { success: false, error: 'Username must be 3-20 characters, alphanumeric and underscores only' };
    }
    
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }
    
    // Password strength validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return { success: false, error: passwordErrors.join('. ') };
    }
    
    // Sanitize inputs
    const cleanUsername = sanitizeInput(username);
    const cleanEmail = sanitizeInput(email);
    
    // Hash password with higher cost for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, status) VALUES (?, ?, ?, "pending")',
      [cleanUsername, cleanEmail, hashedPassword]
    );
    
    // Send notification email to admin (non-blocking)
    sendAdminNotification(cleanUsername, cleanEmail).catch(err => {
      console.error('Failed to send admin notification:', err);
    });
    
    return { success: true, userId: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username or email already exists' };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

async function sendAdminNotification(username, email) {
  if (!process.env.ADMIN_EMAIL) return;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: '🏈 New User Registration - Approval Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New User Registration</h2>
          <p>A new user has registered and is awaiting approval:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please log in to the admin panel to approve or reject this user.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Admin notification email failed:', error);
  }
}

export async function loginUser(username, password) {
  try {
    // Input validation
    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }
    
    const cleanUsername = sanitizeInput(username);
    
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, role, status FROM users WHERE username = ?',
      [cleanUsername]
    );
    
    if (users.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    const user = users[0];
    
    // Check account status
    if (user.status === 'suspended') {
      return { success: false, error: 'Account suspended. Contact administrator.' };
    }
    
    if (user.status === 'pending') {
      return { success: false, error: 'Account pending approval' };
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Generate tokens
    const payload = { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
    
    // Store refresh token in database
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, refreshExpiry]
    );
    
    return {
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Check if refresh token exists in database
    const [tokens] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );
    
    if (tokens.length === 0) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    
    // Generate new access token
    const payload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    
    return {
      success: true,
      token: newAccessToken
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }
    throw error;
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      errorCode: 'NO_TOKEN' 
    });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      errorCode: 'INVALID_TOKEN'
    });
  }
  
  req.user = decoded;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      errorCode: 'ADMIN_REQUIRED'
    });
  }
  next();
}

export async function requestPasswordReset(emailOrUsername) {
  try {
    const cleanInput = sanitizeInput(emailOrUsername);
    
    // Find user by email or username
    const [users] = await pool.execute(`
      SELECT id, email, username FROM users 
      WHERE email = ? OR username = ? LIMIT 1
    `, [cleanInput, cleanInput]);

    if (users.length === 0) {
      // Return success even if user not found (security best practice)
      return { success: true, message: 'If that account exists, a reset link has been sent' };
    }

    const user = users[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store token in password_resets table
    await pool.execute(`
      INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
    `, [user.id, token, expiresAt]);

    // Compose reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Password Reset for NFL Pool',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    return { success: true, message: 'If that account exists, a reset link has been sent' };

  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Failed to process password reset request' };
  }
}

export async function resetPassword(token, newPassword) {
  try {
    // Validate password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return { success: false, error: passwordErrors.join('. ') };
    }
    
    // Lookup the token
    const [rows] = await pool.execute(`
      SELECT pr.user_id, pr.expires_at, u.email
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.token = ?
    `, [token]);

    if (rows.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const resetRecord = rows[0];
    const now = new Date();

    if (now > resetRecord.expires_at) {
      return { success: false, error: 'Reset token has expired' };
    }

    // Hash new password
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await pool.execute(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `, [hashedPassword, resetRecord.user_id]);

    // Delete all password reset tokens for this user (security)
    await pool.execute(`
      DELETE FROM password_resets WHERE user_id = ?
    `, [resetRecord.user_id]);

    // Delete all refresh tokens for this user (force re-login)
    await pool.execute(`
      DELETE FROM refresh_tokens WHERE user_id = ?
    `, [resetRecord.user_id]);

    return { success: true, message: 'Password reset successful' };

  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

export async function logoutUser(userId, refreshToken) {
  try {
    // Delete specific refresh token or all tokens for user
    if (refreshToken) {
      await pool.execute(
        'DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?',
        [refreshToken, userId]
      );
    } else {
      await pool.execute(
        'DELETE FROM refresh_tokens WHERE user_id = ?',
        [userId]
      );
    }
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}