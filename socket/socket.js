const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Store online users: { userId: socketId }
const onlineUsers = new Map();
// Store typing status: { conversationId: { userId: boolean } }
const typingUsers = new Map();

function initializeSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    
    console.log(`User connected: ${userId}`);

    // Store user as online
    onlineUsers.set(userId, socket.id);

    // Update user status in database
    try {
      await pool.query(
        'UPDATE users SET status = $1, last_seen = CURRENT_TIMESTAMP WHERE id = $2',
        ['online', userId]
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Join all conversations the user is part of
    try {
      const conversationsResult = await pool.query(
        'SELECT conversation_id FROM participants WHERE user_id = $1',
        [userId]
      );

      conversationsResult.rows.forEach(row => {
        socket.join(`conversation:${row.conversation_id}`);
      });
    } catch (error) {
      console.error('Error joining conversations:', error);
    }

    // Notify friends that user is online
    io.emit('user:status', {
      userId,
      status: 'online'
    });

    // Handle joining a specific conversation
    socket.on('conversation:join', async (conversationId) => {
      try {
        // Check if user is participant
        const participant = await pool.query(
          'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
          [conversationId, userId]
        );

        if (participant.rows.length > 0) {
          socket.join(`conversation:${conversationId}`);
          
          // Mark messages as read
          await pool.query(
            `UPDATE messages 
             SET read_at = CURRENT_TIMESTAMP 
             WHERE conversation_id = $1 
             AND sender_id != $2 
             AND read_at IS NULL`,
            [conversationId, userId]
          );

          // Update participant's last read message
          const lastMessage = await pool.query(
            'SELECT id FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1',
            [conversationId]
          );

          if (lastMessage.rows.length > 0) {
            await pool.query(
              'UPDATE participants SET last_read_message_id = $1, unread_count = 0 WHERE conversation_id = $2 AND user_id = $3',
              [lastMessage.rows[0].id, conversationId, userId]
            );
          }

          // Notify other participants
          socket.to(`conversation:${conversationId}`).emit('messages:read', {
            conversationId,
            userId
          });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });

    // Handle leaving a conversation
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', replyToMessageId } = data;

        // Validate user is participant
        const participant = await pool.query(
          'SELECT * FROM participants WHERE conversation_id = $1 AND user_id = $2',
          [conversationId, userId]
        );

        if (participant.rows.length === 0) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        // Insert message
        const messageResult = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content, message_type, reply_to_message_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [conversationId, userId, content, messageType, replyToMessageId]
        );

        const message = messageResult.rows[0];

        // Update conversation's updated_at
        await pool.query(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [conversationId]
        );

        // Increment unread count for other participants
        await pool.query(
          `UPDATE participants 
           SET unread_count = unread_count + 1 
           WHERE conversation_id = $1 
           AND user_id != $2`,
          [conversationId, userId]
        );

        // Emit to all participants in conversation
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        // Emit delivery receipt
        io.to(`user:${userId}`).emit('message:delivered', {
          messageId: message.id,
          conversationId
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing:start', (conversationId) => {
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Map());
      }
      typingUsers.get(conversationId).set(userId, true);

      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        userId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (conversationId) => {
      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
      }

      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Handle message editing
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, newContent } = data;

        // Check if user owns the message
        const message = await pool.query(
          'SELECT * FROM messages WHERE id = $1 AND sender_id = $2',
          [messageId, userId]
        );

        if (message.rows.length === 0) {
          socket.emit('error', { message: 'Message not found or not authorized' });
          return;
        }

        // Update message
        const updatedMessage = await pool.query(
          `UPDATE messages 
           SET content = $1, edited = true, edited_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING *`,
          [newContent, messageId]
        );

        // Notify conversation participants
        io.to(`conversation:${message.rows[0].conversation_id}`).emit('message:edited', updatedMessage.rows[0]);
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, deleteForAll = false } = data;

        // Check if user owns the message
        const message = await pool.query(
          'SELECT * FROM messages WHERE id = $1 AND sender_id = $2',
          [messageId, userId]
        );

        if (message.rows.length === 0) {
          socket.emit('error', { message: 'Message not found or not authorized' });
          return;
        }

        if (deleteForAll) {
          await pool.query(
            'UPDATE messages SET deleted_for_all = true WHERE id = $1',
            [messageId]
          );

          io.to(`conversation:${message.rows[0].conversation_id}`).emit('message:deleted', {
            messageId,
            deleteForAll: true
          });
        } else {
          await pool.query(
            'UPDATE messages SET deleted_for_sender = true WHERE id = $1',
            [messageId]
          );

          socket.emit('message:deleted', {
            messageId,
            deleteForAll: false
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle message read receipt
    socket.on('message:read', async (data) => {
      try {
        const { messageId, conversationId } = data;

        await pool.query(
          `UPDATE messages 
           SET read_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [messageId]
        );

        // Update participant's last read message
        await pool.query(
          'UPDATE participants SET last_read_message_id = $1 WHERE conversation_id = $2 AND user_id = $3',
          [messageId, conversationId, userId]
        );

        // Notify sender
        const message = await pool.query('SELECT sender_id FROM messages WHERE id = $1', [messageId]);
        if (message.rows.length > 0) {
          io.to(`user:${message.rows[0].sender_id}`).emit('message:read', {
            messageId,
            conversationId,
            readerId: userId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);

      // Remove user from online users
      onlineUsers.delete(userId);

      // Update user status in database
      try {
        await pool.query(
          'UPDATE users SET status = $2, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
          [userId, 'offline']
        );
      } catch (error) {
        console.error('Error updating user status:', error);
      }

      // Notify friends that user is offline
      io.emit('user:status', {
        userId,
        status: 'offline'
      });

      // Clear typing status
      typingUsers.forEach((users, conversationId) => {
        users.delete(userId);
        if (users.size === 0) {
          typingUsers.delete(conversationId);
        } else {
          io.to(`conversation:${conversationId}`).emit('user:typing', {
            conversationId,
            userId,
            isTyping: false
          });
        }
      });
    });
  });

  return io;
}

module.exports = { initializeSocket, onlineUsers, typingUsers };
