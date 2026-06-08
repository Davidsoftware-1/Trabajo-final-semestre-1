(function () {
  window.PangolingoLevels = window.PangolingoLevels || {};
  window.PangolingoLevels.A1 = {
    level: "A1",
    title: "Beginner",
    description: "Basic everyday English for introductions, routines, places, and simple needs.",
    units: [
      ["Greetings and Farewells", "Use simple greetings, say goodbye, and ask how someone is.", "A1 learners use fixed expressions such as hello, good morning, and how are you.", ["hello", "good morning", "goodbye", "please", "thank you", "fine"]],
      ["Personal Information", "Share your name, country, age, and basic identity.", "Use the verb be for identity: I am, you are, he is, she is.", ["name", "age", "country", "student", "teacher", "from"]],
      ["Numbers and Time", "Understand numbers, prices, and simple times.", "Numbers help with age, phone numbers, time, and prices. Use it is for time.", ["one", "two", "ten", "twenty", "hour", "minute"]],
      ["Family and People", "Talk about family members and people around you.", "Use possessive adjectives: my, your, his, her. Use this is to present someone.", ["mother", "father", "sister", "brother", "friend", "family"]],
      ["Daily Routines", "Describe common actions in the present simple.", "Use present simple for habits. With he or she, add -s in basic affirmative sentences.", ["wake up", "eat", "study", "work", "sleep", "go"]],
      ["Food and Drinks", "Order simple food and name common drinks.", "Use I would like for polite requests. Use a, an, and some with food words.", ["water", "coffee", "rice", "apple", "bread", "menu"]],
      ["Places in Town", "Identify common places and ask where they are.", "Use where is and prepositions such as near, next to, and in.", ["school", "bank", "park", "shop", "street", "near"]],
      ["Clothes and Colors", "Describe clothes with basic colors and adjectives.", "In English, adjectives usually go before the noun: a red shirt.", ["shirt", "shoes", "dress", "red", "blue", "black"]],
      ["Abilities with Can", "Say what you can and cannot do.", "Use can plus base verb: I can swim. For negative, use cannot or can't.", ["can", "can't", "swim", "cook", "read", "write"]],
      ["Simple Reading", "Read short personal texts and identify key information.", "A1 reading focuses on names, places, routines, numbers, and familiar words.", ["text", "sentence", "information", "today", "home", "English"]]
    ].map(function (item, index) {
      return {
        id: "A1-U" + (index + 1),
        title: item[0],
        intro: item[1],
        theory: item[2],
        grammar: "Use short A1 sentences with clear subject + verb order. This unit focuses on basic forms that beginners can reuse immediately.",
        expressions: ["Can you repeat, please?", "Nice to meet you.", "I do not understand."],
        vocabulary: item[3],
        examples: ["I am Ana.", "She studies English.", "Where is the bank?"],
        activities: [
          { type: "multiple-choice", prompt: "Choose a word from this unit.", options: [item[3][0], "airport", "although"], answer: item[3][0], explanation: item[3][0] + " belongs to this unit." },
          { type: "true-false", prompt: "A1 sentences are usually short and familiar.", answer: true, explanation: "A1 communication uses simple everyday language." },
          { type: "fill-blank", prompt: "I ___ a student.", answer: "am", explanation: "Use am with I." },
          { type: "order", prompt: "Order the phrase.", items: ["am", "I", "fine"], answer: ["I", "am", "fine"], explanation: "The subject comes before the verb." }
        ],
        cumulativeQuiz: index === 4,
        finalExam: index === 9,
        feedback: "You can use this topic in a simple everyday exchange.",
        progress: { xp: index === 4 ? 30 : index === 9 ? 40 : 20, skill: index % 2 ? "Grammar" : "Vocabulary" }
      };
    })
  };
})();
