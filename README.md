# Folio

A quiet personal library powered by Google Books, with a visual language based on Beacon.

## Run it

```bash
cp .env.example .env.local
# Add the Google Books key and Supabase project values.
pnpm install
pnpm dev
```

Open `http://localhost:3000`, create an account, and search for a book.

## Current slice

- Supabase email/password authentication with cookie-backed SSR sessions
- Google Books search through a server-side route (the key is never sent to the browser)
- Want-to-read, reading, and finished shelves
- Add, inspect, move, filter, and remove books
- Defensive normalization for incomplete Google Books metadata
- Postgres persistence with per-user Row Level Security

## Database migration

```bash
supabase login
supabase link --project-ref <project-id>
supabase db push --dry-run
supabase db push
```

The project ID is the value in `https://supabase.com/dashboard/project/<project-id>`. Linking also prompts for the database password; API keys alone cannot apply migrations.

Folio expects signup to create a session immediately. In a hosted Supabase project, open **Authentication → Sign In / Providers → Email** and disable **Confirm email**. This Auth setting is separate from the database schema and is not applied by `supabase db push`.

Authentication and catalogue throttles remain process-local. Set `TRUST_PROXY=true` only behind infrastructure that overwrites `X-Forwarded-For`; use a shared rate-limit store for a multi-instance deployment.
