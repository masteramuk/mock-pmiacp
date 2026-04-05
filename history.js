const historyElements = {
  historyDomainAnalysis: document.getElementById("history-domain-analysis"),
  historyAnalysis: document.getElementById("history-analysis"),
  historyList: document.getElementById("history-list"),
  historySearchInput: document.getElementById("history-search-input"),
  historyDifficultyFilter: document.getElementById("history-difficulty-filter"),
  historyResultFilter: document.getElementById("history-result-filter"),
  downloadHistoryBtn: document.getElementById("download-history-btn"),
  downloadHistoryCsvBtn: document.getElementById("download-history-csv-btn"),
  importHistoryInput: document.getElementById("import-history-input"),
  printHistoryBtn: document.getElementById("print-history-btn"),
  historyDetailCard: document.getElementById("history-detail-card"),
  closeHistoryDetailBtn: document.getElementById("close-history-detail-btn"),
  historyDetailDomainBreakdown: document.getElementById("history-detail-domain-breakdown"),
  historyDetailSummary: document.getElementById("history-detail-summary"),
  historyDetailAnalysis: document.getElementById("history-detail-analysis"),
  historyDetailReview: document.getElementById("history-detail-review"),
  detailSearchInput: document.getElementById("detail-search-input"),
  detailDomainFilter: document.getElementById("detail-domain-filter"),
  detailMissedOnlyCheckbox: document.getElementById("detail-missed-only-checkbox"),
  downloadSelectedAttemptBtn: document.getElementById("download-selected-attempt-btn"),
  downloadSelectedAttemptCsvBtn: document.getElementById("download-selected-attempt-csv-btn"),
  printSelectedAttemptBtn: document.getElementById("print-selected-attempt-btn"),
  bookmarkList: document.getElementById("bookmark-list")
};

const historyState = {
  selectedAttemptId: null
};

initHistoryPage();

function initHistoryPage() {
  migrateLegacyHistory();
  bindHistoryEvents();
  renderHistoryPage();
  renderBookmarks();
}

function bindHistoryEvents() {
  [historyElements.historySearchInput, historyElements.historyDifficultyFilter, historyElements.historyResultFilter].forEach((input) => {
    input.addEventListener("input", renderHistoryPage);
  });
  [historyElements.detailSearchInput, historyElements.detailDomainFilter, historyElements.detailMissedOnlyCheckbox].forEach((input) => {
    input.addEventListener("input", renderHistoryDetail);
  });
  historyElements.closeHistoryDetailBtn.addEventListener("click", hideHistoryDetail);
  historyElements.downloadHistoryBtn.addEventListener("click", () => {
    downloadTextFile("pmi-acp-history.json", JSON.stringify(getHistory(), null, 2), "application/json");
  });
  historyElements.downloadHistoryCsvBtn.addEventListener("click", () => {
    downloadTextFile("pmi-acp-history.csv", buildHistorySummaryCsv(getHistory()), "text/csv;charset=utf-8");
  });
  historyElements.printHistoryBtn.addEventListener("click", () => window.print());
  historyElements.importHistoryInput.addEventListener("change", importHistoryBackup);
  historyElements.downloadSelectedAttemptBtn.addEventListener("click", () => {
    const attempt = getSelectedAttempt();
    if (attempt) {
      downloadTextFile(`pmi-acp-attempt-${attempt.id}.json`, JSON.stringify(attempt, null, 2), "application/json");
    }
  });
  historyElements.downloadSelectedAttemptCsvBtn.addEventListener("click", () => {
    const attempt = getSelectedAttempt();
    if (attempt) {
      downloadTextFile(`pmi-acp-attempt-${attempt.id}.csv`, buildAttemptCsv(attempt), "text/csv;charset=utf-8");
    }
  });
  historyElements.printSelectedAttemptBtn.addEventListener("click", () => {
    if (getSelectedAttempt()) {
      window.print();
    }
  });
}

