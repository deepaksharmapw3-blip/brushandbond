-- Enforce registration state and capacity in the database so concurrent
-- requests cannot exceed an event's configured seat limit.
create or replace function public.enforce_event_registration_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_published boolean;
  v_registration_open boolean;
  v_capacity integer;
  v_registration_count bigint;
begin
  if tg_op = 'UPDATE' and new.event_id is not distinct from old.event_id then
    return new;
  end if;

  -- Serialize registrations for this event. The existing count trigger updates
  -- this same row after insert, and every registration path must pass here.
  select
    e.is_published,
    e.registration_open,
    coalesce(e.max_capacity, e.capacity, e."capacityValue")
  into v_is_published, v_registration_open, v_capacity
  from public.events e
  where e.id = new.event_id
  for update;

  if not found then
    raise exception 'EVENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not v_is_published or not v_registration_open then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  -- Let the unique constraint return its established duplicate-registration
  -- error even if the event has filled since this user first registered.
  if exists (
    select 1
    from public.event_registrations r
    where r.event_id = new.event_id
      and r.email = new.email
  ) then
    return new;
  end if;

  select count(*)
  into v_registration_count
  from public.event_registrations r
  where r.event_id = new.event_id;

  if v_capacity is not null and v_registration_count >= v_capacity then
    raise exception 'EVENT_CAPACITY_REACHED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_event_registration_capacity() from public, anon, authenticated;

create trigger event_registration_capacity_guard
before insert or update of event_id on public.event_registrations
for each row execute function public.enforce_event_registration_capacity();
