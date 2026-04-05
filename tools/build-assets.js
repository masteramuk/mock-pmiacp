const fs = require("fs");
const path = require("path");
const { polishQuestions } = require("./editorial-polish");

const rootDir = path.resolve(__dirname, "..");
const sourceJsonPath = path.join(rootDir, "data", "questions.json");
const generatedJsPath = path.join(rootDir, "question-bank.js");
const stylesPath = path.join(rootDir, "styles.css");
const indexHtmlPath = path.join(rootDir, "index.html");
const distDir = path.join(rootDir, "dist");
const offlineHtmlPath = path.join(distDir, "offline.html");
const reportPath = path.join(distDir, "dataset-report.json");
const distributableFiles = [
  "index.html",
  "exam.html",
  "result.html",
  "history.html",
  "question-bank.html",
  "dataset-tools.html",
  "ai-help.html",
  "styles.css",
  "question-bank.js",
  "core.js",
  "home.js",
  "exam.js",
  "result.js",
  "history.js",
  "bank.js",
  "dataset-tools.js"
];

const allowedDomains = [
  "Mindset",
  "Leadership",
  "Product",
  "Delivery"
];

const targetRatios = {
  easy: 20,
  medium: 30,
  hard: 50
};

const targetDomainRatios = {
  Mindset: 28,
  Leadership: 25,
  Product: 19,
  Delivery: 28
};

