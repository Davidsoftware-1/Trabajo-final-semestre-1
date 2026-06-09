// Retos del nivel A1 - Principiante
// 9 retos normales + evaluaciones después de cada 9 retos

const a1Challenges = [
  // Reto 1 - Saludos básicos
  {
    id: 'a1-1',
    type: 'challenge',
    title: 'Saludos Básicos',
    description: 'Aprende a saludar en inglés',
    successRate: 95,
    xp: 10,
    questions: [
      {
        prompt: '¿Cómo se dice "Hola" en inglés?',
        options: ['Hello', 'Goodbye', 'Thanks', 'Sorry'],
        answer: 'Hello'
      },
      {
        prompt: '¿Cómo se dice "Buenos días" en inglés?',
        options: ['Good night', 'Good morning', 'Good afternoon', 'Good evening'],
        answer: 'Good morning'
      },
      {
        prompt: '¿Qué significa "Goodbye"?',
        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        answer: 'Adiós'
      },
      {
        prompt: '¿Cómo se dice "¿Cómo estás?" en inglés?',
        options: ['What is your name?', 'How are you?', 'Where are you from?', 'How old are you?'],
        answer: 'How are you?'
      },
      {
        prompt: '¿Qué significa "Nice to meet you"?',
        options: ['Adiós', 'Gracias', 'Mucho gusto', 'Lo siento'],
        answer: 'Mucho gusto'
      }
    ]
  },
  // Reto 2 - Números 1-10
  {
    id: 'a1-2',
    type: 'challenge',
    title: 'Números 1-10',
    description: 'Aprende los números básicos',
    successRate: 90,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué número es "One"?',
        options: ['1', '2', '3', '4'],
        answer: '1'
      },
      {
        prompt: '¿Cómo se dice "5" en inglés?',
        options: ['Three', 'Four', 'Five', 'Six'],
        answer: 'Five'
      },
      {
        prompt: '¿Qué número es "Ten"?',
        options: ['8', '9', '10', '11'],
        answer: '10'
      },
      {
        prompt: '¿Cómo se dice "7" en inglés?',
        options: ['Five', 'Six', 'Seven', 'Eight'],
        answer: 'Seven'
      },
      {
        prompt: '¿Qué número es "Two"?',
        options: ['1', '2', '3', '4'],
        answer: '2'
      }
    ]
  },
  // Reto 3 - Colores básicos
  {
    id: 'a1-3',
    type: 'challenge',
    title: 'Colores Básicos',
    description: 'Aprende los colores principales',
    successRate: 88,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué color es "Red"?',
        options: ['Azul', 'Rojo', 'Verde', 'Amarillo'],
        answer: 'Rojo'
      },
      {
        prompt: '¿Cómo se dice "Azul" en inglés?',
        options: ['Red', 'Green', 'Blue', 'Yellow'],
        answer: 'Blue'
      },
      {
        prompt: '¿Qué color es "Green"?',
        options: ['Rojo', 'Azul', 'Verde', 'Negro'],
        answer: 'Verde'
      },
      {
        prompt: '¿Cómo se dice "Negro" en inglés?',
        options: ['White', 'Black', 'Brown', 'Gray'],
        answer: 'Black'
      },
      {
        prompt: '¿Qué color es "Yellow"?',
        options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
        answer: 'Amarillo'
      }
    ]
  },
  // Reto 4 - Familia básica
  {
    id: 'a1-4',
    type: 'challenge',
    title: 'Familia Básica',
    description: 'Aprende vocabulario de familia',
    successRate: 85,
    xp: 10,
    questions: [
      {
        prompt: '¿Cómo se dice "Madre" en inglés?',
        options: ['Father', 'Mother', 'Brother', 'Sister'],
        answer: 'Mother'
      },
      {
        prompt: '¿Qué significa "Father"?',
        options: ['Madre', 'Padre', 'Hermano', 'Hermana'],
        answer: 'Padre'
      },
      {
        prompt: '¿Cómo se dice "Hermano" en inglés?',
        options: ['Sister', 'Brother', 'Son', 'Daughter'],
        answer: 'Brother'
      },
      {
        prompt: '¿Qué significa "Sister"?',
        options: ['Hermano', 'Hermana', 'Hijo', 'Hija'],
        answer: 'Hermana'
      },
      {
        prompt: '¿Cómo se dice "Hijo" en inglés?',
        options: ['Daughter', 'Son', 'Brother', 'Father'],
        answer: 'Son'
      }
    ]
  },
  // Reto 5 - Animales básicos
  {
    id: 'a1-5',
    type: 'challenge',
    title: 'Animales Básicos',
    description: 'Aprende nombres de animales',
    successRate: 87,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué animal es "Dog"?',
        options: ['Gato', 'Perro', 'Pájaro', 'Pez'],
        answer: 'Perro'
      },
      {
        prompt: '¿Cómo se dice "Gato" en inglés?',
        options: ['Dog', 'Cat', 'Bird', 'Fish'],
        answer: 'Cat'
      },
      {
        prompt: '¿Qué animal es "Bird"?',
        options: ['Perro', 'Gato', 'Pájaro', 'Pez'],
        answer: 'Pájaro'
      },
      {
        prompt: '¿Cómo se dice "Pez" en inglés?',
        options: ['Bird', 'Fish', 'Dog', 'Cat'],
        answer: 'Fish'
      },
      {
        prompt: '¿Qué animal es "Horse"?',
        options: ['Perro', 'Gato', 'Caballo', 'Vaca'],
        answer: 'Caballo'
      }
    ]
  },
  // Reto 6 - Comida básica
  {
    id: 'a1-6',
    type: 'challenge',
    title: 'Comida Básica',
    description: 'Aprende vocabulario de comida',
    successRate: 86,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué comida es "Apple"?',
        options: ['Naranja', 'Manzana', 'Plátano', 'Uva'],
        answer: 'Manzana'
      },
      {
        prompt: '¿Cómo se dice "Pan" en inglés?',
        options: ['Bread', 'Water', 'Milk', 'Egg'],
        answer: 'Bread'
      },
      {
        prompt: '¿Qué significa "Water"?',
        options: ['Leche', 'Jugo', 'Agua', 'Café'],
        answer: 'Agua'
      },
      {
        prompt: '¿Cómo se dice "Huevo" en inglés?',
        options: ['Bread', 'Milk', 'Egg', 'Cheese'],
        answer: 'Egg'
      },
      {
        prompt: '¿Qué significa "Milk"?',
        options: ['Agua', 'Leche', 'Jugo', 'Café'],
        answer: 'Leche'
      }
    ]
  },
  // Reto 7 - Días de la semana
  {
    id: 'a1-7',
    type: 'challenge',
    title: 'Días de la Semana',
    description: 'Aprende los días de la semana',
    successRate: 84,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué día es "Monday"?',
        options: ['Martes', 'Miércoles', 'Lunes', 'Jueves'],
        answer: 'Lunes'
      },
      {
        prompt: '¿Cómo se dice "Viernes" en inglés?',
        options: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
        answer: 'Friday'
      },
      {
        prompt: '¿Qué día es "Sunday"?',
        options: ['Sábado', 'Domingo', 'Lunes', 'Martes'],
        answer: 'Domingo'
      },
      {
        prompt: '¿Cómo se dice "Miércoles" en inglés?',
        options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        answer: 'Wednesday'
      },
      {
        prompt: '¿Qué día es "Saturday"?',
        options: ['Jueves', 'Viernes', 'Sábado', 'Domingo'],
        answer: 'Sábado'
      }
    ]
  },
  // Reto 8 - Verbos básicos
  {
    id: 'a1-8',
    type: 'challenge',
    title: 'Verbos Básicos',
    description: 'Aprende verbos fundamentales',
    successRate: 82,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué significa "To be"?',
        options: ['Tener', 'Ser/Estar', 'Hacer', 'Ir'],
        answer: 'Ser/Estar'
      },
      {
        prompt: '¿Cómo se dice "Tener" en inglés?',
        options: ['To be', 'To have', 'To do', 'To go'],
        answer: 'To have'
      },
      {
        prompt: '¿Qué significa "To do"?',
        options: ['Ser/Estar', 'Tener', 'Hacer', 'Ir'],
        answer: 'Hacer'
      },
      {
        prompt: '¿Cómo se dice "Ir" en inglés?',
        options: ['To be', 'To have', 'To do', 'To go'],
        answer: 'To go'
      },
      {
        prompt: '¿Qué significa "To eat"?',
        options: ['Beber', 'Comer', 'Dormir', 'Correr'],
        answer: 'Comer'
      }
    ]
  },
  // Reto 9 - Pronombres personales
  {
    id: 'a1-9',
    type: 'challenge',
    title: 'Pronombres Personales',
    description: 'Aprende los pronombres básicos',
    successRate: 83,
    xp: 10,
    questions: [
      {
        prompt: '¿Qué pronombre es "I"?',
        options: ['Tú', 'Él', 'Yo', 'Nosotros'],
        answer: 'Yo'
      },
      {
        prompt: '¿Cómo se dice "Tú" en inglés?',
        options: ['I', 'You', 'He', 'She'],
        answer: 'You'
      },
      {
        prompt: '¿Qué pronombre es "He"?',
        options: ['Ella', 'Él', 'Nosotros', 'Ellos'],
        answer: 'Él'
      },
      {
        prompt: '¿Cómo se dice "Ella" en inglés?',
        options: ['He', 'She', 'It', 'They'],
        answer: 'She'
      },
      {
        prompt: '¿Qué pronombre es "We"?',
        options: ['Yo', 'Tú', 'Nosotros', 'Ellos'],
        answer: 'Nosotros'
      }
    ]
  },
  // Evaluación 1 - Repaso de saludos, números y colores
  {
    id: 'a1-eval1',
    type: 'evaluation',
    title: 'Evaluación 1',
    description: 'Repaso: Saludos, Números y Colores',
    successRate: 80,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Hola" en inglés?',
        options: ['Hello', 'Goodbye', 'Thanks', 'Sorry'],
        answer: 'Hello'
      },
      {
        prompt: '¿Qué número es "Five"?',
        options: ['4', '5', '6', '7'],
        answer: '5'
      },
      {
        prompt: '¿Qué color es "Blue"?',
        options: ['Rojo', 'Verde', 'Azul', 'Amarillo'],
        answer: 'Azul'
      },
      {
        prompt: '¿Cómo se dice "Adiós" en inglés?',
        options: ['Hello', 'Goodbye', 'Hi', 'Thanks'],
        answer: 'Goodbye'
      },
      {
        prompt: '¿Qué número es "Three"?',
        options: ['2', '3', '4', '5'],
        answer: '3'
      },
      {
        prompt: '¿Qué color es "Red"?',
        options: ['Azul', 'Rojo', 'Verde', 'Negro'],
        answer: 'Rojo'
      },
      {
        prompt: '¿Cómo se dice "Buenas noches" en inglés?',
        options: ['Good morning', 'Good afternoon', 'Good night', 'Good day'],
        answer: 'Good night'
      },
      {
        prompt: '¿Qué número es "Eight"?',
        options: ['7', '8', '9', '10'],
        answer: '8'
      },
      {
        prompt: '¿Qué color es "Green"?',
        options: ['Rojo', 'Azul', 'Amarillo', 'Verde'],
        answer: 'Verde'
      },
      {
        prompt: '¿Cómo se dice "¿Cómo estás?" en inglés?',
        options: ['What is your name?', 'How are you?', 'Where are you from?', 'How old are you?'],
        answer: 'How are you?'
      }
    ]
  }
];
