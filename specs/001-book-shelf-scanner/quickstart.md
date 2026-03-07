# Developer Quickstart: Book Shelf Scanner & Sorter

**Branch**: `001-book-shelf-scanner` | **Date**: 2026-03-07

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+ or pnpm 9+
- An Anthropic API key with access to `claude-sonnet-4-6` and `claude-haiku-4-5`
- A modern browser: Chrome 111+ or Safari 16.4+
- HTTPS for camera access (handled automatically by Vite dev server via `--host`)

## 1. Clone & Install

```bash
git clone <repo-url>
cd agent-team-book-sorter
git checkout 001-book-shelf-scanner
npm install
```

## 2. Configure Environment

Create `.env.local` in the repository root (never commit this file):

```bash
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> **Security note**: The Anthropic API key is exposed in the browser bundle. This is acceptable for a local-only personal tool. Do not deploy to a public URL without adding a backend proxy.

## 3. Start Development Server

```bash
npm run dev
```

Vite starts at `http://localhost:5173`. For camera access on a physical phone, run:

```bash
npm run dev -- --host
```

Then open `https://<your-local-ip>:5173` on your phone. Camera access requires HTTPS (or localhost).

## 4. Run Tests

```bash
# Unit + integration (Vitest)
npm run test

# Watch mode
npm run test:watch

# E2E (Playwright — mobile viewport)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

> **Test-First rule (Constitution III)**: Write tests first, confirm they fail, then implement.

## 5. Build for Production

```bash
npm run build
npm run preview   # local preview of production build
```

Output in `dist/`. The PWA service worker is generated automatically by `vite-plugin-pwa`.

## 6. Project Layout (quick reference)

```
src/
├── agents/          # Claude agent team (Vision, Classifier, Orchestrator)
├── components/      # React UI components
├── db/              # Dexie IndexedDB schema + instance
├── hooks/           # useCamera, useCollection, useStorageQuota
├── pages/           # ScanPage, ReviewPage, CollectionPage
├── types/           # Book, ScanSession, Disposition, Genre, SubCategory
└── utils/           # csv-export, image downsampler, logger

tests/
├── unit/            # Vitest unit tests
├── integration/     # Vitest integration tests (mocked Claude API)
└── e2e/             # Playwright E2E on mobile viewport
```

## 7. Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest unit + integration |
| `npm run test:e2e` | Playwright E2E |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## 8. Adding a shadcn/ui Component

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

Components are added to `src/components/ui/`.

## 9. Agent Team Overview

All agent code lives in `src/agents/`. Agents are in-process TypeScript modules — no HTTP calls between them.

```
orchestrator.ts
  → calls vision-agent.ts (claude-sonnet-4-6, sends base64 image)
  → calls classifier-agent.ts (claude-haiku-4-5, per-book classification)
  → returns ScanResult to ReviewPage
```

Images are downsampled to ≤1280×720 (`src/utils/image.ts`) before being sent to the Vision Agent.

All agent decisions are logged via `src/utils/logger.ts` with the format:
```json
{ "timestamp": "2026-03-07T10:00:00.000Z", "agent": "vision-agent", "inputSummary": "...", "outcome": "..." }
```

## 10. Local Storage & Quota Monitoring

Data is stored in IndexedDB (via Dexie). No data is ever sent to a server.

The `useStorageQuota` hook monitors `navigator.storage.estimate()` and surfaces a warning banner when usage exceeds 80% of quota.

To inspect the database in Chrome DevTools: **Application → IndexedDB → BookSorterDB**.
