const resultElements = {
  resultSummary: document.getElementById("result-summary"),
  resultAnalysis: document.getElementById("result-analysis"),
  resultDomainBreakdown: document.getElementById("result-domain-breakdown"),
  reviewList: document.getElementById("review-list"),
  downloadResultBtn: document.getElementById("download-result-btn"),
  downloadResultCsvBtn: document.getElementById("download-result-csv-btn"),
  printResultBtn: document.getElementById("print-result-btn")
};

initResultPage();

function initResultPage() {
  const result = getLastResult();
  if (!result) {
    resultElements.resultSummary.innerHTML = `<p class="muted-text">No completed result is available yet. Start an exam first.</p>`;
    return;
  }

  resultElements.resultSummary.innerHTML = `
    ${metricCard("Score", `${result.percentage}%`, "compact")}
    ${metricCard("Result", result.historyEntry.result, "compact")}
    ${metricCard("Target", result.historyEntry.targetTag, "compact compact-result")}
    ${metricCard("Correct", `${result.correctCount} / ${result.total}`, "compact")}
    ${metricCard("Time", formatDuration(result.durationSeconds), "compact")}
  `;

  resultElements.resultDomainBreakdown.innerHTML = `
    <strong>Performance by domain</strong>
    ${renderDomainBreakdown(result.domainStats)}
  `;

  resultElements.resultAnalysis.innerHTML = `
    <strong>Attempt analysis</strong><br>
    Mode: ${formatModeLabel(result.historyEntry.mode || "exam")}<br>
    Time status: ${result.historyEntry.exceededTimeLimit ? "Exceeded time limit" : "Within time limit"}<br>
    Started: ${formatDateTime(result.historyEntry.startDateTime)}<br>
    Finished: ${formatDateTime(result.historyEntry.endDateTime)}<br>
    Strongest domain: ${result.strongestDomain ? `${result.strongestDomain.domain} (${result.strongestDomain.score}%)` : "N/A"}<br>
    Weakest domain: ${result.weakestDomain ? `${result.weakestDomain.domain} (${result.weakestDomain.score}%)` : "N/A"}
  `;

  renderReviewList(resultElements.reviewList, result.historyEntry.reviewItems, "No review items are available for this attempt.");

  resultElements.downloadResultBtn.addEventListener("click", () => {
    downloadTextFile(`pmi-acp-attempt-${result.historyEntry.id}.json`, JSON.stringify(result.historyEntry, null, 2), "application/json");
  });
  resultElements.downloadResultCsvBtn.addEventListener("click", () => {
    downloadTextFile(`pmi-acp-attempt-${result.historyEntry.id}.csv`, buildAttemptCsv(result.historyEntry), "text/csv;charset=utf-8");
  });
  resultElements.printResultBtn.addEventListener("click", () => window.print());
}
