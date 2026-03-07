# Contract: Scan Orchestrator Agent

**Feature**: Book Shelf Scanner & Sorter | **Date**: 2026-03-07

## Role

The Scan Orchestrator coordinates the full scan pipeline: receives a captured image, delegates recognition to the Vision Agent, delegates classification to the Classifier Agent, and returns a consolidated `ScanResult` to the UI layer.

The orchestrator is **guidance**, not a rigid contract. It may adapt its coordination strategy based on what works best for the current task (Constitution Principle I).

## Transport

In-process TypeScript function call. No HTTP, no message queue.

## Inputs

```typescript
interface ScanRequest {
  sessionId: string;          // UUID v4 for the ScanSession being created
  imageBase64: string;        // JPEG, already downsampled to ≤1280×720 by the caller
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}
```

## Outputs

```typescript
interface ScanResult {
  sessionId: string;
  books: RecognizedBook[];    // All detected books, including unreadable ones
  durationMs: number;         // Total wall-clock time for the scan pipeline
}

interface RecognizedBook {
  tempId: string;             // Temporary ID for UI list key; replaced by Book.id on confirm
  title: string | null;       // null if spine could not be read
  author: string | null;      // null if not legible or not present
  readable: boolean;          // false → user sees manual-entry prompt
  genre: Genre | null;        // null if classification failed
  subCategory: SubCategory | null;
  classificationConfidence: 'high' | 'low' | null;
}
```

## Responsibilities

1. Call the Vision Agent with the image; receive `RecognizedBook[]` (titles + readability flags).
2. Fan out to the Classifier Agent concurrently across all readable books.
3. Merge classification results back into the `RecognizedBook` list.
4. Set `genre: null` and `subCategory: null` for books where `readable: false`.
5. Emit a structured log entry on entry, on vision completion, on classification completion, and on any failure.
6. Never drop unreadable books — they must appear in `ScanResult.books` with `readable: false`.

## Observability

Emits the following structured log entries (via `src/utils/logger.ts`):

```json
{ "timestamp": "...", "agent": "orchestrator", "inputSummary": "sessionId=..., imageSize=...", "outcome": "pipeline started" }
{ "timestamp": "...", "agent": "orchestrator", "inputSummary": "vision complete", "outcome": "N books recognized, M unreadable" }
{ "timestamp": "...", "agent": "orchestrator", "inputSummary": "classification complete", "outcome": "N books classified" }
{ "timestamp": "...", "agent": "orchestrator", "inputSummary": "pipeline error", "outcome": "ERROR: <message>" }
```

## Error Handling

- If the Vision Agent fails entirely → `ScanResult.books = []` with a logged error. The UI shows "no books recognized" with a retake option.
- If the Classifier Agent fails for a specific book → that book's `genre` and `subCategory` remain `null`; the book is still included.
- All errors are surfaced to the caller; none are swallowed silently (Constitution Principle II).
