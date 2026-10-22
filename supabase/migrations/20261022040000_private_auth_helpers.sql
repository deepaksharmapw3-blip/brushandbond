-- Move the RLS helper functions out of the API-exposed `public` schema.
--
-- Policies run as the calling role, so `authenticated` still needs EXECUTE on
-- the helpers. Putting them in `private` (which is NOT listed in
-- supabase/config.toml [api].schemas) keeps them usable inside policies while
-- removing them from the PostgREST RPC surface (`/rest/v1/rpc/is_admin`).

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
$$;

revoke all on function private.is_staff() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Repoint every policy (any schema, including storage.objects) from
-- public.is_staff()/is_admin() to the private versions. Idempotent: already
-- repointed policies are not matched again.
do $$
declare
  p record;
  pattern constant text := '(^|[^A-Za-z_.])(public\.)?is_(staff|admin)\(\)';
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where coalesce(qual, '') ~ pattern
       or coalesce(with_check, '') ~ pattern
  loop
    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then
      stmt := stmt || ' using (' || regexp_replace(p.qual, pattern, '\1private.is_\3()', 'g') || ')';
    end if;
    if p.with_check is not null then
      stmt := stmt || ' with check (' || regexp_replace(p.with_check, pattern, '\1private.is_\3()', 'g') || ')';
    end if;
    execute stmt;
  end loop;
end
$$;

-- No CASCADE on purpose: if anything still depends on the old functions, this
-- fails and the whole migration rolls back instead of silently dropping it.
drop function public.is_staff();
drop function public.is_admin();

-- Trigger-only function: nobody should be able to execute it directly.
revoke all on function public.sync_event_registration_count() from public, anon, authenticated;

notify pgrst, 'reload schema';
