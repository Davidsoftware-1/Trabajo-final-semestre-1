// Módulo de integración de APIs de traducción gratuitas
// Soporta múltiples APIs: MyMemory, LibreTranslate, y otras

class TranslationAPI {
  constructor() {
    this.apis = {
      mymemory: {
        name: 'MyMemory',
        url: 'https://api.mymemory.translated.net/get',
        enabled: true,
        rateLimit: 1000 // ms entre peticiones
      },
      libretranslate: {
        name: 'LibreTranslate',
        url: 'https://libretranslate.com/translate',
        enabled: false, // Requiere API key debido a abuso
        apiKey: null
      }
    };
    this.lastRequestTime = 0;
  }

  // Traducir usando MyMemory API (gratuita sin API key)
  async translateWithMyMemory(text, sourceLang, targetLang) {
    const url = `${this.apis.mymemory.url}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return {
          success: true,
          translatedText: data.responseData.translatedText,
          source: 'MyMemory',
          originalText: text
        };
      } else {
        throw new Error(data.responseDetails || 'Error en la traducción');
      }
    } catch (error) {
      console.error('Error en MyMemory API:', error);
      return {
        success: false,
        error: error.message,
        source: 'MyMemory'
      };
    }
  }

  // Traducir usando LibreTranslate (requiere API key)
  async translateWithLibreTranslate(text, sourceLang, targetLang) {
    if (!this.apis.libretranslate.enabled || !this.apis.libretranslate.apiKey) {
      return {
        success: false,
        error: 'LibreTranslate no está configurado (requiere API key)',
        source: 'LibreTranslate'
      };
    }

    try {
      const response = await fetch(this.apis.libretranslate.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apis.libretranslate.apiKey}`
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      const data = await response.json();
      
      if (data.translatedText) {
        return {
          success: true,
          translatedText: data.translatedText,
          source: 'LibreTranslate',
          originalText: text
        };
      } else {
        throw new Error(data.error || 'Error en la traducción');
      }
    } catch (error) {
      console.error('Error en LibreTranslate API:', error);
      return {
        success: false,
        error: error.message,
        source: 'LibreTranslate'
      };
    }
  }

  // Método principal de traducción con fallback
  async translate(text, sourceLang = 'en', targetLang = 'es') {
    // Normalizar códigos de idioma
    const normalizedSource = sourceLang.toLowerCase().substring(0, 2);
    const normalizedTarget = targetLang.toLowerCase().substring(0, 2);

    // Respetar rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.apis.mymemory.rateLimit) {
      await new Promise(resolve => 
        setTimeout(resolve, this.apis.mymemory.rateLimit - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    // Intentar con MyMemory primero (gratuita y sin API key)
    let result = await this.translateWithMyMemory(text, normalizedSource, normalizedTarget);
    
    if (result.success) {
      return result;
    }

    // Si MyMemory falla, intentar con LibreTranslate si está configurado
    if (this.apis.libretranslate.enabled) {
      result = await this.translateWithLibreTranslate(text, normalizedSource, normalizedTarget);
      if (result.success) {
        return result;
      }
    }

    // Si todas fallan, retornar error
    return {
      success: false,
      error: 'No se pudo traducir con ninguna API disponible',
      source: 'none'
    };
  }

  // Configurar LibreTranslate con API key
  setLibreTranslateApiKey(apiKey) {
    this.apis.libretranslate.apiKey = apiKey;
    this.apis.libretranslate.enabled = !!apiKey;
  }

  // Obtener estado de las APIs
  getAPIsStatus() {
    return {
      mymemory: {
        enabled: this.apis.mymemory.enabled,
        name: this.apis.mymemory.name
      },
      libretranslate: {
        enabled: this.apis.libretranslate.enabled,
        name: this.apis.libretranslate.name,
        hasApiKey: !!this.apis.libretranslate.apiKey
      }
    };
  }
}

// Crear instancia global
const translatorAPI = new TranslationAPI();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = translatorAPI;
}
