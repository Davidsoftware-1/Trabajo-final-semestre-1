(function () {
  window.buildLevel = function (code, title, description, topics, vocabulary) {
    var grammarByLevel = {
      A2: "Use past simple, comparisons, requests, and going to for practical everyday situations.",
      B1: "Connect ideas with because, although, present perfect, advice modals, and narrative tenses.",
      B2: "Use conditionals, passive voice, reported speech, hedging, and evidence-based argument.",
      C1: "Control register, advanced connectors, nominalization, nuance, implication, and formal style.",
      C2: "Refine connotation, ambiguity, rhetorical effect, synthesis, reformulation, and stylistic precision."
    };
    var expressionsByLevel = {
      A2: ["Could I have...?", "I am going to...", "How much is it?"],
      B1: ["In my opinion...", "I have never...", "You should consider..."],
      B2: ["On the other hand...", "The evidence suggests...", "It would be better to..."],
      C1: ["It is worth noting that...", "This implies that...", "Nevertheless..."],
      C2: ["The nuance here is...", "To put it another way...", "This stance is deliberately ambiguous."]
    };
    return {
      level: code,
      title: title,
      description: description,
      units: topics.map(function (topic, index) {
        return {
          id: code + "-U" + (index + 1),
          title: topic,
          intro: "Build " + code + " competence through " + topic.toLowerCase() + ".",
          theory: topic + " focuses on a different communicative purpose inside " + code + ". " + description + " You will study the language needed for this topic, notice how meaning changes in context, and practice with automatic correction.",
          grammar: grammarByLevel[code] || "Use language structures appropriate to the level.",
          expressions: expressionsByLevel[code] || ["Could you explain that?", "I agree because...", "Let me clarify."],
          vocabulary: vocabulary,
          examples: [
            topic + " helps me communicate more clearly.",
            "I can use " + vocabulary[0] + " when the context requires it.",
            "The best answer depends on purpose, audience, and level."
          ],
          activities: [
            { type: "multiple-choice", prompt: "Choose a key word from this unit.", options: [vocabulary[0], "chair", "banana"], answer: vocabulary[0], explanation: vocabulary[0] + " belongs to this level focus." },
            { type: "fill-blank", prompt: topic + " ___ vocabulary and grammar.", answer: "connects", explanation: "Connects describes how skills work together." },
            { type: "true-false", prompt: code + " learners should use language in context.", answer: true, explanation: "CEFR levels measure practical language use." }
          ],
          cumulativeQuiz: index === 4,
          finalExam: index === 9,
          feedback: "Keep practicing with examples, correction, and spaced review.",
          progress: { xp: index === 4 ? 35 : index === 9 ? 50 : 25, skill: "Integrated skills" }
        };
      })
    };
  };
})();
