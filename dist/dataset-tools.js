const toolState = {
  workingBank: JSON.parse(JSON.stringify(QUESTION_BANK)),
  stagedItems: [],
  selectedStageId: null
};

const toolElements = {
  importJsonInput: document.getElementById("import-json-input"),
  importCsvInput: document.getElementById("import-csv-input"),
  pasteImportText: document.getElementById("paste-import-text"),
  parsePastedTextBtn: document.getElementById("parse-pasted-text-btn"),
  mergeStagedBtn: document.getElementById("merge-staged-btn"),
  clearStagedBtn: document.getElementById("clear-staged-btn"),
  downloadMergedDatasetBtn: document.getElementById("download-merged-dataset-btn"),
  toolsSummary: document.getElementById("tools-summary"),
  toolsValidation: document.getElementById("tools-validation"),
  toolsValidationList: document.getElementById("tools-validation-list"),
  stagedList: document.getElementById("staged-list"),
  stagedEditorStatus: document.getElementById("staged-editor-status"),
  stagedEditorId: document.getElementById("staged-editor-id"),
  stagedEditorDomain: document.getElementById("staged-editor-domain"),
  stagedEditorDifficulty: document.getElementById("staged-editor-difficulty"),
  stagedEditorSelectionType: document.getElementById("staged-editor-selection-type"),
  stagedEditorQuestion: document.getElementById("staged-editor-question"),
  stagedEditorExplanation: document.getElementById("staged-editor-explanation"),
  stagedEditorOptionA: document.getElementById("staged-editor-option-a"),
  stagedEditorOptionB: document.getElementById("staged-editor-option-b"),
  stagedEditorOptionC: document.getElementById("staged-editor-option-c"),
  stagedEditorOptionD: document.getElementById("staged-editor-option-d"),
  stagedEditorAnswer: document.getElementById("staged-editor-answer"),
  saveStagedItemBtn: document.getElementById("save-staged-item-btn")
};

initDatasetTools();

function initDatasetTools() {
  bindToolEvents();
  renderToolSummary();
  renderValidationPreview();
  renderStagedList();
}

function bindToolEvents() {
  toolElements.importJsonInput.addEventListener("change", importJsonFile);
  toolElements.importCsvInput.addEventListener("change", importCsvFile);
  toolElements.parsePastedTextBtn.addEventListener("click", parsePastedTextImport);
  toolElements.mergeStagedBtn.addEventListener("click", mergeStagedItems);
  toolElements.clearStagedBtn.addEventListener("click", clearStagedItems);
  toolElements.downloadMergedDatasetBtn.addEventListener("click", downloadMergedDataset);
  toolElements.saveStagedItemBtn.addEventListener("click", saveStagedItem);
}

function importJsonFile(event) {
  readFileAsText(event.target.files?.[0], (text) => {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    stageImportedItems(items);
  });
  event.target.value = "";
}

function importCsvFile(event) {
  readFileAsText(event.target.files?.[0], (text) => {
    const rows = parseCsv(text);
    const items = rows.map(mapCsvRowToQuestion);
    stageImportedItems(items);
  });
  event.target.value = "";
}

function parsePastedTextImport() {
  const rawText = toolElements.pasteImportText.value.trim();
  if (!rawText) {
    window.alert("Paste some text first.");
    return;
  }

  const items = parsePastedQuestions(rawText);
  if (!items.length) {
    window.alert("No recognizable questions were found in the pasted text.");
    return;
  }

  stageImportedItems(items);
}

function stageImportedItems(items) {
  const cleaned = items
    .map((item, index) => normalizeImportedQuestion(item, index))
    .filter((item) => item && item.question);

  if (!cleaned.length) {
    window.alert("No valid questions were found in the imported content.");
    return;
  }

  toolState.stagedItems = [...toolState.stagedItems, ...cleaned];
  if (!toolState.selectedStageId && toolState.stagedItems[0]) {
    toolState.selectedStageId = toolState.stagedItems[0].stageId;
    loadStagedItem(toolState.selectedStageId);
  }
  renderToolSummary();
  renderValidationPreview();
  renderStagedList();
}

