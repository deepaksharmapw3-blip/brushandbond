-- Restrict every existing staff/admin policy to explicitly provisioned admins.
-- Run this migration in the Supabase project before deploying the frontend.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
$$;

revoke all on function public.is_staff() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