function main() {
  const sourceQuestions = readJson(sourceJsonPath);
  const questions = polishQuestions(sourceQuestions);
  fs.writeFileSync(sourceJsonPath, JSON.stringify(questions, null, 2));
  const report = validateQuestions(questions);

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    console.error("Dataset validation failed.");
    report.errors.forEach((error) => console.error(`ERROR: ${error}`));
    if (report.warnings.length > 0) {
      report.warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
    }
    process.exit(1);
  }

  if (report.warnings.length > 0) {
    report.warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
  }

  buildQuestionBankJs(questions);
  buildOfflinePackage();

  console.log(`Questions: ${report.summary.total}`);
  console.log(
    `Difficulty mix: easy ${report.summary.ratios.easy}% | medium ${report.summary.ratios.medium}% | hard ${report.summary.ratios.hard}%`
  );
  console.log(`Generated: ${path.relative(rootDir, generatedJsPath)}`);
  console.log(`Generated: ${path.relative(rootDir, path.join(distDir, "index.html"))}`);
  console.log(`Generated: ${path.relative(rootDir, offlineHtmlPath)}`);
  console.log(`Report: ${path.relative(rootDir, reportPath)}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateQuestions(questions) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const normalizedQuestions = new Set();
  const counts = { easy: 0, medium: 0, hard: 0 };
  const domains = {};

  if (!Array.isArray(questions)) {
    return {
      errors: ["Source dataset must be a JSON array."],
      warnings: [],
      summary: null
    };
  }

  questions.forEach((question, index) => {
    const label = `Question ${question.id ?? `at index ${index}`}`;

    if (!Number.isInteger(question.id) || question.id < 1) {
      errors.push(`${label} must have a positive integer id.`);
    }

    if (ids.has(question.id)) {
      errors.push(`${label} uses a duplicate id.`);
    }
    ids.add(question.id);

    if (index > 0 && Number.isInteger(question.id) && question.id <= questions[index - 1].id) {
      errors.push(`${label} is out of order. Ids must stay in ascending order.`);
    }

    if (typeof question.question !== "string" || question.question.trim().length < 25) {
      errors.push(`${label} must have a meaningful question string.`);
    } else {
      const normalizedQuestion = normalizeText(question.question);
      if (normalizedQuestions.has(normalizedQuestion)) {
        errors.push(`${label} appears to duplicate an earlier question.`);
      }
      normalizedQuestions.add(normalizedQuestion);

      if (question.question.trim().length < 90) {
        warnings.push(`${label} may be too short to feel scenario-based.`);
      }
    }

    if (!question.options || typeof question.options !== "object") {
      errors.push(`${label} must have an options object.`);
    } else {
      const expectedKeys = ["A", "B", "C", "D"];
      const actualKeys = Object.keys(question.options);
      if (actualKeys.length !== 4 || expectedKeys.some((key) => !actualKeys.includes(key))) {
        errors.push(`${label} must contain exactly option keys A, B, C, and D.`);
      }

      const optionValues = expectedKeys.map((key) => String(question.options[key] || "").trim());
      if (optionValues.some((value) => value.length < 5)) {
        errors.push(`${label} has an option that is too short.`);
      }
      if (new Set(optionValues.map(normalizeText)).size !== optionValues.length) {
        warnings.push(`${label} has options that look very similar.`);
      }
    }

    const answers = Array.isArray(question.answer) ? question.answer : [question.answer];
    if (!answers.every((answer) => ["A", "B", "C", "D"].includes(answer))) {
      errors.push(`${label} contains an invalid answer key.`);
    }
    if (new Set(answers).size !== answers.length) {
      errors.push(`${label} contains duplicate answer keys.`);
    }

    if (!["single", "multiple"].includes(question.selectionType)) {
      errors.push(`${label} must use selectionType 'single' or 'multiple'.`);
    } else if (question.selectionType === "single" && answers.length !== 1) {
      errors.push(`${label} is marked single but has ${answers.length} answers.`);
    } else if (question.selectionType === "multiple" && answers.length < 2) {
      errors.push(`${label} is marked multiple but has fewer than 2 answers.`);
    }

    if (!allowedDomains.includes(question.domain)) {
      errors.push(`${label} uses an unsupported domain.`);
    } else {
      domains[question.domain] = (domains[question.domain] || 0) + 1;
    }

    if (!["easy", "medium", "hard"].includes(question.difficulty)) {
      errors.push(`${label} uses an unsupported difficulty.`);
    } else {
      counts[question.difficulty] += 1;
    }

    if (typeof question.explanation !== "string" || question.explanation.trim().length < 40) {
      errors.push(`${label} must have a useful explanation.`);
    }
  });

  const total = questions.length || 1;
  const ratios = {
    easy: Math.round((counts.easy / total) * 100),
    medium: Math.round((counts.medium / total) * 100),
    hard: Math.round((counts.hard / total) * 100)
  };

  Object.entries(targetRatios).forEach(([difficulty, target]) => {
    const actual = ratios[difficulty];
    if (Math.abs(actual - target) > 10) {
      warnings.push(
        `Difficulty mix for ${difficulty} is ${actual}%, which is far from the target ${target}%.`
      );
    }
  });

  const domainRatios = Object.fromEntries(
    Object.entries(domains).map(([domain, count]) => [domain, Math.round((count / total) * 100)])
  );

  Object.entries(targetDomainRatios).forEach(([domain, target]) => {
    const actual = domainRatios[domain] || 0;
    if (Math.abs(actual - target) > 5) {
      warnings.push(
        `Domain mix for ${domain} is ${actual}%, which is far from the target ${target}%.`
      );
    }
  });

  if (questions.length !== 1200) {
    warnings.push(`Dataset currently has ${questions.length} questions; target is 1200.`);
  }

  return {
    errors,
    warnings,
    summary: {
      total: questions.length,
      counts,
      ratios,
      domains,
      domainRatios,
      targetRatios,
      targetDomainRatios,
      outlineVersion: "PMI-ACP Examination Content Outline - October 2024"
    }
  };
}

function buildQuestionBankJs(questions) {
  const contents = `const QUESTION_BANK = ${JSON.stringify(questions, null, 2)};\n`;
  fs.writeFileSync(generatedJsPath, contents);
}

function buildOfflinePackage() {
  distributableFiles.forEach((filename) => {
    const sourcePath = path.join(rootDir, filename);
    const targetPath = path.join(distDir, filename);
    fs.copyFileSync(sourcePath, targetPath);
  });
  fs.writeFileSync(
    offlineHtmlPath,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=./index.html" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PMI-ACP Offline Package</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="app-shell">
      <main>
        <section class="card">
          <h1>PMI-ACP Offline Package</h1>
          <p class="muted-text">The offline app now uses a multi-page structure. If you are not redirected automatically, open <a href="./index.html">index.html</a>.</p>
        </section>
      </main>
    </div>
  </body>
</html>
`
  );
}

function normalizeText(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

main();
