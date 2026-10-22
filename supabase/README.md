# Supabase setup

The hosted project runs PostgreSQL 17; `config.toml` uses the same major
version for local Supabase development. Keep these aligned when changing the
hosted database major version, and review the configuration diff before
running `supabase config push` against a linked hosted project.

The files in `migrations/` are the canonical database setup. They create the
tables, constraints, foreign keys, indexes, row-level security policies, and
public media buckets used by the frontend. Migration filenames are ordered;
apply all of them, not just `rls_policies.sql`.
Artwork likes are included in `20261021010000_artwork_likes_privacy.sql`.
It exposes only the `toggle_artwork_like` RPC to visitors; direct table reads
and writes are revoked so visitor identifiers remain private. Existing Supabase
projects must apply this migration as well as fresh projects.

RLS helper functions (`is_staff`, `is_admin`) live in the `private` schema
(`20261022040000_private_auth_helpers.sql`). That schema is intentionally not
listed in `config.toml` `[api].schemas`, so the helpers work inside policies but
are not callable as RPCs.

The `public-submission` function only accepts browser requests from the
production site (`https://brushandbond.gcect.ac.in` and its `www` host) and local
dev servers. To allow another origin, add its exact URL to the allowlist in
`supabase/functions/public-submission/origin-policy.mjs`, then redeploy the
function. Avoid wildcards for shared hosts like `*.netlify.app`, since anyone
can host a site there.

## Fresh project with the Supabase CLI

1. Create a Supabase project and install the Supabase CLI.
2. From the repository root, run `supabase login` and
   `supabase link --project-ref YOUR_PROJECT_REF`.
3. Apply the complete schema: `supabase db push`.
4. Apply the checked-in Auth configuration to the hosted project:
   `supabase config push`. This disables public and anonymous sign-ups; only
   administrator accounts you create explicitly can sign in.
5. Deploy the public form endpoint: `supabase functions deploy public-submission`.
   It uses the Supabase-provided `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` function secrets. Public contact, membership,
   and event-registration inserts are accepted only through this endpoint;
   it applies persistent per-IP limits (5 contact messages per 15 minutes,
   3 membership applications per hour, and 8 event registrations per 15 minutes).
6. Create the admin account yourself in the dashboard under
   **Authentication → Users**.
7. Copy that user's UUID, then provision the explicit admin profile in the SQL
   Editor (replace the UUID and name):

   ```sql
   insert into public.profiles (id, full_name, role)
   values ('00000000-0000-0000-0000-000000000000', 'Site Administrator', 'admin')
   on conflict (id) do update set full_name = excluded.full_name, role = 'admin';
   ```

8. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend hosting
   environment, then build and deploy the frontend.

## Existing Supabase project: preflight before applying migrations

Do not run `supabase db push` against a non-empty project until its remote
migration history and actual schema have been inspected. Git migration files
and `supabase_migrations.schema_migrations` are separate records;
`CREATE TABLE IF NOT EXISTS` does not reconcile missing columns in a table that
already exists.

1. Back up the project and link the intended project:
   `supabase link --project-ref YOUR_PROJECT_REF`.
2. Compare local and hosted migration history:
   `supabase migration list --linked`.
3. In the Supabase SQL Editor, inspect the hosted history and relevant columns:

   ```sql
   select version from supabase_migrations.schema_migrations order by version;

   select table_name, column_name, data_type
   from information_schema.columns
   where table_schema = 'public'
     and table_name in (
       'artworks', 'artwork_likes', 'events', 'event_registrations',
       'membership_applications', 'contact_messages', 'public_form_rate_limits'
     )
   order by table_name, ordinal_position;
   ```

4. If the hosted schema was created manually and the migration history is
   empty or incomplete, first capture and compare the live schema with
   `supabase db pull`. Do not mark the initial migration applied unless every
   object it creates has been verified. Use
   `supabase migration repair <VERSION> --status applied` only when the
   corresponding migration is already fully present on the remote database;
   repair changes history only and does not execute SQL.
5. Review `supabase db push --dry-run`. Resolve any history or schema mismatch
   before applying. Once the remote state matches the expected baseline, run
   `supabase db push` to apply only pending migrations.

The forward migration `20261021030000_existing_table_reconciliation.sql`
repairs missing columns and constraints in the likes and rate-limit tables
created by the preceding migrations. It preserves valid rows and raises an
explanatory error instead of guessing when existing values cannot be converted
safely. It does not make an unknown legacy schema safe to migrate without this
preflight; review the dry run and the actual schema first.

If importing records from the older Render API, use the separate migration
script with `SUPABASE_SERVICE_ROLE_KEY` in a local, untracked `.env.local`.
That key bypasses RLS and must never be added to a `VITE_*` variable or hosted
frontend environment. The migration script is an administrative one-off task.

The browser anon key is expected to be public; RLS is the security boundary.
Never put a Supabase service-role key in frontend variables or source control.
Admin permissions come only from an explicitly provisioned
`profiles.role = 'admin'` row. Creating a profile alone does not make an account
an administrator.

## Production verification checklist

Before calling a deployment production-ready, verify the hosted project rather
than relying on local configuration:

