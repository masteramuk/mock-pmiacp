const fs = require("fs");
const path = require("path");

const repeatedQuestionClosers = [
  "The agile practitioner is asked what should happen next.",
  "The team wants a recommendation before the next planning decision is made.",
  "Stakeholders want the next step framed in practical agile terms.",
  "The scrum master asks for the most appropriate response.",
  "The product owner asks for the best next action.",
  "Leadership wants the team to respond without losing agility."
];

const replacementClosers = [
  "The practitioner now needs to recommend the most appropriate next step.",
  "The team wants a practical recommendation before it commits to the next move.",
  "Stakeholders are asking for a response grounded in agile practice rather than opinion.",
  "The scrum master wants the next step framed in a way the team can act on immediately.",
  "The product owner is asking for the most suitable action to take next.",
  "Leadership wants a response that preserves agility while still moving the work forward."
];

const explanationEndingsSingle = [
  "It supports empirical learning, transparency, and better downstream decisions.",
  "It aligns with agile principles by improving feedback, flow, or collaboration instead of protecting false certainty.",
  "It addresses the underlying agile concern rather than optimizing only for short-term convenience.",
  "It keeps the response adaptive, value-focused, and grounded in real evidence."
];

const explanationEndingsMultiple = [
  "Together, those choices improve agility without delaying feedback or obscuring important trade-offs.",
  "Those responses work well together because they encourage learning, transparency, and better value delivery.",
  "In combination, those actions support the agile outcome more effectively than short-term control-oriented alternatives.",
  "Taken together, those options strengthen adaptation and collaboration instead of preserving a weaker status quo."
];

function polishQuestions(questions) {
  return questions.map((question) => {
    const polished = { ...question };
    polished.question = polishQuestionText(polished.question, polished.id);
    polished.options = polishOptions(polished.options);
    polished.explanation = polishExplanation(polished.explanation, polished.id, polished.selectionType);
    return polished;
  });
}

function polishQuestionText(text, id) {
  let output = text;
  repeatedQuestionClosers.forEach((phrase, index) => {
    if (output.includes(phrase)) {
      const replacement = replacementClosers[(id + index) % replacementClosers.length];
      output = output.replace(phrase, replacement);
    }
  });

  output = output
    .replace(/\s{2,}/g, " ")
    .replace(/The situation has become more visible over the last/g, "The pattern has become clearer over the last")
    .replace(/Recent discussions around/g, "Recent conversations about")
    .replace(/Recent trends tied to/g, "Recent signals connected to")
    .replace(/Which TWO choices most closely reflect/g, "Which TWO options most closely reflect");

  return output.trim();
}

function polishExplanation(text, id, selectionType) {
  let output = text.replace(/\s{2,}/g, " ").trim();

  output = output
    .replace(
      "because those actions reinforce",
      "because those actions strengthen"
    )
    .replace(
      "because it addresses the real agile need instead of optimizing mainly for short-term certainty or local convenience.",
      explanationEndingsSingle[id % explanationEndingsSingle.length]
    )
    .replace(
      "because those actions reinforce",
      "because those actions strengthen"
    );

  if (selectionType === "multiple") {
    output = output.replace(
      "without hiding uncertainty or delaying learning.",
      explanationEndingsMultiple[id % explanationEndingsMultiple.length]
    );
  }

  output = output
    .replace(/, (It supports empirical learning[^.]*\.)/g, ". $1")
    .replace(/, (It aligns with agile principles[^.]*\.)/g, ". $1")
    .replace(/, (It addresses the underlying agile concern[^.]*\.)/g, ". $1")
    .replace(/, (It keeps the response adaptive[^.]*\.)/g, ". $1")
    .replace(/(because those actions strengthen [^.]+?) (Together,|Those responses|In combination,|Taken together,)/g, "$1. $2")
    .replace(/\s{2,}/g, " ");

  return output;
}

function polishOptions(options) {
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, polishOptionText(String(value))])
  );
}

function polishOptionText(text) {
  return text
    .replace(/^To simplify coordination, (.+?) until the situation becomes clearer$/i, "$1 for now and revisit broader changes later")
    .replace(/^To avoid near-term disruption, (.+?) to reduce immediate disagreement$/i, "$1 to reduce near-term disruption")
    .replace(/^For short-term certainty, (.+?) so the team can maintain delivery pace$/i, "$1 to preserve short-term predictability")
    .replace(/^To preserve the current plan, (.+?) before revisiting the issue later$/i, "$1 to keep the current plan stable for now")
    .replace(/^Initially (.+)$/i, "Start by trying to $1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function runFromCli() {
  const rootDir = path.resolve(__dirname, "..");
  const filePath = path.join(rootDir, "data", "questions.json");
  const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const polished = polishQuestions(questions);
  fs.writeFileSync(filePath, JSON.stringify(polished, null, 2));
  console.log(`Polished ${polished.length} questions in data/questions.json`);
}

if (require.main === module) {
  runFromCli();
}

module.exports = {
  polishQuestions
};
