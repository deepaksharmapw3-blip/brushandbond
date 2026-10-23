-- Public campus archive submissions are written only through the rate-limited
-- public-submission Edge Function. Records stay private until an admin approves.
create table if not exists public.campus_art_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_name text not null check (char_length(contributor_name) between 2 and 100),
  email text,
  batch_year text,
  department text not null check (char_length(department) between 2 and 120),
  title text not null check (char_length(title) between 2 and 180),
  approximate_year text not null check (char_length(approximate_year) between 1 and 32),
  location text,
  description text not null check (char_length(description) between 10 and 3000),
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists campus_art_contributions_status_created_idx
  on public.campus_art_contributions(status, created_at desc);

alter table public.campus_art_contributions enable row level security;
revoke all privileges on table public.campus_art_contributions from public, anon, authenticated;
grant select, update, delete on table public.campus_art_contributions to authenticated;
grant all privileges on table public.campus_art_contributions to service_role;

-- The public can read only approved records, and cannot query contributor email.
grant select (
  id, contributor_name, batch_year, department, title, approximate_year,
  location, description, image_url, created_at
) on public.campus_art_contributions to anon;

drop policy if exists campus_art_public_read_approved on public.campus_art_contributions;
create policy campus_art_public_read_approved
  on public.campus_art_contributions for select to anon, authenticated
  using (status = 'approved');

drop policy if exists campus_art_staff_manage on public.campus_art_contributions;
create policy campus_art_staff_manage
  on public.campus_art_contributions for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Permit the new public form scope in the existing atomic IP rate limiter.
create or replace function public.consume_public_form_rate_limit(
  p_form_scope text,
  p_client_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_form_scope not in ('contact', 'membership', 'event-registration', 'artwork-like', 'campus-art-contribution')
     or p_client_key !~ '^[0-9a-f]{64}$'
     or p_limit < 1 or p_limit > 100
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit request.' using errcode = '22023';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.public_form_rate_limits (form_scope, client_key, window_started, request_count)
  values (p_form_scope, p_client_key, v_window, 1)
  on conflict (form_scope, client_key, window_started)
  do update set request_count = least(public.public_form_rate_limits.request_count + 1, p_limit + 1)
  returning request_count into v_count;

  if random() < 0.01 then
    delete from public.public_form_rate_limits
    where window_started < clock_timestamp() - interval '2 days';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all privileges on function public.consume_public_form_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_form_rate_limit(text, text, integer, integer)
  to service_role;

notify pgrst, 'reload schema';
