-- Initial Supabase schema for Brush and Bond.
-- Apply with `supabase db push` (or run this file in the Supabase SQL Editor).
-- Public-facing records are readable only when published/active. Submitted
-- personal data is never publicly readable.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default gen_random_uuid()::text,
  name text not null,
  batch text,
  department text,
  batch_year integer,
  role text,
  bio text,
  quote text,
  interview jsonb not null default '[]'::jsonb,
  photo_url text,
  statement text,
  specialties jsonb not null default '[]'::jsonb,
  avatar_url text,
  "avatarUrl" text,
  joined_year integer,
  "joinedYear" integer,
  handle text,
  is_spotlight boolean not null default false,
  "isSpotlight" boolean not null default false,
  spotlight_month date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default gen_random_uuid()::text,
  accession_no text unique,
  "accessionNo" text,
  title text not null,
  artist_id uuid references public.artists(id) on delete set null,
  "artistId" uuid,
  artist_name text,
  "artistName" text,
  artist_dept text,
  "artistDept" text,
  department text,
  year integer,
  art_year integer,
  category text not null,
  width integer,
  height integer,
  alt text,
  medium text,
  dimensions text,
  description text,
  curator_note text,
  "curatorNote" text,
  image_url text,
  "imageUrl" text,
  tags jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  likes integer not null default 0 check (likes >= 0),
  views integer not null default 0 check (views >= 0),
  physical_location text,
  "physicalLocation" text,
  event_title text,
  "eventTitle" text,
  event_slug text,
  "eventSlug" text,
  artist_slug text,
  "artistSlug" text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists artworks_artist_id_idx on public.artworks(artist_id);
create index if not exists artworks_category_created_idx on public.artworks(category, created_at desc);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default gen_random_uuid()::text,
  title text,
  event_name text,
  tagline text,
  date date,
  event_date date,
  time text,
  event_time text,
  venue text,
  location text,
  category text,
  type text,
  status text not null default 'upcoming' check (status in ('upcoming','open','concluded','past')),
  registration_open boolean not null default false,
  "registrationOpen" boolean,
  capacity integer,
  "capacityValue" integer,
  max_capacity integer,
  registered_count integer not null default 0 check (registered_count >= 0),
  "registeredCount" integer,
  description text,
  curator text,
  materials_provided jsonb not null default '[]'::jsonb,
  "materialsProvided" jsonb,
  guidelines jsonb not null default '[]'::jsonb,
  image_url text,
  "imageUrl" text,
  banner_url text,
  cover_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  "galleryImages" jsonb,
  participant_artwork_ids jsonb not null default '[]'::jsonb,
  "participantArtworkIds" jsonb,
  winners jsonb not null default '[]'::jsonb,
  is_past boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (capacity is null or capacity >= 0),
  check (max_capacity is null or max_capacity >= 0)
);
create index if not exists events_date_idx on public.events(event_date);

create table if not exists public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  department text,
  year text,
  roll_number text,
  experience_level text,
  notes text,
  created_at timestamptz not null default now(),
  unique(event_id, email)
);
create index if not exists event_registrations_event_created_idx on public.event_registrations(event_id, created_at desc);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  full_name text,
  email text not null,
  department text not null,
  year text,
  roll_number text,
  interest text,
  primary_wing text,
  experience_summary text,
  portfolio text,
  portfolio_url text,
  reason text,
  motivation text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists membership_applications_created_idx on public.membership_applications(created_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  role text,
  department text,
  batch text,
  tier text not null default 'executive' check (tier in ('faculty','executive','lead','member')),
  role_title text,
  bio text,
  quote text,
  avatar_url text,
  "avatarUrl" text,
  photo_url text,
  join_year integer,
  instagram text,
  linkedin text,
  handle text,
  instagram_url text,
  "instagramUrl" text,
  linkedin_url text,
  "linkedinUrl" text,
  responsibilities jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  "displayOrder" integer,
  is_lead boolean not null default false,
  "isLead" boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists team_members_name_unique_idx on public.team_members(name);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  award text,
  event text,
  date text,
  year text,
  category text,
  badge text,
  description text,
  organizer text,
  significance text,
  image_url text,
  "imageUrl" text,
  photo_url text,
  metrics text,
  achieved_on date,
  created_at timestamptz not null default now()
);
create unique index if not exists achievements_title_unique_idx on public.achievements(title);

