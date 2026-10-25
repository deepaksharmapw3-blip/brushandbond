-- The admin team form records year and batch labels as free text (for example,
-- "3rd Year", "Batch of 2026", or "Faculty Advisor"). Keep this separate
-- from the legacy integer join_year column.
alter table public.team_members
  add column if not exists year text;

-- Ensure PostgREST sees the newly added field immediately.
notify pgrst, 'reload schema';
