const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'pangolingo-admin';

// Administradores fijos
const ADMIN_USERS = [
  { email: 'gonzalezbernalsteeven@gmail.com', password: 'Barcelona', name: 'Steeven Gonzalez' },
  { email: 'smarin_1171@unihumboldt.edu.co', password: '1094911727', name: 'Santiago Marin' },
  { email: 'djlopez_1247@unihumboldt.edu.co', password: '@Dav1091@', name: 'David Lopez' },
  { email: 'magiraldo_1283@unihumboldt.edu.co', password: 'pangolin', name: 'Miguel Giraldo' },
  { email: 'jsgonzalez_1063@unihumboldt.edu.co', password: 'redhat', name: 'Juan Sebastian Gonzalez' }
];

// Railway: usar /data para persistencia
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const dbFile = path.join(dataDir, 'pangolingo-db.json');

// Asegurar que el directorio existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;
let chatDb;

const chatDbFile = path.join(dataDir, 'database', 'chat-database.json');

async function initLowdb() {
  const { Low } = await import('lowdb');
  const { JSONFile } = await import('lowdb/node');

  const adapter = new JSONFile(dbFile);
  db = new Low(adapter, { users: [] });

  const chatDbDir = path.join(dataDir, 'database');
  if (!fs.existsSync(chatDbDir)) {
    fs.mkdirSync(chatDbDir, { recursive: true });
  }
  const chatAdapter = new JSONFile(chatDbFile);
  chatDb = new Low(chatAdapter, { users: [], conversations: [], messages: [] });
}

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/pangolingo-db.json', (req, res) => {
  res.status(403).json({ ok: false, message: 'Acceso directo a la base de datos bloqueado.' });
});

app.use(express.static(__dirname));

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getEmailDomain(email) {
  return normalizeEmail(email).split('@')[1] || '';
}

function isValidEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail);
}

function getProviderFromEmail(email) {
  const domain = getEmailDomain(email);
  const knownProviders = {
    'gmail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'live.com': 'Microsoft',
    'yahoo.com': 'Yahoo'
  };

  return knownProviders[domain] || domain;
}

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
  await db.write();
  console.log(`[DB] Base de datos lista (${dbFile}). Usuarios: ${db.data.users.length}`);
  
  // Backup automático cada hora
  setInterval(async () => {
    try {
      await db.read();
      const backupFile = path.join(dataDir, `pangolingo-db-backup-${Date.now()}.json`);
      const fs = require('fs');
      fs.copyFileSync(dbFile, backupFile);
      console.log(`[DB] Backup creado: ${backupFile}`);
      
      // Mantener solo los últimos 5 backups
      const files = fs.readdirSync(dataDir)
        .filter(f => f.startsWith('pangolingo-db-backup-'))
        .sort()
        .reverse();
      
      if (files.length > 5) {
        files.slice(5).forEach(f => {
          fs.unlinkSync(path.join(dataDir, f));
          console.log(`[DB] Backup antiguo eliminado: ${f}`);
        });
      }
    } catch (error) {
      console.error('[DB] Error en backup automático:', error);
    }
  }, 60 * 60 * 1000); // Cada hora
}

// startup sequence moved to bottom

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Pangolingo API activa' });
});

app.get('/api/db-status', async (req, res) => {
  try {
    await db.read();
    const fs = require('fs');
    const stats = fs.statSync(dbFile);
    const backups = fs.readdirSync(dataDir)
      .filter(f => f.startsWith('pangolingo-db-backup-'))
      .length;
    
    res.json({
      ok: true,
      users: db.data.users.length,
      dbFile: dbFile,
      dbSize: stats.size,
      lastModified: stats.mtime,
      backups: backups,
      dataDir: dataDir,
      persistent: !!process.env.RAILWAY_VOLUME_MOUNT_PATH
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

function isAdmin(req) {
  return req.get('x-admin-key') === ADMIN_KEY;
}

// Endpoint de login para administradores
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Correo y contraseña requeridos.' });
  }

  const normalizedEmail = normalizeEmail(email);
  const admin = ADMIN_USERS.find(a => normalizeEmail(a.email) === normalizedEmail && a.password === password);

  if (!admin) {
    return res.status(401).json({ ok: false, message: 'Credenciales de administrador incorrectas.' });
  }

  // Generar token de sesión simple
  const adminToken = Buffer.from(`${admin.email}:${Date.now()}`).toString('base64');

  res.json({
    ok: true,
    admin: {
      email: admin.email,
      name: admin.name
    },
    token: adminToken
  });
});

// Middleware para verificar token de admin
function verifyAdminToken(req, res, next) {
  const token = req.get('x-admin-token');
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Token de administrador requerido.' });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    const admin = ADMIN_USERS.find(a => normalizeEmail(a.email) === normalizeEmail(email));

    if (!admin) {
      return res.status(401).json({ ok: false, message: 'Token de administrador inválido.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Token de administrador inválido.' });
  }
}

app.get('/api/admin/users', async (req, res) => {
  // Soportar ambos métodos: antiguo (admin-key) y nuevo (admin-token)
  const oldMethod = isAdmin(req);
  const token = req.get('x-admin-token');
  
  let newMethod = false;
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [email] = decoded.split(':');
      const admin = ADMIN_USERS.find(a => normalizeEmail(a.email) === normalizeEmail(email));
      if (admin) {
        req.admin = admin;
        newMethod = true;
      }
    } catch (error) {
      // Token inválido
    }
  }

  if (!oldMethod && !newMethod) {
    return res.status(401).json({ ok: false, message: 'Autenticación de administrador requerida.' });
  }

  await db.read();
  const users = db.data.users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    password: user.password,
    provider: user.provider,
    xp: user.xp || 0,
    streak: user.streak || 0,
    completed: Array.isArray(user.completed) ? user.completed : []
  }));

  res.json({ ok: true, total: users.length, users });
});

