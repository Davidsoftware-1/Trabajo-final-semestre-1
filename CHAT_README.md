# Pangolingo Chat System - Sistema de Chat en Tiempo Real

Un sistema de chat en tiempo real similar a WhatsApp diseñado para una plataforma de aprendizaje de idiomas, donde personas que quieren aprender inglés pueden comunicarse con hablantes nativos.

## 🚀 Características Principales

### Autenticación y Seguridad
- ✅ Registro con correo y contraseña
- ✅ Inicio de sesión con JWT
- ✅ Recuperación de contraseña
- ✅ Verificación por correo electrónico
- ✅ Contraseñas cifradas con bcrypt
- ✅ Protección contra spam
- ✅ Bloqueo de usuarios
- ✅ Sistema de reportes

### Perfil de Usuario
- ✅ Nombre y foto de perfil
- ✅ País
- ✅ Idioma nativo
- ✅ Idioma que desea aprender
- ✅ Nivel de idioma (A1-C2)
- ✅ Intereses
- ✅ Biografía
- ✅ Estado (en línea, desconectado, ausente)

### Sistema de Chat
- ✅ Mensajería en tiempo real con Socket.IO
- ✅ Envío instantáneo de mensajes
- ✅ Confirmación de entrega (✓)
- ✅ Confirmación de lectura (✓✓)
- ✅ Estados de usuario (en línea, escribiendo...)
- ✅ Última conexión
- ✅ Conversaciones directas y grupales
- ✅ Lista de conversaciones con último mensaje
- ✅ Contador de mensajes no leídos

### Gestión de Mensajes
- ✅ Enviar mensajes
- ✅ Editar mensajes
- ✅ Eliminar mensajes para todos
- ✅ Eliminar mensajes localmente
- ✅ Responder mensajes
- ✅ Historial de conversaciones

### Archivos Multimedia
- ✅ Imágenes
- ✅ PDF
- ✅ Documentos
- ✅ Audio
- ✅ Videos
- ✅ Límite de tamaño configurable (10MB por defecto)

### Emparejamiento Inteligente
- ✅ Búsqueda por idioma nativo
- ✅ Búsqueda por idioma a aprender
- ✅ Filtrado por intereses
- ✅ Búsqueda de compañeros de idioma

### Interfaz de Usuario
- ✅ Diseño similar a WhatsApp Web
- ✅ Lista de conversaciones a la izquierda
- ✅ Conversación activa a la derecha
- ✅ Mensajes enviados alineados a la derecha
- ✅ Mensajes recibidos alineados a la izquierda
- ✅ Diseño responsive para móviles
- ✅ Modo oscuro
- ✅ Indicadores de estado en tiempo real

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Socket.IO** - Comunicación en tiempo real
- **JWT** - Autenticación con tokens
- **bcryptjs** - Cifrado de contraseñas
- **Multer** - Subida de archivos
- **Nodemailer** - Envío de correos
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Gestión de variables de entorno

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (diseño personalizado similar a WhatsApp)
- **JavaScript (Vanilla)** - Lógica del cliente
- **Socket.IO Client** - Conexión en tiempo real
- **SweetAlert2** - Alertas personalizadas
- **Bootstrap 5** - Componentes UI
- **Font Awesome** - Iconos

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Git

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd Trabajo-final-semestre-1
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos PostgreSQL

#### Crear la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE pangolingo_chat;

# Salir de PostgreSQL
\q
```

#### Ejecutar el Schema

```bash
psql -U postgres -d pangolingo_chat -f database/schema.sql
```

### 4. Configurar Variables de Entorno

Copiar el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editar el archivo `.env` con tu configuración:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pangolingo_chat
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_cambia_esto_en_produccion
JWT_EXPIRES_IN=7d

# Email Configuration (opcional, para verificación)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicación
EMAIL_FROM=Pangolingo <noreply@pangolingo.com>

# Server Configuration
PORT=3000
CHAT_PORT=3001
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 5. Crear Directorio de Uploads

```bash
mkdir uploads
```

## 🚀 Ejecución

### Modo Desarrollo (Ambos Servidores)

```bash
npm run dev
```

Esto iniciará:
- Servidor principal en `http://localhost:3000`
- Servidor de chat en `http://localhost:3001`

