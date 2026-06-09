// Retos del nivel C2 Native - Nivel Nativo
// 9 retos normales + evaluación después de cada 9 retos
// Ejercicios completamente en inglés al nivel de un hablante nativo

const cNativeChallenges = [
  // Reto 1 - Advanced Academic Discourse
  {
    id: 'c2-native-1',
    type: 'challenge',
    title: 'Academic Discourse',
    description: 'Sophisticated academic language and discourse markers',
    successRate: 80,
    xp: 35,
    questions: [
      {
        prompt: 'Choose the most appropriate discourse marker to introduce a counter-argument in formal academic writing:',
        options: ['Moreover', 'Conversely', 'Consequently', 'Furthermore'],
        answer: 'Conversely'
      },
      {
        prompt: 'Which phrase best completes the sentence: "The research findings _____ the initial hypothesis, prompting a reevaluation of the theoretical framework."',
        options: ['corroborated with', 'were consistent to', 'contradicted', 'aligned along'],
        answer: 'contradicted'
      },
      {
        prompt: 'Select the most precise term: "The study\'s methodology was _____, ensuring the reliability and validity of the results."',
        options: ['good', 'rigorous', 'careful', 'thorough'],
        answer: 'rigorous'
      },
      {
        prompt: 'Which expression is most appropriate for concluding an academic paper?',
        options: ['To sum up briefly', 'In conclusion, it can be posited that', 'Finally, I want to say', 'To end this'],
        answer: 'In conclusion, it can be posited that'
      },
      {
        prompt: 'Choose the correct form: "The data _____ that there is a significant correlation between the variables."',
        options: ['suggest', 'suggests', 'suggesting', 'suggestion'],
        answer: 'suggests'
      }
    ]
  },
  // Reto 2 - Nuanced Vocabulary and Connotation
  {
    id: 'c2-native-2',
    type: 'challenge',
    title: 'Lexical Nuance',
    description: 'Understanding subtle differences in word meaning and connotation',
    successRate: 78,
    xp: 35,
    questions: [
      {
        prompt: 'Which word conveys a stronger sense of disapproval than "unusual"?',
        options: ['peculiar', 'aberrant', 'different', 'distinct'],
        answer: 'aberrant'
      },
      {
        prompt: 'Select the word that best describes something done with excessive haste and little thought:',
        options: ['prompt', 'expeditious', 'precipitate', 'efficient'],
        answer: 'precipitate'
      },
      {
        prompt: 'Which term refers to language that is deliberately vague or ambiguous?',
        options: ['equivocal', 'ambiguous', 'obscure', 'unclear'],
        answer: 'equivocal'
      },
      {
        prompt: 'Choose the word that means "to make less severe or intense":',
        options: ['intensify', 'exacerbate', 'mitigate', 'aggravate'],
        answer: 'mitigate'
      },
      {
        prompt: 'Which expression best describes someone who speaks in a pompous or overbearing manner?',
        options: ['articulate', 'verbose', 'pontifical', 'eloquent'],
        answer: 'pontifical'
      }
    ]
  },
  // Reto 3 - Complex Grammatical Structures
  {
    id: 'c2-native-3',
    type: 'challenge',
    title: 'Advanced Syntax',
    description: 'Mastery of complex grammatical constructions',
    successRate: 76,
    xp: 35,
    questions: [
      {
        prompt: 'Choose the correct sentence structure: "_____ the complexity of the issue, a comprehensive approach is required."',
        options: ['Given', 'Giving', 'Having given', 'To give'],
        answer: 'Given'
      },
      {
        prompt: 'Which sentence uses inversion correctly?',
        options: ['Never I have seen such behavior', 'Never have I seen such behavior', 'Never I did see such behavior', 'Never saw I such behavior'],
        answer: 'Never have I seen such behavior'
      },
      {
        prompt: 'Select the correct form: "Had he known about the consequences, he _____ differently."',
        options: ['would act', 'would have acted', 'will act', 'acted'],
        answer: 'would have acted'
      },
      {
        prompt: 'Which construction is grammatically correct for emphasis?',
        options: ['It was the CEO who made the decision', 'It was the CEO that made the decision', 'It was the CEO which made the decision', 'The CEO it was who made the decision'],
        answer: 'It was the CEO who made the decision'
      },
      {
        prompt: 'Choose the correct subjunctive form: "It is imperative that the committee _____ a decision immediately."',
        options: ['makes', 'make', 'made', 'will make'],
        answer: 'make'
      }
    ]
  },
  // Reto 4 - Idiomatic Expressions and Collocations
  {
    id: 'c2-native-4',
    type: 'challenge',
    title: 'Idiomatic Mastery',
    description: 'Advanced idioms and natural collocations',
    successRate: 74,
    xp: 35,
    questions: [
      {
        prompt: 'Complete the idiom: "The proposal was met with _____ silence."',
        options: ['complete', 'total', 'stony', 'absolute'],
        answer: 'stony'
      },
      {
        prompt: 'Which collocation is most natural?',
        options: ['make a decision', 'do a decision', 'take a decision', 'create a decision'],
        answer: 'make a decision'
      },
      {
        prompt: 'Choose the correct idiom: "After years of conflict, the two parties finally _____ and reached an agreement."',
        options: ['buried the hatchet', 'dug the hatchet', 'threw the hatchet', 'hid the hatchet'],
        answer: 'buried the hatchet'
      },
      {
        prompt: 'Which expression means "to reveal a secret"?',
        options: ['let the cat out of the bag', 'spill the beans', 'both A and B', 'neither A nor B'],
        answer: 'both A and B'
      },
      {
        prompt: 'Select the most appropriate phrase: "The situation is complex; there are many _____ to consider."',
        options: ['sides', 'angles', 'facets', 'aspects'],
        answer: 'facets'
      }
    ]
  },
  // Reto 5 - Stylistic Variation and Register
  {
    id: 'c2-native-5',
    type: 'challenge',
    title: 'Stylistic Adaptation',
    description: 'Adapting language to different contexts and registers',
    successRate: 72,
    xp: 35,
    questions: [
      {
        prompt: 'Which phrase is most appropriate for a formal business email?',
        options: ['I want to let you know', 'I am writing to inform you', 'Just wanted to tell you', 'Hey, just a heads up'],
        answer: 'I am writing to inform you'
      },
      {
        prompt: 'Choose the most neutral and professional way to decline an offer:',
        options: ['No thanks', 'I\'m not interested', 'I must respectfully decline', 'That doesn\'t work for me'],
        answer: 'I must respectfully decline'
      },
      {
        prompt: 'Which expression is too informal for academic writing?',
        options: ['Furthermore', 'In addition', 'Also', 'Moreover'],
        answer: 'Also'
      },
      {
        prompt: 'Select the most appropriate closing for a formal letter:',
        options: ['Best', 'Cheers', 'Sincerely', 'Yours truly'],
        answer: 'Sincerely'
      },
      {
        prompt: 'Which word is more formal than "help"?',
        options: ['assist', 'aid', 'support', 'facilitate'],
        answer: 'assist'
      }
    ]
  },
  // Reto 6 - Literary and Rhetorical Devices
  {
    id: 'c2-native-6',
    type: 'challenge',
    title: 'Rhetorical Mastery',
    description: 'Understanding and using literary devices',
    successRate: 70,
    xp: 35,
    questions: [
      {
        prompt: 'Which rhetorical device is used in: "The wind whispered through the trees"?',
        options: ['metaphor', 'personification', 'simile', 'alliteration'],
        answer: 'personification'
      },
      {
        prompt: 'Choose the example of oxymoron:',
        options: ['The silence was deafening', 'She runs like a cheetah', 'Time is a thief', 'The world is a stage'],
        answer: 'The silence was deafening'
      },
      {
        prompt: 'Which device is demonstrated in: "Peter Piper picked a peck of pickled peppers"?',
        options: ['assonance', 'consonance', 'alliteration', 'rhyme'],
        answer: 'alliteration'
      },
      {
        prompt: 'Select the correct term for exaggerated statements not meant to be taken literally:',
        options: ['metaphor', 'hyperbole', 'irony', 'sarcasm'],
        answer: 'hyperbole'
      },
      {
        prompt: 'Which phrase uses parallelism?',
        options: ['She likes reading, writing, and to swim', 'She likes to read, to write, and to swim', 'She likes reading, writing, and swimming', 'She likes to read, writing, and swimming'],
        answer: 'She likes reading, writing, and swimming'
      }
    ]
  },
  // Reto 7 - Critical Analysis and Argumentation
  {
    id: 'c2-native-7',
    type: 'challenge',
    title: 'Critical Reasoning',
    description: 'Advanced critical thinking and argumentation skills',
    successRate: 68,
    xp: 35,
    questions: [
      {
        prompt: 'Which logical fallacy is committed when someone attacks the person instead of their argument?',
        options: ['straw man', 'ad hominem', 'slippery slope', 'false dichotomy'],
        answer: 'ad hominem'
      },
      {
        prompt: 'Choose the phrase that introduces a valid counter-argument:',
        options: ['Some people might say', 'Critics argue that', 'It is often claimed that', 'Opponents contend that'],
        answer: 'Opponents contend that'
      },
      {
        prompt: 'Which term refers to the process of examining evidence to reach a conclusion?',
        options: ['speculation', 'inference', 'assumption', 'conjecture'],
        answer: 'inference'
      },
      {
        prompt: 'Select the most effective way to strengthen an argument:',
        options: ['Use emotional appeals', 'Provide credible evidence', 'Repeat the main point', 'Use complex vocabulary'],
        answer: 'Provide credible evidence'
      },
      {
        prompt: 'Which construction best qualifies a statement to avoid overgeneralization?',
        options: ['always', 'never', 'tend to', 'certainly'],
        answer: 'tend to'
      }
    ]
  },
  // Reto 8 - Cross-Cultural Communication
  {
    id: 'c2-native-8',
    type: 'challenge',
    title: 'Cultural Nuance',
    description: 'Navigating cultural differences in communication',
    successRate: 66,
    xp: 35,
    questions: [
      {
        prompt: 'Which phrase demonstrates high-context communication?',
        options: ['Please say exactly what you mean', 'I think you understand what I\'m suggesting', 'Be direct and clear', 'Don\'t beat around the bush'],
        answer: 'I think you understand what I\'m suggesting'
      },
      {
        prompt: 'Choose the most culturally appropriate way to address someone from a hierarchical culture:',
        options: ['Use their first name immediately', 'Wait for them to suggest using first names', 'Always use formal titles', 'Use informal language to show friendliness'],
        answer: 'Wait for them to suggest using first names'
      },
      {
        prompt: 'Which expression might be considered rude in some cultures?',
        options: ['I\'m afraid I disagree', 'That\'s completely wrong', 'I see things differently', 'I have another perspective'],
        answer: 'That\'s completely wrong'
      },
      {
        prompt: 'Select the most appropriate response when receiving a compliment in a modest culture:',
        options: ['Thank you, I know', 'Oh, it was nothing', 'Yes, I worked hard', 'I appreciate that'],
        answer: 'Oh, it was nothing'
      },
      {
        prompt: 'Which approach is best for cross-cultural negotiation?',
        options: ['Assert your position strongly', 'Find common ground', 'Focus on your own interests', 'Use competitive tactics'],
        answer: 'Find common ground'
      }
    ]
  },
  // Reto 9 - Advanced Phrasal Verbs and Prepositions
  {
    id: 'c2-native-9',
    type: 'challenge',
    title: 'Phrasal Precision',
    description: 'Mastery of advanced phrasal verbs and prepositional phrases',
    successRate: 64,
    xp: 35,
    questions: [
      {
        prompt: 'Choose the correct phrasal verb: "The committee had to _____ the meeting due to lack of quorum."',
        options: ['call off', 'call out', 'call up', 'call in'],
        answer: 'call off'
      },
      {
        prompt: 'Which phrasal verb means "to continue doing something"?',
        options: ['carry on', 'carry out', 'carry off', 'carry through'],
        answer: 'carry on'
      },
      {
        prompt: 'Select the correct preposition: "She is very adept _____ solving complex problems."',
        options: ['in', 'at', 'with', 'on'],
        answer: 'at'
      },
      {
        prompt: 'Which phrase means "to tolerate or endure something unpleasant"?',
        options: ['put up with', 'put down', 'put off', 'put out'],
        answer: 'put up with'
      },
      {
        prompt: 'Choose the correct expression: "The new policy will _____ next month."',
        options: ['come into effect', 'come into effect', 'come in effect', 'come to effect'],
        answer: 'come into effect'
      }
    ]
  },
  // Evaluación 1 - Comprehensive C2 Native Assessment
  {
    id: 'c2-native-eval1',
    type: 'evaluation',
    title: 'C2 Native Evaluation',
    description: 'Comprehensive assessment of native-level English proficiency',
    successRate: 60,
    xp: 60,
    questions: [
      {
        prompt: 'Select the most appropriate discourse marker: "The evidence appears compelling; _____, further research is warranted."',
        options: ['however', 'therefore', 'moreover', 'consequently'],
        answer: 'however'
      },
      {
        prompt: 'Which word best completes the sentence: "The politician\'s _____ speech failed to address the substantive issues."',
        options: ['articulate', 'lucid', 'vacuous', 'eloquent'],
        answer: 'vacuous'
      },
      {
        prompt: 'Choose the correct inversion: "Seldom _____ such a brilliant performance."',
        options: ['one sees', 'does one see', 'has one seen', 'is one seeing'],
        answer: 'does one see'
      },
      {
        prompt: 'Which idiom means "to reveal hidden information"?',
        options: ['let the cat out of the bag', 'break the ice', 'hit the nail on the head', 'bite the bullet'],
        answer: 'let the cat out of the bag'
      },
      {
        prompt: 'Select the most formal expression:',
        options: ['I need to talk to you', 'I require a discussion with you', 'I would like to speak with you', 'I want a word'],
        answer: 'I would like to speak with you'
      },
      {
        prompt: 'Which rhetorical device is used in: "The pen is mightier than the sword"?',
        options: ['metaphor', 'simile', 'personification', 'hyperbole'],
        answer: 'metaphor'
      },
      {
        prompt: 'Choose the logical fallacy: "If we allow A, then B will inevitably happen, leading to disaster."',
        options: ['ad hominem', 'slippery slope', 'straw man', 'false dichotomy'],
        answer: 'slippery slope'
      },
      {
        prompt: 'Which preposition is correct: "He was implicated _____ the scandal."',
        options: ['in', 'at', 'with', 'on'],
        answer: 'in'
      },
      {
        prompt: 'Select the phrase that demonstrates hedging:',
        options: ['This is certainly true', 'This appears to be the case', 'This is undoubtedly correct', 'This is absolutely the case'],
        answer: 'This appears to be the case'
      },
      {
        prompt: 'Which word means "to make something less severe"?',
        options: ['exacerbate', 'mitigate', 'aggravate', 'intensify'],
        answer: 'mitigate'
      },
      {
        prompt: 'Choose the correct subjunctive: "It is essential that he _____ informed of the changes."',
        options: ['be', 'is', 'was', 'will be'],
        answer: 'be'
      },
      {
        prompt: 'Which collocation is incorrect?',
        options: ['make a decision', 'take a break', 'do a mistake', 'give a presentation'],
        answer: 'do a mistake'
      },
      {
        prompt: 'Select the most appropriate term for "a temporary solution":',
        options: ['permanent', 'provisional', 'definitive', 'final'],
        answer: 'provisional'
      },
      {
        prompt: 'Which expression means "to maintain a position despite opposition"?',
        options: ['stand one\'s ground', 'give ground', 'lose ground', 'break ground'],
        answer: 'stand one\'s ground'
      },
      {
        prompt: 'Choose the correct form: "The research, which _____ over five years, yielded significant results."',
        options: ['spanned', 'spans', 'spanning', 'was spanning'],
        answer: 'spanned'
      },
      {
        prompt: 'Which word is a synonym for "ephemeral"?',
        options: ['permanent', 'transient', 'eternal', 'lasting'],
        answer: 'transient'
      },
      {
        prompt: 'Select the most appropriate phrase for academic writing:',
        options: ['a lot of', 'numerous', 'lots of', ' heaps of'],
        answer: 'numerous'
      },
      {
        prompt: 'Which phrasal verb means "to postpone"?',
        options: ['put off', 'put out', 'put up', 'put down'],
        answer: 'put off'
      },
      {
        prompt: 'Choose the correct word: "The committee reached a _____ after lengthy deliberations."',
        options: ['consensus', 'agreement', 'accord', 'all of the above'],
        answer: 'all of the above'
      },
      {
        prompt: 'Which expression is most culturally appropriate for refusing in a high-context culture?',
        options: ['No, I can\'t', 'That\'s not possible', 'I\'ll have to think about it', 'Absolutely not'],
        answer: 'I\'ll have to think about it'
      }
    ]
  }
];
