# Brush and Bond

Brush and Bond is the art club site and artwork archive for the Government College of Engineering and Ceramic Technology (GCECT). The frontend is a React, TypeScript, and Vite app. Its current data backend is Supabase. `server/index.js` is a separate legacy SQLite API; `backend/` is a retired PostgreSQL backend.

> **Current frontend data setup:** the frontend now uses Supabase directly through `src/services/supabaseApi.ts`. For a fresh project, apply every migration in `supabase/migrations/` in filename order and follow [supabase/README.md](supabase/README.md). The SQLite API instructions below describe the older standalone server and are not the database setup for the current Supabase frontend.

## Run locally

Requirements: Node.js 24 or newer and npm.

1. Install dependencies with `npm ci`.
2. Apply the Supabase migrations and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (see [supabase/README.md](supabase/README.md)).
3. Run `npm run dev` and open the Vite URL it prints.

The frontend connects directly to Supabase. The Node.js API and SQLite-specific operational notes below describe the legacy standalone service; they are not required to run this frontend.

## Operational monitoring

`GET /api/health` is a lightweight uptime probe. It returns HTTP 503 when a monitored filesystem is critically full or the latest recorded backup failed. `GET /api/admin/monitoring` requires an administrator session and reports API 4xx/5xx counts and recent requests from the last hour, database/WAL size, uploaded-file bytes, filesystem total/free space, disk warning state, and the latest backup result. API 5xx errors are also written as structured JSON to standard error for the hosting platform's log collector. Counters are in memory and reset when the API restarts; forward platform logs/metrics to a durable monitoring service for history and alerting. Disk scans are cached for up to one minute.

Set `BACKUP_DIR` to a persistent volume separate from the app's database/uploads disk. Schedule `npm run backup` with the host's scheduler; the command reads `BACKUP_DIR` from the environment and updates `backup-status.json` on success or failure (or pass the destination explicitly with `npm run backup -- /absolute/path`). Configure the same `BACKUP_DIR` in the API environment so its monitoring endpoint can see the result. Alert on failed scheduler runs, `/api/health` HTTP 503, disk status `warning`/`critical`, or a backup older than `BACKUP_MAX_AGE_HOURS` (default 26 hours). Set `DISK_WARNING_PERCENT` and `DISK_CRITICAL_PERCENT` to tune thresholds (defaults 80% and 90%). Verify that the scheduler reports exit status and that snapshots contain both the SQLite database and `uploads/`; API-side monitoring cannot alert if the host itself is down or if the backup volume cannot record its own failure status.

## Persistence and security

The server creates `data/brushandbond.sqlite` on first start and does not seed sample records by default. Set `SEED_DEMO_DATA=true` only when you intentionally want sample artworks, events, artists, achievements, headline numbers, and team records (including in development). Review any database created by an earlier version before launch; sample records already stored there are preserved to avoid deleting administrator edits. Contact messages, membership applications, event registrations, likes, announcements, and admin edits are stored server-side. SQLite is configured for WAL journaling, full synchronous commits, and a 5-second lock wait. Uploaded artwork images are written to `uploads/`, separately from the database. Both directories must be on persistent storage and included in backups; both are ignored by Git.

Admin sessions use an HttpOnly, SameSite=Strict cookie and expire after 12 hours. Set `NODE_ENV=production` when serving over HTTPS so the cookie is marked Secure. The admin API is disabled until server credentials are configured. No demo account or client-side password is shipped.

Public contact submissions are limited to 5 per IP per 15 minutes, membership applications to 3 per IP per hour, and event registrations to 8 per IP per 15 minutes. Form fields have server-side length limits. Uploaded images are capped at 4 MB and 40 megapixels, with file-signature and dimension checks; JSON request bodies are capped at 6 MB. Rate limits are process-local, so keep the SQLite API to one instance; use a shared limiter store if the service is later scaled horizontally.

SQLite easily handles this site's expected scale, including 100+ people and their form records. Image storage is bounded by the hosting disk, not by SQLite: each uploaded image can be up to 4 MB, so 100 images could use up to about 400 MB before backup copies and filesystem overhead. Choose persistent storage with room for growth and monitor available disk space.

For production deployment, build the frontend with `npm run build` and run the API with `npm run api`. Set `NODE_ENV=production`, `HOST=0.0.0.0` (the production default), `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 16 characters. Production startup requires absolute `DATABASE_PATH` and `UPLOADS_DIR` values; mount a persistent disk at those paths or startup will stop with a configuration error. Set the host-provided `PORT` when required.

Run exactly one API instance while using SQLite, and back up the database and uploads together. To create a complete local snapshot, stop the API first, then run `npm run backup -- /absolute/path/to/backups`; a completed snapshot contains a `BACKUP_COMPLETE` marker. Copy it to storage independent of the application host and periodically verify restoration. A persistent application disk protects data across restarts, while a separate backup protects it from disk loss or accidental deletion. Restrict access to backups because they contain personal information; encrypt them when stored offsite. The `/uploads/` route serves artwork publicly; contact messages, membership applications, registrations, and admin records are available through authenticated admin endpoints. Put the API behind an HTTPS reverse proxy and route `/api` and `/uploads` to it on the same site origin as the frontend. The proxy/host must terminate TLS; `NODE_ENV=production` marks admin cookies Secure. Do not expose the Vite development server to the public internet.

## Commands

- `npm run dev` — Vite development frontend
- `npm run api` — persistent API server on port 3002
- `npm run build` — TypeScript and production frontend build
- `npm run lint` — Oxlint
