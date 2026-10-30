-- Keep community Gallery artwork private until an admin reviews it, then
-- publish the artwork and update its moderation record in one transaction.
alter table public.campus_art_contributions
  add column if not exists submission_type text not null default 'campus-record'
    check (submission_type in ('campus-record', 'gallery-artwork')),
  add column if not exists category text,
  add column if not exists medium text,
  add column if not exists artwork_id uuid references public.artworks(id) on delete set null;

alter table public.campus_art_contributions
  drop constraint if exists campus_art_contributions_gallery_fields_check;
alter table public.campus_art_contributions
  add constraint campus_art_contributions_gallery_fields_check check (
    submission_type <> 'gallery-artwork'
    or (
      category in ('sketches', 'paintings', 'digital-art', 'photography', 'calligraphy', 'doodles')
      and char_length(coalesce(medium, '')) between 2 and 120
      and image_url is not null
      and char_length(approximate_year) = 4
      and approximate_year ~ '^[0-9]{4}$'
    )
  );

create index if not exists campus_art_contributions_type_status_created_idx
  on public.campus_art_contributions(submission_type, status, created_at desc);

-- Public reads may see only approved rows and never the contributor's email.
grant select (submission_type) on public.campus_art_contributions to anon;

-- Storage policies need to check approval state without granting the public
-- direct access to moderation rows or contributor email addresses. This helper
-- only answers whether a narrowly shaped artwork image path is approved.
create or replace function private.is_approved_gallery_submission_image(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_object_name ~ '^gallery-submissions/[0-9a-f-]+\.(jpg|png|webp)$' then exists (
      select 1
      from public.campus_art_contributions c
      where c.submission_type = 'gallery-artwork'
        and c.status = 'approved'
        and c.image_url like ('%/object/public/artworks/' || p_object_name)
    )
    else false
  end
$$;
revoke all on function private.is_approved_gallery_submission_image(text) from public, anon, authenticated;
grant usage on schema private to anon;
grant execute on function private.is_approved_gallery_submission_image(text) to anon, authenticated;

-- Submitted images stay inaccessible until their contribution is approved.
drop policy if exists public_read_media on storage.objects;
create policy public_read_media
  on storage.objects for select to anon, authenticated
  using (
    bucket_id in ('artworks', 'events', 'artists', 'team')
    and not (bucket_id = 'artworks' and name like 'campus-contributions/%')
    and (
      bucket_id <> 'artworks'
      or name not like 'gallery-submissions/%'
      or (select private.is_approved_gallery_submission_image(storage.objects.name))
    )
  );

drop policy if exists staff_read_gallery_submission_media on storage.objects;
create policy staff_read_gallery_submission_media
  on storage.objects for select to authenticated
  using (
    bucket_id = 'artworks'
    and name like 'gallery-submissions/%'
    and (select private.is_staff())
  );

-- Include Gallery artwork in the existing per-IP public form limiter.
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
  if p_form_scope not in ('contact', 'membership', 'event-registration', 'artwork-like', 'campus-art-contribution', 'artwork-submission')
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

-- Invoker rights preserve RLS. The admin review and Gallery publication happen
-- together, so a failed approval cannot leave a visible or orphaned artwork.
create or replace function public.review_public_contribution(
  p_submission_id uuid,
  p_status text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_submission public.campus_art_contributions%rowtype;
  v_artwork_id uuid;
  v_year integer;
begin
  if not (select private.is_staff()) then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('approved', 'rejected') then
    raise exception 'Invalid review status.' using errcode = '22023';
  end if;

  select * into v_submission
  from public.campus_art_contributions
  where id = p_submission_id
  for update;
  if not found then
    raise exception 'Submission not found.' using errcode = 'P0002';
  end if;

  if v_submission.submission_type = 'gallery-artwork' and p_status = 'approved' then
    v_artwork_id := coalesce(v_submission.artwork_id, v_submission.id);
    v_year := v_submission.approximate_year::integer;
    insert into public.artworks (
      id, slug, title, artist_name, artist_dept, year, art_year, category,
      medium, description, image_url, is_published
    ) values (
      v_artwork_id,
      'community-submission-' || v_submission.id::text,
      v_submission.title,
      v_submission.contributor_name,
      v_submission.department || case when v_submission.batch_year is null then '' else ' · ' || v_submission.batch_year end,
      v_year,
      v_year,
      v_submission.category,
      v_submission.medium,
      v_submission.description,
      v_submission.image_url,
      true
    )
    on conflict (id) do update set
      title = excluded.title,
      artist_name = excluded.artist_name,
      artist_dept = excluded.artist_dept,
      year = excluded.year,
      art_year = excluded.art_year,
      category = excluded.category,
      medium = excluded.medium,
      description = excluded.description,
      image_url = excluded.image_url,
      is_published = true,
      updated_at = now();

    update public.campus_art_contributions
    set status = 'approved', artwork_id = v_artwork_id, reviewed_at = now(), updated_at = now()
    where id = v_submission.id;
  else
    update public.campus_art_contributions
    set status = p_status, reviewed_at = now(), updated_at = now()
    where id = v_submission.id;
    if v_submission.artwork_id is not null then
      update public.artworks set is_published = false, updated_at = now()
      where id = v_submission.artwork_id;
    end if;
  end if;
end;
$$;

revoke all privileges on function public.review_public_contribution(uuid, text) from public, anon;
grant execute on function public.review_public_contribution(uuid, text) to authenticated;

notify pgrst, 'reload schema';
