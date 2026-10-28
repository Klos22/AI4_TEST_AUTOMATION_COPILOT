# Edit book – add a second author to an existing book

Tags: `@regression`

---

# Setup (API)

1. Create author A via `POST /authors` (`getRandomAuthorPayload()`), store `authorA` (id, firstName, lastName).
2. Create author B via `POST /authors` (`getRandomAuthorPayload()`), store `authorB`.
3. Create book via `POST /books` using `getRandomBookOverridePayload({ authors: [authorA.id] })`, store `book` (id, title, year, price, available).

---

# Verify Setup (API)

1. `GET /books/{book.id}` → status 200.
2. Response `authors` contains exactly one author: `authorA.id`.
3. `GET /authors/{authorB.id}` → status 200 (author B exists and is not assigned to the book).

---

# Action (UI)

1. Open `UI_URL` + `/books-management` (nav link "Manage Books").
2. Search for `book.title` using the search box and the 🔍 button.
3. Verify the row for `book.title` is visible and the "Authors" cell shows only author A.
4. Click the "✏️" (edit) button in the book's row → "✏️ Edit Book" dialog opens.
5. In "Authors * (select at least one)" verify the checkbox of author A is checked and author B is unchecked.
6. Check the checkbox labelled `authorB.firstName + ' ' + authorB.lastName`.
7. Leave Title, Year, Price, Available Quantity unchanged.
8. Click "Update Book".

---

# Verify UI

1. The "Edit Book" dialog is closed.
2. After searching for `book.title`, the book row is visible.
3. The row "Authors" cell contains both author A and author B names.
4. Title, Year, Price, Available values in the row are unchanged.
5. Re-open the edit dialog: both author checkboxes (A and B) are checked; close with "Cancel".

---

# Verify API

1. `GET /books/{book.id}` → status 200.
2. `authors` has length 2 and contains ids `authorA.id` and `authorB.id`.
3. `title`, `year`, `price`, `available` equal the values from setup.
4. `GET /authors/{authorA.id}` and `GET /authors/{authorB.id}` → status 200 (authors still exist).

---

# Cleanup (API)

1. `DELETE /books/{book.id}` → 204 (book first, to release author relations).
2. `DELETE /authors/{authorA.id}` → 204.
3. `DELETE /authors/{authorB.id}` → 204.
4. Cleanup runs in `finally`/`afterEach` so it executes even when the test fails.

---

# Required API Endpoints

- `POST /authors`
- `GET /authors/{id}`
- `DELETE /authors/{id}`
- `POST /books`
- `GET /books/{id}`
- `PUT /books/{id}` (exercised by the UI "Update Book" action)
- `DELETE /books/{id}`

---

# Required API Coverage

- `POST /authors` – existing (`tests/api/authors/authors-post-*.spec.ts`)
- `GET /authors/{id}` – existing (used in `authors-post-positive`, `authors-get-positive`)
- `POST /books` – existing (`tests/api/books/books-post-positive.spec.ts`)
- `PUT /books/{id}` – existing (`tests/api/books/books-id-put-positive.spec.ts`)
- `GET /books/{id}`, `DELETE /books/{id}`, `DELETE /authors/{id}` – no dedicated spec; used as verification/cleanup steps in existing API specs.

---

# Required API Architecture

Existing, reusable:

- API Requests: `AuthorsAPIRequest`, `BooksAPIRequest`
- API Steps: `AuthorsAPISteps` (`createAuthor`, `getAuthorById`, `deleteAuthor`), `BooksAPISteps` (`createBook`, `getBookById`, `deleteBook`)
- Factories: `getRandomAuthorPayload`, `getRandomBookOverridePayload`
- Fixtures: `@fixtures/test.fixture` (api + pages)

---

# Required UI Components

- `ManageBooksPage` (`/books-management`): search box, search button, `bookRow(title)`. Missing: edit button in row (to be added by E2E Writer).
- Edit Book dialog component (new; analogous to existing `AddBookDialogComponent`): author checkboxes by name, "Update Book" and "Cancel" buttons.
- Navbar component (existing) – optional navigation to Manage Books.

---

# Test Data

Source: faker via existing factories (confirmed by user).

- Author A: `getRandomAuthorPayload()`
- Author B: `getRandomAuthorPayload()`
- Book: `getRandomBookOverridePayload({ authors: [authorA.id] })`

---

# Assertions

- Setup: POST /authors ×2 → 201, POST /books → 201.
- API pre-check: book has exactly 1 author (A).
- UI: edit dialog shows A checked, B unchecked before the change.
- UI: after update the dialog closes and the row shows both authors.
- UI: other book fields unchanged.
- API: PUT result persisted – book has 2 authors (A, B), other fields unchanged.
- Cleanup: all DELETE → 204.

---

# Notes

- Edit dialog lists all authors (45+ on the observed instance) as checkboxes labelled "firstName lastName" with no search; locate by label text. Faker names must be unique enough to avoid duplicate labels.
- Authors in the dialog and in the table are shown as "firstName lastName"; table author order is not guaranteed – assert with set semantics, not order.
- OpenAPI `PUT /books/{id}` requires `authors`, `available`, `price`, `year`; UI sends the full object.
- OpenAPI declares response type `object` for PUT/POST (no schema) – verify via `GET /books/{id}`.
- Validated in the real UI: Manage Books → "✏️" opens "Edit Book" with Title, Year, Price, Available Quantity and author checkboxes ("Update Book" / "Cancel"). The final "Update Book" click was not executed to avoid modifying shared data.
- Dedicated API specs for `GET /books/{id}` and DELETE endpoints are missing; they are covered only indirectly.
