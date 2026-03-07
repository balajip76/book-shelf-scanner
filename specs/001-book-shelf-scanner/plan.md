# Implementation Plan: Book Shelf Scanner & Sorter

**Branch**: `001-book-shelf-scanner` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-book-shelf-scanner/spec.md`

## Summary

A mobile-first PWA that uses the device camera to photograph a bookshelf, sends the image to a Claude agent team for book recognition and genre classification, and stores the resulting collection in IndexedDB (via Dexie.js) for offline-capable, no-backend local use. Users sort books into Keep / Give Away / Throw Away piles, edit metadata inline, mark physical actions as complete, and export their collection as CSV.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 19, Vite 6, shadcn/ui + Tailwind CSS v4, Dexie.js 4.x, @anthropic-ai/sdk (latest), Motion for React 12.x, vite-plugin-pwa
**Storage**: IndexedDB via Dexie.js (browser-local, no external database)
**Testing**: Vitest 3.x (unit + integration), Playwright 1.x (E2E, mobile viewport)
**Target Platform**: Mobile browser — iOS Safari 16.4+, Android Chrome 111+
**Project Type**: Mobile-first web app (single Vite SPA, PWA)
**Performance Goals**: ≤15s scan-to-recognized-list (SC-001), ≤3s app load on 4G (SC-005), ≤1s edit-to-reflected (SC-007)
**Deployment**: Vercel (public URL) — Anthropic API key stored in Vercel env vars; frontend proxies Claude calls via a Vercel serverless function (`/api/scan`)
**CI/CD**: GitHub Actions → Vercel deploy on push to `main`; GitHub repository public at `github.com/balajip76/book-shelf-scanner`
**Constraints**: Offline-capable UI (scan requires network for `/api/scan` proxy), browser-only storage, ≤5MB initial JS bundle
**Scale/Scope**: Single-user local app; ~500-book collection; no auth, no cloud sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
| --- | --- | --- |
| I. Agent Autonomy & Full Capability | ✅ PASS | Agent team uses lightweight in-process orchestration. No rigid roles or communication contracts enforced at the architectural level. Structured guidance lives in the feature spec as advisory, not a permanent constraint. Agents choose their own approach. |
| II. Data Integrity | ✅ PASS | Unreadable book spines are surfaced as inline manual-entry prompts (FR-004); never silently dropped. Agents return `null` for fields they cannot determine; never fabricate values. Duplicates are flagged to the user, not auto-merged. |
| III. Test-First (NON-NEGOTIABLE) | ✅ PASS | Vitest + Playwright tests must be written and confirmed to fail before any implementation code. Acceptance scenarios from the spec drive test definitions for all agent behavior. |
| IV. Observability | ✅ PASS | Every recognition, classification, and failure decision emits a structured log entry: `{ timestamp: ISO-8601, agent: string, inputSummary: string, outcome: string }`. All agent decision points are covered (see `src/utils/logger.ts`). |
| V. Simplicity | ✅ PASS | Single Vite SPA, Dexie.js for storage, in-process TypeScript agent calls. No message queue, no microservices, no additional abstraction layers. The simplest approach satisfying all FRs. |

**Quality Gates (must pass before merge)**:
1. All Vitest + Playwright tests green.
2. Structured logs emitted at every agent decision point (recognition, classification, failure handling).
3. All tools exposed to the agent team have accurate descriptions tested against acceptance scenarios.
4. Complexity Tracking table filled for any constitution exception.
5. No `NEEDS CLARIFICATION` markers remain in `spec.md`.

**Post-Phase-1 re-check**: ✅ PASS — data-model, contracts, and quickstart introduce no new violations.

## Agent Team Architecture

The agent team uses lightweight, in-process orchestration. Three roles provide guidance; agents may deviate where the task warrants it (Constitution Principle I).

```
┌──────────────────────────────────────────────────────┐
│               Scan Orchestrator Agent                │
│  Receives: base64 image + session id                 │
│  Emits: ScanResult { books: RecognizedBook[] }       │
│                                                      │
│   ┌─────────────────────┐  ┌──────────────────────┐ │
│   │    Vision Agent     │  │  Classifier Agent    │ │
│   │  Model: Sonnet 4.6  │  │  Model: Haiku 4.5    │ │
│   │  Task: OCR spines   │  │  Task: Fiction/NF +  │ │
│   │  → title, author,   │  │  sub-category tags   │ │
│   │    readability flag │  │  per recognized book │ │
│   └─────────────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

