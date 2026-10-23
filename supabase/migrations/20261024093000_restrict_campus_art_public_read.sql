-- Authenticated non-staff users should not gain access to contributor emails.
-- Anonymous archive reads remain limited to approved rows and safe columns.
drop policy if exists campus_art_public_read_approved on public.campus_art_contributions;
create policy campus_art_public_read_approved
  on public.campus_art_contributions for select to anon
  using (status = 'approved');