function renderHistoryPage() {
  const history = getHistory();
  const filteredHistory = filterHistory(history);

  if (!history.length) {
    historyElements.historyDomainAnalysis.innerHTML = `<strong>Performance by domain</strong><br><span class="muted-text">Domain trends will appear after your first completed attempt.</span>`;
    historyElements.historyAnalysis.innerHTML = `<strong>No history yet</strong><br>Complete a mock exam to start building your saved history.`;
    historyElements.historyList.innerHTML = "";
    hideHistoryDetail();
    return;
  }

  const averageScore = Math.round(history.reduce((sum, item) => sum + item.percentageScore, 0) / history.length);
  const bestScore = Math.max(...history.map((item) => item.percentageScore));
  const passCount = history.filter((item) => item.result === "Pass").length;
  const aggregateDomainStats = summarizeHistoryDomains(history);
  const totalStoredReviews = history.reduce((sum, item) => sum + (item.reviewItems || []).length, 0);
  const latestAttempt = history[0];

  historyElements.historyDomainAnalysis.innerHTML = `
    <strong>Performance by domain</strong>
    ${renderDomainBreakdown(aggregateDomainStats)}
  `;

  historyElements.historyAnalysis.innerHTML = `
    <div class="result-grid compact-metrics-grid">
      ${metricCard("Total Attempts", String(history.length), "compact")}
      ${metricCard("Showing", String(filteredHistory.length), "compact")}
      ${metricCard("Average Score", `${averageScore}%`, "compact")}
      ${metricCard("Best Score", `${bestScore}%`, "compact")}
      ${metricCard("Pass Rate", `${Math.round((passCount / history.length) * 100)}%`, "compact")}
      ${metricCard("Stored Answers", String(totalStoredReviews), "compact")}
      ${metricCard("Last Taken", formatDateTime(latestAttempt.endDateTime || latestAttempt.startDateTime), "compact compact-date")}
      ${metricCard("Last Result", `${latestAttempt.result} | ${latestAttempt.percentageScore}%`, "compact compact-result")}
    </div>
  `;

  if (!filteredHistory.length) {
    historyElements.historyList.innerHTML = `<p class="muted-text">No history entries match the current filters.</p>`;
    hideHistoryDetail();
    return;
  }

  historyElements.historyList.innerHTML = filteredHistory.map((item) => `
    <article class="history-card ${historyState.selectedAttemptId === item.id ? "history-card-active" : ""}">
      <div class="history-card-top">
        <h3>${item.result} - ${item.percentageScore}%</h3>
        <span class="tag">${item.targetTag || getTargetTag(item.percentageScore)}</span>
      </div>
      <div class="history-meta-grid">
        <div><strong>Start</strong><span>${formatDateTime(item.startDateTime)}</span></div>
        <div><strong>End</strong><span>${formatDateTime(item.endDateTime)}</span></div>
        <div><strong>Time</strong><span>${formatDuration(item.timeTakenSeconds)}</span></div>
        <div><strong>Difficulty</strong><span>${formatDifficultyLabel(item.difficulty)}</span></div>
        <div><strong>Mode</strong><span>${formatModeLabel(item.mode || "exam")}</span></div>
        <div><strong>Correct</strong><span>${item.correctAnswers} / ${item.totalQuestions}</span></div>
      </div>
      <div class="history-card-actions">
        <button class="primary-btn" type="button" data-action="open" data-id="${item.id}" title="Open answer detail for this attempt">Show Detail</button>
        <button class="secondary-btn" type="button" data-action="json" data-id="${item.id}" title="Download this attempt as JSON">JSON</button>
        <button class="secondary-btn" type="button" data-action="csv" data-id="${item.id}" title="Download this attempt as CSV">CSV</button>
      </div>
    </article>
  `).join("");

  historyElements.historyList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const attempt = history.find((item) => item.id === button.dataset.id);
      if (!attempt) return;
      if (button.dataset.action === "open") {
        historyState.selectedAttemptId = attempt.id;
        resetDetailFilters();
        renderHistoryPage();
        renderHistoryDetail();
      }
      if (button.dataset.action === "json") {
        downloadTextFile(`pmi-acp-attempt-${attempt.id}.json`, JSON.stringify(attempt, null, 2), "application/json");
      }
      if (button.dataset.action === "csv") {
        downloadTextFile(`pmi-acp-attempt-${attempt.id}.csv`, buildAttemptCsv(attempt), "text/csv;charset=utf-8");
      }
    });
  });

  if (!historyState.selectedAttemptId || !filteredHistory.some((item) => item.id === historyState.selectedAttemptId)) {
    hideHistoryDetail();
    return;
  }

  renderHistoryDetail();
}

function filterHistory(history) {
  const search = historyElements.historySearchInput.value.trim().toLowerCase();
  const difficulty = historyElements.historyDifficultyFilter.value;
  const result = historyElements.historyResultFilter.value;

  return history.filter((item) => {
    const searchHaystack = [
      formatDateTime(item.startDateTime), formatDateTime(item.endDateTime), item.result, item.difficulty, item.mode || "exam", `${item.percentageScore}%`
    ].join(" ").toLowerCase();
    const matchesSearch = !search || searchHaystack.includes(search);
    const matchesDifficulty = difficulty === "all" || String(item.difficulty).includes(difficulty);
    const matchesResult = result === "all" || item.result === result;
    return matchesSearch && matchesDifficulty && matchesResult;
  });
}

