require('dotenv').config();
const express = require('express');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'pangolingo-admin';
const dbFile = path.join(__dirname, 'pangolingo-db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: [], messages: [] });

function createDefaultAcademicProgress(level = null) {
  const currentLevel = level || 'A1';
  return {
    assignedLevel: level,
    diagnosticCompleted: Boolean(level),
    currentLevel,
    currentUnit: `${currentLevel}-U1`,
    academicProgress: {
      completedUnits: [],
      completedQuizzes: [],
      passedExams: [],
      scores: {}
    }
  };
}

function normalizeUserProgress(user) {
  const defaults = createDefaultAcademicProgress(user.assignedLevel || user.currentLevel || null);
  user.xp = Number(user.xp) || 40;
  user.streak = Number(user.streak) || 4;
  user.completed = Array.isArray(user.completed) ? user.completed : [];
  user.assignedLevel = user.assignedLevel || defaults.assignedLevel || 'A1';
  user.diagnosticCompleted = typeof user.diagnosticCompleted === 'boolean' ? user.diagnosticCompleted : true;
  user.currentLevel = user.currentLevel || defaults.currentLevel;
  user.currentUnit = user.currentUnit || defaults.currentUnit;
  user.academicProgress = {
    ...defaults.academicProgress,
    ...(user.academicProgress || {})
  };
  user.academicProgress.completedUnits = Array.isArray(user.academicProgress.completedUnits)
    ? user.academicProgress.completedUnits
    : user.completed;
  user.academicProgress.completedQuizzes = Array.isArray(user.academicProgress.completedQuizzes) ? user.academicProgress.completedQuizzes : [];
  user.academicProgress.passedExams = Array.isArray(user.academicProgress.passedExams) ? user.academicProgress.passedExams : [];
  user.academicProgress.scores = user.academicProgress.scores && typeof user.academicProgress.scores === 'object' ? user.academicProgress.scores : {};
  return user;
}

function serializeProgress(user) {
  const normalized = normalizeUserProgress(user);
  return {
    xp: normalized.xp,
    streak: normalized.streak,
    completed: normalized.completed,
    assignedLevel: normalized.assignedLevel,
    diagnosticCompleted: normalized.diagnosticCompleted,
    currentLevel: normalized.currentLevel,
    currentUnit: normalized.currentUnit,
    academicProgress: normalized.academicProgress
  };
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
  db.data ||= { users: [], messages: [] };
  db.data.users ||= [];
  db.data.messages ||= [];
  await db.write();
  console.log(`[DB] Base de datos lista (${dbFile}). Usuarios: ${db.data.users.length}`);
}

initDb().catch((error) => {
  console.error('[DB] Error iniciando la base de datos. ¿El archivo existe y se puede escribir?', error);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Pangolingo API activa' });
});

function isAdmin(req) {
  return req.get('x-admin-key') === ADMIN_KEY;
}

app.get('/api/admin/users', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, message: 'Clave de administrador incorrecta.' });
  }

  await db.read();
  const users = db.data.users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    password: user.password,
    provider: user.provider,
    ...serializeProgress(user)
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
    const existing = db.data.users.find((user) => user.correo === normalizedCorreo);
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
      completed: [],
      ...createDefaultAcademicProgress(null),
      assignedLevel: null,
      diagnosticCompleted: false
    };

    console.log('Usuario a crear:', user);
    db.data.users.push(user);
    console.log('Escribiendo en base de datos...');
    await db.write();
    console.log('Usuario guardado exitosamente');

    res.status(201).json({ ok: true, user: { id: user.id, nombre: user.nombre, correo: user.correo, provider: user.provider, ...serializeProgress(user) } });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, message: 'No se pudo registrar el usuario.' });
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
    const user = db.data.users.find((entry) => entry.correo === normalizedCorreo);
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
      ...serializeProgress(user)
    };

    res.json({ ok: true, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo iniciar sesión.' });
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

  res.json({ ok: true, ...serializeProgress(user) });
});

app.put('/api/progress/:correo', async (req, res) => {
  const correo = decodeURIComponent(req.params.correo).toLowerCase();
  const { xp, streak, completed, assignedLevel, diagnosticCompleted, currentLevel, currentUnit, academicProgress } = req.body;

  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  user.xp = Number(xp) || 0;
  user.streak = Number(streak) || 0;
  user.completed = Array.isArray(completed) ? completed : [];
  user.assignedLevel = assignedLevel || user.assignedLevel || null;
  user.diagnosticCompleted = typeof diagnosticCompleted === 'boolean' ? diagnosticCompleted : user.diagnosticCompleted;
  user.currentLevel = currentLevel || user.currentLevel || user.assignedLevel || 'A1';
  user.currentUnit = currentUnit || user.currentUnit || `${user.currentLevel}-U1`;
  user.academicProgress = {
    ...(user.academicProgress || createDefaultAcademicProgress(user.assignedLevel).academicProgress),
    ...(academicProgress || {})
  };
  normalizeUserProgress(user);

  await db.write();

  res.json({ ok: true, message: 'Progreso guardado en la base de datos.' });
});

