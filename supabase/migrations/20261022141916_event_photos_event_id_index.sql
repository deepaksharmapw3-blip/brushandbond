create index if not exists event_photos_event_id_idx
  on public.event_photos using btree (event_id);
