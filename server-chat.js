const express = require('express');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.CHAT_PORT || 3001;

// Base de datos del chat
const dataDir = path.join(__dirname, 'database');
const chatDbFile = path.join(dataDir, 'chat-database.json');

// Asegurar que el directorio existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const chatAdapter = new JSONFile(chatDbFile);
const chatDb = new Low(chatAdapter, { users: [], conversations: [], messages: [] });

// Inicializar base de datos
chatDb.read().then(() => {
  if (!chatDb.data.users) chatDb.data.users = [];
  if (!chatDb.data.conversations) chatDb.data.conversations = [];
  if (!chatDb.data.messages) chatDb.data.messages = [];
  chatDb.write();
}).catch(() => {
  chatDb.data = { users: [], conversations: [], messages: [] };
  chatDb.write();
});

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Helper functions
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getProviderFromEmail(email) {
  const domain = email.split('@')[1];
  if (domain === 'gmail.com') return 'gmail';
  if (domain === 'yahoo.com') return 'yahoo';
  if (domain === 'outlook.com' || domain === 'hotmail.com') return 'outlook';
  if (domain === 'unihumboldt.edu.co') return 'unihumboldt';
  return 'other';
}

// Chat Authentication Endpoints

// Registro del chat
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Datos recibidos para registro de chat:', req.body);
    const { name, email, password, phone, native_language, learning_language, language_level, country } = req.body;

    if (!name || !email || !password || !phone) {
      console.warn('[CHAT REGISTER] Campos incompletos.');
      return res.status(400).json({ ok: false, message: 'Todos los campos son obligatorios.' });
    }

    const normalizedEmail = normalizeEmail(email);
    console.log('Correo normalizado:', normalizedEmail);

    if (!isValidEmail(normalizedEmail)) {
      console.warn('[CHAT REGISTER] Correo inválido:', normalizedEmail);
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido.' });
    }

    if (password.length < 6) {
      console.warn('[CHAT REGISTER] Contraseña demasiado corta.');
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validar teléfono (mínimo 7 dígitos)
    const phoneClean = phone.replace(/\s/g, '');
    if (phoneClean.length < 7) {
      console.warn('[CHAT REGISTER] Teléfono inválido:', phone);
      return res.status(400).json({ ok: false, message: 'Ingresa un número de teléfono válido.' });
    }

    console.log('Leyendo base de datos del chat...');
    await chatDb.read();
    console.log('Base de datos del chat leída:', chatDb.data);
    
    // Verificar si el correo ya está registrado en el chat
    const existingChatUser = chatDb.data.users.find((user) => user.correo === normalizedEmail);
    if (existingChatUser) {
      console.warn('[CHAT REGISTER] Correo ya registrado en el chat:', normalizedEmail);
      return res.status(409).json({ ok: false, message: 'Ese correo ya está registrado en el chat.' });
    }

    const chatUser = {
      id: Date.now(),
      nombre: name.trim(),
      correo: normalizedEmail,
      password: password,
      telefono: phoneClean,
      native_language: native_language || 'es',
      learning_language: learning_language || 'en',
      language_level: language_level || 'A1',
      country: country || '',
      provider: getProviderFromEmail(normalizedEmail),
      createdAt: new Date().toISOString()
    };

    console.log('Usuario de chat a crear:', chatUser);
    chatDb.data.users.push(chatUser);
    console.log('Escribiendo en base de datos del chat...');
    await chatDb.write();
    console.log('Usuario de chat guardado exitosamente');

    // Generar token para el chat
    const token = Buffer.from(JSON.stringify({
      userId: chatUser.id,
      email: chatUser.correo,
      timestamp: Date.now()
    })).toString('base64');

    res.status(201).json({ ok: true, user: { id: chatUser.id, nombre: chatUser.nombre, correo: chatUser.correo, telefono: chatUser.telefono }, token });
  } catch (error) {
    console.error('Error en registro de chat:', error);
    res.status(500).json({ ok: false, message: 'No se pudo registrar el usuario en el chat.' });
  }
});

// Login del chat
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Correo y contraseña requeridos.' });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido.' });
    }

    await chatDb.read();
    const user = chatDb.data.users.find((entry) => entry.correo === normalizedEmail);
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Usuario no encontrado en el chat.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ ok: false, message: 'Contraseña incorrecta.' });
    }

    const safeUser = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      native_language: user.native_language,
      learning_language: user.learning_language,
      language_level: user.language_level,
      country: user.country
    };

    // Generar token para el chat
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.correo,
      timestamp: Date.now()
    })).toString('base64');

    res.json({ ok: true, user: safeUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo iniciar sesión en el chat.' });
  }
});

// Chat API Endpoints

// Obtener conversaciones del usuario
app.get('/api/chat/conversations', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ ok: false, message: 'ID de usuario requerido.' });
    }

    await chatDb.read();
    const conversations = chatDb.data.conversations.filter(conv => 
      conv.participants.includes(parseInt(userId))
    );

    res.json({ ok: true, conversations });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ ok: false, message: 'No se pudieron obtener las conversaciones.' });
  }
});

