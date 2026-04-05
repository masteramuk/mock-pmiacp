const homeElements = {
  modeSelect: document.getElementById("mode-select"),
  difficultyEasy: document.getElementById("difficulty-easy"),
  difficultyMedium: document.getElementById("difficulty-medium"),
  difficultyHard: document.getElementById("difficulty-hard"),
  questionCountSelect: document.getElementById("question-count-select"),
  startExamBtn: document.getElementById("start-exam-btn"),
  resumeExamLink: document.getElementById("resume-exam-link"),
  latestResultLink: document.getElementById("latest-result-link"),
  homeHistorySummary: document.getElementById("home-history-summary"),
  datasetSummary: document.getElementById("dataset-summary"),
  datasetIssues: document.getElementById("dataset-issues"),
  homeDomainSummary: document.getElementById("home-domain-summary")
};

initHome();

function initHome() {
  migrateLegacyHistory();
  renderHomeDashboard();
  renderDatasetHealth();
  renderHomeShortcuts();
  homeElements.startExamBtn.addEventListener("click", startFromHome);
}

function startFromHome() {
  const selectedDifficulties = [
    homeElements.difficultyEasy.checked ? "easy" : null,
    homeElements.difficultyMedium.checked ? "medium" : null,
    homeElements.difficultyHard.checked ? "hard" : null
  ].filter(Boolean);

  try {
    startExamSession({
      selectedDifficulties,
      questionCount: Number(homeElements.questionCountSelect.value),
      selectedMode: homeElements.modeSelect.value
    });
    window.location.href = "exam.html";
  } catch (error) {
    window.alert(error.message);
  }
}

function renderHomeDashboard() {
  const history = getHistory();
  const bookmarks = getBookmarks();
  if (!history.length) {
    homeElements.homeHistorySummary.innerHTML = `
      ${miniStat("Attempts", "0", "No mock exams completed yet")}
      ${miniStat("Best Score", "-", "Finish your first attempt to see progress")}
      ${miniStat("Bookmarks", `${bookmarks.length}`, "Flag difficult questions for later review")}
    `;
    return;
  }

  const averageScore = Math.round(history.reduce((sum, item) => sum + item.percentageScore, 0) / history.length);
  const bestScore = Math.max(...history.map((item) => item.percentageScore));
  const latestAttempt = history[0];
  homeElements.homeHistorySummary.innerHTML = `
    ${miniStat("Attempts", String(history.length), "Each attempt includes full answer review")}
    ${miniStat("Average Score", `${averageScore}%`, "Across all saved attempts")}
    ${miniStat("Best Score", `${bestScore}%`, `Latest attempt: ${latestAttempt.percentageScore}% on ${formatShortDate(latestAttempt.endDateTime)}`)}
    ${miniStat("Bookmarks", `${bookmarks.length}`, "Use bookmarks to revisit hard questions")}
  `;
}

function renderHomeShortcuts() {
  const examSession = getExamSession();
  const lastResult = getLastResult();

  homeElements.resumeExamLink.classList.toggle("hidden", !examSession || !examSession.examQuestions?.length);
  homeElements.latestResultLink.classList.toggle("hidden", !lastResult || !lastResult.historyEntry);
}

function renderDatasetHealth() {
  const report = validateQuestionBank(QUESTION_BANK);
  const domainSummary = Object.entries(report.domains).map(([domain, count]) => `${domain}: ${count}`).join(" | ");
  homeElements.datasetSummary.innerHTML = `
    <strong>Dataset summary</strong><br>
    Questions: ${report.total}<br>
    Difficulty mix: Easy ${report.ratios.easy}% | Medium ${report.ratios.medium}% | Hard ${report.ratios.hard}%<br>
    Target mix: Easy ${report.targetRatios.easy}% | Medium ${report.targetRatios.medium}% | Hard ${report.targetRatios.hard}%<br>
    Domains: ${domainSummary}
  `;
  homeElements.homeDomainSummary.innerHTML = `
    <strong>Latest PMI-ACP domain coverage</strong><br>
    Mindset 28% | Leadership 25% | Product 19% | Delivery 28%<br>
    Latest outline means the current official domain blueprint used for exam weighting. It does not auto-refresh questions from the internet.<br>
    Questions are AI-generated practice material and not official PMI exam content.
  `;
  if (report.issues.length > 0) {
    homeElements.datasetIssues.classList.add("visible");
    homeElements.datasetIssues.innerHTML = `<strong>Validation notes</strong><br>${report.issues.slice(0, 8).join("<br>")}`;
  } else {
    homeElements.datasetIssues.classList.remove("visible");
    homeElements.datasetIssues.innerHTML = "";
  }
}