app.post('/api/presence', async (req, res) => {
  const correo = normalizeEmail(req.body && req.body.correo);
  if (!correo) {
    return res.status(400).json({ ok: false, message: 'Correo requerido.' });
  }

  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  user.lastSeen = Date.now();
  await db.write();
  res.json({ ok: true });
});

app.get('/api/chat/users', async (req, res) => {
  await db.read();
  const now = Date.now();
  const users = db.data.users.map((user) => ({
    nombre: user.nombre,
    correo: user.correo,
    online: Boolean(user.lastSeen && now - user.lastSeen < 45000)
  }));
  res.json({ ok: true, users });
});

app.get('/api/chat/messages', async (req, res) => {
  const user = normalizeEmail(req.query.user);
  const peer = normalizeEmail(req.query.peer);
  await db.read();
  const messages = (db.data.messages || []).filter((message) => {
    if (peer) {
      return message.type === 'private' && (
        (message.from === user && message.to === peer) ||
        (message.from === peer && message.to === user)
      );
    }
    return message.type === 'global';
  }).slice(-100);

  res.json({ ok: true, messages });
});

app.post('/api/chat/messages', async (req, res) => {
  const from = normalizeEmail(req.body && req.body.from);
  const to = normalizeEmail(req.body && req.body.to);
  const text = String((req.body && req.body.text) || '').trim();
  const type = to ? 'private' : 'global';

  if (!from || !text) {
    return res.status(400).json({ ok: false, message: 'Remitente y mensaje requeridos.' });
  }

  await db.read();
  const sender = db.data.users.find((user) => user.correo === from);
  if (!sender) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  const message = {
    id: Date.now(),
    type,
    from,
    fromName: sender.nombre,
    to: to || null,
    text: text.slice(0, 600),
    createdAt: new Date().toISOString()
  };
  db.data.messages ||= [];
  db.data.messages.push(message);
  await db.write();
  res.status(201).json({ ok: true, message });
});

app.post('/api/speaking', async (req, res) => {
  const correo = normalizeEmail(req.body && req.body.correo);
  const text = String((req.body && req.body.text) || '').trim();
  const level = String((req.body && req.body.level) || 'A1').toUpperCase();

  if (!correo || !text) {
    return res.status(400).json({ ok: false, message: 'Correo y texto requeridos.' });
  }

  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }

  const lower = text.toLowerCase();
  const correction = lower.includes('i am') || lower.includes("i'm")
    ? 'Your sentence has a clear subject and verb.'
    : 'Try adding a clear subject and verb, for example: I am learning English.';
  const reply = {
    id: Date.now(),
    userText: text,
    botText: `${level} practice: ${correction} A natural reply is: "That sounds interesting. Can you tell me more?"`,
    level,
    createdAt: new Date().toISOString()
  };

  user.speakingHistory = Array.isArray(user.speakingHistory) ? user.speakingHistory : [];
  user.speakingHistory.push(reply);
  await db.write();
  res.json({ ok: true, reply });
});

app.get('/api/speaking/:correo', async (req, res) => {
  const correo = normalizeEmail(decodeURIComponent(req.params.correo));
  await db.read();
  const user = db.data.users.find((entry) => entry.correo === correo);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
  }
  res.json({ ok: true, history: Array.isArray(user.speakingHistory) ? user.speakingHistory : [] });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LibreTranslate route ---
// POST /api/translate
// Body: { text: string, target: 'es'|'en'|..., source?: 'en'|'es'|... }
// Optional: set TRANSLATE_URL if you want to use a self-hosted LibreTranslate instance.
app.post('/api/translate', async (req, res) => {
  try {
    const { text, target, source } = req.body || {};
    if (!text || !target) {
      return res.status(400).json({ ok: false, message: 'Se requieren campos "text" y "target".' });
    }

    const translateUrl = process.env.TRANSLATE_URL || 'https://libretranslate.com/translate';
    const apiKey = process.env.TRANSLATE_API_KEY;
    const body = {
      q: String(text),
      source: source ? String(source) : 'auto',
      target: String(target),
      format: 'text'
    };

    if (apiKey) {
      body.api_key = apiKey;
    }

    const response = await fetch(translateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[TRANSLATE] LibreTranslate returned error', data);
      return res.status(response.status).json({ ok: false, message: data.error || 'Error en LibreTranslate.' });
    }

    const translated = data.translatedText || '';
    res.json({ ok: true, translated });
  } catch (err) {
    console.error('[TRANSLATE] Error:', err);
    res.status(500).json({ ok: false, message: 'Error en la traducción.', error: err && err.message });
  }
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('[JSON] Cuerpo de la petición no es JSON válido:', err.message);
    return res.status(400).json({ ok: false, message: 'El cuerpo de la petición no es JSON válido. Usa Content-Type: application/json.' });
  }

  console.error('[SERVER] Error no controlado:', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.', error: err && err.message });
});

app.listen(PORT, () => {
  console.log(`Pangolingo API corriendo en http://localhost:${PORT}`);
});
