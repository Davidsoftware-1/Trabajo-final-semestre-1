// Retos del nivel B1 - Intermedio
// 9 retos normales + evaluación después de cada 9 retos

const b1Challenges = [
  // Reto 1 - Trabajo y educación
  {
    id: 'b1-1',
    type: 'challenge',
    title: 'Trabajo y Educación',
    description: 'Vocabulario profesional y académico',
    successRate: 89,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Me gradué" en inglés?',
        options: ['I graduated', 'I graduate', 'I will graduate', 'I am graduating'],
        answer: 'I graduated'
      },
      {
        prompt: '¿Qué significa "I work as a manager"?',
        options: ['Trabajo como gerente', 'Trabajo como empleado', 'Trabajo como dueño', 'Trabajo como cliente'],
        answer: 'Trabajo como gerente'
      },
      {
        prompt: '¿Cómo se dice "Tengo una entrevista" en inglés?',
        options: ['I have a meeting', 'I have an interview', 'I have a presentation', 'I have a conference'],
        answer: 'I have an interview'
      },
      {
        prompt: '¿Qué significa "She got promoted"?',
        options: ['Ella fue despedida', 'Ella fue ascendida', 'Ella se jubiló', 'Ella renunció'],
        answer: 'Ella fue ascendida'
      },
      {
        prompt: '¿Cómo se dice "Estoy buscando empleo" en inglés?',
        options: ['I am looking for a job', 'I am looking for a house', 'I am looking for a car', 'I am looking for a friend'],
        answer: 'I am looking for a job'
      }
    ]
  },
  // Reto 2 - Viajes
  {
    id: 'b1-2',
    type: 'challenge',
    title: 'Viajes',
    description: 'Vocabulario para viajar',
    successRate: 87,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Reservé un hotel" en inglés?',
        options: ['I booked a hotel', 'I bought a hotel', 'I found a hotel', 'I sold a hotel'],
        answer: 'I booked a hotel'
      },
      {
        prompt: '¿Qué significa "I missed my flight"?',
        options: ['Perdí mi vuelo', 'Gané mi vuelo', 'Encontré mi vuelo', 'Tomé mi vuelo'],
        answer: 'Perdí mi vuelo'
      },
      {
        prompt: '¿Cómo se dice "El pasaporte" en inglés?',
        options: ['The ticket', 'The passport', 'The visa', 'The luggage'],
        answer: 'The passport'
      },
      {
        prompt: '¿Qué significa "We checked in"?',
        options: ['Nos registramos', 'Nos fuimos', 'Nos perdimos', 'Nos dormimos'],
        answer: 'Nos registramos'
      },
      {
        prompt: '¿Cómo se dice "Turista" en inglés?',
        options: ['Visitor', 'Tourist', 'Traveler', 'Passenger'],
        answer: 'Tourist'
      }
    ]
  },
  // Reto 3 - Salud y medicina
  {
    id: 'b1-3',
    type: 'challenge',
    title: 'Salud',
    description: 'Vocabulario médico y de salud',
    successRate: 85,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Tengo dolor de cabeza" en inglés?',
        options: ['I have a stomachache', 'I have a headache', 'I have a toothache', 'I have a backache'],
        answer: 'I have a headache'
      },
      {
        prompt: '¿Qué significa "I need a prescription"?',
        options: ['Necesito una receta', 'Necesito una operación', 'Necesito un descanso', 'Necesito una vacuna'],
        answer: 'Necesito una receta'
      },
      {
        prompt: '¿Cómo se dice "Médico" en inglés?',
        options: ['Nurse', 'Doctor', 'Patient', 'Surgeon'],
        answer: 'Doctor'
      },
      {
        prompt: '¿Qué significa "She recovered quickly"?',
        options: ['Ella empeoró rápido', 'Ella se recuperó rápido', 'Ella murió rápido', 'Ella durmió rápido'],
        answer: 'Ella se recuperó rápido'
      },
      {
        prompt: '¿Cómo se dice "Hospital" en inglés?',
        options: ['Clinic', 'Hospital', 'Pharmacy', 'Emergency'],
        answer: 'Hospital'
      }
    ]
  },
  // Reto 4 - Tecnología
  {
    id: 'b1-4',
    type: 'challenge',
    title: 'Tecnología',
    description: 'Vocabulario tecnológico',
    successRate: 88,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Descargué la aplicación" en inglés?',
        options: ['I uploaded the app', 'I downloaded the app', 'I installed the app', 'I deleted the app'],
        answer: 'I downloaded the app'
      },
      {
        prompt: '¿Qué significa "My computer crashed"?',
        options: ['Mi computadora funcionó', 'Mi computadora se cayó', 'Mi computadora falló', 'Mi computadora se actualizó'],
        answer: 'Mi computadora falló'
      },
      {
        prompt: '¿Cómo se dice "Contraseña" en inglés?',
        options: ['Username', 'Password', 'Email', 'Account'],
        answer: 'Password'
      },
      {
        prompt: '¿Qué significa "I connected to Wi-Fi"?',
        options: ['Me desconecté del Wi-Fi', 'Me conecté al Wi-Fi', 'Compré Wi-Fi', 'Vendí Wi-Fi'],
        answer: 'Me conecté al Wi-Fi'
      },
      {
        prompt: '¿Cómo se dice "Sitio web" en inglés?',
        options: ['Webpage', 'Website', 'Browser', 'Internet'],
        answer: 'Website'
      }
    ]
  },
  // Reto 5 - Medios de comunicación
  {
    id: 'b1-5',
    type: 'challenge',
    title: 'Medios de Comunicación',
    description: 'Noticias y entretenimiento',
    successRate: 86,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Leí las noticias" en inglés?',
        options: ['I watched the news', 'I read the news', 'I heard the news', 'I wrote the news'],
        answer: 'I read the news'
      },
      {
        prompt: '¿Qué significa "Breaking news"?',
        options: ['Noticias viejas', 'Noticias de última hora', 'Noticias falsas', 'Noticias deportivas'],
        answer: 'Noticias de última hora'
      },
      {
        prompt: '¿Cómo se dice "Documental" en inglés?',
        options: ['Movie', 'Series', 'Documentary', 'Show'],
        answer: 'Documentary'
      },
      {
        prompt: '¿Qué significa "I subscribe to this channel"?',
        options: ['Me suscribo a este canal', 'Me desuscribo de este canal', 'Veo este canal', 'Odio este canal'],
        answer: 'Me suscribo a este canal'
      },
      {
        prompt: '¿Cómo se dice "Red social" en inglés?',
        options: ['Social network', 'Social media', 'Social group', 'Social club'],
        answer: 'Social media'
      }
    ]
  },
  // Reto 6 - Medio ambiente
  {
    id: 'b1-6',
    type: 'challenge',
    title: 'Medio Ambiente',
    description: 'Ecología y sostenibilidad',
    successRate: 84,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Reciclo" en inglés?',
        options: ['I recycle', 'I reuse', 'I reduce', 'I refuse'],
        answer: 'I recycle'
      },
      {
        prompt: '¿Qué significa "Climate change"?',
        options: ['Cambio climático', 'Cambio de ropa', 'Cambio de casa', 'Cambio de trabajo'],
        answer: 'Cambio climático'
      },
      {
        prompt: '¿Cómo se dice "Contaminación" en inglés?',
        options: ['Population', 'Pollution', 'Solution', 'Evolution'],
        answer: 'Pollution'
      },
      {
        prompt: '¿Qué significa "Renewable energy"?',
        options: ['Energía nuclear', 'Energía renovable', 'Energía fósil', 'Energía solar'],
        answer: 'Energía renovable'
      },
      {
        prompt: '¿Cómo se dice "Proteger el planeta" en inglés?',
        options: ['Destroy the planet', 'Protect the planet', 'Ignore the planet', 'Leave the planet'],
        answer: 'Protect the planet'
      }
    ]
  },
  // Reto 7 - Relaciones personales
  {
    id: 'b1-7',
    type: 'challenge',
    title: 'Relaciones Personales',
    description: 'Amistad y relaciones',
    successRate: 83,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Nos conocimos en la universidad" en inglés?',
        options: ['We met at work', 'We met at university', 'We met at home', 'We met at school'],
        answer: 'We met at university'
      },
      {
        prompt: '¿Qué significa "We got along well"?',
        options: ['Nos peleamos bien', 'Nos llevamos bien', 'Nos ignoramos bien', 'Nos odiamos bien'],
        answer: 'Nos llevamos bien'
      },
      {
        prompt: '¿Cómo se dice "Mejor amigo" en inglés?',
        options: ['Worst friend', 'Best friend', 'Good friend', 'Old friend'],
        answer: 'Best friend'
      },
      {
        prompt: '¿Qué significa "They broke up"?',
        options: ['Ellos se casaron', 'Ellos se separaron', 'Ellos se conocieron', 'Ellos se enamoraron'],
        answer: 'Ellos se separaron'
      },
      {
        prompt: '¿Cómo se dice "Tener confianza" en inglés?',
        options: ['To trust', 'To lie', 'To fight', 'To ignore'],
        answer: 'To trust'
      }
    ]
  },
  // Reto 8 - Finanzas personales
  {
    id: 'b1-8',
    type: 'challenge',
    title: 'Finanzas Personales',
    description: 'Dinero y presupuestos',
    successRate: 82,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Ahorro dinero" en inglés?',
        options: ['I spend money', 'I save money', 'I waste money', 'I lose money'],
        answer: 'I save money'
      },
      {
        prompt: '¿Qué significa "I am on a budget"?',
        options: ['Tengo mucho dinero', 'Estoy en presupuesto', 'No tengo dinero', 'Gasto mucho'],
        answer: 'Estoy en presupuesto'
      },
      {
        prompt: '¿Cómo se dice "Cuenta bancaria" en inglés?',
        options: ['Bank account', 'Credit card', 'Debit card', 'Cash'],
        answer: 'Bank account'
      },
      {
        prompt: '¿Qué significa "I invested in stocks"?',
        options: ['Invertí en acciones', 'Gasté en ropa', 'Compré comida', 'Vendí mi casa'],
        answer: 'Invertí en acciones'
      },
      {
        prompt: '¿Cómo se dice "Préstamo" en inglés?',
        options: ['Gift', 'Loan', 'Debt', 'Payment'],
        answer: 'Loan'
      }
    ]
  },
  // Reto 9 - Arte y cultura
  {
    id: 'b1-9',
    type: 'challenge',
    title: 'Arte y Cultura',
    description: 'Expresiones artísticas y culturales',
    successRate: 81,
    xp: 20,
    questions: [
      {
        prompt: '¿Cómo se dice "Me gusta la pintura" en inglés?',
        options: ['I like painting', 'I like drawing', 'I like singing', 'I like dancing'],
        answer: 'I like painting'
      },
      {
        prompt: '¿Qué significa "I visited a museum"?',
        options: ['Visité un restaurante', 'Visité un museo', 'Visité un parque', 'Visité una tienda'],
        answer: 'Visité un museo'
      },
      {
        prompt: '¿Cómo se dice "Concierto" en inglés?',
        options: ['Conference', 'Concert', 'Meeting', 'Party'],
        answer: 'Concert'
      },
      {
        prompt: '¿Qué significa "Traditional music"?',
        options: ['Música moderna', 'Música tradicional', 'Música electrónica', 'Música pop'],
        answer: 'Música tradicional'
      },
      {
        prompt: '¿Cómo se dice "Literatura" en inglés?',
        options: ['Literature', 'Library', 'Book', 'Story'],
        answer: 'Literature'
      }
    ]
  },
  // Evaluación 1 - Repaso de nivel B1
  {
    id: 'b1-eval1',
    type: 'evaluation',
    title: 'Evaluación B1',
    description: 'Repaso: Trabajo, Viajes, Salud y más',
    successRate: 75,
    xp: 35,
    questions: [
      {
        prompt: '¿Cómo se dice "Me gradué el año pasado" en inglés?',
        options: ['I graduate last year', 'I graduated last year', 'I will graduate last year', 'I am graduating last year'],
        answer: 'I graduated last year'
      },
      {
        prompt: '¿Qué significa "I booked a flight to London"?',
        options: ['Compré un vuelo a Londres', 'Reservé un vuelo a Londres', 'Cancelé un vuelo a Londres', 'Perdí un vuelo a Londres'],
        answer: 'Reservé un vuelo a Londres'
      },
      {
        prompt: '¿Cómo se dice "El médico me recetó medicina" en inglés?',
        options: ['The doctor gave me a gift', 'The doctor prescribed me medicine', 'The doctor sold me medicine', 'The doctor bought me medicine'],
        answer: 'The doctor prescribed me medicine'
      },
      {
        prompt: '¿Qué significa "I recycle plastic and paper"?',
        options: ['Tiro plástico y papel', 'Reciclo plástico y papel', 'Como plástico y papel', 'Vendo plástico y papel'],
        answer: 'Reciclo plástico y papel'
      },
      {
        prompt: '¿Cómo se dice "Ahorro para el futuro" en inglés?',
        options: ['I spend for the future', 'I save for the future', 'I waste for the future', 'I lose for the future'],
        answer: 'I save for the future'
      }
    ]
  }
];
