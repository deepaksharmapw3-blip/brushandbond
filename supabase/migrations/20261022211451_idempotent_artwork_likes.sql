-- Make like requests idempotent for each persistent browser identity. A
-- repeated request that asks for the current state must never flip it.
create or replace function public.set_artwork_like(
  p_artwork_id uuid,
  p_visitor_id uuid,
  p_is_liked boolean
)
returns table(likes integer, is_liked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer;
  v_likes integer;
begin
  if p_artwork_id is null or p_visitor_id is null or p_is_liked is null then
    raise exception 'Artwork, visitor, and like state are required.' using errcode = '22023';
  end if;

  -- Serialize updates for this artwork so its denormalized count stays exact.
  perform 1
  from public.artworks a
  where a.id = p_artwork_id and a.is_published
  for update;
  if not found then
    raise exception 'Artwork not found.' using errcode = 'P0002';
  end if;

  if p_is_liked then
    insert into public.artwork_likes (artwork_id, visitor_id)
    values (p_artwork_id, p_visitor_id)
    on conflict (artwork_id, visitor_id) do nothing;
    get diagnostics v_rows = row_count;

    if v_rows > 0 then
      update public.artworks a
      set likes = a.likes + 1
      where a.id = p_artwork_id
      returning a.likes into v_likes;
    else
      select a.likes into v_likes
      from public.artworks a
      where a.id = p_artwork_id;
    end if;
  else
    delete from public.artwork_likes l
    where l.artwork_id = p_artwork_id and l.visitor_id = p_visitor_id;
    get diagnostics v_rows = row_count;

    if v_rows > 0 then
      update public.artworks a
      set likes = greatest(a.likes - 1, 0)
      where a.id = p_artwork_id
      returning a.likes into v_likes;
    else
      select a.likes into v_likes
      from public.artworks a
      where a.id = p_artwork_id;
    end if;
  end if;

  return query select v_likes, p_is_liked;
end;
$$;

revoke all privileges on function public.set_artwork_like(uuid, uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.set_artwork_like(uuid, uuid, boolean) to service_role;

notify pgrst, 'reload schema';