- **Transport**: In-process TypeScript function calls (no HTTP, no message queue — simplest option per Principle V).
- **Parallelism**: Classifier runs concurrently on books returned by Vision agent as a batch.
- **Image pre-processing**: Images are downsampled to ≤1280×720 on the client before sending to reduce token cost (~$0.004/image vs ~$0.03/image for 4K).
- **Logging**: Every agent decision emits a structured log entry (Principle IV).
- **Failure handling**: Unreadable spines → `{ title: null, author: null, readable: false }` → surfaced as manual-entry prompt. Low-confidence classifications → `"Uncategorized"` with user prompt.

## Project Structure

### Documentation (this feature)

```text
specs/001-book-shelf-scanner/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
│   ├── agent-orchestrator.md
│   ├── agent-vision.md
│   └── agent-classifier.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── agents/
│   ├── orchestrator.ts      # Coordinates Vision → Classifier pipeline
│   ├── vision-agent.ts      # Claude Sonnet 4.6 — OCR book spines
│   └── classifier-agent.ts  # Claude Haiku 4.5 — Fiction/NF + sub-category
├── components/
│   ├── camera/
│   │   ├── CameraViewfinder.tsx    # getUserMedia live preview + file-input fallback
│   │   └── CaptureButton.tsx
│   ├── scan-review/
│   │   ├── ScanResultList.tsx      # Post-scan list with inline edit
│   │   └── UnreadableBookPrompt.tsx
│   ├── collection/
│   │   ├── CollectionView.tsx      # Main collection management screen
│   │   ├── BookCard.tsx            # Swipeable card with disposition assignment
│   │   ├── BookEditModal.tsx       # Inline edit for all book attributes
│   │   ├── FilterBar.tsx           # Disposition + genre/sub-category filters
│   │   └── ExportButton.tsx
│   └── ui/                         # shadcn/ui auto-generated components
├── db/
│   └── index.ts                    # Dexie schema — books + scanSessions tables
├── hooks/
│   ├── useCamera.ts                # getUserMedia + enumerateDevices + fallback logic
│   ├── useCollection.ts            # Dexie useLiveQuery wrappers for CRUD + filters
│   └── useStorageQuota.ts          # StorageManager.estimate() — 80% warning
├── pages/
│   ├── ScanPage.tsx                # Camera viewfinder + capture
│   ├── ReviewPage.tsx              # Post-scan review + confirm
│   └── CollectionPage.tsx          # Collection management
├── types/
│   └── index.ts                    # Book, ScanSession, Disposition, Genre, SubCategory
├── utils/
│   ├── csv-export.ts               # Blob API CSV export (no library)
│   ├── image.ts                    # Downsample to ≤1280×720 before API call
│   └── logger.ts                   # Structured agent decision logger
└── main.tsx

api/
└── scan.ts                         # Vercel serverless function — proxies Claude API calls

tests/
├── unit/                           # Vitest — db, hooks, utils, agent logic
├── integration/                    # Vitest — agent pipeline (mocked /api/scan)
└── e2e/                            # Playwright — full flows on mobile viewport

vercel.json                         # Vercel project config (rewrites, env var references)
.github/
└── workflows/
    └── deploy.yml                  # CI: lint + test on PR; auto-deploy to Vercel on main
```

**Structure Decision**: Single Vite SPA at the repository root. Claude API calls are proxied through a Vercel serverless function (`api/scan.ts`) so the Anthropic API key never ships to the browser — required for public Vercel deployment. The `api/` directory is Vercel's convention for serverless functions and adds minimal complexity (Constitution Principle V — justified by the security requirement of public deployment).

## Deployment Architecture

### Vercel Serverless Proxy

Because the app is deployed publicly on Vercel, the Anthropic API key must not be bundled into the client-side JavaScript. The solution is a thin Vercel serverless function:

```
POST /api/scan
Body: { imageBase64: string, imageMediaType: string, sessionId: string }
Response: { books: RecognizedBook[] }
```

- The frontend's Scan Orchestrator calls `fetch('/api/scan', ...)` instead of the Anthropic SDK directly.
- `api/scan.ts` imports `@anthropic-ai/sdk` and reads `process.env.ANTHROPIC_API_KEY` (set in Vercel dashboard).
- `vercel.json` configures the function runtime.

### GitHub Setup

- **Repository**: `github.com/balajip76/book-shelf-scanner` (public)
- **GitHub Projects**: One project board — "Book Shelf Scanner" — with columns: Backlog / In Progress / Done
- **GitHub Issues**: One issue per task from `tasks.md`, labeled by phase and story
- **Branch strategy**: `main` (production), `001-book-shelf-scanner` (feature, current branch)

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| `api/` serverless function (adds a lightweight backend layer) | Anthropic API key cannot be exposed in browser bundle for public Vercel deployment | Direct browser SDK calls require the key in the client bundle — a security risk for any public URL |
