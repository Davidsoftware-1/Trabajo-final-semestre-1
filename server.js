const express = require('express');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
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

initDb().catch((error) => {
  console.error('[DB] Error iniciando la base de datos. ¿El archivo existe y se puede escribir?', error);
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pangolingo API corriendo en http://localhost:${PORT}`);
});
