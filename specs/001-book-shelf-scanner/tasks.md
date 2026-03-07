# Tasks: Book Shelf Scanner & Sorter

**Input**: Design documents from `/specs/001-book-shelf-scanner/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — Constitution Principle III (Test-First) is NON-NEGOTIABLE. Tests MUST be written and confirmed to fail before any implementation code.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in all task descriptions

---

## Phase 0: GitHub & Vercel Infrastructure

**Purpose**: Create the public repository, project board, and wire Vercel deployment before any code is written. T001 and T004 are sequential; T002, T003 can run in parallel after T001.

- [ ] T001 Create public GitHub repository `book-shelf-scanner` under `balajip76` with description via `gh repo create balajip76/book-shelf-scanner --public --description "Mobile-first PWA to scan and sort books with Claude AI"`, add remote, push `master` and `001-book-shelf-scanner` branches
- [ ] T002 [P] Create GitHub Projects v2 board "Book Shelf Scanner" via `gh api graphql` mutation; record the project URL and node ID for later issue linking
- [ ] T003 [P] Link local repo to Vercel project via `vercel link`; add `ANTHROPIC_API_KEY` environment variable (production + preview) via `vercel env add ANTHROPIC_API_KEY`
- [ ] T004 Create `vercel.json` at repository root: configure Node.js 20 runtime for `api/**` functions, set `maxDuration: 30` for the scan function, add any required CORS headers

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and toolchain configuration. T005 and T006 are sequential; T007–T014 are all parallel after T006.

- [ ] T005 Initialize Vite 6 + React 19 + TypeScript 5 project at repository root (`npm create vite@latest . -- --template react-ts`); verify `npm run dev` starts without errors
- [ ] T006 Install all runtime and dev dependencies: `@anthropic-ai/sdk dexie dexie-react-hooks motion react-router-dom tailwindcss @tailwindcss/vite vite-plugin-pwa` and `vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @playwright/test msw` and run `npx shadcn@latest init`
- [ ] T007 [P] Configure Tailwind CSS v4 with cool-tone custom theme: `--color-primary` (teal-600), `--color-surface` (slate-900), `--color-accent` (purple-500), `--color-muted` (slate-700) CSS variables in `src/index.css`; add `@tailwindcss/vite` plugin in `vite.config.ts`
- [ ] T008 [P] Configure ESLint 9 (flat config) + Prettier: TypeScript + React rules in `eslint.config.js`; format rules in `.prettierrc`; add `lint` and `format` scripts to `package.json`
- [ ] T009 [P] Configure Vitest in `vite.config.ts`: `environment: 'jsdom'`, `include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts']`, `setupFiles: ['tests/setup.ts']`; add `test` and `test:ui` scripts to `package.json`
- [ ] T010 [P] Configure Playwright in `playwright.config.ts`: projects for `iPhone 14` and `Pixel 7` device presets, `testDir: 'tests/e2e'`, `baseURL: 'http://localhost:5173'`; add `test:e2e` and `test:e2e:ui` scripts to `package.json`
- [ ] T011 [P] Configure `vite-plugin-pwa` in `vite.config.ts`: `registerType: 'autoUpdate'`, manifest with `name: 'Book Shelf Scanner'`, `theme_color: '#0d9488'` (teal-600), `background_color: '#0f172a'` (slate-900), basic `workbox` offline strategy
- [ ] T012 [P] Configure shadcn/ui output directory to `src/components/ui/`; install initial components: `button`, `dialog`, `popover`, `badge`, `input`, `select`, `toggle` via `npx shadcn@latest add`
- [ ] T013 [P] Create `tests/setup.ts` (global Vitest setup: jsdom globals, MSW server setup) and `tests/helpers/db.ts` (Dexie test helper: create in-memory DB, seed books, clear after each test)
- [ ] T014 [P] Create GitHub Actions workflow `.github/workflows/ci.yml`: on PR → `npm run lint && npm run typecheck && npm run test`; on push to `master` → trigger Vercel production deploy via `vercel --prod --token $VERCEL_TOKEN`; store `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub Actions secrets

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer and infrastructure that MUST be complete before ANY user story begins. T015→T016 are sequential; T017–T021 can run in parallel after T016; T022 depends on T017–T021.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T015 Define all TypeScript types and enums in `src/types/index.ts`: `Book`, `ScanSession`, `Disposition` (`keep | give-away | throw-away | unassigned`), `Genre` (`fiction | non-fiction | uncategorized`), `SubCategory` (full 22-value union from data-model.md), `ScanStatus`, `RecognizedBook`, `ScanResult`, `VisionResult`, `ClassificationResult`
- [ ] T016 Implement Dexie 4 database schema in `src/db/index.ts`: `BookSorterDB` class extending `Dexie`, `books` table (indexes: `id, disposition, genre, subCategory, completedAt, capturedAt, scanSessionId`), `scanSessions` table (indexes: `id, capturedAt, status`), export singleton `db`
- [ ] T017 [P] Implement structured agent decision logger in `src/utils/logger.ts`: `logAgentDecision({ timestamp: ISO-8601, agent: string, inputSummary: string, outcome: string })` — logs to `console.info` in dev, silences in test environment
- [ ] T018 [P] Implement image downsampler utility in `src/utils/image.ts`: `downsampleImage(blob: Blob): Promise<{ base64: string; mediaType: 'image/jpeg' }>` — canvas-based resize to fit within 1280×720, output JPEG at 0.85 quality, return raw base64 (no data-URI prefix)
- [ ] T019 [P] Set up React Router v6 with page shells in `src/main.tsx` and `src/App.tsx`: routes for `/` (→ `ScanPage`), `/review` (→ `ReviewPage`), `/collection` (→ `CollectionPage`); each page exports a minimal placeholder component
- [ ] T020 [P] Implement base app layout in `src/components/Layout.tsx`: cool-tone background (`bg-slate-900`), bottom navigation bar (Scan icon / Collection icon), mobile viewport meta (`viewport-fit=cover`), `env(safe-area-inset-bottom)` padding; wrap all routes
- [ ] T021 [P] Implement `useStorageQuota` hook in `src/hooks/useStorageQuota.ts`: calls `navigator.storage.estimate()` on mount and after each Dexie write (via custom event), returns `{ usagePercent: number, isNearFull: boolean }` (threshold: 80%)
- [ ] T022 Implement Vercel serverless function in `api/scan.ts`: accepts `POST { imageBase64: string, imageMediaType: string, sessionId: string }`, imports `@anthropic-ai/sdk` and reads `process.env.ANTHROPIC_API_KEY`, calls Vision Agent logic (inline, not importing from `src/`) to call `claude-sonnet-4-6` with `extract_books` tool, fans out to Classifier Agent logic for each readable book calling `claude-haiku-4-5` with `classify_book` tool, returns `ScanResult`; all agent decisions logged to server console with ISO-8601 timestamp; update `src/agents/orchestrator.ts` stub to call `fetch('/api/scan', { method: 'POST', body: JSON.stringify(...) })` instead of the Anthropic SDK directly

**Checkpoint**: Foundation ready — all user story phases can now begin.

---

## Phase 3: User Story 1 — Capture & Recognize Books from Camera (Priority: P1) 🎯 MVP

**Goal**: User points phone at a shelf, taps capture, sees a reviewed list of recognized books within 15 seconds; unreadable spines appear as manual-entry prompts (never silently dropped).

**Independent Test**: Open the app on a mobile browser, grant camera access, point at a shelf with ≥3 books, capture, verify a list of recognized titles appears within 15s; any unreadable spine shows a manual-entry prompt inline; the entire flow works without any other user story being implemented.

> **TEST-FIRST RULE**: Write and run T023–T026 (confirm FAIL), then implement T027–T036.

### Tests for User Story 1

- [ ] T023 [P] [US1] Write unit test in `tests/unit/image.test.ts`: assert `downsampleImage()` returns base64 JPEG with decoded dimensions ≤1280×720; test with a 4K canvas blob
- [ ] T024 [P] [US1] Write unit test in `tests/unit/vision-agent.test.ts`: mock `fetch('/api/scan')` via MSW, assert `VisionResult` parsed correctly for readable books (title+author populated) and unreadable books (`readable: false`, `title: null`)
- [ ] T025 [P] [US1] Write integration test in `tests/integration/scan-pipeline.test.ts`: mock `/api/scan` endpoint via MSW returning a mixed result (2 readable + 1 unreadable), call orchestrator, assert `ScanResult.books` has 3 entries with correct `readable` flags
- [ ] T026 [US1] Write Playwright E2E test in `tests/e2e/scan.spec.ts`: mock `/api/scan` via Playwright route intercept, simulate file-input capture, assert `ReviewPage` loads with recognized book list; assert unreadable book shows title input field; assert inline edit of title updates the field value

### Implementation for User Story 1

- [ ] T027 [P] [US1] Implement `useCamera` hook in `src/hooks/useCamera.ts`: `enumerateDevices()` to find rear camera by `deviceId`, fall back to `facingMode: 'environment'`, fall back to file-input if `getUserMedia` fails; return `{ stream, captureFrame, error, usingFallback }`; `captureFrame()` draws to canvas and returns `Blob`
- [ ] T028 [P] [US1] Build `UnreadableBookPrompt` component in `src/components/scan-review/UnreadableBookPrompt.tsx`: renders two controlled inputs (title required, author optional), "Confirm" button; calls `onConfirm({ title, author })` prop; styled with cool-tone theme
- [ ] T029 [US1] Implement `src/agents/orchestrator.ts`: `runScan(imageBlob: Blob, sessionId: string): Promise<ScanResult>` — calls `downsampleImage`, then `POST /api/scan`, parses response into `ScanResult`; logs orchestrator entry + completion via `logger.ts`
- [ ] T030 [US1] Build `CameraViewfinder` component in `src/components/camera/CameraViewfinder.tsx`: renders `<video autoPlay muted playsInline>` bound to `useCamera` stream; shows file-input `<input type="file" accept="image/*" capture="environment">` when `usingFallback: true`; shows `CameraPermissionDenied` placeholder when `error` is permission-related
- [ ] T031 [US1] Build `CaptureButton` component in `src/components/camera/CaptureButton.tsx`: triggers `captureFrame()` from `useCamera`, calls `downsampleImage`, invokes `onCapture(base64, mediaType)` prop; shows loading spinner while orchestrator is running
- [ ] T032 [US1] Build `ScanResultList` component in `src/components/scan-review/ScanResultList.tsx`: renders each `RecognizedBook` as an editable card (inline title/author inputs); renders `UnreadableBookPrompt` for entries where `readable: false`; "Confirm All" button calls `onConfirm(books)` prop
- [ ] T033 [US1] Build `ScanPage` in `src/pages/ScanPage.tsx`: mounts `CameraViewfinder` + `CaptureButton`; on capture calls `orchestrator.runScan()`; navigates to `/review` passing `ScanResult` via router state; handles camera-denied state (show explanation + manual-entry CTA) and dark-image state (orchestrator returns 0 books → "No books found, retake" message)
- [ ] T034 [US1] Build `ReviewPage` in `src/pages/ReviewPage.tsx`: reads `ScanResult` from router state; renders `ScanResultList`; "Confirm & Save" button persists all books to `db.books` and creates a `ScanSession` record in `db.scanSessions`; navigates to `/collection` after save

**Checkpoint**: User Story 1 fully functional — camera → `/api/scan` → recognized list → save to IndexedDB. Test independently before proceeding.

---

## Phase 4: User Story 2 — Sort Books into Disposition Piles (Priority: P2)

**Goal**: User assigns each book to Keep / Give Away / Throw Away via swipe or tap; progress persists across browser tab close and reopen.

**Independent Test**: Use `tests/helpers/db.ts` to seed 5 books with `disposition: 'unassigned'`, open `/collection`, assign each to a pile by swipe or tap, verify pile counts update immediately, reload the page, verify all assignments persisted in the correct groups.

> **TEST-FIRST RULE**: Write and run T035–T036 (confirm FAIL), then implement T037–T042.

### Tests for User Story 2

- [ ] T035 [P] [US2] Write unit tests in `tests/unit/useCollection.test.ts`: `addBook()` inserts with `disposition: 'unassigned'`; `updateDisposition()` updates and triggers live-query re-render; `deleteBook()` throws (no permanent deletion); default sort order is Unassigned→Keep→Give Away→Throw Away then A–Z within each group
- [ ] T036 [P] [US2] Write Playwright E2E test in `tests/e2e/disposition.spec.ts`: seed 5 books via `page.evaluate()` calling Dexie directly, swipe a `BookCard` left (Give Away) and right (Keep), tap disposition badge on another card, reload, assert disposition groups contain correct book titles

### Implementation for User Story 2

- [ ] T037 [US2] Implement `useCollection` hook in `src/hooks/useCollection.ts`: `useLiveQuery` for sorted book list (Unassigned→Keep→Give Away→Throw Away, then A–Z within group), `addBook(book)`, `updateBook(id, patch)`, `updateDisposition(id, disposition)`, `markComplete(id)`, `unmarkComplete(id)` — no delete operation; also `addBookWithDuplicateCheck` (returns `{ isDuplicate: boolean }`)
- [ ] T038 [P] [US2] Build `BookCard` component in `src/components/collection/BookCard.tsx`: displays title, author, disposition badge, genre badge; Motion for React `useDrag` — swipe left → Give Away, swipe right → Keep, tap disposition badge → dropdown picker; calls `updateDisposition()` on change
- [ ] T039 [US2] Build `CollectionView` skeleton in `src/components/collection/CollectionView.tsx`: groups books by disposition using `useCollection` live query; renders labeled sections (Unassigned / Keep / Give Away / Throw Away) with `BookCard` list per section and per-section count badge
- [ ] T040 [US2] Build `CollectionPage` in `src/pages/CollectionPage.tsx`: wraps `CollectionView`, header with title + "Add Book" button stub (no-op for now), renders `StorageWarning` banner when `useStorageQuota().isNearFull`
- [ ] T041 [US2] Wire bottom navigation in `src/components/Layout.tsx`: camera icon → `/`, library icon → `/collection`; active route highlighted with `--color-primary` tint; update `src/App.tsx` routes to wrap all pages in `Layout`

**Checkpoint**: User Stories 1 and 2 both independently functional. User can scan books and sort into piles.

---

## Phase 5: User Story 3 — Classify Books by Genre & Sub-category (Priority: P2)

**Goal**: Agent automatically classifies each recognized book as Fiction/Non-Fiction + sub-category; user can review and override any classification at any time.

**Independent Test**: Seed 5 books of known genres via `tests/helpers/db.ts`, open `/collection`, verify each book card shows a genre badge; tap the badge, verify a popover with all sub-categories appears grouped by Fiction/Non-Fiction; select a different sub-category, verify the change is saved and reflected immediately; a book with `genre: 'uncategorized'` shows a "Set Genre" prompt.

> **TEST-FIRST RULE**: Write and run T042–T043 (confirm FAIL), then implement T044–T046.

### Tests for User Story 3

- [ ] T042 [P] [US3] Write unit tests in `tests/unit/classifier-agent.test.ts`: mock `/api/scan` via MSW with high-confidence classification → assert `genre` and `subCategory` populated; mock with low-confidence → assert `genre: 'uncategorized'`; mock API error → assert returns `uncategorized` without throwing
- [ ] T043 [P] [US3] Write Playwright E2E test in `tests/e2e/classification.spec.ts`: seed 5 books with known genres, load `/collection`, assert genre badges visible; tap badge → popover appears → select override → reload → assert override persisted in Dexie

### Implementation for User Story 3

- [ ] T044 [P] [US3] Add genre badge + sub-category picker popover to `BookCard` in `src/components/collection/BookCard.tsx`: genre badge uses shadcn/ui `Badge` (teal for fiction, purple for non-fiction, muted for uncategorized); tap opens shadcn/ui `Popover` with sub-categories grouped under Fiction / Non-Fiction headings; selecting calls `updateBook(id, { genre, subCategory })` immediately
- [ ] T045 [US3] Integrate classification display into `ReviewPage` in `src/pages/ReviewPage.tsx`: `ScanResultList` cards show genre badge returned from `ScanResult`; low-confidence books (`classificationConfidence: 'low'`) show "Uncategorized — tap to set genre" prompt above the badge
- [ ] T046 [US3] Add genre/sub-category display to `CollectionView` in `src/components/collection/CollectionView.tsx`: each `BookCard` already shows genre badge via T044; ensure `useCollection` live query re-renders immediately after `updateBook()` genre change without page reload

**Checkpoint**: User Stories 1, 2, and 3 all independently functional. Agent classifies; user can override.

---

## Phase 6: User Story 4 — Manage Collection: View, Edit & Export (Priority: P2)

**Goal**: User can filter by pile + genre, edit any book attribute inline, mark Give Away / Throw Away books complete, add books manually, show/hide completed, and export CSV.

**Independent Test**: From `/collection`: add a book manually (title + author) → verify "Unassigned / Uncategorized"; apply pile filter → verify only matching books show; apply combined pile + genre filter; tap to edit title → save → verify update; mark Give Away book complete → dimmed + strikethrough; toggle "Hide Completed" → disappears; toggle back → returns; tap Export → CSV downloaded with all required columns.

> **TEST-FIRST RULE**: Write and run T047–T049 (confirm FAIL), then implement T050–T058.

### Tests for User Story 4

- [ ] T047 [P] [US4] Write unit tests in `tests/unit/csv-export.test.ts`: assert output contains header row with all 9 columns; assert `completedAt` is ISO-8601 when set and empty when null; assert commas and double-quotes in titles are correctly escaped
- [ ] T048 [P] [US4] Write unit tests in `tests/unit/collection-filters.test.ts`: `useCollection` with disposition filter returns only matching books; combined disposition + genre filter; Show/Hide completed toggle; default sort order preserved after filter change
- [ ] T049 [US4] Write Playwright E2E test in `tests/e2e/collection-management.spec.ts`: add book manually → filter by pile → combined filter → inline edit title → mark complete → hide/show completed → export CSV (assert download triggered and filename is `books-export.csv`)

### Implementation for User Story 4

- [ ] T050 [P] [US4] Implement `csv-export` utility in `src/utils/csv-export.ts`: `exportCollectionAsCSV(books: Book[]): void` — builds CSV string with columns `id,title,author,genre,subCategory,disposition,completedAt,capturedAt,addedManually`; escapes fields; creates `Blob('text/csv')`, triggers download via temporary `<a>` element with filename `books-export.csv`
- [ ] T051 [P] [US4] Build `FilterBar` component in `src/components/collection/FilterBar.tsx`: horizontal scroll row of disposition pill buttons (All / Unassigned / Keep / Give Away / Throw Away); genre `<select>` dropdown; "Show Completed" / "Hide Completed" toggle button; calls `onFilterChange` prop on any change
- [ ] T052 [P] [US4] Build `BookEditModal` component in `src/components/collection/BookEditModal.tsx`: shadcn/ui `Dialog` with controlled inputs for title (required), author (optional), disposition `Select`, genre `Select`, sub-category `Select` (filtered to match chosen genre); "Save" calls `updateBook(id, patch)` and closes; "Cancel" discards
- [ ] T053 [P] [US4] Build `ExportButton` component in `src/components/collection/ExportButton.tsx`: button that calls `exportCollectionAsCSV(allBooks)` where `allBooks` comes from `useCollection()` with no filters; rendered in `CollectionView` header
- [ ] T054 [US4] Integrate `FilterBar` + `BookEditModal` + `ExportButton` into `CollectionView` in `src/components/collection/CollectionView.tsx`: add `filterState` (disposition + genre + showCompleted); pass to `useCollection` live query; tap-to-edit on `BookCard` opens `BookEditModal`; place `ExportButton` and `FilterBar` in the view header
- [ ] T055 [US4] Implement "Mark Complete" toggle in `BookCard` and `CollectionView` in `src/components/collection/BookCard.tsx` and `src/components/collection/CollectionView.tsx`: "Mark Complete" button visible only when `disposition` is `give-away` or `throw-away`; completed books rendered with `opacity-50 line-through`; button label toggles to "Undo Complete"; calls `markComplete()` / `unmarkComplete()`
- [ ] T056 [US4] Implement "Add Book Manually" modal in `CollectionPage` in `src/pages/CollectionPage.tsx`: shadcn/ui `Dialog` with title (required) + author (optional) inputs; "Add" calls `useCollection.addBookWithDuplicateCheck({ title, author, disposition: 'unassigned', genre: 'uncategorized', addedManually: true })`; if `isDuplicate: true` shows inline warning "A book with this title and author already exists" before allowing confirm
- [ ] T057 [US4] Extend `useCollection` in `src/hooks/useCollection.ts`: add filter parameters `{ disposition?, genre?, showCompleted }` to the live query so `CollectionView` receives a pre-filtered, pre-sorted list; filtered views sort alphabetically by title only (no disposition grouping when a filter is active)
- [ ] T058 [US4] Update `useCollection` default sort in `src/hooks/useCollection.ts`: when no disposition filter, sort by disposition group order (Unassigned→Keep→Give Away→Throw Away) then A–Z within each group; when filter active, sort A–Z only

**Checkpoint**: All four user stories independently functional. Full app is feature-complete.

---

## Phase 7: Polish, Accessibility & Deployment

**Purpose**: Edge cases, accessibility, PWA readiness, GitHub Issues, and Vercel production deploy.

- [ ] T059 [P] Add `StorageWarning` banner in `src/components/StorageWarning.tsx`: renders dismissible yellow/amber alert when `useStorageQuota().isNearFull`; integrate into `Layout.tsx` above the page content area
- [ ] T060 [P] Add `CameraPermissionDenied` screen in `src/components/camera/CameraPermissionDenied.tsx`: explains camera access is required; "Open Browser Settings" button links to `chrome://settings` / shows iOS instructions; "Add Books Manually" button navigates to `/collection`
- [ ] T061 [P] Add no-books-detected error state in `src/pages/ScanPage.tsx`: when `orchestrator.runScan()` returns `books: []` (dark/blurry image), show error banner "No books detected — try better lighting" + "Retake Photo" button that resets camera state
- [ ] T062 [P] Finalize PWA manifest and icons: create `public/icons/icon-192.png` and `public/icons/icon-512.png` (app icon with book + camera motif, teal on dark); update `vite-plugin-pwa` manifest in `vite.config.ts` with correct paths, `display: 'standalone'`, correct `theme_color` and `background_color`
- [ ] T063 Accessibility pass across all interactive components in `src/components/`: ARIA labels on camera controls (`aria-label="Capture photo"`), disposition swipe cards (`role="button" aria-label="Book: {title}"`), `FilterBar` pills (`role="group" aria-label="Filter by pile"`); focus traps inside all modals; keyboard navigation through `CollectionView` list
- [ ] T064 Mobile UX polish in `src/index.css` and relevant components: all tap targets ≥44×44px (add `min-h-[44px] min-w-[44px]` where needed); `padding-bottom: env(safe-area-inset-bottom)` on bottom nav; `overscroll-behavior: contain` on scroll containers; `-webkit-overflow-scrolling: touch` on book lists
- [ ] T065 Run full quickstart.md validation: `npm install` → `npm run typecheck` (0 errors) → `npm run lint` (0 errors) → `npm run build` (succeeds, bundle ≤5MB) → `npm run test` (all green) → `npm run test:e2e` (all green on mobile viewport) → `vercel dev` and verify `/api/scan` responds
- [ ] T066 [P] Create all GitHub Issues from tasks.md via `gh issue create`: one issue per task T001–T065, title = task description (truncated to 80 chars), body = full task description + file paths, labels = phase (e.g., `phase-1`, `phase-2`, `phase-3-us1`) + story label where applicable; add each issue to the GitHub Projects board via `gh project item-add`
- [ ] T067 Deploy to Vercel production via `vercel --prod`; verify the public URL loads on a mobile browser; smoke-test: grant camera access, capture a bookshelf image, confirm scan results appear within 15 seconds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (GitHub & Vercel)**: No dependencies — start immediately; T001 before T002/T003; T004 any time after T001
- **Phase 1 (Setup)**: T005→T006 sequential, then T007–T014 all parallel
- **Phase 2 (Foundational)**: T015→T016 sequential, then T017–T021 all parallel, then T022 last (depends on T016–T021)
- **Phases 3–6 (User Stories)**: All depend on Phase 2 completion — begin in priority order or in parallel
- **Phase 7 (Polish & Deploy)**: Depends on all desired user stories being complete; T066–T067 last

### User Story Dependencies

- **US1 (Phase 3, P1)**: Starts after Phase 2 — no dependency on other stories; defines `orchestrator`, `useCamera`, `ScanPage`, `ReviewPage`
- **US2 (Phase 4, P2)**: Starts after Phase 2 — `useCollection` hook + `BookCard` + `CollectionView`; testable with seeded data independent of US1
- **US3 (Phase 5, P2)**: Starts after Phase 2 — extends `BookCard` (T044) and `ReviewPage` (T045); T044 has a soft dependency on T038 (`BookCard` existing); otherwise independent
- **US4 (Phase 6, P2)**: Starts after Phase 2 — T054 depends on `CollectionView` skeleton from T039 (US2); T057–T058 extend `useCollection` from T037 (US2)

### Parallelism Within Each Phase

- **Phase 0**: T002 + T003 in parallel after T001
- **Phase 1**: T007–T014 all in parallel after T006
- **Phase 2**: T017–T021 all in parallel after T016; T022 after all of T017–T021
- **Phase 3 (US1)**: T023+T024+T025 (tests) in parallel; T027+T028+T032 (hook + orchestrator + prompt) in parallel; then T029→T030→T031→T033→T034
- **Phase 4 (US2)**: T035+T036 (tests) in parallel; T038 (BookCard) in parallel with T037 (hook)
- **Phase 5 (US3)**: T042+T043 (tests) in parallel; T044 in parallel with test writing
- **Phase 6 (US4)**: T047+T048 (tests) in parallel; T050+T051+T052+T053 (utility + components) all in parallel
- **Phase 7**: T059+T060+T061+T062 all in parallel; T063→T064→T065→T066→T067 sequential

---

## Parallel Example: User Story 1

```bash
# After Phase 2 complete — write all US1 tests first (must FAIL):
Task T023: Unit test — image downsampler         (tests/unit/image.test.ts)
Task T024: Unit test — vision-agent parsing      (tests/unit/vision-agent.test.ts)
Task T025: Integration test — scan pipeline      (tests/integration/scan-pipeline.test.ts)
Task T026: E2E test — camera scan flow           (tests/e2e/scan.spec.ts)

# Then implement in parallel where possible:
Task T027: useCamera hook                        (src/hooks/useCamera.ts)
Task T028: UnreadableBookPrompt                  (src/components/scan-review/UnreadableBookPrompt.tsx)
  ↓ after T027+T028:
Task T029: Scan Orchestrator                     (src/agents/orchestrator.ts)
Task T030: CameraViewfinder (needs useCamera)    (src/components/camera/CameraViewfinder.tsx)
Task T031: CaptureButton                         (src/components/camera/CaptureButton.tsx)
Task T032: ScanResultList (needs Prompt)         (src/components/scan-review/ScanResultList.tsx)
  ↓ after T029+T030+T031:
Task T033: ScanPage                              (src/pages/ScanPage.tsx)
  ↓ after T032:
Task T034: ReviewPage                            (src/pages/ReviewPage.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: GitHub + Vercel infrastructure
2. Complete Phase 1: Setup
3. Complete Phase 2: Foundational + `api/scan.ts` proxy (**CRITICAL**)
4. Complete Phase 3: User Story 1
5. **STOP and VALIDATE**: `npm run test` + `npm run test:e2e` — all US1 tests green; open on phone, scan a shelf
6. Merge to `master` → auto-deploy to Vercel via GitHub Actions

### Incremental Delivery

1. Phase 0 + Phase 1 + Phase 2 → project bootstrapped, proxy live on Vercel
2. Add US1 → **MVP: scan + recognize books** — deploy and share!
3. Add US2 → disposition sorting (core declutter value)
4. Add US3 → genre classification (cataloguing value)
5. Add US4 → full collection management (power features)
6. Phase 7 → polish, accessibility, GitHub Issues, final Vercel deploy

### Parallel Team Strategy (4 stories after foundation)

1. Full team completes Phases 0–2 together
2. Once Phase 2 complete:
   - **Developer A**: US1 — camera + `/api/scan` proxy (P1, MVP blocker)
   - **Developer B**: US2 — disposition piles + `useCollection` hook
   - **Developer C**: US3 — genre badge + picker (extends BookCard from B)
   - **Developer D**: US4 — collection management screens

---

## Notes

- `[P]` tasks operate on different files — safe to run concurrently
- `[Story]` labels trace each task to its user story for independent testing
- Tests MUST fail before implementation — non-negotiable (Constitution III)
- `api/scan.ts` is a **Vercel serverless function** — the Anthropic SDK lives server-side only; the browser never sees the API key
- Each checkpoint marks a fully independently testable and deployable increment
- Never permanently delete a `Book` record — use `disposition` + `completedAt` instead (FR-016)
- All agent decisions must emit a structured log entry (Constitution IV)
- Commit after each task or logical group; push to `001-book-shelf-scanner` branch; merge to `master` to trigger Vercel deploy
