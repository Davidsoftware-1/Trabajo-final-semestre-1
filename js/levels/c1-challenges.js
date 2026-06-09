// Retos del nivel C1 - Avanzado
// 9 retos normales + evaluación después de cada 9 retos

const c1Challenges = [
  // Reto 1 - Lenguaje académico
  {
    id: 'c1-1',
    type: 'challenge',
    title: 'Lenguaje Académico',
    description: 'Vocabulario y expresiones para contextos académicos',
    successRate: 85,
    xp: 30,
    questions: [
      {
        prompt: '¿Cómo se dice "Hipótesis" en inglés?',
        options: ['Theory', 'Hypothesis', 'Thesis', 'Premise'],
        answer: 'Hypothesis'
      },
      {
        prompt: '¿Qué significa "To corroborate"?',
        options: ['Contradecir', 'Corroborar/confirmar', 'Investigar', 'Analizar'],
        answer: 'Corroborar/confirmar'
      },
      {
        prompt: '¿Cómo se dice "Metodología" en inglés?',
        options: ['Method', 'Methodology', 'Technique', 'Procedure'],
        answer: 'Methodology'
      },
      {
        prompt: '¿Qué significa "Peer-reviewed"?',
        options: ['Revisado por expertos', 'Revisado por pares', 'Revisado por estudiantes', 'Revisado por editores'],
        answer: 'Revisado por pares'
      },
      {
        prompt: '¿Cómo se dice "Conclusión" en inglés?',
        options: ['Introduction', 'Conclusion', 'Discussion', 'Results'],
        answer: 'Conclusion'
      }
    ]
  },
  // Reto 2 - Comunicación profesional avanzada
  {
    id: 'c1-2',
    type: 'challenge',
    title: 'Comunicación Profesional',
    description: 'Lenguaje corporativo de alto nivel',
    successRate: 83,
    xp: 30,
    questions: [
      {
        prompt: '¿Cómo se dice "Sinergia" en inglés?',
        options: ['Synergy', 'Strategy', 'Structure', 'System'],
        answer: 'Synergy'
      },
      {
        prompt: '¿Qué significa "To leverage"?',
        options: ['Ignorar', 'Aprovechar/maximizar', 'Evitar', 'Reducir'],
        answer: 'Aprovechar/maximizar'
      },
      {
        prompt: '¿Cómo se dice "Stakeholders" en español?',
        options: ['Clientes', 'Empleados', 'Partes interesadas', 'Competidores'],
        answer: 'Partes interesadas'
      },
      {
        prompt: '¿Qué significa "Scalable"?',
        options: ['Escalable', 'Fijo', 'Limitado', 'Temporal'],
        answer: 'Escalable'
      },
      {
        prompt: '¿Cómo se dice "ROI" (Return on Investment) en español?',
        options: ['Retorno de inversión', 'Riesgo de inversión', 'Ratio de inversión', 'Registro de inversión'],
        answer: 'Retorno de inversión'
      }
    ]
  },
  // Reto 3 - Estructuras gramaticales complejas
  {
    id: 'c1-3',
    type: 'challenge',
    title: 'Gramática Avanzada',
    description: 'Estructuras complejas y matices gramaticales',
    successRate: 80,
    xp: 30,
    questions: [
      {
        prompt: '¿Cuál es la forma correcta del condicional mixto?',
        options: ['If I would have known, I would tell you', 'If I had known, I would have told you', 'If I knew, I would tell you', 'If I know, I will tell you'],
        answer: 'If I had known, I would have told you'
      },
      {
        prompt: '¿Qué significa "I wish I had studied more"?',
        options: ['Ojalá estudie más', 'Ojalá hubiera estudiado más', 'Ojalá estudiaré más', 'Ojalá estuviera estudiando más'],
        answer: 'Ojalá hubiera estudiado más'
      },
      {
        prompt: '¿Cómo se dice "De haber sabido, habría venido" en inglés?',
        options: ['If I knew, I would come', 'Had I known, I would have come', 'If I would know, I would come', 'Knowing I would come'],
        answer: 'Had I known, I would have come'
      },
      {
        prompt: '¿Qué estructura se usa para algo que debió pasar pero no pasó?',
        options: ['Should have + past participle', 'Must have + past participle', 'Can have + past participle', 'May have + past participle'],
        answer: 'Should have + past participle'
      },
      {
        prompt: '¿Cómo se dice "Es probable que venga" en inglés formal?',
        options: ['He probable comes', 'He is likely to come', 'He probably comes', 'He will probable come'],
        answer: 'He is likely to come'
      }
    ]
  },
  // Reto 4 - Vocabulario abstracto
  {
    id: 'c1-4',
    type: 'challenge',
    title: 'Conceptos Abstractos',
    description: 'Términos filosóficos y conceptuales',
    successRate: 78,
    xp: 30,
    questions: [
      {
        prompt: '¿Cómo se dice "Paradigma" en inglés?',
        options: ['Paradigm', 'Paradox', 'Parameter', 'Pattern'],
        answer: 'Paradigm'
      },
      {
        prompt: '¿Qué significa "Ambiguous"?',
        options: ['Claro', 'Ambiguo/dudoso', 'Cierto', 'Falso'],
        answer: 'Ambiguo/dudoso'
      },
      {
        prompt: '¿Cómo se dice "Inherente" en inglés?',
        options: ['External', 'Inherent', 'Internal', 'Integral'],
        answer: 'Inherent'
      },
      {
        prompt: '¿Qué significa "Nuance"?',
        options: ['Obviedad', 'Matiz/sutil diferencia', 'Error', 'Confusión'],
        answer: 'Matiz/sutil diferencia'
      },
      {
        prompt: '¿Cómo se dice "Paradoja" en inglés?',
        options: ['Paradigm', 'Paradox', 'Parody', 'Parameter'],
        answer: 'Paradox'
      }
    ]
  },
  // Reto 5 - Expresiones idiomáticas avanzadas
  {
    id: 'c1-5',
    type: 'challenge',
    title: 'Expresiones Idiomáticas',
    description: 'Frases hechas de nivel avanzado',
    successRate: 76,
    xp: 30,
    questions: [
      {
        prompt: '¿Qué significa "To bite the bullet"?',
        options: ['Morder la bala', 'Afrontar una situación difícil', 'Disparar', 'Comer rápido'],
        answer: 'Afrontar una situación difícil'
      },
      {
        prompt: '¿Cómo se dice "Echar leña al fuego" en inglés?',
        options: ['To add fuel to the fire', 'To burn the bridge', 'To play with fire', 'To fire someone'],
        answer: 'To add fuel to the fire'
      },
      {
        prompt: '¿Qué significa "To cut corners"?',
        options: ['Cortar esquinas', 'Hacer las cosas rápido y mal', 'Ser honesto', 'Ahorrar dinero'],
        answer: 'Hacer las cosas rápido y mal'
      },
      {
        prompt: '¿Cómo se dice "Ponerse al día" en inglés?',
        options: ['To get up to date', 'To make up for lost time', 'To catch up', 'To keep up'],
        answer: 'To catch up'
      },
      {
        prompt: '¿Qué significa "The elephant in the room"?',
        options: ['Un elefante real', 'Un problema obvio que se ignora', 'Una persona grande', 'Un animal doméstico'],
        answer: 'Un problema obvio que se ignora'
      }
    ]
  },
  // Reto 6 - Phrasal verbs avanzados
  {
    id: 'c1-6',
    type: 'challenge',
    title: 'Phrasal Verbs Avanzados',
    description: 'Verbos compuestos de nivel superior',
    successRate: 74,
    xp: 30,
    questions: [
      {
        prompt: '¿Qué significa "To come across as"?',
        options: ['Encontrarse con', 'Parecer/causar impresión', 'Cruzar', 'Llegar a'],
        answer: 'Parecer/causar impresión'
      },
      {
        prompt: '¿Cómo se dice "Llevarse bien con alguien" en inglés?',
        options: ['To get along with', 'To get over', 'To get through', 'To get by'],
        answer: 'To get along with'
      },
      {
        prompt: '¿Qué significa "To brush up on"?',
        options: ['Cepillar', 'Repasar/refrescar conocimientos', 'Limpiar', 'Pintar'],
        answer: 'Repasar/refrescar conocimientos'
      },
      {
        prompt: '¿Cómo se dice "Prescindir de algo" en inglés?',
        options: ['To do without', 'To do with', 'To make do', 'To deal with'],
        answer: 'To do without'
      },
      {
        prompt: '¿Qué significa "To put up with"?',
        options: ['Construir', 'Tolerar/soportar', 'Ofrecer', 'Colgar'],
        answer: 'Tolerar/soportar'
      }
    ]
  },
  // Reto 7 - Cohesión y coherencia
  {
    id: 'c1-7',
    type: 'challenge',
    title: 'Cohesión Textual',
    description: 'Conectores y estructura textual avanzada',
    successRate: 72,
    xp: 30,
    questions: [
      {
        prompt: '¿Qué conector se usa para contrastar ideas de forma formal?',
        options: ['But', 'However', 'And', 'So'],
        answer: 'However'
      },
      {
        prompt: '¿Cómo se dice "Por consiguiente" en inglés formal?',
        options: ['Therefore', 'However', 'Moreover', 'Nevertheless'],
        answer: 'Therefore'
      },
      {
        prompt: '¿Qué significa "Notwithstanding"?',
        options: ['Sin embargo/no obstante', 'Por lo tanto', 'Además', 'De hecho'],
        answer: 'Sin embargo/no obstante'
      },
      {
        prompt: '¿Cómo se dice "Por otro lado" en inglés formal?',
        options: ['On the other hand', 'On the one hand', 'In addition', 'Furthermore'],
        answer: 'On the other hand'
      },
      {
        prompt: '¿Qué significa "Conversely"?',
        options: ['De manera similar', 'Por el contrario', 'Además', 'Finalmente'],
        answer: 'Por el contrario'
      }
    ]
  },
  // Reto 8 - Registro y tono
  {
    id: 'c1-8',
    type: 'challenge',
    title: 'Registro y Tono',
    description: 'Adecuación del lenguaje según el contexto',
    successRate: 70,
    xp: 30,
    questions: [
      {
        prompt: '¿Cuál es la forma formal de decir "I want"?',
        options: ['I desire', 'I would like', 'I need', 'I wish'],
        answer: 'I would like'
      },
      {
        prompt: '¿Qué significa "To deem appropriate"?',
        options: ['Considerar apropiado', 'Dejar apropiado', 'Hacer apropiado', 'Ver apropiado'],
        answer: 'Considerar apropiado'
      },
      {
        prompt: '¿Cómo se dice "Por favor" en inglés muy formal?',
        options: ['Please', 'Kindly', 'If you please', 'At your convenience'],
        answer: 'Kindly'
      },
      {
        prompt: '¿Qué significa "Herewith"?',
        options: ['Aquí', 'Con esto/adjunto', 'Allí', 'Ahora'],
        answer: 'Con esto/adjunto'
      },
      {
        prompt: '¿Cómo se dice "Quedo a la espera de su respuesta" en inglés formal?',
        options: ['I wait for your answer', 'I look forward to your reply', 'I expect your answer', 'I anticipate your response'],
        answer: 'I look forward to your reply'
      }
    ]
  },
  // Reto 9 - Vocabulario técnico especializado
  {
    id: 'c1-9',
    type: 'challenge',
    title: 'Vocabulario Técnico',
    description: 'Términos especializados de diversos campos',
    successRate: 68,
    xp: 30,
    questions: [
      {
        prompt: '¿Cómo se dice "Algoritmo" en inglés?',
        options: ['Algorithm', 'Logarithm', 'Analogy', 'Logic'],
        answer: 'Algorithm'
      },
      {
        prompt: '¿Qué significa "To mitigate"?',
        options: ['Aumentar', 'Mitigar/reducir', 'Ignorar', 'Crear'],
        answer: 'Mitigar/reducir'
      },
      {
        prompt: '¿Cómo se dice "Sostenibilidad" en inglés?',
        options: ['Sustainability', 'Sustenance', 'Survival', 'Stability'],
        answer: 'Sustainability'
      },
      {
        prompt: '¿Qué significa "To implement"?',
        options: ['Planear', 'Implementar/ejecutar', 'Diseñar', 'Cancelar'],
        answer: 'Implementar/ejecutar'
      },
      {
        prompt: '¿Cómo se dice "Innovación" en inglés?',
        options: ['Invention', 'Innovation', 'Improvement', 'Investigation'],
        answer: 'Innovation'
      }
    ]
  },
  // Evaluación 1 - Repaso completo de A1 a C1 con 30 preguntas
  {
    id: 'c1-eval1',
    type: 'evaluation',
    title: 'Evaluación C1',
    description: 'Evaluación completa: Desde principiante hasta avanzado',
    successRate: 65,
    xp: 50,
    questions: [
      // Nivel A1 - Básico
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
      // Nivel A2 - Elemental
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
      // Nivel B1 - Intermedio
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
      // Nivel B2 - Intermedio Alto
      {
        prompt: '¿Cómo se dice "La empresa lanzó una nueva estrategia" en inglés?',
        options: ['The company launched a new strategy', 'The company created a new strategy', 'The company designed a new strategy', 'The company planned a new strategy'],
        answer: 'The company launched a new strategy'
      },
      {
        prompt: '¿Qué significa "The parliament passed the legislation"?',
        options: ['El parlamento rechazó la legislación', 'El parlamento aprobó la legislación', 'El parlamento modificó la legislación', 'El parlamento propuso la legislación'],
        answer: 'El parlamento aprobó la legislación'
      },
      {
        prompt: '¿Cómo se dice "Los científicos confirmaron la hipótesis" en inglés?',
        options: ['The scientists confirmed the hypothesis', 'The scientists created the hypothesis', 'The scientists rejected the hypothesis', 'The scientists designed the hypothesis'],
        answer: 'The scientists confirmed the hypothesis'
      },
      // Nivel C1 - Avanzado
      {
        prompt: '¿Cuál es la forma correcta del condicional mixto?',
        options: ['If I would have known, I would tell you', 'If I had known, I would have told you', 'If I knew, I would tell you', 'If I know, I will tell you'],
        answer: 'If I had known, I would have told you'
      },
      {
        prompt: '¿Qué significa "To leverage" en contexto empresarial?',
        options: ['Ignorar', 'Aprovechar/maximizar recursos', 'Evitar', 'Reducir'],
        answer: 'Aprovechar/maximizar recursos'
      },
      {
        prompt: '¿Cómo se dice "Paradigma" en inglés?',
        options: ['Paradigm', 'Paradox', 'Parameter', 'Pattern'],
        answer: 'Paradigm'
      },
      {
        prompt: '¿Qué significa "To bite the bullet"?',
        options: ['Morder la bala', 'Afrontar una situación difícil', 'Disparar', 'Comer rápido'],
        answer: 'Afrontar una situación difícil'
      },
      {
        prompt: '¿Qué conector se usa para contrastar ideas de forma formal?',
        options: ['But', 'However', 'And', 'So'],
        answer: 'However'
      },
      // Más preguntas de repaso mixto
      {
        prompt: '¿Qué significa "I wish I had studied more"?',
        options: ['Ojalá estudie más', 'Ojalá hubiera estudiado más', 'Ojalá estudiaré más', 'Ojalá estuviera estudiando más'],
        answer: 'Ojalá hubiera estudiado más'
      },
      {
        prompt: '¿Cómo se dice "Inherente" en inglés?',
        options: ['External', 'Inherent', 'Internal', 'Integral'],
        answer: 'Inherent'
      },
      {
        prompt: '¿Qué significa "To come across as"?',
        options: ['Encontrarse con', 'Parecer/causar impresión', 'Cruzar', 'Llegar a'],
        answer: 'Parecer/causar impresión'
      },
      {
        prompt: '¿Cuál es la forma formal de decir "I want"?',
        options: ['I desire', 'I would like', 'I need', 'I wish'],
        answer: 'I would like'
      },
      {
        prompt: '¿Cómo se dice "Algoritmo" en inglés?',
        options: ['Algorithm', 'Logarithm', 'Analogy', 'Logic'],
        answer: 'Algorithm'
      },
      {
        prompt: '¿Qué significa "To mitigate"?',
        options: ['Aumentar', 'Mitigar/reducir', 'Ignorar', 'Crear'],
        answer: 'Mitigar/reducir'
      },
      {
        prompt: '¿Cómo se dice "De haber sabido, habría venido" en inglés?',
        options: ['If I knew, I would come', 'Had I known, I would have come', 'If I would know, I would come', 'Knowing I would come'],
        answer: 'Had I known, I would have come'
      },
      {
        prompt: '¿Qué significa "Ambiguous"?',
        options: ['Claro', 'Ambiguo/dudoso', 'Cierto', 'Falso'],
        answer: 'Ambiguo/dudoso'
      },
      {
        prompt: '¿Cómo se dice "Llevarse bien con alguien" en inglés?',
        options: ['To get along with', 'To get over', 'To get through', 'To get by'],
        answer: 'To get along with'
      },
      {
        prompt: '¿Qué significa "Notwithstanding"?',
        options: ['Sin embargo/no obstante', 'Por lo tanto', 'Además', 'De hecho'],
        answer: 'Sin embargo/no obstante'
      },
      {
        prompt: '¿Cómo se dice "Por consiguiente" en inglés formal?',
        options: ['Therefore', 'However', 'Moreover', 'Nevertheless'],
        answer: 'Therefore'
      },
      {
        prompt: '¿Qué significa "To brush up on"?',
        options: ['Cepillar', 'Repasar/refrescar conocimientos', 'Limpiar', 'Pintar'],
        answer: 'Repasar/refrescar conocimientos'
      },
      {
        prompt: '¿Qué significa "Nuance"?',
        options: ['Obviedad', 'Matiz/sutil diferencia', 'Error', 'Confusión'],
        answer: 'Matiz/sutil diferencia'
      },
      {
        prompt: '¿Cómo se dice "Sostenibilidad" en inglés?',
        options: ['Sustainability', 'Sustenance', 'Survival', 'Stability'],
        answer: 'Sustainability'
      }
    ]
  }
];
