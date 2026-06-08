(function () {
  window.PangolingoReadings = ["A1", "A2", "B1", "B2", "C1", "C2"].flatMap(function (level) {
    var titles = {
      A1: ["My New School", "A Small Cafe"],
      A2: ["A Weekend Trip", "The Lost Ticket"],
      B1: ["A Change of Plans", "Learning Online"],
      B2: ["Cities of the Future", "The Value of Debate"],
      C1: ["The Hidden Cost of Convenience", "A Nuanced Opinion"],
      C2: ["Language, Identity, and Power", "The Art of Reformulation"]
    };
    return titles[level].map(function (title, index) {
      return {
        id: level + "-R" + (index + 1),
        level: level,
        title: title,
        difficulty: index === 0 ? "Core" : "Challenge",
        text: title + " is a " + level + " reading designed to practice comprehension, vocabulary, and inference. The text presents a clear situation, introduces useful language, and asks the learner to identify meaning from context.",
        vocabulary: ["context", "meaning", "purpose", "detail"],
        xp: 18 + index * 7,
        questions: [
          { prompt: "What skill does this reading practice?", options: ["Comprehension", "Cooking", "Drawing"], answer: "Comprehension" },
          { prompt: "What should the learner identify?", options: ["Meaning from context", "A phone number", "A password"], answer: "Meaning from context" }
        ]
      };
    });
  });
})();
