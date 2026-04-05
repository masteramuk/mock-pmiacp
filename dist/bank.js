const bankState = {
  editableQuestionBank: JSON.parse(JSON.stringify(QUESTION_BANK)),
  editorMode: "edit",
  currentPage: 1,
  pageSize: 12
};

const bankElements = {
  bankSearchInput: document.getElementById("bank-search-input"),
  bankDomainFilter: document.getElementById("bank-domain-filter"),
  bankDifficultyFilter: document.getElementById("bank-difficulty-filter"),
  bankSummary: document.getElementById("bank-summary"),
  bankPrevPageBtn: document.getElementById("bank-prev-page-btn"),
  bankNextPageBtn: document.getElementById("bank-next-page-btn"),
  bankPageStatus: document.getElementById("bank-page-status"),
  bankList: document.getElementById("bank-list"),
  downloadBankBtn: document.getElementById("download-bank-btn"),
  importBankInput: document.getElementById("import-bank-input"),
  editorStatus: document.getElementById("editor-status"),
  editorId: document.getElementById("editor-id"),
  editorDomain: document.getElementById("editor-domain"),
  editorDifficulty: document.getElementById("editor-difficulty"),
  editorSelectionType: document.getElementById("editor-selection-type"),
  editorQuestion: document.getElementById("editor-question"),
  editorExplanation: document.getElementById("editor-explanation"),
  editorOptionA: document.getElementById("editor-option-a"),
  editorOptionB: document.getElementById("editor-option-b"),
  editorOptionC: document.getElementById("editor-option-c"),
  editorOptionD: document.getElementById("editor-option-d"),
  editorAnswer: document.getElementById("editor-answer"),
  newQuestionBtn: document.getElementById("new-question-btn"),
  saveEditorBtn: document.getElementById("save-editor-btn"),
  downloadEditedBankBtn: document.getElementById("download-edited-bank-btn"),
  runDuplicateCheckBtn: document.getElementById("run-duplicate-check-btn"),
  duplicateSummary: document.getElementById("duplicate-summary"),
  duplicateList: document.getElementById("duplicate-list")
};

initBankPage();

function initBankPage() {
  bindBankEvents();
  renderQuestionBank();
  renderDuplicateCheck();
}

function bindBankEvents() {
  [bankElements.bankSearchInput, bankElements.bankDomainFilter, bankElements.bankDifficultyFilter].forEach((input) => {
    input.addEventListener("input", () => {
      bankState.currentPage = 1;
      renderQuestionBank();
    });
  });
  bankElements.downloadBankBtn.addEventListener("click", downloadQuestionBank);
  bankElements.importBankInput.addEventListener("change", importEditedQuestionBank);
  bankElements.newQuestionBtn.addEventListener("click", prepareNewQuestion);
  bankElements.saveEditorBtn.addEventListener("click", saveEditedQuestion);
  bankElements.downloadEditedBankBtn.addEventListener("click", downloadEditedQuestionBank);
  bankElements.runDuplicateCheckBtn.addEventListener("click", renderDuplicateCheck);
  bankElements.bankPrevPageBtn.addEventListener("click", () => {
    bankState.currentPage = Math.max(1, bankState.currentPage - 1);
    renderQuestionBank();
  });
  bankElements.bankNextPageBtn.addEventListener("click", () => {
    bankState.currentPage += 1;
    renderQuestionBank();
  });
}

