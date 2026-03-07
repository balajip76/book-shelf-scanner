# Feature Specification: Book Shelf Scanner & Sorter

**Feature Branch**: `001-book-shelf-scanner`
**Created**: 2026-03-07
**Status**: Draft
**Input**: User description: "using an agent team, I want to build a web app that can use the phone camera to see, capture and recognize the books in a book shelf and help me categorize them into keep, throw or give away piles. I also want the books to be categorized into fiction and non-fiction and additional sub categories. I want this to be stored locally with no database or anything complex. Want the app to use modern, elegant, cooler colors/tones and elegant UI elements"

## Clarifications

### Session 2026-03-07

- Q: Should users be able to view AND edit book details (disposition, genre, sub-category, title, author) directly from the collection list view? → A: Yes — a dedicated collection management view is required where users can browse and edit any book attribute across all dispositions and categories.
- Q: Should users be able to permanently delete a book entry from their local collection? → A: No — books are never permanently deleted. Books in the "Give Away" or "Throw Away" piles can be marked as "Complete" once the physical action has been taken (donated or discarded).
- Q: Should users be able to add books to the collection manually at any time, independent of a camera scan? → A: Yes — "Add manually" is always accessible from the collection screen. Manual entry is also the explicit fallback when the agent team cannot read a book's title or spine from a scan.
- Q: How should completed books be displayed in the collection view? → A: Visible but visually dimmed with strikethrough text, with a "Show/Hide Completed" toggle on the collection screen to reveal or hide them.
- Q: What should the default sort order be in the collection view? → A: Grouped by disposition (Unassigned → Keep → Give Away → Throw Away), then alphabetical by title (A–Z) within each group.
- Q: When a duplicate book is detected (same title + author), what should "merge" do? → A: No merge — the app warns the user that a duplicate exists and lets them keep both entries as-is; the user can edit one of them manually via the collection screen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture & Recognize Books from Camera (Priority: P1)

A user points their phone camera at a bookshelf. The app provides a live viewfinder
so the user can frame the shelf, then captures an image. The agent team analyzes the
image, identifies each visible book (by title and author where legible), and presents
the recognized books as a list for review. Books whose spines cannot be read are
surfaced immediately with a manual entry prompt rather than dropped silently.

**Why this priority**: This is the core input mechanism. Without it, the app has
no books to sort. All other stories depend on having a recognized book list.

**Independent Test**: Open the app on a mobile browser, grant camera access, point
at a shelf with at least 3 visible books, capture the image, and verify that a list
of recognized titles appears on screen; any unreadable spine must appear as a manual
entry prompt, not a silent omission.

**Acceptance Scenarios**:

1. **Given** the app is open and camera permission has been granted,
   **When** the user taps the capture button,
   **Then** the app takes a photo, sends it to the agent team, and displays a list
   of recognized books within 10 seconds.

2. **Given** the agent team cannot read a spine,
   **When** recognition completes,
   **Then** the unreadable book appears in the post-scan list with title blank and
   a manual entry prompt (not silently omitted); the user can type the title and
   author directly in that prompt before confirming.

3. **Given** the user reviews the recognized list,
   **When** a title or author is wrong,
   **Then** the user can tap to edit any field inline before proceeding.

---

### User Story 2 - Sort Books into Disposition Piles (Priority: P2)

After books are recognized and confirmed, the user assigns each book to one of three
disposition piles: **Keep**, **Give Away**, or **Throw Away**. The UI presents each
book as a card the user can swipe or tap to assign. Progress is saved locally so
the user can pause and resume.

**Why this priority**: This is the primary value proposition — helping the user
declutter. It must work after P1 delivers a book list.

**Independent Test**: Seed the app with a pre-loaded list of 5 books (bypassing
camera), then assign each to a pile and verify the counts update and the session
persists after a page refresh.

**Acceptance Scenarios**:

1. **Given** a list of recognized books,
   **When** the user assigns a book to "Keep", "Give Away", or "Throw Away",
   **Then** the book moves to the correct pile and the pile count updates immediately.

2. **Given** the user closes and reopens the browser tab,
   **When** the session loads,
   **Then** all previously assigned books remain in their correct piles.

3. **Given** all books have been assigned,
   **When** the user views the summary screen,
   **Then** each pile is shown with its book count and a scrollable list of titles.

---

### User Story 3 - Classify Books by Genre & Sub-category (Priority: P2)

