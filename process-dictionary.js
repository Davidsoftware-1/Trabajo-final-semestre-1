const fs = require('fs');

// Leer el diccionario descargado
const rawData = fs.readFileSync('./llm_dict_enes.json', 'utf8');
// El archivo está stringificado, así que necesitamos parsearlo dos veces
const dictArray = JSON.parse(JSON.parse(rawData));

// Convertir al formato simple { "english": "spanish" }
const dictionary = {};

dictArray.forEach(item => {
  if (item.word && item.translation) {
    // Extraer solo la primera traducción principal
    const translation = item.translation.split(';')[0].split(',')[0].trim();
    // Eliminar información gramatical entre paréntesis
    const cleanTranslation = translation.replace(/\([^)]*\)/g, '').trim();
    dictionary[item.word.toLowerCase()] = cleanTranslation;
  }
});

// Guardar en el formato correcto
const output = `const dictionary = ${JSON.stringify(dictionary, null, 2)};

// Diccionario inverso (Español → Inglés)
const reverseDictionary = {};
for (const [english, spanish] of Object.entries(dictionary)) {
  reverseDictionary[spanish] = english;
}
`;

fs.writeFileSync('./js/dictionary.js', output, 'utf8');
console.log(`Procesadas ${Object.keys(dictionary).length} palabras.`);
