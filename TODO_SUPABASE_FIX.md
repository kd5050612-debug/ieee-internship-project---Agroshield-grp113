# Supabase blank screen fix (based on console error)

## Symptom
Frontend is showing a white screen with console error:
- `Uncaught Error: supabaseUrl is required.`

## Root cause
`src/lib/supabase.ts` calls `createClient()` using:
- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

If either env var is missing/undefined, `createClient` throws and React never renders.

## Fix options
### Option 1 (recommended): set env vars
Add the following to `.env`:
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
Then restart `npm run dev`.

### Option 2: make Supabase optional (dev-safe)
Update `src/lib/supabase.ts` to only create the client when env vars exist; otherwise export `supabase = null` and ensure callers handle it.

## Next step
We will implement Option 2 in code so the site loads even if Supabase is not configured yet.

