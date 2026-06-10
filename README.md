# Trabajo-final-semestre-1
Pagina para aprender ingles llamada pangolingo donde vas a poder aprender ingles de la manera mas eficiente y productiva

## Despliegue en Railway (MEJOR OPCIÓN GRATUITA)

Railway es la mejor opción porque:
- ✅ **Persistencia gratuita** - Tus datos no se pierden al actualizar
- ✅ **Auto-deploy desde GitHub** - Solo haces push y se actualiza solo
- ✅ **Soporte completo de Node.js** - Express, Socket.io, lowdb funcionan perfectamente

### Pasos para desplegar en Railway:

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Haz clic en "Sign Up" o "Login"
   - Regístrate con tu cuenta de GitHub

2. **Crear nuevo proyecto**
   - En Railway, haz clic en **"+ New Project"** (botón arriba a la derecha)
   - Si no ves esa opción, ve directamente a: https://railway.app/new

3. **Conectar repositorio GitHub**
   - Busca la opción de **GitHub** o el icono de GitHub
   - Si es tu primera vez, autoriza a Railway a acceder a tus repositorios
   - Busca y selecciona tu repositorio `Trabajo-final-semestre-1`
   - Haz clic en **"Deploy Now"** o **"Import"**

4. **Esperar despliegue inicial**
   - Railway comenzará a desplegar automáticamente
   - Ve a la pestaña **"Deployments"** para ver el progreso
   - Espera a que aparezca **"Success"** (puede tardar 2-5 minutos)

5. **Configurar volumen persistente** (IMPORTANTE para datos)
   - Ve a la pestaña **"Volumes"** en tu proyecto Railway
   - Haz clic en **"+ New Volume"**
   - Nombre: `data`
   - Haz clic en **"Create"**

6. **Configurar variable de entorno**
   - Ve a la pestaña **"Variables"** en tu proyecto Railway
   - Haz clic en **"+ New Variable"**
   - Nombre: `RAILWAY_VOLUME_MOUNT_PATH`
   - Valor: `/data`
   - Haz clic en **"Add"**

7. **Redesplegar para aplicar cambios**
   - Ve a la pestaña **"Deployments"**
   - Haz clic en **"Redeploy"** (botón arriba a la derecha)
   - Espera a que termine el despliegue

8. **Obtener tu URL pública**
   - En la pestaña **"Deployments"**, verás la URL de tu aplicación
   - Será algo como: `https://tu-app.railway.app`
   - Esa es la URL que puedes compartir

### Cómo actualizar tu aplicación:

Para actualizar tu aplicación en Railway, solo necesitas:

1. Haz cambios en tu código local
2. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   ```
3. Railway detectará el push automáticamente y desplegará los cambios

### Notas importantes:

- ✅ La base de datos JSON (`pangolingo-db.json`) se guarda en el volumen persistente
- ✅ Los datos de usuarios se mantienen entre despliegues
- ✅ No necesitas hacer nada manual para actualizar, solo git push
- ✅ **Sistema de backup automático**: Se crean copias de seguridad cada hora
- ✅ **Persistencia garantizada**: Los usuarios registrados quedan de por vida en la base de datos
- ✅ **Sin eliminación de usuarios**: No hay funciones que eliminen usuarios del sistema

### Verificar estado de la base de datos:

Puedes verificar el estado de la base de datos accediendo a:
```
https://tu-app.railway.app/api/db-status
```

Este endpoint te mostrará:
- Número de usuarios registrados
- Tamaño de la base de datos
- Última modificación
- Número de backups disponibles
- Estado de persistencia

## Ejecución local

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:3000`
