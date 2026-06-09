const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all conversations for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT 
        c.id,
        c.type,
        c.name,
        c.group_photo,
        c.updated_at,
        p.unread_count,
        p.last_read_message_id,
        CASE 
          WHEN c.type = 'direct' THEN (
            SELECT u.name 
            FROM users u 
            JOIN participants p2 ON u.id = p2.user_id 
            WHERE p2.conversation_id = c.id AND p2.user_id != $1
            LIMIT 1
          )
          ELSE c.name
        END as display_name,
        CASE 
          WHEN c.type = 'direct' THEN (
            SELECT u.profile_photo 
            FROM users u 
            JOIN participants p2 ON u.id = p2.user_id 
            WHERE p2.conversation_id = c.id AND p2.user_id != $1
            LIMIT 1
          )
          ELSE c.group_photo
        END as display_photo,
        CASE 
          WHEN c.type = 'direct' THEN (
            SELECT u.status 
            FROM users u 
            JOIN participants p2 ON u.id = p2.user_id 
            WHERE p2.conversation_id = c.id AND p2.user_id != $1
            LIMIT 1
          )
          ELSE NULL
        END as other_user_status,
        (
          SELECT m.content 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          AND m.deleted_for_all = false
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          AND m.deleted_for_all = false
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT m.sender_id 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          AND m.deleted_for_all = false
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_sender_id
       FROM conversations c
       JOIN participants p ON c.id = p.conversation_id
       WHERE p.user_id = $1
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    res.json({ ok: true, conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get conversations' });
  }
});

// Create a new direct conversation
router.post('/direct', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: 'User ID required' });
    }

    if (userId == req.user.id) {
      return res.status(400).json({ ok: false, message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    const existingConversation = await pool.query(
      `SELECT c.id, c.type
       FROM conversations c
       JOIN participants p1 ON c.id = p1.conversation_id
       JOIN participants p2 ON c.id = p2.conversation_id
       WHERE p1.user_id = $1 
       AND p2.user_id = $2 
       AND c.type = 'direct'
       AND p1.user_id != p2.user_id`,
      [req.user.id, userId]
    );

    if (existingConversation.rows.length > 0) {
      return res.json({ ok: true, conversation: existingConversation.rows[0] });
    }

    // Create new conversation
    const conversationResult = await pool.query(
      'INSERT INTO conversations (type, created_by) VALUES ($1, $2) RETURNING *',
      ['direct', req.user.id]
    );

    const conversation = conversationResult.rows[0];

    // Add participants
    await pool.query(
      'INSERT INTO participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)',
      [conversation.id, req.user.id, userId]
    );

    res.status(201).json({ ok: true, conversation });
  } catch (error) {
    console.error('Create direct conversation error:', error);
    res.status(500).json({ ok: false, message: 'Failed to create conversation' });
  }
});

// Create a new group conversation
router.post('/group', authenticateToken, async (req, res) => {
  try {
    const { name, group_photo, participantIds } = req.body;

    if (!name || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ ok: false, message: 'Name and participants required' });
    }

    if (!participantIds.includes(req.user.id)) {
      participantIds.push(req.user.id);
    }

    // Create conversation
    const conversationResult = await pool.query(
      'INSERT INTO conversations (type, name, group_photo, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      ['group', name, group_photo, req.user.id]
    );

    const conversation = conversationResult.rows[0];

    // Add participants
    const participantValues = participantIds.map(id => `(${conversation.id}, ${id})`).join(',');
    await pool.query(
      `INSERT INTO participants (conversation_id, user_id) VALUES ${participantValues}`
    );

    // Make creator admin
    await pool.query(
      'UPDATE participants SET is_admin = true WHERE conversation_id = $1 AND user_id = $2',
      [conversation.id, req.user.id]
    );

    res.status(201).json({ ok: true, conversation });
  } catch (error) {
    console.error('Create group conversation error:', error);
    res.status(500).json({ ok: false, message: 'Failed to create group conversation' });
  }
});

// Get conversation details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Check if user is participant
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0) {
      return res.status(403).json({ ok: false, message: 'Not a participant in this conversation' });
    }

    // Get conversation details
    const conversationResult = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Conversation not found' });
    }

    // Get participants
    const participantsResult = await pool.query(
      `SELECT u.id, u.name, u.profile_photo, u.status, p.is_admin, p.joined_at
       FROM participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.conversation_id = $1`,
      [conversationId]
    );

    const conversation = conversationResult.rows[0];
    conversation.participants = participantsResult.rows;

    res.json({ ok: true, conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get conversation' });
  }
});

// Get messages for a conversation
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Check if user is participant
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0) {
      return res.status(403).json({ ok: false, message: 'Not a participant in this conversation' });
    }

    // Get messages
    const messagesResult = await pool.query(
      `SELECT m.*, 
        u.name as sender_name,
        u.profile_photo as sender_photo,
        reply.content as reply_to_content,
        reply.sender_id as reply_to_sender_id,
        ru.name as reply_to_sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN messages reply ON m.reply_to_message_id = reply.id
       LEFT JOIN users ru ON reply.sender_id = ru.id
       WHERE m.conversation_id = $1
       AND m.deleted_for_all = false
       AND (m.deleted_for_sender = false OR m.sender_id = $2)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [conversationId, req.user.id, limit, offset]
    );

    res.json({ ok: true, messages: messagesResult.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get messages' });
  }
});

// Update conversation (for groups)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { name, group_photo } = req.body;

    // Check if user is admin
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0 || !participant.rows[0].is_admin) {
      return res.status(403).json({ ok: false, message: 'Not authorized to update this conversation' });
    }

    // Update conversation
    const result = await pool.query(
      `UPDATE conversations 
       SET name = COALESCE($1, name),
           group_photo = COALESCE($2, group_photo)
       WHERE id = $3
       RETURNING *`,
      [name, group_photo, conversationId]
    );

    res.json({ ok: true, conversation: result.rows[0] });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ ok: false, message: 'Failed to update conversation' });
  }
});

// Add participant to group
router.post('/:id/participants', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.body;

    // Check if user is admin
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0 || !participant.rows[0].is_admin) {
      return res.status(403).json({ ok: false, message: 'Not authorized to add participants' });
    }

    // Add participant
    await pool.query(
      'INSERT INTO participants (conversation_id, user_id) VALUES ($1, $2)',
      [conversationId, userId]
    );

    res.json({ ok: true, message: 'Participant added' });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ ok: false, message: 'Failed to add participant' });
  }
});

// Remove participant from group
router.delete('/:id/participants/:userId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.params.userId;

    // Check if user is admin or removing themselves
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0 || (!participant.rows[0].is_admin && userId != req.user.id)) {
      return res.status(403).json({ ok: false, message: 'Not authorized to remove participant' });
    }

    // Remove participant
    await pool.query(
      'DELETE FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    res.json({ ok: true, message: 'Participant removed' });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ ok: false, message: 'Failed to remove participant' });
  }
});

// Leave conversation
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Check if conversation is direct (can't leave direct conversations)
    const conversation = await pool.query(
      'SELECT type FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Conversation not found' });
    }

    if (conversation.rows[0].type === 'direct') {
      return res.status(400).json({ ok: false, message: 'Cannot leave direct conversations' });
    }

    // Remove participant
    await pool.query(
      'DELETE FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    res.json({ ok: true, message: 'Left conversation' });
  } catch (error) {
    console.error('Leave conversation error:', error);
    res.status(500).json({ ok: false, message: 'Failed to leave conversation' });
  }
});

module.exports = router;
