# Folio

A quiet personal library powered by Google Books, with a visual language based on Beacon.

## Run it

```bash
cp .env.example .env.local
# Add a Google Books API key.
pnpm install
pnpm dev
```

Open `http://localhost:3000`, create an account, and search for a book.

## Current slice

- Email/password registration and signed, HTTP-only sessions
- Google Books search through a server-side route (the key is never sent to the browser)
- Want-to-read, reading, and finished shelves
- Add, inspect, move, filter, and remove books
- Defensive normalization for incomplete Google Books metadata
- Local JSON persistence under `.data/`

Local JSON storage is intentional for this first personal prototype. The persistence code is isolated in `lib/store.ts`; replace that adapter with Postgres or Supabase before a multi-instance deployment.

Authentication and catalogue throttles are process-local for the same reason. Set `TRUST_PROXY=true` only behind infrastructure that overwrites `X-Forwarded-For`; use a shared rate-limit store alongside the database migration for a multi-instance deployment.
