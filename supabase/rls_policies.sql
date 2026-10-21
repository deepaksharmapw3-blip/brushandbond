-- ============================================================
-- Brush and Bond — RLS Policies
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Helper functions
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  -- For now, admin is the only role allowed to manage records. Add other
  -- trusted roles explicitly here only after defining their permissions.
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
$$;

-- These helpers are used by authenticated policies; callers without an
-- authenticated JWT must not be able to invoke them directly.
revoke all on function public.is_staff() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Enable RLS + admin full-access policy on every content table
do $$
declare t text;
begin
  foreach t in array array[
    'artists','artworks','events','event_photos','team_members','announcements',
    'achievements','site_stats','membership_applications','event_registrations',
    'contact_messages'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy staff_manage_%1$s on %1$I for all to authenticated
       using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

-- Profiles table
alter table profiles enable row level security;
create policy read_own_profile on profiles for select to authenticated using (id = auth.uid());
create policy admin_manage_profiles on profiles for all to authenticated using (is_admin()) with check (is_admin());

-- Public read policies
create policy public_read_artists       on artists      for select using (is_published);
create policy public_read_artworks      on artworks     for select using (is_published);
create policy public_read_events        on events       for select using (is_published);
create policy public_read_event_photos  on event_photos for select using (true);
create policy public_read_team         on team_members  for select using (is_active);
create policy public_read_announcements on announcements for select
  using (active and (expires_at is null or expires_at > now()));
create policy public_read_achievements  on achievements for select using (true);
create policy public_read_stats         on site_stats   for select using (true);

-- Visitor insert-only policies (cannot read back)
create policy public_apply on membership_applications for insert to anon, authenticated
  with check (
    status = 'pending'
    and char_length(name) between 2 and 100
    and char_length(email) between 5 and 254 and position('@' in email) > 1
    and char_length(coalesce(reason, '')) <= 1000
  );

create policy public_register on event_registrations for insert to anon, authenticated
  with check (
    exists (select 1 from events e where e.id = event_id and e.registration_open and e.is_published)
    and char_length(name) between 2 and 100
    and char_length(email) between 5 and 254 and position('@' in email) > 1
  );

create policy public_contact on contact_messages for insert to anon, authenticated
  with check (
    char_length(name) between 2 and 100
    and char_length(email) between 5 and 254 and position('@' in email) > 1
    and char_length(message) between 5 and 2000
  );

-- ============================================================
-- Storage buckets (run once)
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('artworks','artworks',true), ('events','events',true),
  ('artists','artists',true),  ('team','team',true)
on conflict (id) do nothing;

create policy public_read_media on storage.objects for select
  using (bucket_id in ('artworks','events','artists','team'));

create policy staff_insert_media on storage.objects for insert to authenticated
  with check (bucket_id in ('artworks','events','artists','team') and is_staff());

create policy staff_update_media on storage.objects for update to authenticated
  using (bucket_id in ('artworks','events','artists','team') and is_staff());

create policy staff_delete_media on storage.objects for delete to authenticated
  using (bucket_id in ('artworks','events','artists','team') and is_staff());
