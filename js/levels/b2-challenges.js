// Retos del nivel B2 - Intermedio Alto
// 9 retos normales + evaluación después de cada 9 retos

const b2Challenges = [
  // Reto 1 - Negocios
  {
    id: 'b2-1',
    type: 'challenge',
    title: 'Negocios',
    description: 'Vocabulario corporativo y de negocios',
    successRate: 86,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Estrategia empresarial" en inglés?',
        options: ['Business strategy', 'Business plan', 'Business model', 'Business goal'],
        answer: 'Business strategy'
      },
      {
        prompt: '¿Qué significa "Stakeholders"?',
        options: ['Clientes', 'Stakeholders (partes interesadas)', 'Empleados', 'Competidores'],
        answer: 'Stakeholders (partes interesadas)'
      },
      {
        prompt: '¿Cómo se dice "Fusionarse con otra empresa" en inglés?',
        options: ['To acquire a company', 'To merge with a company', 'To invest in a company', 'To sell a company'],
        answer: 'To merge with a company'
      },
      {
        prompt: '¿Qué significa "Revenue"?',
        options: ['Gastos', 'Ingresos', 'Pérdidas', 'Beneficios'],
        answer: 'Ingresos'
      },
      {
        prompt: '¿Cómo se dice "Lanzar un producto" en inglés?',
        options: ['To launch a product', 'To create a product', 'To design a product', 'To test a product'],
        answer: 'To launch a product'
      }
    ]
  },
  // Reto 2 - Política
  {
    id: 'b2-2',
    type: 'challenge',
    title: 'Política',
    description: 'Vocabulario político y gubernamental',
    successRate: 84,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Elections" en español?',
        options: ['Elecciones', 'Referéndum', 'Debate', 'Campaña'],
        answer: 'Elecciones'
      },
      {
        prompt: '¿Qué significa "Foreign policy"?',
        options: ['Política interior', 'Política exterior', 'Política económica', 'Política social'],
        answer: 'Política exterior'
      },
      {
        prompt: '¿Cómo se dice "Parlamento" en inglés?',
        options: ['Congress', 'Parliament', 'Senate', 'Cabinet'],
        answer: 'Parliament'
      },
      {
        prompt: '¿Qué significa "To run for office"?',
        options: ['Trabajar en una oficina', 'Presentarse a un cargo público', 'Renunciar al cargo', 'Votar'],
        answer: 'Presentarse a un cargo público'
      },
      {
        prompt: '¿Cómo se dice "Constitución" en inglés?',
        options: ['Constitution', 'Legislation', 'Regulation', 'Treaty'],
        answer: 'Constitution'
      }
    ]
  },
  // Reto 3 - Ciencia
  {
    id: 'b2-3',
    type: 'challenge',
    title: 'Ciencia',
    description: 'Vocabulario científico y tecnológico',
    successRate: 82,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Investigación" en inglés?',
        options: ['Investigation', 'Research', 'Experiment', 'Discovery'],
        answer: 'Research'
      },
      {
        prompt: '¿Qué significa "Hypothesis"?',
        options: ['Resultado', 'Hipótesis', 'Conclusión', 'Teoría'],
        answer: 'Hipótesis'
      },
      {
        prompt: '¿Cómo se dice "Genética" en inglés?',
        options: ['Genetics', 'Biology', 'Chemistry', 'Physics'],
        answer: 'Genetics'
      },
      {
        prompt: '¿Qué significa "Breakthrough"?',
        options: ['Fracaso', 'Avance científico', 'Experimento', 'Hipótesis'],
        answer: 'Avance científico'
      },
      {
        prompt: '¿Cómo se dice "Sostenibilidad" en inglés?',
        options: ['Sustainability', 'Pollution', 'Consumption', 'Production'],
        answer: 'Sustainability'
      }
    ]
  },
  // Reto 4 - Economía
  {
    id: 'b2-4',
    type: 'challenge',
    title: 'Economía',
    description: 'Conceptos económicos financieros',
    successRate: 83,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Inflación" en inglés?',
        options: ['Deflation', 'Inflation', 'Recession', 'Depression'],
        answer: 'Inflation'
      },
      {
        prompt: '¿Qué significa "GDP" (Gross Domestic Product)?',
        options: ['Producto Interno Bruto', 'Producto Nacional Bruto', 'Ingreso Nacional', 'Balanza de pagos'],
        answer: 'Producto Interno Bruto'
      },
      {
        prompt: '¿Cómo se dice "Mercado de valores" en inglés?',
        options: ['Stock market', 'Bond market', 'Currency market', 'Commodity market'],
        answer: 'Stock market'
      },
      {
        prompt: '¿Qué significa "Supply and demand"?',
        options: ['Oferta y demanda', 'Importación y exportación', 'Ganancia y pérdida', 'Crédito y débito'],
        answer: 'Oferta y demanda'
      },
      {
        prompt: '¿Cómo se dice "Moneda" en inglés?',
        options: ['Currency', 'Money', 'Cash', 'Coin'],
        answer: 'Currency'
      }
    ]
  },
  // Reto 5 - Literatura
  {
    id: 'b2-5',
    type: 'challenge',
    title: 'Literatura',
    description: 'Términos literarios y análisis',
    successRate: 81,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Protagonista" en inglés?',
        options: ['Antagonist', 'Protagonist', 'Character', 'Narrator'],
        answer: 'Protagonist'
      },
      {
        prompt: '¿Qué significa "Plot"?',
        options: ['Personaje', 'Trama', 'Escenario', 'Diálogo'],
        answer: 'Trama'
      },
      {
        prompt: '¿Cómo se dice "Metáfora" en inglés?',
        options: ['Simile', 'Metaphor', 'Allegory', 'Symbol'],
        answer: 'Metaphor'
      },
      {
        prompt: '¿Qué significa "Genre"?',
        options: ['Autor', 'Género', 'Editorial', 'Publicación'],
        answer: 'Género'
      },
      {
        prompt: '¿Cómo se dice "Narrador" en inglés?',
        options: ['Author', 'Narrator', 'Character', 'Speaker'],
        answer: 'Narrator'
      }
    ]
  },
  // Reto 6 - Psicología
  {
    id: 'b2-6',
    type: 'challenge',
    title: 'Psicología',
    description: 'Conceptos psicológicos básicos',
    successRate: 80,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Consciencia" en inglés?',
        options: ['Unconscious', 'Conscious', 'Subconscious', 'Awareness'],
        answer: 'Conscious'
      },
      {
        prompt: '¿Qué significa "Cognitive"?',
        options: ['Emocional', 'Cognitivo', 'Físico', 'Social'],
        answer: 'Cognitivo'
      },
      {
        prompt: '¿Cómo se dice "Ansiedad" en inglés?',
        options: ['Depression', 'Anxiety', 'Stress', 'Fear'],
        answer: 'Anxiety'
      },
      {
        prompt: '¿Qué significa "Behavior"?',
        options: ['Pensamiento', 'Comportamiento', 'Emoción', 'Sensación'],
        answer: 'Comportamiento'
      },
      {
        prompt: '¿Cómo se dice "Terapia" en inglés?',
        options: ['Treatment', 'Therapy', 'Medicine', 'Cure'],
        answer: 'Therapy'
      }
    ]
  },
  // Reto 7 - Filosofía
  {
    id: 'b2-7',
    type: 'challenge',
    title: 'Filosofía',
    description: 'Conceptos filosóficos fundamentales',
    successRate: 79,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Ética" en inglés?',
        options: ['Morality', 'Ethics', 'Philosophy', 'Logic'],
        answer: 'Ethics'
      },
      {
        prompt: '¿Qué significa "Existentialism"?',
        options: ['Existencialismo', 'Racionalismo', 'Empirismo', 'Idealismo'],
        answer: 'Existencialismo'
      },
      {
        prompt: '¿Cómo se dice "Conocimiento" en inglés?',
        options: ['Wisdom', 'Knowledge', 'Information', 'Intelligence'],
        answer: 'Knowledge'
      },
      {
        prompt: '¿Qué significa "Rationalism"?',
        options: ['Racionalismo', 'Empirismo', 'Escepticismo', 'Pragmatismo'],
        answer: 'Racionalismo'
      },
      {
        prompt: '¿Cómo se dice "Consciencia" en inglés?',
        options: ['Conscience', 'Awareness', 'Mind', 'Thought'],
        answer: 'Conscience'
      }
    ]
  },
  // Reto 8 - Derecho
  {
    id: 'b2-8',
    type: 'challenge',
    title: 'Derecho',
    description: 'Vocabulario legal y judicial',
    successRate: 78,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Contrato" en inglés?',
        options: ['Agreement', 'Contract', 'Treaty', 'Deal'],
        answer: 'Contract'
      },
      {
        prompt: '¿Qué significa "Jurisdiction"?',
        options: ['Jurisdicción', 'Legislación', 'Constitución', 'Reglamento'],
        answer: 'Jurisdicción'
      },
      {
        prompt: '¿Cómo se dice "Veredicto" en inglés?',
        options: ['Sentence', 'Verdict', 'Judgment', 'Ruling'],
        answer: 'Verdict'
      },
      {
        prompt: '¿Qué significa "Liability"?',
        options: ['Responsabilidad legal', 'Propiedad', 'Derecho', 'Obligación'],
        answer: 'Responsabilidad legal'
      },
      {
        prompt: '¿Cómo se dice "Apelación" en inglés?',
        options: ['Appeal', 'Trial', 'Hearing', 'Case'],
        answer: 'Appeal'
      }
    ]
  },
  // Reto 9 - Sociología
  {
    id: 'b2-9',
    type: 'challenge',
    title: 'Sociología',
    description: 'Conceptos sociales y culturales',
    successRate: 77,
    xp: 25,
    questions: [
      {
        prompt: '¿Cómo se dice "Estratificación social" en inglés?',
        options: ['Social stratification', 'Social class', 'Social mobility', 'Social structure'],
        answer: 'Social stratification'
      },
      {
        prompt: '¿Qué significa "Demography"?',
        options: ['Geografía', 'Demografía', 'Sociología', 'Economía'],
        answer: 'Demografía'
      },
      {
        prompt: '¿Cómo se dice "Integración social" en inglés?',
        options: ['Social integration', 'Social exclusion', 'Social isolation', 'Social segregation'],
        answer: 'Social integration'
      },
      {
        prompt: '¿Qué significa "Cultural diversity"?',
        options: ['Diversidad cultural', 'Cultural identity', 'Cultural assimilation', 'Cultural heritage'],
        answer: 'Diversidad cultural'
      },
      {
        prompt: '¿Cómo se dice "Movilidad social" en inglés?',
        options: ['Social mobility', 'Social class', 'Social status', 'Social change'],
        answer: 'Social mobility'
      }
    ]
  },
  // Evaluación 1 - Repaso de nivel B2
  {
    id: 'b2-eval1',
    type: 'evaluation',
    title: 'Evaluación B2',
    description: 'Repaso: Negocios, Política, Ciencia y más',
    successRate: 72,
    xp: 40,
    questions: [
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
      {
        prompt: '¿Qué significa "The stock market crashed"?',
        options: ['El mercado de valores creció', 'El mercado de valores se derrumbó', 'El mercado de valores se estabilizó', 'El mercado de valores cerró'],
        answer: 'El mercado de valores se derrumbó'
      },
      {
        prompt: '¿Cómo se dice "El tribunal emitió el veredicto" en inglés?',
        options: ['The court issued the sentence', 'The court issued the verdict', 'The court issued the judgment', 'The court issued the ruling'],
        answer: 'The court issued the verdict'
      }
    ]
  }
];
