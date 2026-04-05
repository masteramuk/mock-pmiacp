const examState = {
  timerId: null,
  session: null
};

const examElements = {
  progressLabel: document.getElementById("progress-label"),
  timerLabel: document.getElementById("timer-label"),
  timeLimitPill: document.getElementById("time-limit-pill"),
  difficultyPill: document.getElementById("difficulty-pill"),
  modePill: document.getElementById("mode-pill"),
  examProgressSummary: document.getElementById("exam-progress-summary"),
  questionPalette: document.getElementById("question-palette"),
  domainLabel: document.getElementById("domain-label"),
  questionTypeLabel: document.getElementById("question-type-label"),
  difficultyLabel: document.getElementById("difficulty-label"),
  questionText: document.getElementById("question-text"),
  questionHelpText: document.getElementById("question-help-text"),
  questionForm: document.getElementById("question-form"),
  studyFeedback: document.getElementById("study-feedback"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  finishBtn: document.getElementById("finish-btn")
};

initExamPage();

function initExamPage() {
  examState.session = getExamSession();
  if (!examState.session || !examState.session.examQuestions?.length) {
    window.location.href = "index.html";
    return;
  }
  bindExamEvents();
  startTimer();
  renderQuestion();
}

function bindExamEvents() {
  examElements.prevBtn.addEventListener("click", () => changeQuestion(-1));
  examElements.nextBtn.addEventListener("click", () => changeQuestion(1));
  examElements.finishBtn.addEventListener("click", finishExamPage);
}

function renderQuestion() {
  const question = examState.session.examQuestions[examState.session.currentIndex];
  const selectedAnswers = examState.session.selections[question.id] || [];
  const inputType = question.selectionType === "multiple" ? "checkbox" : "radio";
  const feedback = getStudyFeedback(question, selectedAnswers);

  examElements.progressLabel.textContent = `Question ${examState.session.currentIndex + 1} of ${examState.session.examQuestions.length}`;
  examElements.difficultyPill.textContent = formatDifficultySelectionLabel(examState.session.selectedDifficulties);
  examElements.modePill.textContent = formatModeLabel(examState.session.selectedMode);
  examElements.timeLimitPill.textContent = `Limit ${formatDuration(examState.session.allowedTimeSeconds)}`;
  examElements.domainLabel.textContent = question.domain;
  examElements.questionTypeLabel.textContent = question.selectionType === "multiple" ? "Multiple answers" : "Single answer";
  examElements.difficultyLabel.textContent = capitalize(question.difficulty);
  examElements.questionText.textContent = question.question;
  examElements.questionHelpText.textContent = examState.session.selectedMode === "study"
    ? (question.selectionType === "multiple"
      ? `Study mode: select ${normalizeAnswer(question.answer).length} answers to see instant feedback.`
      : "Study mode: select 1 answer to see instant feedback.")
    : (question.selectionType === "multiple"
      ? `Exam mode: select ${normalizeAnswer(question.answer).length} answers, then continue when ready.`
      : "Exam mode: select 1 answer, then continue when ready.");

  examElements.questionForm.innerHTML = Object.entries(question.options).map(([key, value]) => {
    const checked = selectedAnswers.includes(key) ? "checked" : "";
    const optionStateClass = getOptionStateClass(question, key, feedback);
    return `
      <div class="option-card ${optionStateClass}">
        <label class="option-label">
          <input type="${inputType}" name="option" value="${key}" ${checked}>
          <span class="option-text"><strong>${key}.</strong> ${value}</span>
        </label>
      </div>
    `;
  }).join("");

  examElements.questionForm.innerHTML += `
    <button class="secondary-btn bookmark-btn" type="button" id="bookmark-current-btn" title="Save this question to bookmarks">
      ${isBookmarked(question.id) ? "Remove Bookmark" : "Bookmark Question"}
    </button>
  `;

  examElements.questionForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      saveSelection(question);
      renderQuestion();
    });
  });

  document.getElementById("bookmark-current-btn").addEventListener("click", () => {
    toggleBookmark(question);
    renderQuestion();
  });

  renderStudyFeedback(feedback, question);
  examElements.prevBtn.disabled = examState.session.currentIndex === 0;
  examElements.nextBtn.disabled = examState.session.currentIndex === examState.session.examQuestions.length - 1;
  renderExamSidebar();
}

