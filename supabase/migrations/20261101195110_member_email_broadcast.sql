-- Approved members can stop receiving non-transactional club updates at any time.
alter table public.membership_applications
  add column if not exists email_updates_opt_in boolean not null default false,
  add column if not exists email_unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists membership_applications_email_unsubscribe_token_uidx
  on public.membership_applications (email_unsubscribe_token);

create table if not exists public.member_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  gmail_message_id text not null unique,
  sender_email text not null,
  subject text not null,
  category text not null check (category in ('event', 'announcement', 'achievement', 'update')),
  body_text text not null,
  status text not null default 'queued'
    check (status in ('queued', 'sending', 'sent', 'partial', 'failed', 'no_recipients')),
  recipients_total integer not null default 0 check (recipients_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.member_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.member_email_campaigns(id) on delete cascade,
  membership_application_id uuid references public.membership_applications(id) on delete set null,
  recipient_email text not null,
  recipient_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (campaign_id, membership_application_id)
);

create index if not exists member_email_deliveries_pending_idx
  on public.member_email_deliveries (created_at, id) where status in ('pending', 'failed');
create index if not exists member_email_deliveries_campaign_idx
  on public.member_email_deliveries (campaign_id, status);
create index if not exists member_email_campaigns_created_idx
  on public.member_email_campaigns (created_at desc);

alter table public.member_email_campaigns enable row level security;
alter table public.member_email_deliveries enable row level security;

-- These outbox tables intentionally have no anon/authenticated policies. Only
-- the authenticated admin Edge Function uses the service role to access them.
revoke all on public.member_email_campaigns, public.member_email_deliveries from anon, authenticated;
grant all on public.member_email_campaigns, public.member_email_deliveries to service_role;

notify pgrst, 'reload schema';