// Crear nueva conversación
app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { userId, participantId } = req.body;
    
    if (!userId || !participantId) {
      return res.status(400).json({ ok: false, message: 'IDs de usuarios requeridos.' });
    }

    await chatDb.read();
    
    // Verificar si ya existe una conversación entre estos usuarios
    const existingConversation = chatDb.data.conversations.find(conv =>
      conv.participants.includes(parseInt(userId)) && 
      conv.participants.includes(parseInt(participantId))
    );

    if (existingConversation) {
      return res.json({ ok: true, conversation: existingConversation });
    }

    const newConversation = {
      id: Date.now(),
      participants: [parseInt(userId), parseInt(participantId)],
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageAt: null
    };

    chatDb.data.conversations.push(newConversation);
    await chatDb.write();

    res.status(201).json({ ok: true, conversation: newConversation });
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({ ok: false, message: 'No se pudo crear la conversación.' });
  }
});

// Obtener mensajes de una conversación
app.get('/api/chat/conversations/:conversationId/messages', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    
    await chatDb.read();
    const messages = chatDb.data.messages.filter(msg => 
      msg.conversationId === conversationId
    );

    res.json({ ok: true, messages });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ ok: false, message: 'No se pudieron obtener los mensajes.' });
  }
});

// Enviar mensaje
app.post('/api/chat/messages', async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ ok: false, message: 'Datos incompletos.' });
    }

    await chatDb.read();
    
    const newMessage = {
      id: Date.now(),
      conversationId: parseInt(conversationId),
      senderId: parseInt(senderId),
      content: content,
      timestamp: new Date().toISOString(),
      read: false
    };

    chatDb.data.messages.push(newMessage);
    
    // Actualizar última información de la conversación
    const conversation = chatDb.data.conversations.find(conv => conv.id === parseInt(conversationId));
    if (conversation) {
      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date().toISOString();
    }
    
    await chatDb.write();

    res.status(201).json({ ok: true, message: newMessage });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ ok: false, message: 'No se pudo enviar el mensaje.' });
  }
});

// Buscar usuarios
app.get('/api/chat/users', async (req, res) => {
  try {
    const query = req.query.query;
    const currentUserId = req.query.userId;
    
    await chatDb.read();
    
    let users = chatDb.data.users;
    
    if (query) {
      users = users.filter(user => 
        user.nombre.toLowerCase().includes(query.toLowerCase()) ||
        user.correo.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Excluir al usuario actual
    if (currentUserId) {
      users = users.filter(user => user.id !== parseInt(currentUserId));
    }
    
    // Retornar solo información pública
    const safeUsers = users.map(user => ({
      id: user.id,
      nombre: user.nombre,
      native_language: user.native_language,
      learning_language: user.learning_language,
      language_level: user.language_level,
      country: user.country
    }));

    res.json({ ok: true, users: safeUsers });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ ok: false, message: 'No se pudieron buscar usuarios.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Chat server is running' });
});

// Socket.IO Connection Handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('user:join', async (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);

    // Update user status to online
    await chatDb.read();
    const user = chatDb.data.users.find(u => u.id === parseInt(userId));
    if (user) {
      user.status = 'online';
      await chatDb.write();
    }

    // Notify other users
    io.emit('user:status', { userId, status: 'online' });
  });

  // Send message
  socket.on('message:send', async (data) => {
    try {
      const { conversationId, senderId, content } = data;

      await chatDb.read();

      const newMessage = {
        id: Date.now(),
        conversationId: parseInt(conversationId),
        senderId: parseInt(senderId),
        content: content,
        timestamp: new Date().toISOString(),
        read: false
      };

      chatDb.data.messages.push(newMessage);

      // Update conversation
      const conversation = chatDb.data.conversations.find(conv => conv.id === parseInt(conversationId));
      if (conversation) {
        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date().toISOString();
      }

      await chatDb.write();

      // Get conversation participants
      if (conversation) {
        conversation.participants.forEach(participantId => {
          const participantSocketId = connectedUsers.get(participantId.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('message:new', newMessage);
          }
        });
      }

      socket.emit('message:sent', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Typing indicator
  socket.on('typing:start', (data) => {
    const { conversationId, userId } = data;
    conversation.participants.forEach(participantId => {
      if (participantId !== userId) {
        const participantSocketId = connectedUsers.get(participantId.toString());
        if (participantSocketId) {
          io.to(participantSocketId).emit('user:typing', { conversationId, userId, isTyping: true });
        }
      }
    });
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, userId } = data;
    conversation.participants.forEach(participantId => {
      if (participantId !== userId) {
        const participantSocketId = connectedUsers.get(participantId.toString());
        if (participantSocketId) {
          io.to(participantSocketId).emit('user:typing', { conversationId, userId, isTyping: false });
        }
      }
    });
  });

  // Mark message as read
  socket.on('message:read', async (data) => {
    try {
      const { messageId } = data;
      await chatDb.read();
      const message = chatDb.data.messages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
        await chatDb.write();

        // Notify sender
        const senderSocketId = connectedUsers.get(message.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', { messageId });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId.toString());
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationId.toString());
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.userId.toString());

      // Update user status to offline
      await chatDb.read();
      const user = chatDb.data.users.find(u => u.id === parseInt(socket.userId));
      if (user) {
        user.status = 'offline';
        await chatDb.write();
      }

      // Notify other users
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
