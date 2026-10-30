-- Keep staff write access explicit per operation. Public read policies remain
-- responsible for selecting published records; private admin queues retain
-- their existing all-operation policies.
do $$
declare
  table_name text;
  policy_suffix text;
begin
  foreach table_name in array array[
    'artists', 'artworks', 'events', 'event_photos', 'team_members',
    'announcements', 'achievements', 'site_stats'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'staff_manage_' || table_name, table_name);

    foreach policy_suffix in array array['insert', 'update', 'delete'] loop
      execute format(
        'drop policy if exists %I on public.%I',
        'staff_' || policy_suffix || '_' || table_name,
        table_name
      );
    end loop;

    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_staff()))',
      'staff_insert_' || table_name,
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()))',
      'staff_update_' || table_name,
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_staff()))',
      'staff_delete_' || table_name,
      table_name
    );
  end loop;
end;
$$;

notify pgrst, 'reload schema';
