-- The team admin form stores a member's art specialty independently from
-- their role/title.
alter table public.team_members
  add column if not exists specialty text;

notify pgrst, 'reload schema';
