const express = require('express');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'pangolingo-admin';
const dbFile = path.join(__dirname, 'pangolingo-db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: [] });

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
      completed: [1]
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

app.listen(PORT, () => {
  console.log(`Pangolingo API corriendo en http://localhost:${PORT}`);
});
