# PMI-ACP Mock Exam Web App

Offline-ready PMI-ACP mock exam web app built with pure HTML, CSS, and JavaScript.

This project is designed to help users study Agile and PMI-ACP style content through mock exams, review pages, attempt history, dataset tools, and question-bank management. It is aligned to the PMI-ACP Examination Content Outline published by PMI in October 2024, while clearly remaining an unofficial practice product.

## What It Includes

- Randomized mock exams
- Single-answer and multi-answer questions
- Explanations and answer review
- Local history with simple analysis
- Offline-ready multi-page build
- JSON dataset workflow
- In-browser question bank editor
- Dataset import tools for JSON, CSV, and pasted text
- Question bank duplicate checking
- Separate pages for home, exam, result, history, question bank, dataset tools, and AI guidance

## Quick Links

- [How To Run](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/HOWTORUN.md)
- [Disclaimer](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/DISCLAIMER.md)
- [Copyright and Rights](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/COPYRIGHTED.md)
- [Future Improvements](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/TODO.md)
- [Dataset Guide](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/DATASET_GUIDE.md)

## Project Structure

- [index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/index.html): home page
- [exam.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/exam.html): exam page
- [result.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/result.html): latest result page
- [history.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/history.html): history and analytics page
- [question-bank.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/question-bank.html): question bank browser and editor
- [dataset-tools.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dataset-tools.html): import and bulk-merge tools
- [ai-help.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/ai-help.html): AI prompt guidance
- [core.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/core.js): shared offline storage, exam, result, and history logic
- [home.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/home.js): home page logic
- [exam.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/exam.js): exam page logic
- [result.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/result.js): result page logic
- [history.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/history.js): history page logic
- [bank.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/bank.js): question bank browser/editor logic
- [dataset-tools.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dataset-tools.js): dataset import and merge logic
- [styles.css](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/styles.css): styling
- [data/questions.json](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/data/questions.json): source dataset
- [question-bank.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/question-bank.js): generated browser-ready dataset
- [tools/build-assets.js](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/tools/build-assets.js): validation and build script
- [dist](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dist): offline-ready packaged pages and scripts

## Main Pages

- `index.html`: start exam, open result/history/question bank/dataset tools
- `exam.html`: focused mock exam page with timer and navigation
- `result.html`: latest completed attempt result and answer review
- `history.html`: saved attempt analytics and question-by-question historical review
- `question-bank.html`: browse and edit questions in-browser
- `dataset-tools.html`: import JSON, CSV, and pasted text for bulk review and merge
- `ai-help.html`: prompt guidance for AI-assisted dataset maintenance

## Development Workflow

1. Edit the dataset in `data/questions.json`
2. Run:

```bash
node tools/build-assets.js
```

3. Open `index.html` with Live Server

Detailed local execution steps are available in [HOWTORUN.md](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/HOWTORUN.md).

## Offline Package

After running the build command, open `dist/index.html`.

The `dist` folder now contains the full offline-ready multi-page app:

- `index.html`
- `exam.html`
- `result.html`
- `history.html`
- `question-bank.html`
- `dataset-tools.html`
- `ai-help.html`
- shared CSS and JS assets

So it can run without `fetch` and without any backend.

## Important Notes

- This app and question bank are AI-generated study support material only.
- It is not an official PMI product and must not be treated as real exam content.
- Usage limitations, ownership, and rights expectations are described in [COPYRIGHTED.md](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/COPYRIGHTED.md).
- Study and legal-risk warnings are described in [DISCLAIMER.md](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/DISCLAIMER.md).

## Screenshot
- Home Screen <img width="1209" height="778" alt="Home" src="https://github.com/user-attachments/assets/b448d16d-5b12-499d-b0cd-7f143974bca7" />
- Exam Page <img width="1224" height="870" alt="ExamStart" src="https://github.com/user-attachments/assets/6ae58358-edf2-404b-8845-84401d9f8570" />
- Result Page after submit Finish <img width="1213" height="707" alt="ResultAfterExam" src="https://github.com/user-attachments/assets/d1666871-d2e6-44ba-9ff0-82b42f124b35" />
- Example Wrong Answer <img width="1145" height="586" alt="SampleWrongAnswer" src="https://github.com/user-attachments/assets/913f96aa-d1f9-4968-88d1-fbfab86c596d" />
- History Page <img width="1213" height="836" alt="HistoryPage" src="https://github.com/user-attachments/assets/11d97668-1fd6-49e2-9305-84893e26ac35" />
- History List <img width="1158" height="775" alt="History" src="https://github.com/user-attachments/assets/84f7e9ba-b7f3-49a2-80a9-7479246ca3a5" />
- Attempt Detail <img width="1205" height="805" alt="AttempDetail" src="https://github.com/user-attachments/assets/7711b357-0ece-4f7e-a437-ecbd735b2348" />





