# How To Run

This guide explains how to run the PMI-ACP Mock Exam web app locally and how to use the offline-ready build.

## Requirements

- A modern browser such as Chrome, Edge, Safari, or Firefox
- Node.js installed if you want to rebuild the dataset and packaged files
- Optional: VS Code with Live Server for easier local development

## Fast Start

1. Open the project folder in VS Code.
2. If you only want to use the app during development, open [index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/index.html) with Live Server.
3. If you want a packaged offline-ready copy, run:

```bash
node tools/build-assets.js
```

4. Open [dist/index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dist/index.html) in a browser.

## Development Mode

Use this when you want to edit code, styles, or the dataset.

1. Open the workspace in VS Code.
2. Start Live Server from [index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/index.html).
3. Make your changes.
4. If you changed dataset content or want to refresh generated output, run:

```bash
node tools/build-assets.js
```

## Offline Package Mode

Use this when you want a no-backend study copy.

1. Run:

```bash
node tools/build-assets.js
```

2. Open [dist/index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dist/index.html).
3. Use the app directly from the `dist` folder.

## Main Pages

- [index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/index.html): home page
- [exam.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/exam.html): exam workspace
- [result.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/result.html): latest result page
- [history.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/history.html): history and analytics
- [question-bank.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/question-bank.html): question browser and editor
- [dataset-tools.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dataset-tools.html): import and bulk-merge tools
- [ai-help.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/ai-help.html): AI maintenance guidance

## Common Tasks

### Rebuild the app package

```bash
node tools/build-assets.js
```

### Check JavaScript syntax

```bash
node --check core.js
node --check home.js
node --check exam.js
node --check result.js
node --check history.js
node --check bank.js
node --check dataset-tools.js
```

### Edit the dataset

1. Open [question-bank.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/question-bank.html) for in-browser editing.
2. Or edit [data/questions.json](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/data/questions.json) directly.
3. Re-run the build command afterward.

## Troubleshooting

- If the latest UI changes are not showing, rebuild and refresh the browser.
- If you are using the packaged version, confirm you opened [dist/index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dist/index.html), not the source file by mistake.
- If imported history or dataset files do not work, check that the JSON is valid and follows the expected structure.
