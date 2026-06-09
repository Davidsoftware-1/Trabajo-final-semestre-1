# APIs de Traducción Integradas - Pangolingo

## Overview
Se han integrado APIs de traducción gratuitas en el traductor de Pangolingo para complementar el diccionario local.

## APIs Integradas

### 1. MyMemory Translation API (Principal)
- **Estado**: Activo y configurado
- **Costo**: Gratuito (sin API key para uso básico)
- **Límites**: ~1000 palabras por día para uso gratuito
- **Idiomas**: Soporta múltiples pares de idiomas
- **URL**: https://api.mymemory.translated.net/get

### 2. LibreTranslate (Opcional)
- **Estado**: Configurado pero requiere API key
- **Costo**: Gratuito con API key (debido a abuso de bots)
- **Cómo activar**: Configurar API key en `translator-api.js`

## Funcionamiento

### Flujo de Traducción
1. **Primero**: Busca en el diccionario local (dictionary.js)
2. **Si no encuentra**: Usa MyMemory API automáticamente
3. **Fallback**: Si MyMemory falla, intenta con LibreTranslate (si está configurado)

### Modo Híbrido
El traductor ahora funciona en modo híbrido:
- **Diccionario local**: Para palabras comunes (rápido, sin conexión)
- **APIs externas**: Para palabras no encontradas (requiere conexión)

## Archivos Modificados

### 1. `js/translator-api.js` (NUEVO)
Módulo de integración de APIs de traducción con soporte para múltiples proveedores.

### 2. `js/app-main.js` (MODIFICADO)
- Integración con endpoint de traducción del servidor
- Lógica híbrida: diccionario local + APIs
- Indicadores de fuente de traducción

### 3. `server.js` (MODIFICADO)
- Nuevo endpoint: `POST /api/translate`
- Proxy para MyMemory API (evita problemas de CORS)
- Manejo de errores y rate limiting

### 4. `app.html` (MODIFICADO)
- Incluye script `translator-api.js`

## Uso

### Para el Usuario Final
1. Abre la aplicación en `http://localhost:3000`
2. Navega a la sección "Traductor"
3. Escribe una palabra en inglés o español
4. Si la palabra está en el diccionario local, mostrará "Fuente: Diccionario local"
5. Si no está, usará automáticamente la API y mostrará "Fuente: MyMemory API"

### Para Desarrolladores

#### Probar el Endpoint Directamente
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","sourceLang":"en","targetLang":"es"}'
```

#### Configurar LibreTranslate (Opcional)
En `js/translator-api.js`:
```javascript
translatorAPI.setLibreTranslateApiKey('tu-api-key-aqui');
```

#### Desactivar APIs (Usar solo diccionario local)
En `js/app-main.js`:
```javascript
let useAPIForTranslation = false;
```

## Ventajas

1. **Sin costo**: MyMemory API es gratuita para uso básico
2. **Expansión**: Traduce palabras que no están en el diccionario local
3. **Híbrido**: Mejor de ambos mundos (rapidez + cobertura)
4. **Resiliente**: Múltiples APIs con fallback
5. **Backend proxy**: Evita problemas de CORS

## Limitaciones

1. **MyMemory**: ~1000 palabras/día en plan gratuito
2. **Requiere conexión**: Las APIs necesitan internet
3. **Latencia**: Las APIs son más lentas que el diccionario local

## Próximas Mejoras (Opcionales)

- [ ] Agregar más APIs (Google Translate, DeepL)
- [ ] Caché de traducciones de APIs
- [ ] Soporte para frases completas (no solo palabras)
- [ ] Historial de traducciones
- [ ] Selección manual de API

## Soporte

Si necesitas agregar más APIs o configurar opciones adicionales, edita:
- `js/translator-api.js` (módulo de APIs)
- `server.js` (endpoint backend)
- `js/app-main.js` (lógica frontend)
