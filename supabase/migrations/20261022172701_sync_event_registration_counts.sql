-- Keep the event count column aligned with the authoritative RSVP rows.
-- This covers both public-submission Edge Function writes and staff changes.
create or replace function public.sync_event_registration_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.events
    set registered_count = registered_count + 1
    where id = new.event_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.events
    set registered_count = greatest(registered_count - 1, 0)
    where id = old.event_id;
    return old;
  elsif tg_op = 'UPDATE' and old.event_id is distinct from new.event_id then
    update public.events
    set registered_count = greatest(registered_count - 1, 0)
    where id = old.event_id;

    update public.events
    set registered_count = registered_count + 1
    where id = new.event_id;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists event_registration_count_sync on public.event_registrations;
create trigger event_registration_count_sync
after insert or update of event_id or delete on public.event_registrations
for each row execute function public.sync_event_registration_count();

-- Repair counts for registrations that existed before this trigger was installed.
update public.events e
set registered_count = (
  select count(*)::integer
  from public.event_registrations r
  where r.event_id = e.id
)
where registered_count is distinct from (
  select count(*)::integer
  from public.event_registrations r
  where r.event_id = e.id
);