### Servidor Principal Solamente

```bash
npm start
```

### Servidor de Chat Solamente

```bash
npm run chat
```

### Acceder a la Aplicación

- **Aplicación Principal**: http://localhost:3000/app.html
- **Sistema de Chat**: http://localhost:3001/chat.html

## 📁 Estructura del Proyecto

```
Trabajo-final-semestre-1/
├── database/
│   └── schema.sql                 # Schema de base de datos PostgreSQL
├── config/
│   └── database.js                # Configuración de PostgreSQL
├── middleware/
│   └── auth.js                    # Middleware de autenticación JWT
├── routes/
│   ├── auth.js                    # Rutas de autenticación
│   ├── users.js                   # Rutas de usuarios
│   ├── conversations.js           # Rutas de conversaciones
│   └── uploads.js                 # Rutas de subida de archivos
├── socket/
│   └── socket.js                  # Configuración de Socket.IO
├── css/
│   ├── style.css                  # Estilos principales
│   └── chat.css                   # Estilos del chat (WhatsApp-like)
├── js/
│   ├── app-main.js                # Lógica principal de la app
│   ├── chat.js                    # Lógica del chat
│   └── levels/                    # Archivos de niveles de idioma
├── uploads/                       # Directorio para archivos subidos
├── server.js                      # Servidor principal
├── chat-server.js                 # Servidor de chat
├── chat.html                      # Interfaz del chat
├── app.html                       # Interfaz principal
├── index.html                     # Página de inicio
├── .env                           # Variables de entorno
├── .env.example                   # Ejemplo de variables de entorno
├── package.json                   # Dependencias y scripts
└── CHAT_README.md                 # Este archivo
```

## 🔐 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/verify-email?token=xxx` - Verificar correo
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contraseña

### Usuarios

