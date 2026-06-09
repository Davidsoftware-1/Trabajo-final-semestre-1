const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload file for a message
router.post('/message/:messageId', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }

    const { messageId } = req.params;

    // Verify user owns the message
    const message = await pool.query(
      'SELECT * FROM messages WHERE id = $1 AND sender_id = $2',
      [messageId, req.user.id]
    );

    if (message.rows.length === 0) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ ok: false, message: 'Not authorized to upload to this message' });
    }

    // Determine file type category
    let fileType = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    // Save attachment to database
    const attachmentResult = await pool.query(
      `INSERT INTO attachments (message_id, file_name, file_path, file_size, file_type, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [messageId, req.file.originalname, req.file.path, req.file.size, fileType, req.file.mimetype]
    );

    // Update message type
    await pool.query(
      'UPDATE messages SET message_type = $1 WHERE id = $2',
      [fileType, messageId]
    );

    res.json({
      ok: true,
      attachment: attachmentResult.rows[0],
      fileUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ ok: false, message: 'Failed to upload file' });
  }
});

// Upload profile photo
router.post('/profile-photo', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, message: 'Only image files are allowed' });
    }

    // Update user profile photo
    await pool.query(
      'UPDATE users SET profile_photo = $1 WHERE id = $2',
      [`/uploads/${req.file.filename}`, req.user.id]
    );

    res.json({
      ok: true,
      profilePhoto: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ ok: false, message: 'Failed to upload profile photo' });
  }
});

// Upload group photo
router.post('/group-photo/:conversationId', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, message: 'Only image files are allowed' });
    }

    // Check if user is admin
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (participant.rows.length === 0 || !participant.rows[0].is_admin) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ ok: false, message: 'Not authorized to update group photo' });
    }

    // Update conversation group photo
    await pool.query(
      'UPDATE conversations SET group_photo = $1 WHERE id = $2',
      [`/uploads/${req.file.filename}`, conversationId]
    );

    res.json({
      ok: true,
      groupPhoto: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Group photo upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ ok: false, message: 'Failed to upload group photo' });
  }
});

// Get attachment by ID
router.get('/attachment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await pool.query(
      `SELECT a.*, m.sender_id, m.conversation_id
       FROM attachments a
       JOIN messages m ON a.message_id = m.id
       WHERE a.id = $1`,
      [id]
    );

    if (attachment.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Attachment not found' });
    }

    const attachmentData = attachment.rows[0];

    // Check if user is participant in the conversation
    const participant = await pool.query(
      'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
      [attachmentData.conversation_id, req.user.id]
    );

    if (participant.rows.length === 0) {
      return res.status(403).json({ ok: false, message: 'Not authorized to access this attachment' });
    }

    // Send file
    if (fs.existsSync(attachmentData.file_path)) {
      res.sendFile(path.resolve(attachmentData.file_path));
    } else {
      res.status(404).json({ ok: false, message: 'File not found on server' });
    }
  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get attachment' });
  }
});

// Delete attachment
router.delete('/attachment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await pool.query(
      `SELECT a.*, m.sender_id
       FROM attachments a
       JOIN messages m ON a.message_id = m.id
       WHERE a.id = $1`,
      [id]
    );

    if (attachment.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Attachment not found' });
    }

    const attachmentData = attachment.rows[0];

    // Check if user owns the message
    if (attachmentData.sender_id !== req.user.id) {
      return res.status(403).json({ ok: false, message: 'Not authorized to delete this attachment' });
    }

    // Delete file from disk
    if (fs.existsSync(attachmentData.file_path)) {
      fs.unlinkSync(attachmentData.file_path);
    }

    // Delete from database
    await pool.query('DELETE FROM attachments WHERE id = $1', [id]);

    res.json({ ok: true, message: 'Attachment deleted' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete attachment' });
  }
});

module.exports = router;
