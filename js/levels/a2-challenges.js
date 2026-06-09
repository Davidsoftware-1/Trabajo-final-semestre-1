// Retos del nivel A2 - Elemental
// 9 retos normales + evaluación después de cada 9 retos

const a2Challenges = [
  // Reto 1 - Rutina diaria
  {
    id: 'a2-1',
    type: 'challenge',
    title: 'Rutina Diaria',
    description: 'Aprende a describir tu día a día',
    successRate: 92,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Me despierto" en inglés?',
        options: ['I wake up', 'I get up', 'I go to bed', 'I sleep'],
        answer: 'I wake up'
      },
      {
        prompt: '¿Qué significa "I brush my teeth"?',
        options: ['Me lavo las manos', 'Me cepillo los dientes', 'Me peino', 'Me visto'],
        answer: 'Me cepillo los dientes'
      },
      {
        prompt: '¿Cómo se dice "Voy al trabajo" en inglés?',
        options: ['I go to school', 'I go to work', 'I go home', 'I go out'],
        answer: 'I go to work'
      },
      {
        prompt: '¿Qué significa "I have breakfast"?',
        options: ['Almuerzo', 'Ceno', 'Desayuno', 'Como'],
        answer: 'Desayuno'
      },
      {
        prompt: '¿Cómo se dice "Me ducho" en inglés?',
        options: ['I wash my face', 'I take a shower', 'I brush my hair', 'I get dressed'],
        answer: 'I take a shower'
      }
    ]
  },
  // Reto 2 - Tiempo verbal pasado
  {
    id: 'a2-2',
    type: 'challenge',
    title: 'Pasado Simple',
    description: 'Aprende a hablar del pasado',
    successRate: 88,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Ayer fui" en inglés?',
        options: ['Yesterday I go', 'Yesterday I went', 'Yesterday I will go', 'Yesterday I am going'],
        answer: 'Yesterday I went'
      },
      {
        prompt: '¿Qué significa "I played soccer"?',
        options: ['Jugaré fútbol', 'Juego fútbol', 'Jugué fútbol', 'Estaba jugando fútbol'],
        answer: 'Jugué fútbol'
      },
      {
        prompt: '¿Cómo se dice "Ella comió" en inglés?',
        options: ['She eat', 'She eats', 'She ate', 'She eating'],
        answer: 'She ate'
      },
      {
        prompt: '¿Qué significa "We studied yesterday"?',
        options: ['Estudiamos ayer', 'Estudiaremos ayer', 'Estudiamos hoy', 'Estábamos estudiando'],
        answer: 'Estudiamos ayer'
      },
      {
        prompt: '¿Cómo se dice "No fui" en inglés?',
        options: ['I not go', 'I didn\'t go', 'I don\'t go', 'I wasn\'t go'],
        answer: 'I didn\'t go'
      }
    ]
  },
  // Reto 3 - Compras
  {
    id: 'a2-3',
    type: 'challenge',
    title: 'Compras',
    description: 'Vocabulario para ir de compras',
    successRate: 90,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "¿Cuánto cuesta?" en inglés?',
        options: ['How many is it?', 'How much is it?', 'What price is it?', 'How cost it?'],
        answer: 'How much is it?'
      },
      {
        prompt: '¿Qué significa "I want to buy"?',
        options: ['Quiero vender', 'Quiero comprar', 'Quiero ver', 'Quiero usar'],
        answer: 'Quiero comprar'
      },
      {
        prompt: '¿Cómo se dice "Es muy caro" en inglés?',
        options: ['It\'s very cheap', 'It\'s very expensive', 'It\'s very good', 'It\'s very bad'],
        answer: 'It\'s very expensive'
      },
      {
        prompt: '¿Qué significa "Can I pay with card?"?',
        options: ['¿Puedo pagar en efectivo?', '¿Puedo pagar con tarjeta?', '¿Es gratis?', '¿Hay descuento?'],
        answer: '¿Puedo pagar con tarjeta?'
      },
      {
        prompt: '¿Cómo se dice "¿Tienes esto en talla M?" en inglés?',
        options: ['Do you have this in size M?', 'Have you this in size M?', 'You have this in size M?', 'This is size M?'],
        answer: 'Do you have this in size M?'
      }
    ]
  },
  // Reto 4 - Direcciones
  {
    id: 'a2-4',
    type: 'challenge',
    title: 'Direcciones',
    description: 'Cómo pedir y dar direcciones',
    successRate: 85,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "¿Dónde está el banco?" en inglés?',
        options: ['Where is the bank?', 'Where the bank is?', 'Where are the bank?', 'Where bank is?'],
        answer: 'Where is the bank?'
      },
      {
        prompt: '¿Qué significa "Turn left"?',
        options: ['Dobla a la derecha', 'Dobla a la izquierda', 'Sigue recto', 'Retrocede'],
        answer: 'Dobla a la izquierda'
      },
      {
        prompt: '¿Cómo se dice "Sigue recto" en inglés?',
        options: ['Turn right', 'Turn left', 'Go straight', 'Go back'],
        answer: 'Go straight'
      },
      {
        prompt: '¿Qué significa "It\'s next to the pharmacy"?',
        options: ['Está lejos de la farmacia', 'Está cerca de la farmacia', 'Está al lado de la farmacia', 'Está detrás de la farmacia'],
        answer: 'Está al lado de la farmacia'
      },
      {
        prompt: '¿Cómo se dice "Está a dos calles de aquí" en inglés?',
        options: ['It\'s two streets from here', 'It\'s two streets to here', 'It\'s two streets in here', 'It\'s two streets at here'],
        answer: 'It\'s two streets from here'
      }
    ]
  },
  // Reto 5 - Clima
  {
    id: 'a2-5',
    type: 'challenge',
    title: 'El Clima',
    description: 'Hablar del tiempo atmosférico',
    successRate: 87,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Hace sol" en inglés?',
        options: ['It\'s windy', 'It\'s sunny', 'It\'s rainy', 'It\'s cold'],
        answer: 'It\'s sunny'
      },
      {
        prompt: '¿Qué significa "It\'s raining"?',
        options: ['Está nevando', 'Está lloviendo', 'Está soleado', 'Está nublado'],
        answer: 'Está lloviendo'
      },
      {
        prompt: '¿Cómo se dice "Hace frío" en inglés?',
        options: ['It\'s hot', 'It\'s cold', 'It\'s warm', 'It\'s cool'],
        answer: 'It\'s cold'
      },
      {
        prompt: '¿Qué significa "It\'s snowing"?',
        options: ['Está lloviendo', 'Está nevando', 'Hay viento', 'Hay niebla'],
        answer: 'Está nevando'
      },
      {
        prompt: '¿Cómo se dice "Está nublado" en inglés?',
        options: ['It\'s sunny', 'It\'s cloudy', 'It\'s clear', 'It\'s bright'],
        answer: 'It\'s cloudy'
      }
    ]
  },
  // Reto 6 - Sentimientos
  {
    id: 'a2-6',
    type: 'challenge',
    title: 'Sentimientos',
    description: 'Expresar emociones y estados de ánimo',
    successRate: 86,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Estoy cansado" en inglés?',
        options: ['I\'m hungry', 'I\'m tired', 'I\'m thirsty', 'I\'m sleepy'],
        answer: 'I\'m tired'
      },
      {
        prompt: '¿Qué significa "I feel sad"?',
        options: ['Me siento feliz', 'Me siento triste', 'Me siento enojado', 'Me siento nervioso'],
        answer: 'Me siento triste'
      },
      {
        prompt: '¿Cómo se dice "Tengo hambre" en inglés?',
        options: ['I\'m thirsty', 'I\'m hungry', 'I\'m tired', 'I\'m cold'],
        answer: 'I\'m hungry'
      },
      {
        prompt: '¿Qué significa "She is excited"?',
        options: ['Ella está aburrida', 'Ella está emocionada', 'Ella está tranquila', 'Ella está preocupada'],
        answer: 'Ella está emocionada'
      },
      {
        prompt: '¿Cómo se dice "Estoy nervioso" en inglés?',
        options: ['I\'m calm', 'I\'m nervous', 'I\'m happy', 'I\'m relaxed'],
        answer: 'I\'m nervous'
      }
    ]
  },
  // Reto 7 - Tiempo libre y hobbies
  {
    id: 'a2-7',
    type: 'challenge',
    title: 'Tiempo Libre',
    description: 'Hablar de hobbies y actividades',
    successRate: 84,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Me gusta leer" en inglés?',
        options: ['I like to read', 'I like to write', 'I like to watch', 'I like to listen'],
        answer: 'I like to read'
      },
      {
        prompt: '¿Qué significa "I play guitar"?',
        options: ['Toco el piano', 'Toco la guitarra', 'Canto', 'Bailo'],
        answer: 'Toco la guitarra'
      },
      {
        prompt: '¿Cómo se dice "Veo películas" en inglés?',
        options: ['I read books', 'I watch movies', 'I listen to music', 'I play games'],
        answer: 'I watch movies'
      },
      {
        prompt: '¿Qué significa "She enjoys cooking"?',
        options: ['A ella le gusta cocinar', 'A ella le gusta limpiar', 'A ella le gusta comer', 'A ella le gusta trabajar'],
        answer: 'A ella le gusta cocinar'
      },
      {
        prompt: '¿Cómo se dice "Hago ejercicio" en inglés?',
        options: ['I eat food', 'I sleep', 'I exercise', 'I work'],
        answer: 'I exercise'
      }
    ]
  },
  // Reto 8 - Trabajo y ocupaciones
  {
    id: 'a2-8',
    type: 'challenge',
    title: 'Trabajo',
    description: 'Vocabulario de profesiones',
    successRate: 82,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Soy doctor" en inglés?',
        options: ['I am teacher', 'I am doctor', 'I am engineer', 'I am lawyer'],
        answer: 'I am doctor'
      },
      {
        prompt: '¿Qué significa "She works in an office"?',
        options: ['Ella trabaja en una escuela', 'Ella trabaja en una oficina', 'Ella trabaja en un hospital', 'Ella trabaja en una tienda'],
        answer: 'Ella trabaja en una oficina'
      },
      {
        prompt: '¿Cómo se dice "Él es chef" en inglés?',
        options: ['He is waiter', 'He is chef', 'He is cook', 'He is baker'],
        answer: 'He is chef'
      },
      {
        prompt: '¿Qué significa "I work from home"?',
        options: ['Trabajo en la oficina', 'Trabajo desde casa', 'Trabajo en la calle', 'Trabajo en el hospital'],
        answer: 'Trabajo desde casa'
      },
      {
        prompt: '¿Cómo se dice "Ella es maestra" en inglés?',
        options: ['She is doctor', 'She is teacher', 'She is nurse', 'She is engineer'],
        answer: 'She is teacher'
      }
    ]
  },
  // Reto 9 - Transporte
  {
    id: 'a2-9',
    type: 'challenge',
    title: 'Transporte',
    description: 'Medios de transporte y viajes',
    successRate: 83,
    xp: 15,
    questions: [
      {
        prompt: '¿Cómo se dice "Voy en autobús" en inglés?',
        options: ['I go by car', 'I go by bus', 'I go by train', 'I go by plane'],
        answer: 'I go by bus'
      },
      {
        prompt: '¿Qué significa "I take the subway"?',
        options: ['Tomo el autobús', 'Tomo el metro', 'Tomo el taxi', 'Tomo el tren'],
        answer: 'Tomo el metro'
      },
      {
        prompt: '¿Cómo se dice "Vuelo en avión" en inglés?',
        options: ['I fly by plane', 'I go by car', 'I travel by boat', 'I ride a bike'],
        answer: 'I fly by plane'
      },
      {
        prompt: '¿Qué significa "She drives to work"?',
        options: ['Ella camina al trabajo', 'Ella conduce al trabajo', 'Ella toma el autobús', 'Ella corre al trabajo'],
        answer: 'Ella conduce al trabajo'
      },
      {
        prompt: '¿Cómo se dice "Voy en bicicleta" en inglés?',
        options: ['I go by car', 'I go by bus', 'I ride a bike', 'I go by train'],
        answer: 'I ride a bike'
      }
    ]
  },
  // Evaluación 1 - Repaso de nivel A2
  {
    id: 'a2-eval1',
    type: 'evaluation',
    title: 'Evaluación A2',
    description: 'Repaso: Rutina, Pasado, Compras y más',
    successRate: 78,
    xp: 30,
    questions: [
      {
        prompt: '¿Cómo se dice "Ayer fui al cine" en inglés?',
        options: ['Yesterday I go to the cinema', 'Yesterday I went to the cinema', 'Yesterday I will go to the cinema', 'Yesterday I am going to the cinema'],
        answer: 'Yesterday I went to the cinema'
      },
      {
        prompt: '¿Qué significa "How much is this?"?',
        options: ['¿Cuántos hay?', '¿Cuánto cuesta esto?', '¿Qué es esto?', '¿Dónde está esto?'],
        answer: '¿Cuánto cuesta esto?'
      },
      {
        prompt: '¿Cómo se dice "Gira a la derecha" en inglés?',
        options: ['Turn left', 'Turn right', 'Go straight', 'Go back'],
        answer: 'Turn right'
      },
      {
        prompt: '¿Qué significa "It\'s windy"?',
        options: ['Hace sol', 'Hace calor', 'Hay viento', 'Está lloviendo'],
        answer: 'Hay viento'
      },
      {
        prompt: '¿Cómo se dice "Estoy emocionado" en inglés?',
        options: ['I\'m tired', 'I\'m sad', 'I\'m excited', 'I\'m nervous'],
        answer: 'I\'m excited'
      }
    ]
  }
];
