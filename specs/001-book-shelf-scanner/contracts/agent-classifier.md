# Contract: Classifier Agent

**Feature**: Book Shelf Scanner & Sorter | **Date**: 2026-03-07

## Role

The Classifier Agent takes a recognized book (title + author) and assigns a Fiction/Non-Fiction genre and a sub-category tag from the fixed list defined in `src/types/index.ts`.

This is **guidance**. The agent may adapt its approach (Constitution Principle I).

## Model

`claude-haiku-4-5` — sufficient for structured text classification from a book title and author; sub-200ms response time; low cost at volume.

## Transport

In-process TypeScript function call. Invoked concurrently by the Orchestrator for each readable book.

## Inputs

```typescript
interface ClassificationRequest {
  tempId: string;        // From SpineReading.tempId — for log correlation
  title: string;         // Must be non-null (only readable books are classified)
  author: string | null;
}
```

## Outputs

```typescript
interface ClassificationResult {
  tempId: string;
  genre: Genre | 'uncategorized';
  subCategory: SubCategory | null;
  confidence: 'high' | 'low';    // low → user prompted to confirm
}
```

## Claude API Message Structure

```typescript
{
  model: 'claude-haiku-4-5',
  max_tokens: 256,
  tools: [ClassifyBookTool],
  tool_choice: { type: 'tool', name: 'classify_book' },
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Classify the following book:
Title: "${title}"
Author: "${author ?? 'Unknown'}"

Return:
- genre: "fiction" | "non-fiction" | "uncategorized"
- subCategory: one of the allowed sub-categories, or null if genre is uncategorized
- confidence: "high" if you are confident, "low" if the title is ambiguous

Allowed sub-categories:
Fiction: literary-fiction, science-fiction, mystery, romance, fantasy, thriller, historical-fiction, horror, short-stories, graphic-novel
Non-Fiction: self-help, biography, memoir, history, science, business, travel, cooking, philosophy, psychology, politics, true-crime`
        }
      ]
    }
  ]
}
```

## Tool Definition (classify_book)

```typescript
const ClassifyBookTool = {
  name: 'classify_book',
  description: 'Classify a book by genre and sub-category',
  input_schema: {
    type: 'object',
    properties: {
      genre: {
        type: 'string',
        enum: ['fiction', 'non-fiction', 'uncategorized']
      },
      subCategory: {
        type: ['string', 'null'],
        enum: [
          'literary-fiction', 'science-fiction', 'mystery', 'romance', 'fantasy',
          'thriller', 'historical-fiction', 'horror', 'short-stories', 'graphic-novel',
          'self-help', 'biography', 'memoir', 'history', 'science', 'business',
          'travel', 'cooking', 'philosophy', 'psychology', 'politics', 'true-crime',
          null
        ]
      },
      confidence: {
        type: 'string',
        enum: ['high', 'low']
      }
    },
    required: ['genre', 'subCategory', 'confidence']
  }
};
```

## Confidence Handling

- `confidence: "low"` → The UI displays the book as "Uncategorized" with a prompt asking the user to confirm or change the genre.
- `confidence: "high"` → Classification is applied immediately; the user can still override at any time (FR-008).

## Observability

```json
{ "timestamp": "...", "agent": "classifier-agent", "inputSummary": "tempId=..., title=...", "outcome": "genre=fiction, subCategory=science-fiction, confidence=high" }
{ "timestamp": "...", "agent": "classifier-agent", "inputSummary": "tempId=..., title=...", "outcome": "genre=uncategorized, confidence=low" }
{ "timestamp": "...", "agent": "classifier-agent", "inputSummary": "API error", "outcome": "ERROR: <message>" }
```

## Error Handling

- API error → return `{ genre: 'uncategorized', subCategory: null, confidence: 'low' }` with a log entry. Do not fail the entire scan — the book is still added with "Uncategorized" label (Constitution Principle II).