create table if not exists public.site_stats (
  key text primary key,
  value numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  text text,
  link text,
  category text,
  is_pinned boolean not null default false,
  "isPinned" boolean not null default false,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists announcements_text_unique_idx on public.announcements(text);

-- An admin profile must be provisioned explicitly after creating the user in
-- Supabase Auth. No trigger promotes new signups to staff.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
$$;
revoke all on function public.is_staff() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

do $$ declare t text; begin
  foreach t in array array['artists','artworks','events','event_photos','team_members','announcements','achievements','site_stats','membership_applications','event_registrations','contact_messages'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  alter table public.profiles enable row level security;
end $$;

-- Make this migration safe to reapply in the SQL Editor as well as through CLI.
do $$ declare t text; begin
  foreach t in array array['artists','artworks','events','event_photos','team_members','announcements','achievements','site_stats','membership_applications','event_registrations','contact_messages'] loop
    execute format('drop policy if exists staff_manage_%1$s on public.%1$I', t);
    execute format('create policy staff_manage_%1$s on public.%1$I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;
drop policy if exists read_own_profile on public.profiles;
create policy read_own_profile on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists admin_manage_profiles on public.profiles;
create policy admin_manage_profiles on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_read_artists on public.artists;
create policy public_read_artists on public.artists for select to anon, authenticated using (is_published);
drop policy if exists public_read_artworks on public.artworks;
create policy public_read_artworks on public.artworks for select to anon, authenticated using (is_published);
drop policy if exists public_read_events on public.events;
create policy public_read_events on public.events for select to anon, authenticated using (is_published);
drop policy if exists public_read_event_photos on public.event_photos;
create policy public_read_event_photos on public.event_photos for select to anon, authenticated using (true);
drop policy if exists public_read_team on public.team_members;
create policy public_read_team on public.team_members for select to anon, authenticated using (is_active);
drop policy if exists public_read_announcements on public.announcements;
create policy public_read_announcements on public.announcements for select to anon, authenticated using (active and (expires_at is null or expires_at > now()));
drop policy if exists public_read_achievements on public.achievements;
create policy public_read_achievements on public.achievements for select to anon, authenticated using (true);
drop policy if exists public_read_stats on public.site_stats;
create policy public_read_stats on public.site_stats for select to anon, authenticated using (true);

drop policy if exists public_apply on public.membership_applications;
create policy public_apply on public.membership_applications for insert to anon, authenticated with check (
  status = 'pending' and char_length(name) between 2 and 100
  and char_length(email) between 5 and 254 and position('@' in email) > 1
  and char_length(coalesce(reason, '')) <= 1000
);
drop policy if exists public_register on public.event_registrations;
create policy public_register on public.event_registrations for insert to anon, authenticated with check (
  exists (select 1 from public.events e where e.id = event_id and e.registration_open and e.is_published)
  and char_length(name) between 2 and 100
  and char_length(email) between 5 and 254 and position('@' in email) > 1
);
drop policy if exists public_contact on public.contact_messages;
create policy public_contact on public.contact_messages for insert to anon, authenticated with check (
  char_length(name) between 2 and 100
  and char_length(email) between 5 and 254 and position('@' in email) > 1
  and char_length(message) between 5 and 2000
);

-- Media is intentionally public. Write operations remain admin-only.
insert into storage.buckets (id, name, public)
values ('artworks','artworks',true), ('events','events',true), ('artists','artists',true), ('team','team',true)
on conflict (id) do update set public = excluded.public;
drop policy if exists public_read_media on storage.objects;
create policy public_read_media on storage.objects for select to anon, authenticated using (bucket_id in ('artworks','events','artists','team'));
drop policy if exists staff_insert_media on storage.objects;
create policy staff_insert_media on storage.objects for insert to authenticated with check (bucket_id in ('artworks','events','artists','team') and public.is_staff());
drop policy if exists staff_update_media on storage.objects;
create policy staff_update_media on storage.objects for update to authenticated using (bucket_id in ('artworks','events','artists','team') and public.is_staff()) with check (bucket_id in ('artworks','events','artists','team') and public.is_staff());
drop policy if exists staff_delete_media on storage.objects;
create policy staff_delete_media on storage.objects for delete to authenticated using (bucket_id in ('artworks','events','artists','team') and public.is_staff());

-- PostgREST must refresh its schema cache after the new tables/relationships.
notify pgrst, 'reload schema';
