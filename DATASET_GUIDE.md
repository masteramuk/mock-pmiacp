# PMI-ACP Dataset Guide

This project now uses a simple source-of-truth workflow:

1. Edit questions in [data/questions.json](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/data/questions.json)
2. Run `node tools/build-assets.js`
3. Open [index.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/index.html) for development
4. Use [dist/offline.html](/Users/nurulhaszeliahmad/Projects/web/mock-pmiacp/dist/offline.html) for the final single-file offline version

## Latest Outline

This project is now aligned to the latest official PMI-ACP outline published by PMI in the
**PMI-ACP Examination Content Outline - October 2024**.

Current official exam domains:

- `Mindset` - 28%
- `Leadership` - 25%
- `Product` - 19%
- `Delivery` - 28%

The older 7-domain PMI-ACP structure has been removed from this project because it no longer
matches the current official outline.

## Canonical Question Format

```json
{
  "id": 1,
  "question": "string",
  "options": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string"
  },
  "answer": "A",
  "explanation": "string",
  "domain": "Mindset",
  "difficulty": "medium",
  "selectionType": "single"
}
```

For multi-answer questions:

```json
{
  "answer": ["A", "C"],
  "selectionType": "multiple"
}
```

## Validation Rules

- IDs must be positive integers and remain in ascending order.
- Question text should be scenario-based, not just definitions.
- Options must be exactly `A` to `D`.
- `answer` must match valid option keys.
- `selectionType` must match the number of correct answers.
- Domain must be one of the four current PMI-ACP exam domains used in this project.
- Difficulty must be `easy`, `medium`, or `hard`.
- Explanation must be present and meaningful.
- Duplicate or near-duplicate question text should be avoided.

## Difficulty Mix

This project now standardizes on:

- `20% easy`
- `30% medium`
- `50% hard`

Your earlier notes included another ratio (`20/30/60`). Since the more detailed requirements later specified `20/30/50`, the validator and app now use `20/30/50` as the target.

## Quality Checklist

- Use real agile situations with competing priorities, trade-offs, risk, or stakeholder tension.
- Avoid memorization-only questions.
- Make distractors plausible.
- Keep one best answer for `single` questions.
- For `multiple` questions, only include clearly correct combinations.
- Explanations should teach why the best answer fits PMI-ACP thinking.

## Scaling to 1200 Questions

- Keep authoring in batches of 25 to 50 questions.
- Run validation after every batch.
- Review `dist/dataset-report.json` after each build.
- Keep IDs stable. Do not reuse deleted IDs.
- Keep domain coverage close to the latest PMI-ACP outline percentages.
