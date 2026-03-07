# Phase 0 Research: Book Shelf Scanner & Sorter

**Branch**: `001-book-shelf-scanner` | **Date**: 2026-03-07

## 1. Claude Vision Model Selection

**Decision**: Use **claude-sonnet-4-6** for the Vision Agent (OCR) and **claude-haiku-4-5** for the Classifier Agent.

**Rationale**:
- Sonnet 4.6 provides the best balance of vision accuracy, latency, and cost for book-spine text extraction. Comparable vision capability to Opus 4.6 for OCR-style tasks at ~5x lower cost.
- Haiku 4.5 is sufficient for genre classification (structured reasoning from a title + author string, no image involved). Sub-200ms response time; ultra-low cost at high volume.
- Opus 4.6 is overkill for pure OCR and adds unnecessary latency for a mobile UX. Ruled out.

**Alternatives considered**:
- Opus 4.6 — superior reasoning but 5x cost of Sonnet, not justified for spine OCR.
- Haiku 4.5 for vision — cost-effective but may struggle with angled spines or small fonts. Sonnet used for vision reliability.

## 2. Image Passing to Claude API

**Decision**: Pass a base64-encoded JPEG image in the `image` content block of the Claude message.

**Rationale**: Base64 is the simplest browser-native approach with no server upload step. URL-based images would require a hosting URL, which adds complexity and defeats the no-backend requirement.

**Message structure**:
```json
{
  "role": "user",
  "content": [
    {
      "type": "image",
      "source": {
        "type": "base64",
        "media_type": "image/jpeg",
        "data": "<base64_string>"
      }
    },
    {
      "type": "text",
      "text": "..."
    }
  ]
}
```

**Image pre-processing**: Downsample to ≤1280×720 on the client before encoding. This reduces token cost from ~$0.03/image (4K) to ~$0.004/image (720p) — a 10–15x reduction with negligible quality loss for spine text.

## 3. Book Recognition Prompt Strategy

**Decision**: Use structured output via tool use (Zod schema) to guarantee parseable results. Prompt instructs Claude to return `null` for unreadable fields, never guess.

**Rationale**: Tool use with a defined schema eliminates brittle JSON-parsing logic and enforces the data contract between the Vision Agent and the rest of the app.

**Key prompt directives**:
- Return `null` for `title` or `author` when text is not legible (never fabricate)
- Include a `readable: boolean` flag per book
- Flag books as `readable: false` rather than omitting them (FR-004: never silently drop)
- Process all visible spines left-to-right

**Alternatives considered**:
- Free-form JSON in the text response — rejected due to parsing fragility and hallucination risk.
- Separate image preprocessing step — rejected as unnecessary complexity (Principle V).

## 4. Camera Access Strategy

**Decision**: Primary: `MediaDevices.getUserMedia()` with device enumeration via `enumerateDevices()`. Fallback: `<input type="file" accept="image/*" capture="environment">`.

**Rationale**:
- `facingMode: { exact: "environment" }` is unreliable on iOS Safari (ignored despite `getSupportedConstraints()` reporting support). Device enumeration + `deviceId` constraint is the only reliably cross-platform approach for rear camera selection.
- File input fallback handles iOS Safari edge cases, permission denials, and older browsers. No live viewfinder but simpler and universal.

**iOS Safari requirements**:
- Must use HTTPS.
- `<video>` element requires `autoplay`, `muted`, and `playsinline` attributes.
- iOS 16.3+ for reliable back-camera enumeration.

**Alternatives considered**:
- `facingMode: "environment"` only — rejected; unreliable on iOS Safari.
- File input only — rejected; no live viewfinder (poor UX for SC-001).

## 5. Local Storage Strategy

**Decision**: **IndexedDB via Dexie.js 4.x**.

**Rationale**:
- `localStorage` has a hard 10 MiB limit per origin; IndexedDB uses up to 60–80% of available disk space (no practical limit for a 500-book collection).
- `localStorage` is synchronous and blocks the main thread; IndexedDB is async and non-blocking.
- Dexie.js provides a clean TypeScript API, `useLiveQuery` React hook for reactive UI updates (SC-007: edits reflected within 1s), and active maintenance.
- StorageManager API (`navigator.storage.estimate()`) provides quota monitoring for the 80% warning (FR edge case).

**Schema**: Two tables — `books` (indexed on `disposition`, `genre`, `subCategory`, `completedAt`) and `scanSessions`.

**Alternatives considered**:
- `localStorage` — rejected; synchronous, 10 MiB cap, no indexing for filters.
- Raw IndexedDB — rejected; verbose API, no React integration, more boilerplate.

## 6. React Framework & Tooling

**Decision**: Vite 6 + React 19 + TypeScript 5.x.

**Rationale**: Vite starts in <2s vs CRA's 20-30s. 27% smaller bundles than CRA (Rollup-based tree-shaking). CRA is no longer maintained. `vite-plugin-pwa` enables offline capability.

## 7. UI Framework & Gesture Library

**Decision**: **shadcn/ui** components on **Tailwind CSS v4** + **Motion for React 12.x** for swipe gestures.

**Rationale**:
- shadcn/ui + Tailwind v4 gives complete color control for the cool-tone palette (blues, teals, deep purples, charcoals) with zero runtime overhead. Components are copy-pasted, not a package lock-in.
- Motion for React (successor to Framer Motion) provides native-feeling swipe card gestures in one library (animations + gestures combined). Simpler than `@use-gesture/react + react-spring`.

**Tailwind v4 notes**: Requires Safari 16.4+, Chrome 111+ (matches target platform). JS config replaced by CSS `@theme` directives.

**Alternatives considered**:
- Mantine — full-featured but heavier; more than needed for this app.
- Chakra UI — good DX but adds runtime CSS-in-JS overhead.
- `@use-gesture/react + react-spring` — more modular but two libraries vs one.

## 8. Testing Strategy

**Decision**: **Vitest 3.x** (unit + integration) + **Playwright 1.x** (E2E, mobile viewport).

**Rationale**:
- Vitest is deeply integrated with Vite; zero config, 4–20x faster than Jest, native ESM/TypeScript.
- Playwright has native mobile device emulation (viewport, user-agent, touch events) and superior debugging (trace viewer, video). Cypress requires plugins for mobile emulation.

## 9. CSV Export

**Decision**: Blob API with a plain TypeScript utility — no library.

**Rationale**: 500 books is a small dataset. A custom `csv-export.ts` utility using `new Blob([csvString], { type: 'text/csv' })` + a temporary anchor element is ~15 lines, has zero bundle impact, and requires no dependency. `react-csv` adds 25 kB for functionality we can write in minutes.

## 10. Multi-Agent Orchestration Pattern

**Decision**: In-process TypeScript function calls (no HTTP, no message queue).

**Rationale**: The agent team runs entirely in the browser (no backend). All agents are TypeScript modules called synchronously/asynchronously within the same process. This is the simplest transport option (Constitution Principle V) and satisfies the transport flexibility guideline. The choice is documented here per the Agent Collaboration Guidelines.

**Pattern**: Orchestrator calls Vision Agent → receives `RecognizedBook[]` → fans out to Classifier Agent concurrently (one classification call per book or batched) → aggregates results into `ScanResult`.
