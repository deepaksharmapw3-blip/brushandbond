-- Route artwork likes through the Edge Function. Clients must not execute the
-- SECURITY DEFINER RPC directly or choose arbitrary visitor UUIDs.
revoke all privileges on function public.toggle_artwork_like(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.toggle_artwork_like(uuid, uuid) to service_role;

-- Extend the existing server-only per-IP limiter to cover both visitor-token
-- issuance and like toggles. The Edge Function shares one 100 / 15-minute
-- budget across these actions for each source IP.
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
  if p_form_scope not in ('contact', 'membership', 'event-registration', 'artwork-like')
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
