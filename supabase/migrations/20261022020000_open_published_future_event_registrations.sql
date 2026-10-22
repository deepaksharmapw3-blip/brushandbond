-- Existing published events defaulted to registration_open = false, which
-- caused the public site to show “Registration opens soon”. Open registration
-- for events that are still upcoming; keep past, concluded, and unpublished
-- events closed. Safe to run more than once.
update public.events
set registration_open = true,
    status = case when status = 'upcoming' then 'open' else status end,
    updated_at = now()
where is_published
  and not is_past
  and coalesce(event_date, date) >= current_date
  and status not in ('concluded', 'past')
  and not registration_open;
