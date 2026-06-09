const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, profile_photo, country, native_language, learning_language, language_level, interests, bio, is_verified, status, last_seen, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profile_photo, country, native_language, learning_language, language_level, interests, bio } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           profile_photo = COALESCE($2, profile_photo),
           country = COALESCE($3, country),
           native_language = COALESCE($4, native_language),
           learning_language = COALESCE($5, learning_language),
           language_level = COALESCE($6, language_level),
           interests = COALESCE($7, interests),
           bio = COALESCE($8, bio)
       WHERE id = $9
       RETURNING id, email, name, profile_photo, country, native_language, learning_language, language_level, interests, bio, is_verified, status`,
      [name, profile_photo, country, native_language, learning_language, language_level, interests, bio, req.user.id]
    );

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ ok: false, message: 'Failed to update profile' });
  }
});

// Get user by ID (for viewing other users' profiles)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, profile_photo, country, native_language, learning_language, language_level, interests, bio, status, last_seen FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get user' });
  }
});

// Search users (for matching)
router.get('/search/match', authenticateToken, async (req, res) => {
  try {
    const { native_language, learning_language, interests } = req.query;

    let query = `
      SELECT id, name, profile_photo, country, native_language, learning_language, language_level, interests, bio, status, last_seen
      FROM users
      WHERE id != $1
      AND is_verified = true
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (native_language) {
      query += ` AND learning_language = $${paramIndex}`;
      params.push(native_language);
      paramIndex++;
    }

    if (learning_language) {
      query += ` AND native_language = $${paramIndex}`;
      params.push(learning_language);
      paramIndex++;
    }

    if (interests) {
      const interestArray = interests.split(',');
      query += ` AND interests && $${paramIndex}`;
      params.push(interestArray);
      paramIndex++;
    }

    query += ' ORDER BY last_seen DESC LIMIT 50';

    const result = await pool.query(query, params);

    res.json({ ok: true, users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ ok: false, message: 'Failed to search users' });
  }
});

// Update user status
router.put('/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'Invalid status' });
    }

    await pool.query(
      'UPDATE users SET status = $1, last_seen = CURRENT_TIMESTAMP WHERE id = $2',
      [status, req.user.id]
    );

    res.json({ ok: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ ok: false, message: 'Failed to update status' });
  }
});

// Block user
router.post('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (userId == req.user.id) {
      return res.status(400).json({ ok: false, message: 'Cannot block yourself' });
    }

    await pool.query(
      'INSERT INTO blocked_users (blocker_id, blocked_id, reason) VALUES ($1, $2, $3) ON CONFLICT (blocker_id, blocked_id) DO UPDATE SET reason = $3',
      [req.user.id, userId, reason]
    );

    res.json({ ok: true, message: 'User blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ ok: false, message: 'Failed to block user' });
  }
});

// Unblock user
router.delete('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      'DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
      [req.user.id, userId]
    );

    res.json({ ok: true, message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ ok: false, message: 'Failed to unblock user' });
  }
});

// Get blocked users
router.get('/blocked/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_photo, b.blocked_at, b.reason
       FROM blocked_users b
       JOIN users u ON b.blocked_id = u.id
       WHERE b.blocker_id = $1
       ORDER BY b.blocked_at DESC`,
      [req.user.id]
    );

    res.json({ ok: true, blocked_users: result.rows });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get blocked users' });
  }
});

// Report user
router.post('/report/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, description, conversation_id, message_id } = req.body;

    if (!['spam', 'harassment', 'inappropriate_content', 'other'].includes(reason)) {
      return res.status(400).json({ ok: false, message: 'Invalid reason' });
    }

    await pool.query(
      `INSERT INTO reports (reporter_id, reported_id, conversation_id, message_id, reason, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, userId, conversation_id, message_id, reason, description]
    );

    res.json({ ok: true, message: 'User reported' });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ ok: false, message: 'Failed to report user' });
  }
});

module.exports = router;