function renderHistoryDetail() {
  const attempt = getSelectedAttempt();
  if (!attempt) {
    hideHistoryDetail();
    return;
  }

  const allReviewItems = attempt.reviewItems || [];
  const filteredReviewItems = filterReviewItems(allReviewItems);
  const domainBaseItems = historyElements.detailDomainFilter.value === "all" && !historyElements.detailSearchInput.value.trim() && !historyElements.detailMissedOnlyCheckbox.checked
    ? allReviewItems
    : filteredReviewItems;
  const domainStats = domainBaseItems.length ? summarizeDomains(domainBaseItems) : (attempt.domainStats || []);
  const strongestDomain = [...domainStats].sort((a, b) => b.score - a.score)[0];
  const weakestDomain = [...domainStats].sort((a, b) => a.score - b.score)[0];

  historyElements.historyDetailCard.classList.remove("hidden");
  historyElements.historyDetailDomainBreakdown.innerHTML = `
    <strong>Domain breakdown</strong>
    ${renderDomainBreakdown(domainStats)}
  `;
  historyElements.historyDetailSummary.innerHTML = `
    ${metricCard("Score", `${attempt.percentageScore}%`, "compact")}
    ${metricCard("Result", attempt.result, "compact")}
    ${metricCard("Target", attempt.targetTag || getTargetTag(attempt.percentageScore), "compact compact-result")}
    ${metricCard("Correct", `${attempt.correctAnswers} / ${attempt.totalQuestions}`, "compact")}
    ${metricCard("Time", formatDuration(attempt.timeTakenSeconds), "compact")}
  `;
  historyElements.historyDetailAnalysis.innerHTML = `
    <strong>Attempt detail</strong><br>
    Mode: ${formatModeLabel(attempt.mode || "exam")}<br>
    Start: ${formatDateTime(attempt.startDateTime)}<br>
    End: ${formatDateTime(attempt.endDateTime)}<br>
    Difficulty: ${formatDifficultyLabel(attempt.difficulty)}<br>
    Time status: ${attempt.exceededTimeLimit ? "Exceeded time limit" : "Within time limit"}<br>
    Strongest domain: ${strongestDomain ? `${strongestDomain.domain} (${strongestDomain.score}%)` : "N/A"}<br>
    Weakest domain: ${weakestDomain ? `${weakestDomain.domain} (${weakestDomain.score}%)` : "N/A"}
  `;

  renderReviewList(
    historyElements.historyDetailReview,
    filteredReviewItems,
    allReviewItems.length
      ? "No questions match the current filters."
      : "This older attempt does not contain stored question-by-question review data."
  );
  historyElements.historyDetailCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function filterReviewItems(reviewItems) {
  const search = historyElements.detailSearchInput.value.trim().toLowerCase();
  const domain = historyElements.detailDomainFilter.value;
  const missedOnly = historyElements.detailMissedOnlyCheckbox.checked;
  return reviewItems.filter((item) => {
    const haystack = `${item.question} ${item.explanation} ${item.domain}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesDomain = domain === "all" || item.domain === domain;
    const matchesMissed = !missedOnly || !item.correct;
    return matchesSearch && matchesDomain && matchesMissed;
  });
}

function resetDetailFilters() {
  historyElements.detailSearchInput.value = "";
  historyElements.detailDomainFilter.value = "all";
  historyElements.detailMissedOnlyCheckbox.checked = false;
}

function hideHistoryDetail() {
  historyState.selectedAttemptId = null;
  historyElements.historyDetailCard.classList.add("hidden");
  historyElements.historyDetailDomainBreakdown.innerHTML = "";
  historyElements.historyDetailSummary.innerHTML = "";
  historyElements.historyDetailAnalysis.innerHTML = "";
  historyElements.historyDetailReview.innerHTML = "";
}

function getSelectedAttempt() {
  return getHistory().find((item) => item.id === historyState.selectedAttemptId) || null;
}

function importHistoryBackup(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!Array.isArray(imported)) {
        window.alert("History backup must be a JSON array.");
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      renderHistoryPage();
      renderBookmarks();
      window.alert("History backup imported successfully.");
    } catch (_error) {
      window.alert("Unable to import history backup.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function renderBookmarks() {
  const bookmarks = getBookmarks();
  if (!bookmarks.length) {
    historyElements.bookmarkList.innerHTML = `<p class="muted-text">No bookmarked questions yet.</p>`;
    return;
  }
  historyElements.bookmarkList.innerHTML = bookmarks.map((item) => `
    <article class="review-card">
      <p class="muted-text">${item.domain} | ${capitalize(item.difficulty)}</p>
      <h3>${item.question}</h3>
      <p class="answer-line"><strong>Explanation:</strong> ${item.explanation}</p>
      <button class="secondary-btn bookmark-btn" type="button" data-bookmark-remove="${item.id}" title="Remove this bookmark">Remove Bookmark</button>
    </article>
  `).join("");
  historyElements.bookmarkList.querySelectorAll("[data-bookmark-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = QUESTION_BANK.find((item) => item.id === Number(button.dataset.bookmarkRemove));
      if (question) {
        toggleBookmark(question);
        renderBookmarks();
      }
    });
  });
}
