const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { generateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, native_language, learning_language, language_level } = req.body;

    // Validation
    if (!email || !password || !name || !native_language || !learning_language) {
      return res.status(400).json({ ok: false, message: 'All required fields must be provided' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ ok: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, native_language, learning_language, language_level, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, native_language, learning_language, language_level, is_verified`,
      [email.toLowerCase(), hashedPassword, name, native_language, learning_language, language_level || 'A1', verificationToken]
    );

    const user = result.rows[0];

    // Send verification email (in development, skip this)
    if (process.env.NODE_ENV === 'production') {
      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Pangolingo <noreply@pangolingo.com>',
        to: email,
        subject: 'Verify your email',
        html: `<p>Please verify your email by clicking: <a href="${verificationUrl}">${verificationUrl}</a></p>`
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      ok: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        native_language: user.native_language,
        learning_language: user.learning_language,
        language_level: user.language_level,
        is_verified: user.is_verified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ ok: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password required' });
    }

    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    // Update last seen
    await pool.query(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_photo: user.profile_photo,
        country: user.country,
        native_language: user.native_language,
        learning_language: user.learning_language,
        language_level: user.language_level,
        interests: user.interests,
        bio: user.bio,
        is_verified: user.is_verified,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, message: 'Login failed' });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ ok: false, message: 'Invalid or expired verification token' });
    }

    res.json({ ok: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ ok: false, message: 'Email verification failed' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.json({ ok: true, message: 'If email exists, reset link will be sent' });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // Send reset email (in development, skip this)
    if (process.env.NODE_ENV === 'production') {
      const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Pangolingo <noreply@pangolingo.com>',
        to: email,
        subject: 'Password Reset',
        html: `<p>Reset your password by clicking: <a href="${resetUrl}">${resetUrl}</a></p>`
      });
    }

    res.json({ ok: true, message: 'If email exists, reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ ok: false, message: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters' });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > CURRENT_TIMESTAMP',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ ok: false, message: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ ok: false, message: 'Password reset failed' });
  }
});

// Admin login with ADMIN_KEY
router.post('/admin-login', async (req, res) => {
  try {
    const { admin_key } = req.body;

    if (!admin_key) {
      return res.status(400).json({ ok: false, message: 'Admin key required' });
    }

    if (admin_key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, message: 'Invalid admin key' });
    }

    // Create admin user object for token
    const adminUser = {
      id: 0,
      email: 'admin@system',
      name: 'System Admin',
      is_admin: true
    };

    const token = generateToken(adminUser);

    res.json({
      ok: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        is_admin: adminUser.is_admin
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ ok: false, message: 'Admin login failed' });
  }
});

module.exports = router;
