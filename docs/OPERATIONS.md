# Operations: monitoring and backups

## 1. Uptime monitoring (automated in this repo)
`.github/workflows/uptime.yml` checks `/` and `/api/health` every 15 minutes.
1. GitHub repo > Settings > Secrets and variables > Actions > **Variables** > New: `SITE_URL` = `https://brushandbond.gcect.ac.in` (or the live URL).
2. GitHub > profile > Settings > Notifications > enable "Actions" email notifications for failed workflows.
Scheduled runs can be delayed by several minutes; for faster alerts also add a free UptimeRobot/Better Stack monitor on the same two URLs.

## 2. Supabase backups (dashboard)
1. Supabase > Project > Database > **Backups**. Free plan: no managed backups. Pro plan: daily backups (7 days). Enable **Point in Time Recovery** (paid add-on) for finer restore.
2. Storage (uploaded artwork) is NOT included in database backups. Periodically download the bucket or copy it with the Supabase CLI.
3. Optional manual dump (store somewhere private and encrypted; it contains personal data, so never commit it or use a public repo's artifacts):
   `supabase db dump --db-url "$DATABASE_URL" -f backup.sql`
4. Test a restore into a scratch project at least once.

## 3. Error monitoring (Sentry, optional)
1. Create a free Sentry project (React) and copy the DSN.
2. `npm i @sentry/react`, then in `src/main.tsx` call `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })` before rendering.
3. Add `VITE_SENTRY_DSN` to the host's environment variables and add `https://*.sentry.io https://*.ingest.sentry.io` to `connect-src` in `netlify.toml` and `vercel.json`, or the CSP will block reports.
4. Also check Supabase > Logs (Edge Functions and Postgres) after launch.
