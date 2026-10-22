-- Keep public media uploads bounded. The browser also validates images, but
-- Storage enforces these limits for every client and cannot be bypassed there.
update storage.buckets
set file_size_limit = 1048576,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id in ('artworks', 'events', 'artists', 'team');

do $$
begin
  if (select count(*) from storage.buckets where id in ('artworks', 'events', 'artists', 'team')) <> 4 then
    raise exception 'Expected all four public media buckets before applying upload limits.';
  end if;
end;
$$;