- In the SQL Editor, confirm that the intended administrator's Auth user UUID
  has exactly an explicit admin profile:

  ```sql
  select u.id, u.email, p.role
  from auth.users u
  left join public.profiles p on p.id = u.id
  where lower(u.email) = lower('ADMIN_EMAIL_HERE');
  ```

  The result must be the expected user and `role = 'admin'`. If it is missing,
  use the provisioning procedure above. Do not grant admin by changing the
  client-side auth state.
- Verify backup recovery separately from backup creation: obtain a current
  backup using the hosted project's supported backup/export mechanism, restore
  it into an isolated test project, then verify expected tables, representative
  records, and required Storage objects. Do not test a restore over production.
  Record when the restore test succeeded and repeat it periodically.
- Verify the hosted database major version in the Supabase dashboard before
  running `supabase config push`; `config.toml` does not prove the hosted
  project's version or backup health.

### Recovery drill: isolated Supabase project

This drill must not restore over the production project. Supabase's
**Restore to a new project** workflow restores database contents, but Storage
objects and settings need separate handling. Database backups alone do not
contain the actual Storage files.

1. In the production project's **Database → Backups**, select a recent backup
   and use **Restore to a new project** if that option is available. Give the
   destination a clearly recognizable test name. If using a manual backup,
   restore it only into a newly created test project, following Supabase's
   current backup/restore guide. Do not paste database passwords or service
   role keys into chat or commit them.
2. Before the restore, record source counts in the production SQL Editor, then
   run the same query against the test project's SQL Editor after restore:

   ```sql
   select 'artworks' as table_name, count(*) as row_count from public.artworks
   union all select 'artists', count(*) from public.artists
   union all select 'events', count(*) from public.events
   union all select 'event_photos', count(*) from public.event_photos
   union all select 'event_registrations', count(*) from public.event_registrations
   union all select 'membership_applications', count(*) from public.membership_applications
   union all select 'contact_messages', count(*) from public.contact_messages
   union all select 'team_members', count(*) from public.team_members
   union all select 'achievements', count(*) from public.achievements
   union all select 'artwork_likes', count(*) from public.artwork_likes
   order by table_name;
   ```

   Counts should match the selected backup point. The test project can
   legitimately differ from today's production if submissions happened after
   that backup was taken. Check a few representative rows and foreign-key
   relationships as well; avoid copying personal submission data to a test
   project unless it is access-controlled and then deleted after the drill.
3. In **Storage → Files**, list the production buckets and record the object
   counts. Recreate the required buckets and their public/private settings in
   the test project, then copy the actual objects using Supabase's documented
   CLI or S3-compatible migration method. Compare per-bucket object counts and
   open representative artwork/event images using the test project's URLs.
   Restored `storage.objects` metadata alone does not prove that the file bytes
   are present.
4. Point a local/test frontend at the test project's URL and anon key only.
   Verify a public image loads and an admin-only operation remains denied to an
   unauthenticated user. Do not point the production frontend at the test
   project.
5. Record source backup timestamp, restore completion time, table and bucket
   count comparisons, image checks, and any failures. Delete the test project
   and local backup files securely when they are no longer needed.

## SQL Editor alternative

If not using the CLI, run every `supabase/migrations/*.sql` file in filename
order in the Supabase SQL Editor. Do not apply `rls_policies.sql` afterwards:
it is the older policy-only script and the migration already installs those
policies alongside the schema. Keep the migration files committed so later
projects receive the same database structure.
The Edge Function still needs deployment with the Supabase CLI; public form
submissions will fail closed until `public-submission` is deployed. Also link
the hosted project and run `supabase config push` so the repository's disabled
sign-up setting is applied to that project.

## Data shape notes

Relationships are enforced with foreign keys: artwork-to-artist,
event-photo-to-event, and registration-to-event. Visitor roles can only insert
contact messages, membership applications, and event registrations. Admin
records require an authenticated administrator. Artwork/event/artist/team
images use public storage buckets by design; personal submissions are not
publicly readable.

# Membership application email notifications

Admin approval and rejection actions call the `admin-application-status` Edge
Function. The function validates the Supabase session and admin profile,
sends the notification through Resend, then changes the application status.
If email delivery fails, the status remains pending so an admin can safely
retry. The function sends an idempotency key to Resend for retry protection.

Before using approval/rejection in production, configure these secrets in the
Supabase Dashboard under **Edge Functions → Secrets**:

- `RESEND_API_KEY`: a Resend API key with permission to send email.
- `RESEND_FROM_EMAIL`: a sender address on a domain verified with Resend, for
  example `Brush and Bond <notifications@example.org>`.
- `CLUB_EMAIL`: optional reply-to address (defaults to the club email).

For local development, copy `supabase/functions/.env.example` to
`supabase/functions/.env` and fill in test credentials. Do not commit that
file. Supabase CLI deployments can set the production values with
`supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL=...`.

Deploy the function with `supabase functions deploy admin-application-status`
and make sure the frontend build containing the function invocation is
deployed. The function authenticates its bearer token itself, so its config
sets `verify_jwt = false`; it still rejects requests without a valid Supabase
session and an `admin` profile.
