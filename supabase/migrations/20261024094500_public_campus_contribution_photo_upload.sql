-- Keep awaiting-review contribution photos out of public Storage listings.
-- The submission Edge Function writes them with a service key; staff can read
-- and delete these paths while reviewing or removing the associated record.
drop policy if exists public_read_media on storage.objects;
create policy public_read_media
  on storage.objects for select to anon, authenticated
  using (
    bucket_id in ('artworks', 'events', 'artists', 'team')
    and not (bucket_id = 'artworks' and name like 'campus-contributions/%')
  );

drop policy if exists staff_read_campus_contribution_media on storage.objects;
create policy staff_read_campus_contribution_media
  on storage.objects for select to authenticated
  using (
    bucket_id = 'artworks'
    and name like 'campus-contributions/%'
    and (select private.is_staff())
  );
