import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const constantTimeEqual = (left: string, right: string) => {
  let difference = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) difference |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return difference === 0;
};

const getSecretKey = () => {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // Fall back to the legacy service-role secret below.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
};

const getPublishableKey = () => {
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (publishableKeys) {
    try {
      const parsed = JSON.parse(publishableKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // Fall back to the legacy anon key below.
    }
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? '';
};

const validEmail = (value: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && value.length <= 254;

const categoryFromSubject = (subject: string) => {
  const match = subject.match(/^\[B&B\s+(EVENT|ANNOUNCEMENT|ACHIEVEMENT|UPDATE)\]\s*/i);
  if (!match) return null;
  return {
    category: match[1].toLowerCase(),
    subject: subject.slice(match[0].length).trim(),
  };
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const messageHtml = (subject: string, body: string, unsubscribeUrl: string) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#25221f;max-width:640px;margin:0 auto">
    <div style="border-bottom:2px solid #5b4bdb;padding:0 0 14px;margin-bottom:20px">
      <strong style="font-size:18px">Brush &amp; Bond</strong>
    </div>
    <h1 style="font-size:22px;line-height:1.3">${escapeHtml(subject)}</h1>
    <div style="white-space:normal">${escapeHtml(body).replaceAll('\n', '<br>')}</div>
    <hr style="border:0;border-top:1px solid #ddd;margin:28px 0 14px">
    <p style="font-size:12px;color:#666">You received this because you are an approved Brush &amp; Bond member. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe from member updates</a>.</p>
  </div>`;

const relay = async (
  urlValue: string,
  secret: string,
  deliveryKey: string,
  recipient: string,
  subject: string,
  html: string,
  body: string,
) => {
  const url = new URL(urlValue);
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' || !url.pathname.startsWith('/macros/s/')) {
    throw new Error('GMAIL_AUTOMATION_URL must be an HTTPS Apps Script Web App URL.');
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      idempotencyKey: deliveryKey,
      to: recipient,
      replyTo: 'brushandbondgcect22@gmail.com',
      subject,
      html,
      text: body,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => ({})) as { ok?: boolean; alreadySent?: boolean; error?: string };
  if (!response.ok || result.ok !== true) throw new Error(result.error || `Gmail relay returned ${response.status}.`);
  return result;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const expectedSecret = Deno.env.get('GMAIL_AUTOMATION_SECRET') ?? '';
  const suppliedSecret = request.headers.get('x-broadcast-secret') ?? '';
  if (!expectedSecret) return json({ error: 'Gmail automation is not configured.' }, 503);
  if (!constantTimeEqual(suppliedSecret, expectedSecret)) return json({ error: 'Unauthorized.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = getSecretKey();
  const gmailRelayUrl = Deno.env.get('GMAIL_AUTOMATION_URL') ?? '';
  const gmailRelaySecret = expectedSecret;
  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase function credentials are not configured.' }, 503);

  let rawBody: string;
  try {
    rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 24_000) return json({ error: 'Request is too large.' }, 413);
  } catch {
    return json({ error: 'Could not read request body.' }, 400);
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'Invalid request body.' }, 400);
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  if (payload.action === 'ingest') {
    const gmailMessageId = text(payload.gmailMessageId, 180);
    const senderEmail = text(payload.senderEmail, 254).toLowerCase();
    const rawSubject = text(payload.subject, 200);
    const bodyText = text(payload.bodyText, 3_500);
    const categorized = categoryFromSubject(rawSubject);
    if (
      senderEmail !== 'brushandbondgcect22@gmail.com'
      || !/^[a-zA-Z0-9_-]{4,180}$/.test(gmailMessageId)
      || !categorized || categorized.subject.length < 2
      || bodyText.length < 2
    ) {
      return json({ error: 'Message does not match an allowed Brush & Bond broadcast.' }, 400);
    }
    if (new TextEncoder().encode(bodyText).byteLength > 16_000) return json({ error: 'Message body is too large.' }, 413);

    const { data: existing, error: existingError } = await admin
      .from('member_email_campaigns')
      .select('id, status, recipients_total')
      .eq('gmail_message_id', gmailMessageId)
      .maybeSingle();
    if (existingError) {
      console.error('Could not check campaign deduplication:', existingError.message);
      return json({ error: 'Could not check whether this message was already queued.' }, 500);
    }
    if (existing) return json({ success: true, duplicate: true, campaign: existing });

    const { data: members, error: membersError } = await admin
      .from('membership_applications')
      .select('id, name, full_name, email, email_unsubscribe_token')
      .eq('status', 'approved')
      .eq('email_updates_opt_in', true);
    if (membersError) {
      console.error('Could not load approved email recipients:', membersError.message);
      return json({ error: 'Could not load approved members.' }, 500);
    }

    const uniqueRecipients = new Map<string, Record<string, unknown>>();
    for (const member of members ?? []) {
      const email = text(member.email, 254).toLowerCase();
      if (validEmail(email) && !uniqueRecipients.has(email)) uniqueRecipients.set(email, member);
    }

    const { data: campaign, error: campaignError } = await admin
      .from('member_email_campaigns')
      .insert({
        gmail_message_id: gmailMessageId,
        sender_email: senderEmail,
        subject: `[B&B ${categorized.category.toUpperCase()}] ${categorized.subject}`.replace(/[\r\n\t]/g, ' ').slice(0, 200),
        category: categorized.category,
        body_text: bodyText,
        status: uniqueRecipients.size ? 'queued' : 'no_recipients',
        recipients_total: uniqueRecipients.size,
        completed_at: uniqueRecipients.size ? null : new Date().toISOString(),
      })
      .select('id, status, recipients_total')
      .single();
    if (campaignError || !campaign) {
      console.error('Could not create member email campaign:', campaignError?.message ?? 'No campaign returned.');
      return json({ error: 'Could not create the campaign.' }, 500);
    }

    if (uniqueRecipients.size) {
      const deliveries = Array.from(uniqueRecipients.values()).map((member) => ({
        campaign_id: campaign.id,
        membership_application_id: member.id,
        recipient_email: text(member.email, 254).toLowerCase(),
        recipient_name: text(member.full_name || member.name, 100) || 'Brush & Bond member',
      }));
      const { error: deliveryError } = await admin.from('member_email_deliveries').insert(deliveries);
      if (deliveryError) {
        await admin.from('member_email_campaigns').delete().eq('id', campaign.id);
        console.error('Could not queue campaign deliveries:', deliveryError.message);
        return json({ error: 'Could not queue campaign recipients.' }, 500);
      }
    }
    return json({ success: true, duplicate: false, campaign });
  }

  if (payload.action === 'dispatch') {
    if (!gmailRelayUrl) return json({ error: 'GMAIL_AUTOMATION_URL is not configured.' }, 503);

    const { data: pending, error: pendingError } = await admin
      .from('member_email_deliveries')
      .select('id, campaign_id, membership_application_id, recipient_email, recipient_name, attempt_count')
      .in('status', ['pending', 'failed'])
      .lt('attempt_count', 5)
      .order('created_at', { ascending: true })
      .limit(10);
    if (pendingError) {
      console.error('Could not load pending member emails:', pendingError.message);
      return json({ error: 'Could not load pending member emails.' }, 500);
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let paused = false;

    for (const delivery of pending ?? []) {
      const { data: claimed, error: claimError } = await admin
        .from('member_email_deliveries')
        .update({ status: 'sending', attempt_count: delivery.attempt_count + 1, updated_at: new Date().toISOString(), last_error: null })
        .eq('id', delivery.id)
        .in('status', ['pending', 'failed'])
        .select('id')
        .maybeSingle();
      if (claimError) {
        console.error('Could not claim email delivery:', claimError.message);
        failed++;
        continue;
      }
      if (!claimed) continue;

      if (!delivery.membership_application_id) {
        await admin.from('member_email_deliveries').update({
          status: 'skipped', last_error: 'Membership application no longer exists.', updated_at: new Date().toISOString(),
        }).eq('id', delivery.id);
        skipped++;
        continue;
      }

      const { data: member, error: memberError } = await admin
        .from('membership_applications')
        .select('status, email_updates_opt_in, email_unsubscribe_token')
        .eq('id', delivery.membership_application_id)
        .maybeSingle();
      if (memberError || !member || member.status !== 'approved' || !member.email_updates_opt_in) {
        await admin.from('member_email_deliveries').update({
          status: 'skipped',
          last_error: memberError ? 'Could not verify current membership preference.' : 'Member is no longer opted in or approved.',
          updated_at: new Date().toISOString(),
        }).eq('id', delivery.id);
        skipped++;
        continue;
      }

      const { data: campaign, error: campaignError } = await admin
        .from('member_email_campaigns')
        .select('subject, body_text')
        .eq('id', delivery.campaign_id)
        .maybeSingle();
      if (campaignError || !campaign) {
        await admin.from('member_email_deliveries').update({
          status: 'failed', last_error: 'Campaign content could not be loaded.', updated_at: new Date().toISOString(),
        }).eq('id', delivery.id);
        failed++;
        continue;
      }

      const unsubscribeUrl = `${supabaseUrl}/functions/v1/member-email-unsubscribe?token=${member.email_unsubscribe_token}`;
      const deliveryKey = `broadcast-${delivery.campaign_id.replaceAll('-', '')}-${delivery.membership_application_id.replaceAll('-', '')}`;
      try {
        await relay(
          gmailRelayUrl,
          gmailRelaySecret,
          deliveryKey,
          delivery.recipient_email,
          campaign.subject,
          messageHtml(campaign.subject, campaign.body_text, unsubscribeUrl),
          `${campaign.subject}\n\n${campaign.body_text}\n\nUnsubscribe from member updates: ${unsubscribeUrl}`,
        );
        await admin.from('member_email_deliveries').update({
          status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_error: null,
        }).eq('id', delivery.id);
        sent++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gmail delivery failed.';
        const quotaExhausted = message.toLowerCase().includes('quota is exhausted');
        await admin.from('member_email_deliveries').update({
          status: quotaExhausted ? 'pending' : 'failed',
          attempt_count: quotaExhausted ? delivery.attempt_count : delivery.attempt_count + 1,
          last_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        }).eq('id', delivery.id);
        if (quotaExhausted) {
          paused = true;
          break;
        }
        failed++;
      }
    }

    const { data: campaigns } = await admin
      .from('member_email_campaigns')
      .select('id')
      .in('status', ['queued', 'sending', 'partial']);
    for (const item of campaigns ?? []) {
      const { data: states } = await admin
        .from('member_email_deliveries')
        .select('status, attempt_count')
        .eq('campaign_id', item.id);
      const counts = (states ?? []).reduce((acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const hasRetryableFailure = (states ?? []).some((row) => row.status === 'failed' && row.attempt_count < 5);
      const unresolved = (counts.pending ?? 0) + (counts.sending ?? 0) + (hasRetryableFailure ? 1 : 0);
      const hasFailure = (counts.failed ?? 0) > 0 || (counts.skipped ?? 0) > 0;
      const finalStatus = unresolved
        ? ((counts.sent ?? 0) ? 'partial' : 'queued')
        : hasFailure ? ((counts.sent ?? 0) ? 'partial' : 'failed') : 'sent';
      await admin.from('member_email_campaigns').update({
        status: finalStatus,
        updated_at: new Date().toISOString(),
        completed_at: unresolved ? null : new Date().toISOString(),
      }).eq('id', item.id);
    }

    return json({ success: true, processed: sent + failed + skipped, sent, failed, skipped, paused });
  }

  return json({ error: 'Unknown action.' }, 400);
});
