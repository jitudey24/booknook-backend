# BookNook-Server

Express 5 API (ESM, `"type": "module"`) for the BookNook library app, using the **native MongoDB driver** (no Mongoose) and JWT auth via `jose`.

- Real entrypoint: `src/index.js` → `connectDB()` → `createApp(collections)` → listen. Do not create a second entrypoint.
- The auth server is **not in this repo**: it is Better Auth running inside the sibling `C:\code\BookNook-Client` Next.js app on `http://localhost:3000`. That client expects this API on `http://localhost:5000` (`NEXT_PUBLIC_API_URL`).

## Commands

- `npm run dev` (nodemon) / `npm start` — the only scripts that exist.
- There are **no tests, lint, or typecheck** — `npm test` is a stub that always exits 1. Verify changes by starting the server (`node src/index.js`) and curling routes; a missing/bad `.env` or unreachable MongoDB makes it exit 1 immediately.

## Environment (`.env`, gitignored)

- `src/config/env.js` is imported transitively by almost every file and **throws at import time** if `MONGODB_URI` or `AUTH_BASE_URL` is missing — even importing `validation.js` fails without `.env`.
- Optional: `PORT` (default 5000), `MONGODB_DB` (default `BookNook`).

## Data model gotchas (verified against the live DB)

- Books collection is named **`BookNook` — same name as the database** (`client.db("BookNook").collection("BookNook")`); borrows live in `borrows`. Easy to mix up.
- `borrows.bookId` is stored as a **string**, not an ObjectId. Query borrows with the string form; query books with `new ObjectId(id)`.
- `totalCopies` is the availability counter itself: `$inc: -1` on borrow, `$inc: +1` on return. There is no separate `availableCopies` field.
- Returning a book is **`DELETE /borrows/:id`**: the borrow document is deleted (never marked `isReturned: true`). The `isReturned`/`returnedAt` fields exist but only `false`/`null` are ever written; a partial unique index `unique_active_borrow_per_user_book` ({bookId, userEmail} where `isReturned: false`) enforces one active borrow per user+book.
- `connectDB()` runs data migrations/backfills **on every boot** (`src/config/db.js`): default `totalCopies: 1` on old books, ownership backfill, index creation. Expect those log lines; don't re-implement them elsewhere.

## Conventions that differ from defaults

- Ownership: `addedByEmail === null` marks pre-existing "imported" books — **any authenticated user may update/delete them** by design. Owner-only check applies when `addedByEmail` is a real email.
- Identity is keyed off the **normalized email** (trim + lowercase), not the user id. JWT must contain `email` and `sub`; issuer and audience are both `AUTH_BASE_URL`, and JWKS comes from `${AUTH_BASE_URL}/api/auth/jwks`.
- Book categories are a fixed allowlist `allowedCategories` in `src/config/env.js` — add new categories there (shared by create and partial update).
- Every response is `{ success, message, data? }`. Routes are Express **route factories** that receive injected collections (`booksRoutes({ booksCollection, borrowsCollection })`) — new routes must follow this pattern, not module-level imports of the DB.
- Each route handler catches its own errors and returns JSON; the global error handler mainly covers JSON parse failures and 404s.
