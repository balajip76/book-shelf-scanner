# Contract: Vision Agent

**Feature**: Book Shelf Scanner & Sorter | **Date**: 2026-03-07

## Role

The Vision Agent processes a base64-encoded bookshelf photo and extracts a list of books visible in the image, returning title, author, and a readability flag for each detected spine.

This is **guidance**. The agent may choose a different extraction strategy if it determines a better approach (Constitution Principle I).

## Model

`claude-sonnet-4-6` — best balance of vision accuracy and cost for spine OCR tasks.

## Transport

In-process TypeScript function call.

## Inputs

```typescript
interface VisionRequest {
  imageBase64: string;         // JPEG, ≤1280×720 (downsampled by caller)
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  sessionId: string;
}
```

## Outputs

```typescript
interface VisionResult {
  books: SpineReading[];
  rawResponseId: string;       // Anthropic API response ID for logging
}

interface SpineReading {
  tempId: string;              // UUID assigned by the agent for this reading
  title: string | null;        // null if text is not legible
  author: string | null;       // null if not present or not legible
  readable: boolean;           // false if the spine could not be read at all
}
```

## Claude API Message Structure

```typescript
{
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools: [BookListTool],       // Structured output via tool use
  tool_choice: { type: 'tool', name: 'extract_books' },
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: '...', data: '...' }
        },
        {
          type: 'text',
          text: `You are scanning a bookshelf image. Extract every visible book spine, left to right.

For each spine:
- Return the title exactly as written (null if unreadable)
- Return the author exactly as written (null if not present or unreadable)
- Set readable: false if you cannot determine the title at all

Rules:
- Never guess or fabricate title or author
- Use null, not empty string, for missing values
- Include ALL spines, even partially visible ones — set readable: false rather than omitting`
        }
      ]
    }
  ]
}
```

## Tool Definition (extract_books)

```typescript
const BookListTool = {
  name: 'extract_books',
  description: 'Return all book spines visible in the image',
  input_schema: {
    type: 'object',
    properties: {
      books: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title:    { type: ['string', 'null'] },
            author:   { type: ['string', 'null'] },
            readable: { type: 'boolean' }
          },
          required: ['title', 'author', 'readable']
        }
      }
    },
    required: ['books']
  }
};
```

## Observability

```json
{ "timestamp": "...", "agent": "vision-agent", "inputSummary": "sessionId=..., imageMediaType=image/jpeg", "outcome": "N spines detected, M unreadable" }
{ "timestamp": "...", "agent": "vision-agent", "inputSummary": "API error", "outcome": "ERROR: <message>" }
```

## Error Handling

- API error or timeout → throw with a structured log entry; orchestrator handles.
- Empty image or completely unrecognizable photo → return `books: []`; orchestrator surfaces "no books found" to the user.