function normalizeImportedQuestion(item, index) {
  const options = item.options || {};
  const answer = Array.isArray(item.answer)
    ? item.answer.map((value) => String(value).trim().toUpperCase())
    : String(item.answer || "A")
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);

  return {
    stageId: `stage-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    id: Number(item.id) || getNextId(),
    question: String(item.question || "").trim(),
    options: {
      A: String(options.A || item.optionA || "").trim(),
      B: String(options.B || item.optionB || "").trim(),
      C: String(options.C || item.optionC || "").trim(),
      D: String(options.D || item.optionD || "").trim()
    },
    answer: answer.length <= 1 ? (answer[0] || "A") : answer,
    explanation: String(item.explanation || "").trim(),
    domain: normalizeDomain(item.domain),
    difficulty: normalizeDifficulty(item.difficulty),
    selectionType: normalizeSelectionType(item.selectionType || item.selection_type || (answer.length > 1 ? "multiple" : "single")),
    source: item.source || "imported"
  };
}

function normalizeDomain(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("leader")) return "Leadership";
  if (normalized.includes("product")) return "Product";
  if (normalized.includes("delivery")) return "Delivery";
  return "Mindset";
}

function normalizeDifficulty(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "easy" || normalized === "hard") return normalized;
  return "medium";
}

function normalizeSelectionType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "multiple" ? "multiple" : "single";
}

function renderToolSummary() {
  toolElements.toolsSummary.innerHTML = `
    <strong>Dataset tool summary</strong><br>
    Working dataset: ${toolState.workingBank.length} questions<br>
    Staged imported questions: ${toolState.stagedItems.length}<br>
    Tip: export from Excel as CSV, and paste copied text from PDFs into the text box above.
  `;
}

function renderValidationPreview() {
  const issues = toolState.stagedItems.flatMap((item) => validateStagedItem(item));
  if (!toolState.stagedItems.length) {
    toolElements.toolsValidation.innerHTML = `<strong>Validation preview</strong><br>No staged questions to validate yet.`;
    toolElements.toolsValidationList.innerHTML = "";
    return;
  }

  const validCount = toolState.stagedItems.length - new Set(issues.map((issue) => issue.stageId)).size;
  toolElements.toolsValidation.innerHTML = `
    <strong>Validation preview</strong><br>
    Staged questions: ${toolState.stagedItems.length}<br>
    Ready to merge: ${validCount}<br>
    Needs review: ${new Set(issues.map((issue) => issue.stageId)).size}
  `;

  if (!issues.length) {
    toolElements.toolsValidationList.innerHTML = `<p class="muted-text">All staged questions currently pass the lightweight validation preview.</p>`;
    return;
  }

  toolElements.toolsValidationList.innerHTML = issues.map((issue) => `
    <article class="review-card incorrect">
      <p class="muted-text">Question ID ${issue.id}</p>
      <h3>${issue.title}</h3>
      <p>${issue.message}</p>
    </article>
  `).join("");
}

function renderStagedList() {
  if (!toolState.stagedItems.length) {
    toolElements.stagedList.innerHTML = `<p class="muted-text">No staged imported questions yet.</p>`;
    return;
  }

  toolElements.stagedList.innerHTML = toolState.stagedItems
    .map((item) => `
      <article class="review-card">
        <p class="muted-text">ID ${item.id} | ${item.domain} | ${capitalize(item.difficulty)} | ${item.selectionType}</p>
        <h3>${item.question || "(No question text yet)"}</h3>
        <div class="question-options-review">
          ${Object.entries(item.options).map(([key, value]) => `<div class="review-option"><strong>${key}.</strong> ${value || "<em>Empty</em>"}</div>`).join("")}
        </div>
        <p class="answer-line"><strong>Explanation:</strong> ${item.explanation || "<em>Missing explanation</em>"}</p>
        <div class="history-card-actions">
          <button class="primary-btn" type="button" data-stage-edit="${item.stageId}">Edit</button>
          <button class="secondary-btn" type="button" data-stage-remove="${item.stageId}">Remove</button>
        </div>
      </article>
    `)
    .join("");

  toolElements.stagedList.querySelectorAll("[data-stage-edit]").forEach((button) => {
    button.addEventListener("click", () => loadStagedItem(button.dataset.stageEdit));
  });

  toolElements.stagedList.querySelectorAll("[data-stage-remove]").forEach((button) => {
    button.addEventListener("click", () => removeStagedItem(button.dataset.stageRemove));
  });
}

function loadStagedItem(stageId) {
  const item = toolState.stagedItems.find((entry) => entry.stageId === stageId);
  if (!item) return;

  toolState.selectedStageId = stageId;
  toolElements.stagedEditorId.value = item.id;
  toolElements.stagedEditorDomain.value = item.domain;
  toolElements.stagedEditorDifficulty.value = item.difficulty;
  toolElements.stagedEditorSelectionType.value = item.selectionType;
  toolElements.stagedEditorQuestion.value = item.question;
  toolElements.stagedEditorExplanation.value = item.explanation;
  toolElements.stagedEditorOptionA.value = item.options.A;
  toolElements.stagedEditorOptionB.value = item.options.B;
  toolElements.stagedEditorOptionC.value = item.options.C;
  toolElements.stagedEditorOptionD.value = item.options.D;
  toolElements.stagedEditorAnswer.value = normalizeAnswer(item.answer).join(",");
  toolElements.stagedEditorStatus.innerHTML = `<strong>Editing staged question ${item.id}</strong><br>Review it before bulk merge.`;
}

function saveStagedItem() {
  const item = toolState.stagedItems.find((entry) => entry.stageId === toolState.selectedStageId);
  if (!item) {
    window.alert("Choose a staged question first.");
    return;
  }

  const answerKeys = toolElements.stagedEditorAnswer.value
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  item.id = Number(toolElements.stagedEditorId.value) || getNextId();
  item.domain = toolElements.stagedEditorDomain.value;
  item.difficulty = toolElements.stagedEditorDifficulty.value;
  item.selectionType = toolElements.stagedEditorSelectionType.value;
  item.question = toolElements.stagedEditorQuestion.value.trim();
  item.explanation = toolElements.stagedEditorExplanation.value.trim();
  item.options = {
    A: toolElements.stagedEditorOptionA.value.trim(),
    B: toolElements.stagedEditorOptionB.value.trim(),
    C: toolElements.stagedEditorOptionC.value.trim(),
    D: toolElements.stagedEditorOptionD.value.trim()
  };
  item.answer = answerKeys.length <= 1 ? (answerKeys[0] || "A") : answerKeys;

  renderStagedList();
  renderValidationPreview();
  toolElements.stagedEditorStatus.innerHTML = `<strong>Saved staged question ${item.id}</strong><br>It is ready for bulk merge.`;
}

function removeStagedItem(stageId) {
  toolState.stagedItems = toolState.stagedItems.filter((item) => item.stageId !== stageId);
  if (toolState.selectedStageId === stageId) {
    toolState.selectedStageId = null;
    toolElements.stagedEditorStatus.innerHTML = "Choose a staged question to edit.";
  }
  renderToolSummary();
  renderValidationPreview();
  renderStagedList();
}

function clearStagedItems() {
  toolState.stagedItems = [];
  toolState.selectedStageId = null;
  renderToolSummary();
  renderValidationPreview();
  renderStagedList();
  toolElements.stagedEditorStatus.innerHTML = "Choose a staged question to edit.";
}

function mergeStagedItems() {
  if (!toolState.stagedItems.length) {
    window.alert("There are no staged questions to merge.");
    return;
  }

  toolState.stagedItems.forEach((item) => {
    const merged = {
      id: item.id,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      domain: item.domain,
      difficulty: item.difficulty,
      selectionType: item.selectionType
    };
    const existingIndex = toolState.workingBank.findIndex((entry) => entry.id === merged.id);
    if (existingIndex >= 0) {
      toolState.workingBank[existingIndex] = merged;
    } else {
      toolState.workingBank.push(merged);
    }
  });

  toolState.workingBank.sort((left, right) => left.id - right.id);
  renderToolSummary();
  renderValidationPreview();
  window.alert(`Merged ${toolState.stagedItems.length} staged question(s) into the working dataset.`);
}

function validateStagedItem(item) {
  const issues = [];
  const answers = normalizeAnswer(item.answer);
  const optionValues = Object.values(item.options || {});

  if (!item.question || item.question.trim().length < 20) {
    issues.push({ stageId: item.stageId, id: item.id, title: "Question text is too short", message: "The question stem should be more complete and scenario-based before merge." });
  }
  if (!item.explanation || item.explanation.trim().length < 25) {
    issues.push({ stageId: item.stageId, id: item.id, title: "Explanation is too short", message: "Add a clearer rationale so the learner understands why the answer is correct." });
  }
  if (optionValues.some((value) => !String(value || "").trim())) {
    issues.push({ stageId: item.stageId, id: item.id, title: "One or more options are empty", message: "Each staged question must include all four options A to D." });
  }
  if (answers.some((answer) => !["A", "B", "C", "D"].includes(answer))) {
    issues.push({ stageId: item.stageId, id: item.id, title: "Answer key is invalid", message: "Use A, B, C, D or a comma-separated combination such as A,C." });
  }
  if (item.selectionType === "single" && answers.length !== 1) {
    issues.push({ stageId: item.stageId, id: item.id, title: "Single-answer mismatch", message: "This question is marked single-answer but currently has multiple answer keys." });
  }
  if (item.selectionType === "multiple" && answers.length < 2) {
    issues.push({ stageId: item.stageId, id: item.id, title: "Multiple-answer mismatch", message: "This question is marked multiple-answer but has fewer than two answer keys." });
  }

  return issues;
}

function downloadMergedDataset() {
  downloadTextFile("pmi-acp-question-bank-merged.json", JSON.stringify(toolState.workingBank, null, 2), "application/json");
}

function parsePastedQuestions(text) {
  return text
    .split(/\n\s*\n/g)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return null;

      const mapped = {
        question: stripPrefix(lines[0], ["Q:", "Question:"]),
        options: {},
        answer: "A",
        explanation: "",
        domain: "Mindset",
        difficulty: "medium",
        selectionType: "single",
        source: "pasted-text"
      };

      lines.slice(1).forEach((line) => {
        if (/^A[\.\:\)]/i.test(line)) mapped.options.A = line.replace(/^A[\.\:\)]\s*/i, "").trim();
        else if (/^B[\.\:\)]/i.test(line)) mapped.options.B = line.replace(/^B[\.\:\)]\s*/i, "").trim();
        else if (/^C[\.\:\)]/i.test(line)) mapped.options.C = line.replace(/^C[\.\:\)]\s*/i, "").trim();
        else if (/^D[\.\:\)]/i.test(line)) mapped.options.D = line.replace(/^D[\.\:\)]\s*/i, "").trim();
        else if (/^Answer:/i.test(line)) mapped.answer = line.replace(/^Answer:\s*/i, "").trim();
        else if (/^Explanation:/i.test(line)) mapped.explanation = line.replace(/^Explanation:\s*/i, "").trim();
        else if (/^Domain:/i.test(line)) mapped.domain = line.replace(/^Domain:\s*/i, "").trim();
        else if (/^Difficulty:/i.test(line)) mapped.difficulty = line.replace(/^Difficulty:\s*/i, "").trim();
        else if (/^Selection Type:/i.test(line)) mapped.selectionType = line.replace(/^Selection Type:\s*/i, "").trim();
      });

      return mapped;
    })
    .filter(Boolean);
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [header = [], ...dataRows] = rows;
  return dataRows.map((dataRow) =>
    Object.fromEntries(header.map((key, columnIndex) => [String(key).trim(), dataRow[columnIndex] || ""]))
  );
}

function mapCsvRowToQuestion(row) {
  return {
    id: row.id,
    question: row.question,
    optionA: row.optionA || row.A,
    optionB: row.optionB || row.B,
    optionC: row.optionC || row.C,
    optionD: row.optionD || row.D,
    answer: row.answer,
    explanation: row.explanation,
    domain: row.domain,
    difficulty: row.difficulty,
    selectionType: row.selectionType
  };
}

function normalizeAnswer(answer) {
  return Array.isArray(answer) ? answer : [answer];
}

function stripPrefix(value, prefixes) {
  return prefixes.reduce((output, prefix) => output.replace(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), ""), String(value || "")).trim();
}

function getNextId() {
  const ids = toolState.workingBank.map((item) => Number(item.id) || 0);
  const stagedIds = toolState.stagedItems.map((item) => Number(item.id) || 0);
  return Math.max(0, ...ids, ...stagedIds) + 1;
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readFileAsText(file, onLoad) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ""));
  reader.readAsText(file);
}