app.post('/api/register', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      console.warn('[REGISTER] Campos incompletos.');
      return res.status(400).json({ ok: false, message: 'Todos los campos son obligatorios.' });
    }

    const normalizedCorreo = normalizeEmail(correo);
    console.log('Correo normalizado:', normalizedCorreo);

    if (!isValidEmail(normalizedCorreo)) {
      console.warn('[REGISTER] Correo inválido:', normalizedCorreo);
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido, por ejemplo usuario@empresa.com.' });
    }

    if (password.length < 6) {
      console.warn('[REGISTER] Contraseña demasiado corta.');
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    console.log('Leyendo base de datos...');
    await db.read();
    console.log('Base de datos leída:', db.data);
    const existing = db.data.users.find((user) => user.correo === normalizedCorreo && !user.isChatUser);
    if (existing) {
      console.warn('[REGISTER] Correo ya registrado:', normalizedCorreo);
      return res.status(409).json({ ok: false, message: 'Ese correo ya está registrado.' });
    }

    const user = {
      id: Date.now(),
      nombre: nombre.trim(),
      correo: normalizedCorreo,
      password: password,
      provider: getProviderFromEmail(normalizedCorreo),
      xp: 40,
      streak: 4,
      completed: [1],
      isChatUser: false
    };

    console.log('Usuario a crear:', user);
    db.data.users.push(user);
    console.log('Escribiendo en base de datos...');
    await db.write();
    console.log('Usuario guardado exitosamente');

    res.status(201).json({ ok: true, user: { id: user.id, nombre: user.nombre, correo: user.correo, provider: user.provider, xp: user.xp, streak: user.streak, completed: user.completed } });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, message: 'No se pudo registrar el usuario.' });
  }
});

// Endpoint separado para registro del chat
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

app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, message: 'Correo y contraseña requeridos.' });
    }

    const normalizedCorreo = normalizeEmail(correo);

    if (!isValidEmail(normalizedCorreo)) {
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido.' });
    }

    await db.read();
    const user = db.data.users.find((entry) => entry.correo === normalizedCorreo && !entry.isChatUser);
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Usuario no encontrado.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ ok: false, message: 'Contraseña incorrecta.' });
    }

    const safeUser = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      provider: user.provider,
      xp: user.xp,
      streak: user.streak,
      completed: Array.isArray(user.completed) ? user.completed : [1]
    };

    res.json({ ok: true, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo iniciar sesión.' });
  }
});

// Endpoint separado para login del chat
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

// API del Chat - Obtener conversaciones del usuario
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

// API del Chat - Crear nueva conversación
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

// API del Chat - Obtener mensajes de una conversación
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

// API del Chat - Enviar mensaje
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

// API del Chat - Buscar usuarios
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

app.post('/api/recover-account', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, message: 'Correo y nueva contraseña requeridos.' });
    }

    const normalizedCorreo = normalizeEmail(correo);

    if (!isValidEmail(normalizedCorreo)) {
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    await db.read();
    const user = db.data.users.find((entry) => entry.correo === normalizedCorreo);
    if (!user) {
      return res.status(404).json({ ok: false, message: 'No encontramos una cuenta con ese correo.' });
    }

    user.password = password;
    await db.write();

    res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo recuperar la cuenta.' });
  }
});

app.get('/api/progress/:correo', async (req, res) => {
  const correo = decodeURIComponent(req.params.correo).toLowerCase();
  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);

  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  res.json({
    ok: true,
    xp: user.xp || 40,
    streak: user.streak || 4,
    completed: Array.isArray(user.completed) ? user.completed : [1]
  });
});

app.put('/api/progress/:correo', async (req, res) => {
  const correo = decodeURIComponent(req.params.correo).toLowerCase();
  const { xp, streak, completed } = req.body;

  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  user.xp = Number(xp) || 0;
  user.streak = Number(streak) || 0;
  user.completed = Array.isArray(completed) ? completed : [1];

  await db.write();

  res.json({ ok: true, message: 'Progreso guardado en la base de datos.' });
});

// Endpoint de traducción usando MyMemory API (gratuita)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'en', targetLang = 'es' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Texto requerido para traducción.' });
    }

    // Usar MyMemory API (gratuita, sin API key para uso básico)
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

    https.get(apiUrl, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.responseStatus === 200) {
            res.json({
              ok: true,
              translatedText: result.responseData.translatedText,
              originalText: text,
              source: 'MyMemory',
              sourceLang: sourceLang,
              targetLang: targetLang
            });
          } else {
            res.status(500).json({
              ok: false,
              message: result.responseDetails || 'Error en el servicio de traducción'
            });
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          res.status(500).json({ ok: false, message: 'Error al procesar la respuesta del servicio de traducción.' });
        }
      });
    }).on('error', (error) => {
      console.error('Error calling translation API:', error);
      res.status(500).json({ ok: false, message: 'Error al conectar con el servicio de traducción.' });
    });

  } catch (error) {
    console.error('Error en endpoint de traducción:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor en traducción.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('[JSON] Cuerpo de la petición no es JSON válido:', err.message);
    return res.status(400).json({ ok: false, message: 'El cuerpo de la petición no es JSON válido. Usa Content-Type: application/json.' });
  }

  console.error('[SERVER] Error no controlado:', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.', error: err && err.message });
});

initLowdb().then(() => {
  return initDb();
}).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch((error) => {
  console.error('[DB] Error iniciando:', error);
  process.exit(1);
});
