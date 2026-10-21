-- ============================================================
-- Brush and Bond — Schema Additions
-- Run this in Supabase Dashboard → SQL Editor AFTER rls_policies.sql
-- ============================================================

-- 1. likes column on artworks
alter table artworks add column if not exists likes int not null default 0;
alter table artworks drop constraint if exists artworks_likes_non_negative;
alter table artworks add constraint artworks_likes_non_negative check (likes >= 0);

-- 2. Per-visitor like tracking (visitor_id stored in browser localStorage)
create table if not exists artwork_likes (
  artwork_id uuid not null references artworks(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (artwork_id, visitor_id)
);

alter table artwork_likes enable row level security;

create policy public_insert_like on artwork_likes for insert to anon, authenticated
  with check (char_length(visitor_id) between 10 and 64);

create policy public_delete_like on artwork_likes for delete to anon, authenticated
  using (true);

create policy public_read_likes on artwork_likes for select using (true);

create policy staff_manage_likes on artwork_likes for all to authenticated
  using (is_staff()) with check (is_staff());

-- Atomic toggle function: increments or decrements artworks.likes and
-- returns the new count + whether the visitor now has a like.
create or replace function toggle_artwork_like(p_artwork_id uuid, p_visitor_id text)
returns table(likes int, is_liked boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_exists boolean;
  v_likes  int;
begin
  select exists(
    select 1 from artwork_likes
    where artwork_id = p_artwork_id and visitor_id = p_visitor_id
  ) into v_exists;

  if v_exists then
    delete from artwork_likes
      where artwork_id = p_artwork_id and visitor_id = p_visitor_id;
    update artworks
      set likes = greatest(0, artworks.likes - 1)
      where id = p_artwork_id
      returning artworks.likes into v_likes;
    return query select v_likes, false;
  else
    insert into artwork_likes (artwork_id, visitor_id)
      values (p_artwork_id, p_visitor_id)
      on conflict do nothing;
    update artworks
      set likes = artworks.likes + 1
      where id = p_artwork_id
      returning artworks.likes into v_likes;
    return query select v_likes, true;
  end if;
end;
$$;

-- 3. is_read column on contact_messages
alter table contact_messages add column if not exists is_read boolean not null default false;
create index if not exists contact_messages_is_read_idx on contact_messages (is_read, created_at desc);