function renderQuestionBank() {
  const search = bankElements.bankSearchInput.value.trim().toLowerCase();
  const domain = bankElements.bankDomainFilter.value;
  const difficulty = bankElements.bankDifficultyFilter.value;

  const filtered = bankState.editableQuestionBank.filter((question) => {
    const haystack = `${question.question} ${question.explanation} ${question.domain}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesDomain = domain === "all" || question.domain === domain;
    const matchesDifficulty = difficulty === "all" || question.difficulty === difficulty;
    return matchesSearch && matchesDomain && matchesDifficulty;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / bankState.pageSize));
  bankState.currentPage = Math.min(bankState.currentPage, totalPages);
  const startIndex = (bankState.currentPage - 1) * bankState.pageSize;
  const pagedItems = filtered.slice(startIndex, startIndex + bankState.pageSize);

  bankElements.bankSummary.innerHTML = `
    <strong>Question bank browser</strong><br>
    Showing ${filtered.length} of ${bankState.editableQuestionBank.length} questions.<br>
    To edit the master dataset permanently, replace <code>data/questions.json</code> with your exported dataset and rebuild.
  `;

  bankElements.bankPageStatus.innerHTML = `
    <strong>Page ${bankState.currentPage}</strong> of ${totalPages}<br>
    Questions ${filtered.length ? startIndex + 1 : 0} to ${Math.min(startIndex + bankState.pageSize, filtered.length)} of ${filtered.length}
  `;
  bankElements.bankPrevPageBtn.disabled = bankState.currentPage <= 1;
  bankElements.bankNextPageBtn.disabled = bankState.currentPage >= totalPages;

  bankElements.bankList.innerHTML = pagedItems.map((question) => {
    const answers = normalizeAnswer(question.answer);
    const optionsMarkup = Object.entries(question.options).map(([key, value]) => `
      <div class="review-option ${answers.includes(key) ? "correct-answer" : ""}">
        <strong>${key}.</strong> ${value}
        ${answers.includes(key) ? `<div class="muted-text">Answer key</div>` : ""}
      </div>
    `).join("");

    return `
      <article class="review-card">
        <p class="muted-text">ID ${question.id} | ${question.domain} | ${capitalize(question.difficulty)} | ${question.selectionType}</p>
        <h3>${question.question}</h3>
        <div class="question-options-review">${optionsMarkup}</div>
        <p class="answer-line"><strong>Explanation:</strong> ${question.explanation}</p>
        <button class="secondary-btn bookmark-btn" type="button" data-load-editor-id="${question.id}" title="Load this question into the editor">Edit This Question</button>
      </article>
    `;
  }).join("");

  bankElements.bankList.querySelectorAll("[data-load-editor-id]").forEach((button) => {
    button.addEventListener("click", () => loadEditorQuestion(Number(button.dataset.loadEditorId)));
  });
}

function downloadQuestionBank() {
  downloadTextFile("pmi-acp-question-bank.json", JSON.stringify(bankState.editableQuestionBank, null, 2), "application/json");
}

function importEditedQuestionBank(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!Array.isArray(imported)) {
        window.alert("Dataset file must be a JSON array.");
        return;
      }
      const report = validateQuestionBank(imported);
      if (report.issues.length > 0) {
        window.alert(`Imported dataset has validation issues. First note: ${report.issues[0]}`);
        return;
      }
      bankState.editableQuestionBank = JSON.parse(JSON.stringify(imported));
      bankState.currentPage = 1;
      renderQuestionBank();
      renderDuplicateCheck();
      bankElements.editorStatus.innerHTML = `<strong>Dataset imported</strong><br>The editable bank now uses the imported JSON file. Download the edited dataset after further changes.`;
    } catch (_error) {
      window.alert("Unable to import the dataset JSON file.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function loadEditorQuestion(questionId) {
  const question = bankState.editableQuestionBank.find((item) => item.id === questionId);
  if (!question) return;

  bankState.editorMode = "edit";
  bankElements.editorId.value = question.id;
  bankElements.editorDomain.value = question.domain;
  bankElements.editorDifficulty.value = question.difficulty;
  bankElements.editorSelectionType.value = question.selectionType;
  bankElements.editorQuestion.value = question.question;
  bankElements.editorExplanation.value = question.explanation;
  bankElements.editorOptionA.value = question.options.A;
  bankElements.editorOptionB.value = question.options.B;
  bankElements.editorOptionC.value = question.options.C;
  bankElements.editorOptionD.value = question.options.D;
  bankElements.editorAnswer.value = normalizeAnswer(question.answer).join(",");
  bankElements.editorStatus.innerHTML = `<strong>Editing question ${question.id}</strong><br>Update the fields and click <em>Save Current Question</em>.`;
  bankElements.editorStatus.scrollIntoView({ behavior: "smooth", block: "start" });
}

function prepareNewQuestion() {
  bankState.editorMode = "create";
  bankElements.editorId.value = getNextQuestionId();
  bankElements.editorDomain.value = "Mindset";
  bankElements.editorDifficulty.value = "medium";
  bankElements.editorSelectionType.value = "single";
  bankElements.editorQuestion.value = "";
  bankElements.editorExplanation.value = "";
  bankElements.editorOptionA.value = "";
  bankElements.editorOptionB.value = "";
  bankElements.editorOptionC.value = "";
  bankElements.editorOptionD.value = "";
  bankElements.editorAnswer.value = "A";
  bankElements.editorStatus.innerHTML = `<strong>Creating question ${bankElements.editorId.value}</strong><br>Fill in all fields, then click <em>Save Current Question</em> to add it to the editable dataset.`;
  bankElements.editorStatus.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveEditedQuestion() {
  const questionId = Number(bankElements.editorId.value);
  const answerKeys = bankElements.editorAnswer.value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
  if (!answerKeys.length || answerKeys.some((item) => !["A", "B", "C", "D"].includes(item))) {
    window.alert("Answer Key(s) must be A, B, C, D, or a comma-separated combination like A,C.");
    return;
  }

  const questionPayload = {
    id: questionId,
    domain: bankElements.editorDomain.value,
    difficulty: bankElements.editorDifficulty.value,
    selectionType: bankElements.editorSelectionType.value,
    question: bankElements.editorQuestion.value.trim(),
    explanation: bankElements.editorExplanation.value.trim(),
    options: {
      A: bankElements.editorOptionA.value.trim(),
      B: bankElements.editorOptionB.value.trim(),
      C: bankElements.editorOptionC.value.trim(),
      D: bankElements.editorOptionD.value.trim()
    },
    answer: answerKeys.length === 1 ? answerKeys[0] : answerKeys
  };

  if (!questionPayload.question || !questionPayload.explanation || Object.values(questionPayload.options).some((value) => !value)) {
    window.alert("Question, explanation, and all four options are required.");
    return;
  }
  if (questionPayload.selectionType === "single" && answerKeys.length !== 1) {
    window.alert("Single-answer questions must have exactly one answer key.");
    return;
  }
  if (questionPayload.selectionType === "multiple" && answerKeys.length < 2) {
    window.alert("Multiple-answer questions must have at least two answer keys.");
    return;
  }

  const existingIndex = bankState.editableQuestionBank.findIndex((item) => item.id === questionId);
  if (existingIndex >= 0) {
    bankState.editableQuestionBank[existingIndex] = questionPayload;
    bankElements.editorStatus.innerHTML = `<strong>Saved question ${questionId}</strong><br>The in-browser editable dataset has been updated. Download the edited dataset JSON to keep the changes permanently.`;
  } else {
    bankState.editableQuestionBank.push(questionPayload);
    bankState.editableQuestionBank.sort((left, right) => left.id - right.id);
    bankState.editorMode = "edit";
    bankState.currentPage = Math.max(1, Math.ceil(bankState.editableQuestionBank.length / bankState.pageSize));
    bankElements.editorStatus.innerHTML = `<strong>Created question ${questionId}</strong><br>The new question is now part of the editable dataset. Download the edited dataset JSON to keep it permanently.`;
  }

  renderQuestionBank();
  renderDuplicateCheck();
}

function renderDuplicateCheck() {
  const duplicateGroups = findLikelyDuplicates(bankState.editableQuestionBank);
  if (!duplicateGroups.length) {
    bankElements.duplicateSummary.innerHTML = `<strong>Duplicate checker</strong><br>No likely duplicates were found in the current editable dataset.`;
    bankElements.duplicateList.innerHTML = "";
    return;
  }

  bankElements.duplicateSummary.innerHTML = `<strong>Duplicate checker</strong><br>Found ${duplicateGroups.length} likely duplicate pair${duplicateGroups.length === 1 ? "" : "s"}. Review them before exporting the edited dataset.`;
  bankElements.duplicateList.innerHTML = duplicateGroups.slice(0, 40).map((pair) => `
    <article class="review-card duplicate-card">
      <p class="muted-text">Similarity score ${pair.score}%</p>
      <div class="duplicate-grid">
        <div class="duplicate-item">
          <p class="muted-text">Question ${pair.left.id} | ${pair.left.domain} | ${capitalize(pair.left.difficulty)}</p>
          <h3>${pair.left.question}</h3>
          <p class="answer-line"><strong>Explanation:</strong> ${pair.left.explanation}</p>
          <button class="secondary-btn bookmark-btn" type="button" data-load-editor-id="${pair.left.id}" title="Edit the left question">Edit Question ${pair.left.id}</button>
        </div>
        <div class="duplicate-item">
          <p class="muted-text">Question ${pair.right.id} | ${pair.right.domain} | ${capitalize(pair.right.difficulty)}</p>
          <h3>${pair.right.question}</h3>
          <p class="answer-line"><strong>Explanation:</strong> ${pair.right.explanation}</p>
          <button class="secondary-btn bookmark-btn" type="button" data-load-editor-id="${pair.right.id}" title="Edit the right question">Edit Question ${pair.right.id}</button>
        </div>
      </div>
    </article>
  `).join("");

  if (duplicateGroups.length > 40) {
    bankElements.duplicateList.innerHTML += `<p class="muted-text">Only the first 40 likely duplicate pairs are shown here. Refine the dataset and run the check again as needed.</p>`;
  }

  bankElements.duplicateList.querySelectorAll("[data-load-editor-id]").forEach((button) => {
    button.addEventListener("click", () => loadEditorQuestion(Number(button.dataset.loadEditorId)));
  });
}

function findLikelyDuplicates(questions) {
  const pairs = [];
  for (let index = 0; index < questions.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < questions.length; compareIndex += 1) {
      const left = questions[index];
      const right = questions[compareIndex];
      const score = similarityScore(left.question, right.question);
      if (score >= 82) {
        pairs.push({ left, right, score });
      }
    }
  }
  return pairs.sort((left, right) => right.score - left.score);
}

function similarityScore(leftText, rightText) {
  const leftTokens = new Set(normalizeComparisonText(leftText).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeComparisonText(rightText).split(" ").filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let overlap = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) overlap += 1;
  });
  const denominator = Math.max(leftTokens.size, rightTokens.size);
  return Math.round((overlap / denominator) * 100);
}

function normalizeComparisonText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getNextQuestionId() {
  const ids = bankState.editableQuestionBank.map((item) => Number(item.id) || 0);
  return (Math.max(...ids, 0) || 0) + 1;
}

function downloadEditedQuestionBank() {
  downloadTextFile("pmi-acp-question-bank-edited.json", JSON.stringify(bankState.editableQuestionBank, null, 2), "application/json");
}