Alongside disposition sorting, the agent team automatically classifies each
recognized book as **Fiction** or **Non-Fiction** and assigns a sub-category
(e.g., Fiction: Literary Fiction, Science Fiction, Mystery, Romance, Fantasy, Thriller;
Non-Fiction: Self-Help, Biography, History, Science, Business, Travel). The user
can review and override any classification.

**Why this priority**: Adds lasting cataloguing value beyond decluttering. Shares
the same book list produced by P1 and can be done in parallel with P2.

**Independent Test**: Seed the app with 5 books of known genres, verify the agent
assigns the correct Fiction/Non-Fiction label and a plausible sub-category, then
manually override one classification and verify it persists.

**Acceptance Scenarios**:

1. **Given** a recognized book,
   **When** the agent team classifies it,
   **Then** it receives a Fiction/Non-Fiction label and at least one sub-category
   tag displayed on the book card.

2. **Given** the agent assigns an incorrect genre,
   **When** the user taps the genre badge,
   **Then** a picker appears with all available sub-categories and the user can
   select the correct one; the change is saved immediately.

3. **Given** a book whose genre cannot be determined,
   **When** classification completes,
   **Then** the book is labeled "Uncategorized" and the user is prompted to assign
   a genre manually.

---

### User Story 4 - Manage Collection: View, Edit & Export (Priority: P2)

The user has a dedicated collection management screen showing all books in their
local library. From this screen they can browse books filtered by disposition
(Keep / Give Away / Throw Away / Unassigned) and/or genre/sub-category, add a book
manually by typing title and author, edit any existing book's disposition, genre,
sub-category, title, or author inline, mark Give Away or Throw Away books as
"Complete" once the physical action is done, and export the full collection as a
CSV file. Books are never permanently deleted.

**Why this priority**: The collection view is the primary place users will correct
mistakes, add overlooked titles, and manage their library over time. The "mark
complete" action closes the loop on the physical decluttering workflow.

**Independent Test**: From the collection screen, add a book manually, assign it a
disposition and genre, mark a "Give Away" book as "Complete", filter by "Give Away",
verify the completed book shows a distinct visual state, then export and confirm the
CSV reflects all edits and completion statuses.

**Acceptance Scenarios**:

1. **Given** a collection with books in multiple piles and genres,
   **When** the user applies a pile filter,
   **Then** only books in that pile are shown.

2. **Given** the user applies a genre filter combined with a pile filter,
   **When** the filter is active,
   **Then** only books matching both criteria are displayed.

3. **Given** a book in the collection view,
   **When** the user taps to edit its disposition or genre/sub-category,
   **Then** the change is applied immediately and reflected in filtered views
   without requiring a page reload.

4. **Given** a book in the collection view,
   **When** the user taps to edit its title or author,
   **Then** an inline text editor opens; saving updates the record immediately.

5. **Given** a book with disposition "Give Away" or "Throw Away",
   **When** the user marks it as "Complete",
   **Then** the book is rendered with dimmed opacity and strikethrough text,
   the completion status is saved locally, and it remains visible unless the
   "Show/Hide Completed" toggle is set to hidden.

6. **Given** the collection view contains completed books,
   **When** the user activates the "Hide Completed" toggle,
   **Then** all completed books disappear from the list; toggling back to
   "Show Completed" restores them in their dimmed/strikethrough state.

6. **Given** the user taps "Add Book Manually",
   **When** they enter a title (author optional) and confirm,
   **Then** the new book is added to the collection with disposition "Unassigned"
   and genre "Uncategorized", ready to be classified and sorted.

7. **Given** the user taps "Export",
   **When** the export completes,
   **Then** a CSV file is downloaded containing title, author, genre, sub-category,
   disposition, and completion status for every book in the collection.

---

### Edge Cases

- What happens when the camera image is too dark or blurry to recognize any books?
  → The app displays an error message and offers to retake the photo.
- What if a book spine is partially visible but the title cannot be read?
  → The agent surfaces it as an unreadable entry with a manual entry prompt
  inline in the post-scan results; it is never silently dropped.
- What if the same book is scanned twice across two sessions?
  → The app warns the user that a duplicate entry (same title + author) was
  detected. No automatic merge occurs — both entries remain in the collection.
  The user can edit or reclassify either entry manually via the collection screen.
- What if the user denies camera permission?
  → The app shows a clear explanation and a button to open browser settings;
  manual book entry via the collection screen remains fully available.
- What if local storage is nearly full?
  → The app warns the user when storage usage exceeds 80% of the available quota.
