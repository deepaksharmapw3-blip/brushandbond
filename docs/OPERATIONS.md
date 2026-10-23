# Operations: monitoring and backups

## 1. Uptime monitoring (automated in this repo)
`.github/workflows/uptime.yml` checks `/` and `/api/health` every 15 minutes.
1. GitHub repo > Settings > Secrets and variables > Actions > **Variables** > New: `SITE_URL` = `https://brushandbond.gcect.ac.in` (or the live URL).
2. GitHub > profile > Settings > Notifications > enable "Actions" email notifications for failed workflows.
Scheduled runs can be delayed by several minutes; for faster alerts also add a free UptimeRobot/Better Stack monitor on the same two URLs.

## 2. Supabase backups (Free plan)

Supabase Free does not provide downloadable managed database backups. The
`Supabase off-site backup` GitHub Actions workflow in this repository makes a
daily logical database dump, downloads every Storage object, verifies each
file with SHA-256, encrypts the archive with AES-256-GCM, and stores only the
encrypted artifact in GitHub Actions for 30 days. The repository is public, so
plaintext backup data and encryption keys must never be committed or uploaded.

### Enable automated backups

In GitHub, open **Settings → Secrets and variables → Actions → New repository
secret** and add these four secrets:

| Secret | Value |
| --- | --- |
| `SUPABASE_DB_URL` | Production project's Session Pooler connection string from Supabase **Connect**. Include the database password; URL-encode special characters in it. |
| `SUPABASE_URL` | `https://fxxolsjhlqlatwlqdwsq.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The production project's `service_role` secret key from Supabase **Settings → API Keys**. Treat it as highly privileged. |
| `BACKUP_ENCRYPTION_KEY` | A random 32-byte key encoded as 64 hex characters. Generate locally, save it in a password manager, and add it only as a GitHub secret. |

PowerShell key generation:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$key = [Convert]::ToHexString($bytes)
$key
```

After adding the secrets, run **Actions → Supabase off-site backup → Run
workflow** once. Confirm the run succeeds and has an artifact named
`brushandbond-supabase-backup-*`. Scheduled runs start daily at 02:17 UTC.
GitHub artifacts expire after 30 days, so download and retain an encrypted
copy somewhere else if you need longer retention. Keep the encryption key
separate from every copy of the encrypted artifact.

### Restore procedure

1. Download an encrypted artifact from **Actions → Supabase off-site backup**.
2. On a trusted machine with Node.js 24, set `BACKUP_ENCRYPTION_KEY` from your
   password manager and decrypt the `.enc` file:

   ```powershell
   node scripts/backup-crypto.mjs decrypt .\backup.tar.gz.enc .\backup.tar.gz
   tar -xzf .\backup.tar.gz
   ```

3. Install `psql`, set `TEST_DB_URL` to a new/empty destination project's
   Session Pooler connection string, then restore the SQL files in order. Never
   restore over production as a test:

   ```powershell
   psql --single-transaction --variable ON_ERROR_STOP=1 `
     --file .\backup\database\roles.sql `
     --file .\backup\database\schema.sql `
     --command 'SET session_replication_role = replica' `
     --file .\backup\database\data.sql `
     --dbname $env:TEST_DB_URL
   ```

   The backup excludes Storage object metadata; after the database restore, set
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the destination project
   and restore actual files and bucket settings:

   ```powershell
   node scripts/import-supabase-storage.mjs .\backup\storage
   ```

   This checks each file against its SHA-256 before upload. Run the row-count
   and image checks in `supabase/README.md` against the restored project. A
   restore is verified only when database counts and representative Storage
   files match the selected backup.

Database credentials, Storage service keys, and backup encryption keys must
never be pasted into chat or written into repository files. The workflow is
not active until all four GitHub secrets are configured and its first run
succeeds.

## 3. Error monitoring (Sentry, optional)
1. Create a free Sentry project (React) and copy the DSN.
2. `npm i @sentry/react`, then in `src/main.tsx` call `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })` before rendering.
3. Add `VITE_SENTRY_DSN` to the host's environment variables and add `https://*.sentry.io https://*.ingest.sentry.io` to `connect-src` in `netlify.toml` and `vercel.json`, or the CSP will block reports.
4. Also check Supabase > Logs (Edge Functions and Postgres) after launch.
