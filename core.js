const STORAGE_KEY = "pmiacp-mock-history-v3";
const BOOKMARKS_KEY = "pmiacp-bookmarks-v1";
const LEGACY_STORAGE_KEYS = ["pmiacp-mock-history-v2", "pmiacp-mock-history"];
const EXAM_SESSION_KEY = "pmiacp-exam-session-v1";
const LAST_RESULT_KEY = "pmiacp-last-result-v1";
const DOMAIN_WEIGHTS = {
  Mindset: 28,
  Leadership: 25,
  Product: 19,
  Delivery: 28
};
const MINUTES_PER_QUESTION = 1.5;

function migrateLegacyHistory() {
  if (window.localStorage.getItem(STORAGE_KEY)) {
    return;
  }

  const legacyKey = LEGACY_STORAGE_KEYS.find((key) => window.localStorage.getItem(key));
  if (!legacyKey) {
    return;
  }

  try {
    const legacy = JSON.parse(window.localStorage.getItem(legacyKey));
    const migrated = legacy.map((item) => ({
      id: item.id || `${Date.now()}-${Math.random()}`,
      mode: item.mode || "exam",
      startDateTime: item.startDateTime,
      endDateTime: item.endDateTime,
      timeTakenSeconds: item.timeTakenSeconds,
      difficulty: item.difficulty || "all",
      difficultyLabels: item.difficultyLabels || String(item.difficulty || "all").split(","),
      result: item.result || "Needs Improvement",
      targetTag: item.targetTag || getTargetTag(item.percentageScore || 0),
      percentageScore: item.percentageScore || 0,
      correctAnswers: item.correctAnswers || 0,
      totalQuestions: item.totalQuestions || 0,
      allowedTimeSeconds: item.allowedTimeSeconds || 0,
      exceededTimeLimit: Boolean(item.exceededTimeLimit),
      domainStats: item.domainStats || [],
      reviewItems: item.reviewItems || [],
      outlineVersion: item.outlineVersion || "PMI-ACP Examination Content Outline - October 2024"
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  } catch (_error) {
    window.localStorage.removeItem(legacyKey);
  }
}

function getHistory() {
  migrateLegacyHistory();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function clearHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function getBookmarks() {
  const raw = window.localStorage.getItem(BOOKMARKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function isBookmarked(questionId) {
  return getBookmarks().some((item) => item.id === questionId);
}

function toggleBookmark(question) {
  const bookmarks = getBookmarks();
  const existing = bookmarks.find((item) => item.id === question.id);
  const nextBookmarks = existing
    ? bookmarks.filter((item) => item.id !== question.id)
    : [
        {
          id: question.id,
          question: question.question,
          domain: question.domain,
          difficulty: question.difficulty,
          explanation: question.explanation
        },
        ...bookmarks
      ];
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextBookmarks));
}

function getLastResult() {
  const raw = window.localStorage.getItem(LAST_RESULT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveLastResult(result) {
  window.localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

function getExamSession() {
  const raw = window.localStorage.getItem(EXAM_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveExamSession(session) {
  window.localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));
}

function clearExamSession() {
  window.localStorage.removeItem(EXAM_SESSION_KEY);
}

function startExamSession(config) {
  const selectedDifficulties = config.selectedDifficulties;
  const requestedCount = Number(config.questionCount);
  const filteredQuestions = QUESTION_BANK.filter((question) => selectedDifficulties.includes(question.difficulty));

  if (!selectedDifficulties.length) {
    throw new Error("Select at least one difficulty level.");
  }
  if (!filteredQuestions.length) {
    throw new Error("No questions found for the selected difficulty combination.");
  }

  const examCount = Math.min(Math.max(requestedCount || 10, 1), filteredQuestions.length);
  const examQuestions = buildWeightedExam(filteredQuestions, examCount);
  const session = {
    examQuestions,
    currentIndex: 0,
    selections: {},
    startTime: new Date().toISOString(),
    endTime: null,
    allowedTimeSeconds: Math.round(examCount * MINUTES_PER_QUESTION * 60),
    selectedDifficulties,
    selectedMode: config.selectedMode || "exam"
  };
  saveExamSession(session);
  return session;
}

function finishExamSession(session) {
  const endedSession = {
    ...session,
    endTime: new Date().toISOString()
  };

  const reviewItems = endedSession.examQuestions.map((question, index) => {
    const expected = normalizeAnswer(question.answer);
    const selected = (endedSession.selections[question.id] || []).slice().sort();
    const correct = arraysEqual(expected, selected);
    return {
      questionId: question.id,
      questionNumber: index + 1,
      question: question.question,
      domain: question.domain,
      difficulty: question.difficulty,
      selectionType: question.selectionType,
      options: question.options,
      selected,
      expected,
      correct,
      explanation: question.explanation
    };
  });

  const correctCount = reviewItems.filter((item) => item.correct).length;
  const total = reviewItems.length;
  const percentage = Math.round((correctCount / total) * 100);
  const startTime = new Date(endedSession.startTime);
  const endTime = new Date(endedSession.endTime);
  const durationSeconds = Math.max(1, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));
  const domainStats = summarizeDomains(reviewItems);
  const strongestDomain = [...domainStats].sort((a, b) => b.score - a.score)[0];
  const weakestDomain = [...domainStats].sort((a, b) => a.score - b.score)[0];

  const historyEntry = {
    id: `${startTime.getTime()}`,
    mode: endedSession.selectedMode,
    startDateTime: endedSession.startTime,
    endDateTime: endedSession.endTime,
    timeTakenSeconds: durationSeconds,
    allowedTimeSeconds: endedSession.allowedTimeSeconds,
    exceededTimeLimit: durationSeconds > endedSession.allowedTimeSeconds,
    difficulty: endedSession.selectedDifficulties.join(","),
    difficultyLabels: endedSession.selectedDifficulties,
    result: percentage >= 70 ? "Pass" : "Needs Improvement",
    targetTag: getTargetTag(percentage),
    percentageScore: percentage,
    correctAnswers: correctCount,
    totalQuestions: total,
    domainStats,
    reviewItems,
    outlineVersion: QUESTION_BANK[0]?.outlineVersion || "PMI-ACP Examination Content Outline - October 2024"
  };

  const result = {
    correctCount,
    total,
    percentage,
    durationSeconds,
    reviewItems,
    domainStats,
    strongestDomain,
    weakestDomain,
    historyEntry
  };

  saveHistory(historyEntry);
  saveLastResult(result);
  clearExamSession();
  return result;
}

function validateQuestionBank(questions) {
  const validDomains = ["Mindset", "Leadership", "Product", "Delivery"];
  const issues = [];
  const ids = new Set();
  const texts = new Set();
  const counts = { easy: 0, medium: 0, hard: 0 };
  const domains = {};

  questions.forEach((question, index) => {
    if (ids.has(question.id)) issues.push(`Duplicate id found: ${question.id}`);
    ids.add(question.id);
    const normalizedText = String(question.question || "").trim().toLowerCase();
    if (texts.has(normalizedText)) issues.push(`Possible duplicate question text at id ${question.id}`);
    texts.add(normalizedText);
    if (!question.options || Object.keys(question.options).length !== 4) issues.push(`Question ${question.id} does not have exactly 4 options`);
    const answerList = Array.isArray(question.answer) ? question.answer : [question.answer];
    const optionKeys = Object.keys(question.options || {});
    const invalidAnswers = answerList.filter((key) => !optionKeys.includes(key));
    if (invalidAnswers.length > 0) issues.push(`Question ${question.id} has invalid answer keys: ${invalidAnswers.join(", ")}`);
    if (!["easy", "medium", "hard"].includes(question.difficulty)) issues.push(`Question ${question.id} has invalid difficulty`);
    else counts[question.difficulty] += 1;
    if (!validDomains.includes(question.domain)) issues.push(`Question ${question.id} has invalid domain`);
    domains[question.domain] = (domains[question.domain] || 0) + 1;
    if (!question.explanation || question.explanation.trim().length < 20) issues.push(`Question ${question.id} explanation is too short`);
    if (question.selectionType === "single" && answerList.length !== 1) issues.push(`Question ${question.id} selectionType is single but answer count is ${answerList.length}`);
    if (question.selectionType === "multiple" && answerList.length < 2) issues.push(`Question ${question.id} selectionType is multiple but answer count is ${answerList.length}`);
    if (index > 0 && question.id <= questions[index - 1].id) issues.push(`Question ids should be in ascending order near id ${question.id}`);
  });

  const total = questions.length || 1;
  return {
    issues,
    counts,
    ratios: {
      easy: Math.round((counts.easy / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      hard: Math.round((counts.hard / total) * 100)
    },
    domains,
    total,
    targetRatios: { easy: 20, medium: 30, hard: 50 }
  };
}

function summarizeDomains(reviewItems) {
  const domainMap = {};
  reviewItems.forEach((item) => {
    if (!domainMap[item.domain]) {
      domainMap[item.domain] = { correct: 0, total: 0 };
    }
    domainMap[item.domain].total += 1;
    if (item.correct) {
      domainMap[item.domain].correct += 1;
    }
  });

  return Object.entries(domainMap).map(([domain, stats]) => ({
    domain,
    score: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total
  }));
}

function summarizeHistoryDomains(history) {
  const domainMap = {};
  history.forEach((attempt) => {
    const sourceStats = (attempt.reviewItems && attempt.reviewItems.length)
      ? summarizeDomains(attempt.reviewItems)
      : (attempt.domainStats || []);
    sourceStats.forEach((stat) => {
      if (!domainMap[stat.domain]) {
        domainMap[stat.domain] = { totalScore: 0, attempts: 0 };
      }
      domainMap[stat.domain].totalScore += stat.score;
      domainMap[stat.domain].attempts += 1;
    });
  });

  return Object.entries(domainMap).map(([domain, stats]) => ({
    domain,
    score: Math.round(stats.totalScore / stats.attempts),
    correct: null,
    total: stats.attempts
  }));
}

function renderDomainBreakdown(domainStats) {
  if (!domainStats || domainStats.length === 0) {
    return `<p class="muted-text">No domain breakdown available yet.</p>`;
  }

  return `
    <div class="domain-list">
      ${domainStats
        .map(
          (stat) => `
            <div class="domain-row">
              <strong>${stat.domain}</strong>
              <span>${stat.score}%</span>
              <div class="domain-bar"><div class="domain-bar-fill" style="width:${stat.score}%"></div></div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderReviewList(target, reviewItems, emptyMessage = "No questions match the current filters.") {
  if (!reviewItems.length) {
    target.innerHTML = `<p class="muted-text">${emptyMessage}</p>`;
    return;
  }

  target.innerHTML = reviewItems
    .map((item) => {
      const optionsMarkup = Object.entries(item.options || {})
        .map(([key, value]) => {
          const selectedList = item.selected || [];
          const expectedList = item.expected || [];
          const isSelected = selectedList.includes(key);
          const isCorrect = expectedList.includes(key);
          const stateClass = isSelected && isCorrect
            ? "selected-correct"
            : isCorrect
              ? "correct-answer"
              : isSelected
                ? "selected-wrong"
                : "";
          const badges = [isSelected ? "Your choice" : "", isCorrect ? "Correct answer" : ""].filter(Boolean).join(" | ");

          return `
            <div class="review-option ${stateClass}">
              <strong>${key}.</strong> ${value}
              ${badges ? `<div class="muted-text">${badges}</div>` : ""}
            </div>
          `;
        })
        .join("");

      return `
        <article class="review-card ${item.correct ? "correct" : "incorrect"}">
          <p class="muted-text">Question ${item.questionNumber || "-"} | ${item.domain} | ${capitalize(item.difficulty)}</p>
          <h3>${item.question}</h3>
          <div class="question-options-review">${optionsMarkup}</div>
          <p class="answer-line"><strong>Explanation:</strong> ${item.explanation}</p>
        </article>
      `;
    })
    .join("");
}

function metricCard(label, value, extraClass = "") {
  return `<div class="metric-card ${extraClass}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div></div>`;
}

function miniStat(label, value, hint) {
  return `<div class="mini-stat"><strong>${value}</strong><div>${label}</div><div class="muted-text">${hint}</div></div>`;
}

function buildWeightedExam(questions, examCount) {
  const byDomain = questions.reduce((map, question) => {
    if (!map[question.domain]) {
      map[question.domain] = [];
    }
    map[question.domain].push(question);
    return map;
  }, {});

  Object.values(byDomain).forEach((items) => shuffle(items));
  const allocations = allocateByWeights(byDomain, examCount);
  const selected = [];

  Object.entries(allocations).forEach(([domain, count]) => {
    selected.push(...(byDomain[domain] || []).slice(0, count));
  });

  if (selected.length < examCount) {
    const selectedIds = new Set(selected.map((question) => question.id));
    selected.push(...shuffle(questions.filter((question) => !selectedIds.has(question.id))).slice(0, examCount - selected.length));
  }

  return shuffle(selected).slice(0, examCount);
}

function allocateByWeights(byDomain, examCount) {
  const base = [];
  let allocated = 0;

  Object.entries(DOMAIN_WEIGHTS).forEach(([domain, weight]) => {
    const exact = (examCount * weight) / 100;
    const count = Math.min(Math.floor(exact), (byDomain[domain] || []).length);
    base.push({ domain, count, remainder: exact - Math.floor(exact) });
    allocated += count;
  });

  while (allocated < examCount) {
    const candidate = base
      .filter((item) => item.count < (byDomain[item.domain] || []).length)
      .sort((left, right) => right.remainder - left.remainder)[0];
    if (!candidate) break;
    candidate.count += 1;
    candidate.remainder = 0;
    allocated += 1;
  }

  return Object.fromEntries(base.map((item) => [item.domain, item.count]));
}

function buildAttemptCsv(attempt) {
  const header = [
    "Attempt ID", "Mode", "Start", "End", "Difficulty", "Result", "Target Tag", "Exceeded Time Limit",
    "Score", "Question Number", "Domain", "Difficulty", "Question", "Selected Answer", "Correct Answer", "Correct", "Explanation"
  ];
  const rows = (attempt.reviewItems || []).map((item) => [
    attempt.id, attempt.mode || "exam", attempt.startDateTime, attempt.endDateTime, attempt.difficulty,
    attempt.result, attempt.targetTag, attempt.exceededTimeLimit ? "Yes" : "No", attempt.percentageScore,
    item.questionNumber, item.domain, item.difficulty, item.question,
    (item.selected || []).join(" | "), (item.expected || []).join(" | "), item.correct ? "Yes" : "No", item.explanation
  ]);
  return rowsToCsv([header, ...rows]);
}

function buildHistorySummaryCsv(history) {
  const header = ["Attempt ID", "Mode", "Start", "End", "Difficulty", "Result", "Target Tag", "Exceeded Time Limit", "Score", "Correct", "Total Questions", "Time Taken"];
  const rows = history.map((item) => [
    item.id, item.mode || "exam", item.startDateTime, item.endDateTime, item.difficulty, item.result,
    item.targetTag || getTargetTag(item.percentageScore), item.exceededTimeLimit ? "Yes" : "No",
    item.percentageScore, item.correctAnswers, item.totalQuestions, item.timeTakenSeconds
  ]);
  return rowsToCsv([header, ...rows]);
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeAnswer(answer) {
  return (Array.isArray(answer) ? answer : [answer]).slice().sort();
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString();
}

function capitalize(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDifficultyLabel(value) {
  if (value === "all") return "All difficulties";
  if (Array.isArray(value)) return value.map(capitalize).join(", ");
  if (String(value).includes(",")) return String(value).split(",").map((item) => capitalize(item.trim())).join(", ");
  return capitalize(value);
}

function formatModeLabel(value) {
  return value === "study" ? "Study mode" : "Exam mode";
}

function formatDifficultySelectionLabel(values) {
  return values.length === 3 ? "Easy, Medium, Hard" : values.map(capitalize).join(", ");
}

function getTargetTag(percentage) {
  if (percentage < 70) return "PMI-ACP - Below Target";
  if (percentage < 80) return "PMI-ACP - Meet Target";
  return "PMI-ACP - Above Target";
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