function renderExamSidebar() {
  const answeredCount = Object.values(examState.session.selections).filter((answers) => answers.length > 0).length;
  const remaining = examState.session.examQuestions.length - answeredCount;

  examElements.examProgressSummary.innerHTML = `
    <strong>${answeredCount} answered</strong><br>
    ${remaining} remaining<br>
    ${examState.session.selectedMode === "study" ? "Use the number grid to revisit difficult questions." : "Use the number grid to move through the mock exam quickly."}
  `;

  examElements.questionPalette.innerHTML = examState.session.examQuestions.map((question, index) => {
    const answered = (examState.session.selections[question.id] || []).length > 0;
    const current = index === examState.session.currentIndex;
    return `<button type="button" class="palette-btn ${answered ? "answered" : "unanswered"} ${current ? "current" : ""}" data-index="${index}" title="Go to question ${index + 1}">${index + 1}</button>`;
  }).join("");

  examElements.questionPalette.querySelectorAll(".palette-btn").forEach((button) => {
    button.addEventListener("click", () => {
      saveSelection(examState.session.examQuestions[examState.session.currentIndex]);
      examState.session.currentIndex = Number(button.dataset.index);
      saveExamSession(examState.session);
      renderQuestion();
    });
  });
}

function saveSelection(question) {
  const selectedInputs = [...examElements.questionForm.querySelectorAll("input:checked")];
  examState.session.selections[question.id] = selectedInputs.map((input) => input.value).sort();
  saveExamSession(examState.session);
}

function changeQuestion(direction) {
  saveSelection(examState.session.examQuestions[examState.session.currentIndex]);
  const nextIndex = examState.session.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= examState.session.examQuestions.length) return;
  examState.session.currentIndex = nextIndex;
  saveExamSession(examState.session);
  renderQuestion();
}

function getStudyFeedback(question, selectedAnswers) {
  if (examState.session.selectedMode !== "study") return null;
  const expected = normalizeAnswer(question.answer);
  if (!selectedAnswers.length) return { state: "prompt", message: "Choose an answer to see feedback immediately." };
  if (question.selectionType === "multiple" && selectedAnswers.length < expected.length) {
    return { state: "prompt", message: `Select ${expected.length - selectedAnswers.length} more answer${expected.length - selectedAnswers.length > 1 ? "s" : ""} to check this question.` };
  }
  const correct = arraysEqual(expected, selectedAnswers.slice().sort());
  return {
    state: correct ? "correct" : "incorrect",
    message: correct ? "Correct. This matches the intended answer." : `Not quite. Correct answer: ${expected.join(", ")}`,
    explanation: question.explanation
  };
}

function getOptionStateClass(question, optionKey, feedback) {
  if (!feedback || (feedback.state !== "correct" && feedback.state !== "incorrect")) return "";
  const expected = normalizeAnswer(question.answer);
  const selected = examState.session.selections[question.id] || [];
  if (expected.includes(optionKey)) return "correct-option";
  if (selected.includes(optionKey) && !expected.includes(optionKey)) return "incorrect-option";
  return "";
}

function renderStudyFeedback(feedback, question) {
  if (examState.session.selectedMode !== "study") {
    examElements.studyFeedback.classList.add("hidden");
    examElements.studyFeedback.innerHTML = "";
    return;
  }
  examElements.studyFeedback.classList.remove("hidden");
  if (!feedback) {
    examElements.studyFeedback.innerHTML = `<strong>Study feedback</strong><br>Choose an answer to begin reviewing immediately.`;
    return;
  }
  if (feedback.state === "prompt") {
    examElements.studyFeedback.innerHTML = `<strong>Study feedback</strong><br>${feedback.message}`;
    return;
  }
  examElements.studyFeedback.innerHTML = `<strong>${feedback.state === "correct" ? "Correct" : "Review needed"}</strong><br>${feedback.message}<br>${question.explanation}`;
}

function startTimer() {
  stopTimer();
  updateTimer();
  examState.timerId = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (examState.timerId) {
    window.clearInterval(examState.timerId);
    examState.timerId = null;
  }
}

function updateTimer() {
  if (!examState.session?.startTime) {
    examElements.timerLabel.textContent = "00:00";
    examElements.timeLimitPill.classList.remove("alert");
    return;
  }
  const elapsed = Math.floor((Date.now() - new Date(examState.session.startTime).getTime()) / 1000);
  examElements.timerLabel.textContent = formatDuration(elapsed);
  const overLimit = examState.session.allowedTimeSeconds > 0 && elapsed > examState.session.allowedTimeSeconds;
  examElements.timerLabel.classList.toggle("alert", overLimit);
  examElements.timeLimitPill.classList.toggle("alert", overLimit);
}

function finishExamPage() {
  saveSelection(examState.session.examQuestions[examState.session.currentIndex]);
  stopTimer();
  finishExamSession(examState.session);
  window.location.href = "result.html";
}
