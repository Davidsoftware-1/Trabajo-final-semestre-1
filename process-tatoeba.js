const fs = require('fs');

// Leer el diccionario actual
const currentDictContent = fs.readFileSync('./js/dictionary.js', 'utf8');

// Extraer el objeto dictionary actual
const dictMatch = currentDictContent.match(/const dictionary = ({[\s\S]*?});/);
if (!dictMatch) {
  console.error('No se pudo extraer el diccionario actual');
  process.exit(1);
}

const currentDictionary = JSON.parse(dictMatch[1]);

// Leer el archivo Tatoeba
const tatoebaContent = fs.readFileSync('./spa.txt', 'utf8');
const lines = tatoebaContent.split('\n').filter(line => line.trim());

console.log(`Procesando ${lines.length} líneas del archivo Tatoeba...`);

// Procesar cada línea y agregar al diccionario
let addedCount = 0;
let skippedCount = 0;

lines.forEach(line => {
  const parts = line.split('\t');
  if (parts.length >= 2) {
    const english = parts[0].trim().toLowerCase();
    const spanish = parts[1].trim();
    
    // Solo agregar si la palabra en inglés no existe ya en el diccionario
    if (english && spanish && !currentDictionary[english]) {
      currentDictionary[english] = spanish;
      addedCount++;
    } else {
      skippedCount++;
    }
  }
});

console.log(`Agregadas ${addedCount} nuevas palabras`);
console.log(`Omitidas ${skippedCount} palabras (ya existían o inválidas)`);
console.log(`Total de palabras en diccionario: ${Object.keys(currentDictionary).length}`);

// Generar el diccionario inverso
const reverseDictionary = {};
for (const [english, spanish] of Object.entries(currentDictionary)) {
  reverseDictionary[spanish] = english;
}

// Guardar en el formato correcto
const output = `const dictionary = ${JSON.stringify(currentDictionary, null, 2)};

// Diccionario inverso (Español → Inglés)
const reverseDictionary = ${JSON.stringify(reverseDictionary, null, 2)};
`;

fs.writeFileSync('./js/dictionary.js', output, 'utf8');
console.log('Diccionario actualizado exitosamente.');
