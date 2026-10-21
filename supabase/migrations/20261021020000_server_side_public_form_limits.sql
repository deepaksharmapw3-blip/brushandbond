-- Public forms must pass through the Edge Function so IP-based limits cannot
-- be bypassed by calling the anonymous PostgREST endpoint directly.
create table if not exists public.public_form_rate_limits (
  form_scope text not null,
  client_key text not null,
  window_started timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (form_scope, client_key, window_started)
);

alter table public.public_form_rate_limits enable row level security;
revoke all privileges on table public.public_form_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.public_form_rate_limits to service_role;

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
  if p_form_scope not in ('contact', 'membership', 'event-registration')
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

  -- Opportunistic cleanup avoids unbounded growth without scanning on every call.
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

drop policy if exists public_apply on public.membership_applications;
drop policy if exists public_register on public.event_registrations;
drop policy if exists public_contact on public.contact_messages;
revoke insert on table public.membership_applications, public.event_registrations, public.contact_messages
  from public, anon, authenticated;

notify pgrst, 'reload schema';