- Can a "Complete" book be un-completed (e.g., the donation fell through)?
  → Yes — the completion status can be toggled at any time from the collection screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST access the device camera via the browser and display a
  live viewfinder for framing the bookshelf.
- **FR-002**: The app MUST capture a still image on user command and pass it to the
  agent team for book recognition.
- **FR-003**: The agent team MUST return a list of recognized books with title and
  author (where legible) within a reasonable time.
- **FR-004**: Books whose title cannot be read from the scan MUST be surfaced to the
  user as unreadable entries with an inline manual entry prompt; they MUST NOT be
  silently dropped from the post-scan results.
- **FR-005**: Users MUST be able to manually add a book (title required, author
  optional) to the collection at any time from the collection management screen,
  independent of a camera scan.
- **FR-006**: Users MUST be able to assign each book to one of three disposition
  piles: Keep, Give Away, or Throw Away.
- **FR-007**: The agent team MUST classify each recognized book as Fiction or
  Non-Fiction and assign at least one sub-category.
- **FR-008**: Users MUST be able to override any genre or sub-category assignment.
- **FR-009**: All book data (titles, authors, classifications, dispositions,
  completion status) MUST be persisted in browser local storage with no external
  database required.
- **FR-010**: The app MUST function as a mobile-first web application accessible
  from a phone browser without installation.
- **FR-011**: The UI MUST use a modern, elegant design with cool color tones
  (blues, teals, deep purples, charcoals) and polished UI elements.
- **FR-012**: Users MUST be able to filter their collection by disposition pile
  and/or genre/sub-category from the collection management screen.
- **FR-013**: Users MUST be able to export their full collection as a downloadable
  CSV file including completion status.
- **FR-014**: Users MUST be able to edit any book's disposition, genre, sub-category,
  title, and author from within the collection management screen at any time.
- **FR-015**: Books with disposition "Give Away" or "Throw Away" MUST have a
  "Mark Complete" action available; completed books MUST be rendered with dimmed
  opacity and strikethrough text. The completion status MUST be toggleable (mark
  and un-mark). The collection screen MUST provide a "Show/Hide Completed" toggle
  that hides or reveals all completed books without affecting other filters.
- **FR-016**: Books MUST NOT be permanently deleted from the collection.
- **FR-017**: The collection management screen MUST sort books by disposition group
  by default in the order: Unassigned → Keep → Give Away → Throw Away, with books
  within each group sorted alphabetically by title (A–Z). This order applies when
  no disposition filter is active; filtered views sort alphabetically by title.

### Key Entities

- **Book**: A single recognized volume. Attributes: id, title, author, capturedAt,
  disposition (keep | give-away | throw-away | unassigned), genre (fiction |
  non-fiction | uncategorized), subCategory, notes, completedAt (timestamp | null),
  addedManually (boolean).
- **Scan Session**: A single camera capture event. Attributes: id, capturedAt,
  imageThumb (optional), booksRecognized (list of Book ids).
- **Collection**: The user's full local library. Contains all Books and Scan Sessions.

## Assumptions

- The app runs in a modern mobile browser (Chrome/Safari on iOS or Android) that
  supports the MediaDevices Camera API.
- The agent team has access to a vision-capable Claude model to process captured
  images.
- No user accounts, authentication, or cloud sync are required; all data lives in
  the browser's local storage (or IndexedDB for larger collections).
- Sub-categories are a fixed, curated list defined at build time; the user cannot
  create new sub-categories (they can only choose from the provided list).
- Export format defaults to CSV; no additional formats are required.
- "Mark Complete" is only available for "Give Away" and "Throw Away" books; "Keep"
  books do not have a completion state.
- Manually added books enter the collection with disposition "Unassigned" and
  genre "Uncategorized" by default.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can point their phone at a bookshelf, capture an image, and see
  a recognized book list within 15 seconds of tapping the capture button.
- **SC-002**: At least 80% of clearly visible book spines in a well-lit photo are
  correctly identified by title.
- **SC-003**: A user can assign all books on a 20-book shelf to piles and genre
  categories in under 5 minutes.
- **SC-004**: All assigned dispositions, genre classifications, and completion
  statuses survive a full browser tab close and reopen.
- **SC-005**: The app loads and is fully interactive on a mobile phone within 3
  seconds on a standard 4G connection.
- **SC-006**: 90% of first-time users can complete a scan-and-sort session without
  consulting any documentation.
- **SC-007**: Any edit made in the collection management screen is reflected
  everywhere in the app within 1 second, without a page reload.
