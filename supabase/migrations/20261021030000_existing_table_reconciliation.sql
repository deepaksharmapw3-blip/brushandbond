-- Forward repair for projects where earlier migrations created these tables
-- with an older or incomplete column set. Existing migration files stay
-- immutable because Supabase records their applied versions separately.

do $$
begin
  if to_regclass('public.artworks') is null
     or to_regclass('public.artwork_likes') is null
     or to_regclass('public.public_form_rate_limits') is null then
    raise exception 'Expected baseline tables are missing. Inspect remote migration history and schema before applying this reconciliation migration.';
  end if;
end;
$$;

alter table public.artworks
  add column if not exists likes integer not null default 0;

update public.artworks set likes = 0 where likes is null;

alter table public.artworks alter column likes set default 0;
alter table public.artworks alter column likes set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.artworks'::regclass
      and conname = 'artworks_likes_non_negative'
  ) then
    alter table public.artworks
      add constraint artworks_likes_non_negative check (likes >= 0);
  end if;
end;
$$;

alter table public.artwork_likes
  add column if not exists artwork_id uuid,
  add column if not exists visitor_id uuid,
  add column if not exists created_at timestamptz;

update public.artwork_likes set created_at = now() where created_at is null;

do $$
declare
  visitor_type text;
begin
  select data_type into visitor_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'artwork_likes'
    and column_name = 'visitor_id';

  if visitor_type in ('text', 'character varying') then
    if exists (
      select 1 from public.artwork_likes
      where visitor_id is not null
        and visitor_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) then
      raise exception 'artwork_likes.visitor_id contains values that cannot be converted to UUID; repair those rows explicitly before retrying.';
    end if;
    alter table public.artwork_likes
      alter column visitor_id type uuid using visitor_id::uuid;
  elsif visitor_type <> 'uuid' then
    raise exception 'artwork_likes.visitor_id has unsupported type %; inspect and migrate it manually.', visitor_type;
  end if;

  if exists (select 1 from public.artwork_likes where artwork_id is null or visitor_id is null) then
    raise exception 'artwork_likes has rows without artwork_id or visitor_id; repair those rows explicitly before retrying.';
  end if;
end;
$$;

alter table public.artwork_likes
  alter column artwork_id set not null,
  alter column visitor_id set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

do $$
declare
  artwork_att smallint;
  visitor_att smallint;
begin
  select attnum into artwork_att from pg_attribute
    where attrelid = 'public.artwork_likes'::regclass and attname = 'artwork_id' and not attisdropped;
  select attnum into visitor_att from pg_attribute
    where attrelid = 'public.artwork_likes'::regclass and attname = 'visitor_id' and not attisdropped;

  if not exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.artwork_likes'::regclass
      and c.contype in ('p', 'u')
      and c.conkey @> array[artwork_att, visitor_att]::smallint[]
      and cardinality(c.conkey) = 2
  ) then
    alter table public.artwork_likes
      add constraint artwork_likes_identity_unique unique (artwork_id, visitor_id);
  end if;

  if not exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.artwork_likes'::regclass
      and c.contype = 'f'
      and c.confrelid = 'public.artworks'::regclass
      and c.conkey = array[artwork_att]::smallint[]
  ) then
    alter table public.artwork_likes
      add constraint artwork_likes_artwork_id_fkey
      foreign key (artwork_id) references public.artworks(id) on delete cascade;
  end if;
end;
$$;

alter table public.public_form_rate_limits
  add column if not exists form_scope text,
  add column if not exists client_key text,
  add column if not exists window_started timestamptz,
  add column if not exists request_count integer;

update public.public_form_rate_limits
set request_count = 0 where request_count is null;

do $$
begin
  if exists (
    select 1 from public.public_form_rate_limits
    where form_scope is null or client_key is null or window_started is null
  ) then
    raise exception 'public_form_rate_limits has rows missing scope, client key, or window start; repair those rows explicitly before retrying.';
  end if;
end;
$$;

alter table public.public_form_rate_limits
  alter column form_scope set not null,
  alter column client_key set not null,
  alter column window_started set not null,
  alter column request_count set default 0,
  alter column request_count set not null;

do $$
declare
  scope_att smallint;
  client_att smallint;
  window_att smallint;
begin
  select attnum into scope_att from pg_attribute
    where attrelid = 'public.public_form_rate_limits'::regclass and attname = 'form_scope' and not attisdropped;
  select attnum into client_att from pg_attribute
    where attrelid = 'public.public_form_rate_limits'::regclass and attname = 'client_key' and not attisdropped;
  select attnum into window_att from pg_attribute
    where attrelid = 'public.public_form_rate_limits'::regclass and attname = 'window_started' and not attisdropped;

  if not exists (
    select 1 from pg_constraint c
    where c.conrelid = 'public.public_form_rate_limits'::regclass
      and c.contype in ('p', 'u')
      and c.conkey @> array[scope_att, client_att, window_att]::smallint[]
      and cardinality(c.conkey) = 3
  ) then
    alter table public.public_form_rate_limits
      add constraint public_form_rate_limits_identity_unique
      unique (form_scope, client_key, window_started);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.public_form_rate_limits'::regclass
      and conname = 'public_form_rate_limits_request_count_non_negative'
  ) then
    alter table public.public_form_rate_limits
      add constraint public_form_rate_limits_request_count_non_negative
      check (request_count >= 0);
  end if;
end;
$$;

notify pgrst, 'reload schema';
