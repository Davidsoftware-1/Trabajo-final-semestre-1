const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'pangolingo-admin';
const dbFile = path.join(__dirname, 'pangolingo-db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: [] });

app.use(express.json());

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
}

initDb().catch((error) => {
  console.error('Error iniciando la base de datos:', error);
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
    passwordHash: user.password,
    passwordPlain: user.passwordPlain || null,
    provider: user.provider,
    xp: user.xp || 0,
    streak: user.streak || 0,
    completed: Array.isArray(user.completed) ? user.completed : []
  }));

  res.json({ ok: true, total: users.length, users });
});

app.post('/api/register', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ ok: false, message: 'Todos los campos son obligatorios.' });
    }

    const normalizedCorreo = normalizeEmail(correo);

    if (!isValidEmail(normalizedCorreo)) {
      return res.status(400).json({ ok: false, message: 'Ingresa un correo valido, por ejemplo usuario@empresa.com.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    await db.read();
    const existing = db.data.users.find((user) => user.correo === normalizedCorreo);
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Ese correo ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      nombre: nombre.trim(),
      correo: normalizedCorreo,
      password: passwordHash,
      passwordPlain: password,
      provider: getProviderFromEmail(normalizedCorreo),
      xp: 40,
      streak: 4,
      completed: [1]
    };

    db.data.users.push(user);
    await db.write();

    res.json({ ok: true, user: { id: user.id, nombre: user.nombre, correo: user.correo, provider: user.provider, xp: user.xp, streak: user.streak, completed: user.completed } });
  } catch (error) {
    console.error(error);
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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

    user.password = await bcrypt.hash(password, 10);
    user.passwordPlain = password;
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

app.listen(PORT, () => {
  console.log(`Pangolingo API corriendo en http://localhost:${PORT}`);
});