- `GET /api/users/profile` - Obtener perfil propio
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/:id` - Obtener perfil de otro usuario
- `GET /api/users/search/match` - Buscar compañeros
- `PUT /api/users/status` - Actualizar estado
- `POST /api/users/block/:userId` - Bloquear usuario
- `DELETE /api/users/block/:userId` - Desbloquear usuario
- `GET /api/users/blocked/list` - Lista de bloqueados
- `POST /api/users/report/:userId` - Reportar usuario

### Conversaciones

- `GET /api/conversations` - Lista de conversaciones
- `POST /api/conversations/direct` - Crear conversación directa
- `POST /api/conversations/group` - Crear grupo
- `GET /api/conversations/:id` - Detalles de conversación
- `GET /api/conversations/:id/messages` - Mensajes de conversación
- `PUT /api/conversations/:id` - Actualizar conversación
- `POST /api/conversations/:id/participants` - Añadir participante
- `DELETE /api/conversations/:id/participants/:userId` - Eliminar participante
- `POST /api/conversations/:id/leave` - Abandonar conversación

### Uploads

- `POST /api/uploads/message/:messageId` - Subir archivo a mensaje
- `POST /api/uploads/profile-photo` - Subir foto de perfil
- `POST /api/uploads/group-photo/:conversationId` - Subir foto de grupo
- `GET /api/uploads/attachment/:id` - Descargar archivo
- `DELETE /api/uploads/attachment/:id` - Eliminar archivo

## 🔌 Socket.IO Events

### Cliente → Servidor

- `conversation:join` - Unirse a conversación
- `conversation:leave` - Abandonar conversación
- `message:send` - Enviar mensaje
- `typing:start` - Iniciar indicador de escritura
- `typing:stop` - Detener indicador de escritura
- `message:edit` - Editar mensaje
- `message:delete` - Eliminar mensaje
- `message:read` - Marcar mensaje como leído

### Servidor → Cliente

- `message:new` - Nuevo mensaje recibido
- `message:delivered` - Mensaje entregado
- `message:read` - Mensaje leído
- `message:edited` - Mensaje editado
- `message:deleted` - Mensaje eliminado
- `user:typing` - Usuario escribiendo
- `user:status` - Cambio de estado de usuario
- `error` - Error del servidor

## 🎯 Casos de Uso

### 1. Registro y Primer Acceso

1. El usuario se registra en `chat.html`
2. Completa su perfil (idiomas, nivel, intereses)
3. Busca compañeros de idioma
4. Inicia una conversación

### 2. Chat en Tiempo Real

1. El usuario selecciona una conversación
2. Escribe y envía mensajes
3. Recibe mensajes instantáneamente
4. Ve confirmaciones de entrega y lectura
5. Puede editar o eliminar mensajes

### 3. Emparejamiento

1. El usuario hace clic en "Buscar compañeros"
2. Filtra por idioma nativo y a aprender
3. Ve la lista de usuarios compatibles
4. Inicia conversación con el deseado

### 4. Gestión de Archivos

1. El usuario hace clic en el ícono de clip
2. Selecciona archivos (imágenes, PDF, etc.)
3. Los archivos se suben y envían
4. El destinatario puede descargarlos

## 🔒 Seguridad

- Contraseñas cifradas con bcrypt
- Tokens JWT para autenticación
- Validación de entrada en todos los endpoints
- Límite de tamaño de archivos
- Protección contra SQL injection (parámetros preparados)
- CORS configurado
- Bloqueo y reporte de usuarios

## 🚀 Despliegue

### Requisitos de Producción

1. Cambiar `NODE_ENV` a `production`
2. Usar un secreto JWT fuerte
3. Configurar HTTPS
4. Usar una base de datos PostgreSQL en la nube
5. Configurar un servicio de correo real
6. Usar un CDN para archivos estáticos
7. Configurar un balanceador de carga
8. Implementar logging y monitoreo

### Servidores Sugeridos

- **Backend**: Heroku, DigitalOcean, AWS EC2, Google Cloud
- **Base de Datos**: PostgreSQL en Heroku, AWS RDS, Google Cloud SQL
- **Archivos**: AWS S3, Cloudinary, Firebase Storage
- **Correo**: SendGrid, Mailgun, AWS SES

## 🔄 Escalabilidad

La arquitectura está diseñada para ser escalable:

- **Base de datos**: PostgreSQL soporta alta concurrencia
- **Socket.IO**: Puede usar Redis adapter para múltiples servidores
- **Archivos**: Sistema de subida separado (S3, Cloudinary)
- **Frontend**: Puede migrarse a React/Angular para SPA
- **API**: Puede usar GraphQL para consultas más eficientes

## 🎨 Personalización

### Colores y Tema

Editar `css/chat.css` para personalizar:

```css
:root {
    --primary-color: #00a884;
    --background-color: #111b21;
    --sidebar-color: #111b21;
    --message-sent: #005c4b;
    --message-received: #202c33;
}
```

### Configuración del Servidor

Editar `.env` para ajustar:

- Puertos del servidor
- Tamaño máximo de archivos
- Tiempo de expiración de tokens
- Configuración de correo

## 🐛 Solución de Problemas

### Error de Conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Verificar credenciales en .env
# Verificar que la base de datos existe
```

### Socket.IO No Conecta

```bash
# Verificar que el servidor de chat está corriendo
# Verificar el puerto en .env (CHAT_PORT)
# Verificar CORS configuration
```

### Archivos No Se Suben

```bash
# Verificar que el directorio uploads existe
# Verificar permisos de escritura
# Verificar tamaño máximo de archivo
```

## 📝 Próximas Características (Roadmap)

- [ ] Videollamadas (WebRTC)
- [ ] Traducción automática en tiempo real
- [ ] Salas grupales
- [ ] Emparejamiento inteligente con IA
- [ ] Mensajes de voz
- [ ] Reacciones a mensajes (emojis)
- [ ] Mensajes temporales
- [ ] Integración con calendario
- [ ] Estadísticas de aprendizaje
- [ ] Gamificación

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es parte de un trabajo académico final de semestre.

## 👥 Autores

- David Software - Desarrollo completo del sistema de chat

## 📞 Soporte

Para preguntas o problemas:
- Abrir un issue en el repositorio
- Contactar al desarrollador

---

**Nota**: Este es un sistema de chat completo en tiempo real diseñado específicamente para aprendizaje de idiomas. La arquitectura es modular y escalable, permitiendo agregar fácilmente nuevas características en el futuro.
