-- Private, server-mediated likes. Visitors can toggle their own local UUID
-- only through the RPC; the visitor UUID table is never exposed via PostgREST.

create table if not exists public.artwork_likes (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (artwork_id, visitor_id)
);

-- Older setup scripts stored UUID strings as text. Preserve valid rows and
-- discard malformed visitor identifiers before enforcing the UUID type.
do $$
declare
  visitor_data_type text;
begin
  select data_type into visitor_data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'artwork_likes'
    and column_name = 'visitor_id';

  if visitor_data_type = 'text' then
    delete from public.artwork_likes
    where visitor_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    alter table public.artwork_likes
      alter column visitor_id type uuid using visitor_id::uuid;
  end if;
end $$;

alter table public.artwork_likes enable row level security;

-- There are intentionally no direct visitor policies. Access to the table is
-- through the narrowly scoped function below; even visitor UUIDs stay private.
drop policy if exists public_insert_like on public.artwork_likes;
drop policy if exists public_delete_like on public.artwork_likes;
drop policy if exists public_read_likes on public.artwork_likes;
drop policy if exists staff_manage_likes on public.artwork_likes;
revoke all privileges on table public.artwork_likes from public, anon, authenticated;

drop function if exists public.toggle_artwork_like(uuid, text);
create or replace function public.toggle_artwork_like(
  p_artwork_id uuid,
  p_visitor_id uuid
)
returns table(likes integer, is_liked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer;
  v_likes integer;
  v_is_liked boolean;
begin
  if p_artwork_id is null or p_visitor_id is null then
    raise exception 'Artwork and visitor identifiers are required.' using errcode = '22023';
  end if;

  -- Serialize toggles for one artwork so the denormalized count stays correct.
  perform 1
  from public.artworks a
  where a.id = p_artwork_id and a.is_published
  for update;
  if not found then
    raise exception 'Artwork not found.' using errcode = 'P0002';
  end if;

  delete from public.artwork_likes l
  where l.artwork_id = p_artwork_id and l.visitor_id = p_visitor_id;
  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    v_is_liked := false;
    update public.artworks a
    set likes = greatest(a.likes - 1, 0)
    where a.id = p_artwork_id
    returning a.likes into v_likes;
  else
    insert into public.artwork_likes (artwork_id, visitor_id)
    values (p_artwork_id, p_visitor_id)
    on conflict (artwork_id, visitor_id) do nothing;
    get diagnostics v_rows = row_count;

    v_is_liked := v_rows > 0;
    if v_is_liked then
      update public.artworks a
      set likes = a.likes + 1
      where a.id = p_artwork_id
      returning a.likes into v_likes;
    else
      select a.likes into v_likes
      from public.artworks a
      where a.id = p_artwork_id;
    end if;
  end if;

  return query select v_likes, v_is_liked;
end;
$$;

revoke all privileges on function public.toggle_artwork_like(uuid, uuid) from public, anon, authenticated;
grant execute on function public.toggle_artwork_like(uuid, uuid) to anon, authenticated;

notify pgrst, 'reload schema';
