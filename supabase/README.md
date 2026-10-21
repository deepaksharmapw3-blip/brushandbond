# Supabase setup

The files in `migrations/` are the canonical database setup. They create the
tables, constraints, foreign keys, indexes, row-level security policies, and
public media buckets used by the frontend. Migration filenames are ordered;
apply all of them, not just `rls_policies.sql`.

## Fresh project with the Supabase CLI

1. Create a Supabase project and install the Supabase CLI.
2. From the repository root, run `supabase login` and
   `supabase link --project-ref YOUR_PROJECT_REF`.
3. Apply the complete schema: `supabase db push`.
4. In Supabase Auth settings, keep public sign-ups disabled. Create the admin
   account yourself in the dashboard under **Authentication → Users**.
5. Copy that user's UUID, then provision the explicit admin profile in the SQL
   Editor (replace the UUID and name):

   ```sql
   insert into public.profiles (id, full_name, role)
   values ('00000000-0000-0000-0000-000000000000', 'Site Administrator', 'admin')
   on conflict (id) do update set full_name = excluded.full_name, role = 'admin';
   ```

6. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the frontend hosting
   environment, then build and deploy the frontend.

If importing records from the older Render API, use the separate migration
script with `SUPABASE_SERVICE_ROLE_KEY` in a local, untracked `.env.local`.
That key bypasses RLS and must never be added to a `VITE_*` variable or hosted
frontend environment. The migration script is an administrative one-off task.

The browser anon key is expected to be public; RLS is the security boundary.
Never put a Supabase service-role key in frontend variables or source control.
Admin permissions come only from an explicitly provisioned
`profiles.role = 'admin'` row. Creating a profile alone does not make an account
an administrator.

## SQL Editor alternative

If not using the CLI, run every `supabase/migrations/*.sql` file in filename
order in the Supabase SQL Editor. Do not apply `rls_policies.sql` afterwards:
it is the older policy-only script and the migration already installs those
policies alongside the schema. Keep the migration files committed so later
projects receive the same database structure.

## Data shape notes

Relationships are enforced with foreign keys: artwork-to-artist,
event-photo-to-event, and registration-to-event. Visitor roles can only insert
contact messages, membership applications, and event registrations. Admin
records require an authenticated administrator. Artwork/event/artist/team
images use public storage buckets by design; personal submissions are not
publicly readable.
