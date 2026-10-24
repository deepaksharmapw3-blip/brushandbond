import { createClient } from '@supabase/supabase-js';
import { buildEmail } from './email-template.mjs';

const ALLOWED_ORIGINS = new Set([
  'https://brushandbond.gcect.ac.in',
  'https://www.brushandbond.gcect.ac.in',
  'https://brushandbond.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
]);

const corsHeaders = (origin: string | null) => ({
  ...(origin && ALLOWED_ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const getSecretKey = () => {
  const keySet = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (keySet) {
    try {
      const keys = JSON.parse(keySet) as Record<string, string>;
      if (keys.default) return keys.default;
    } catch {
      // Fall back to the legacy service role key below.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);

  const authorization = request.headers.get('authorization') ?? '';
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return json({ error: 'You must be signed in as an admin.' }, 401, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  let publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (publishableKeys) {
    try {
      publishableKey = (JSON.parse(publishableKeys) as Record<string, string>).default ?? publishableKey;
    } catch {
      // Fall back to the legacy anon key below.
    }
  }
  const secretKey = getSecretKey();
  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: 'Supabase function credentials are not configured.' }, 503, origin);
  }
  const gmailRelayUrl = Deno.env.get('GMAIL_AUTOMATION_URL');
  const gmailRelaySecret = Deno.env.get('GMAIL_AUTOMATION_SECRET');
  if (!(gmailRelayUrl && gmailRelaySecret)) {
    return json({ error: 'Email delivery is not configured. Follow supabase/email-relay/SETUP.md to configure the Gmail automation.' }, 503, origin);
  }

  let parsedBody: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 8_192) {
      return json({ error: 'Request is too large.' }, 413, origin);
    }
    parsedBody = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid request body.' }, 400, origin);
  }
  if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
    return json({ error: 'Invalid request body.' }, 400, origin);
  }
  const body = parsedBody as { id?: unknown; status?: unknown; adminNotes?: unknown };
  const id = text(body.id, 64);
  const status = typeof body.status === 'string' ? body.status.toLowerCase() : '';
  const adminNotes = text(body.adminNotes, 2000);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id) || !['approved', 'rejected'].includes(status)) {
    return json({ error: 'Invalid application status request.' }, 400, origin);
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(tokenMatch[1]);
  if (authError || !user) return json({ error: 'Your session is invalid or expired. Sign in again.' }, 401, origin);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    console.error('Could not verify admin profile:', profileError.message);
    return json({ error: 'Could not verify admin access.' }, 500, origin);
  }
  if (profile?.role !== 'admin') return json({ error: 'Admin access is required.' }, 403, origin);

  const { data: application, error: lookupError } = await admin
    .from('membership_applications')
    .select('id, name, full_name, email, status')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) {
    console.error('Could not load membership application:', lookupError.message);
    return json({ error: 'Could not load the application.' }, 500, origin);
  }
  if (!application) return json({ error: 'Application not found.' }, 404, origin);

  // An already-applied status is treated as a completed request. This also
  // prevents a client retry after a lost response from sending a duplicate.
  if (application.status === status) {
    return json({ success: true, notificationSent: false, alreadyProcessed: true }, 200, origin);
  }
  if (application.status !== 'pending') {
    return json({ error: 'This application has already been reviewed.' }, 409, origin);
  }

  const recipient = text(application.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return json({ error: 'The applicant email address is invalid. The status was not changed.' }, 422, origin);
  }

  const applicantName = text(application.full_name || application.name, 100);
  const email = buildEmail(status as 'approved' | 'rejected', applicantName, adminNotes);
  let alreadySent = false;
  try {
    const replyTo = 'brushandbondgcect22@gmail.com';
    const relayUrl = new URL(gmailRelayUrl);
    if (relayUrl.protocol !== 'https:' || relayUrl.hostname !== 'script.google.com' || !relayUrl.pathname.startsWith('/macros/s/')) {
      return json({ error: 'GMAIL_AUTOMATION_URL must be the HTTPS Google Apps Script Web App URL.' }, 503, origin);
    }
    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: gmailRelaySecret,
        idempotencyKey: `membership-${id}-${status}`,
        to: recipient,
        replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const relayResult = await response.json().catch(() => ({}));
    if (!response.ok || relayResult.ok !== true) {
      console.error('Gmail automation rejected notification:', response.status, relayResult.error ?? 'Unknown error');
      return json({ error: 'Gmail could not accept the notification. The application status was not changed.' }, 502, origin);
    }
    alreadySent = relayResult.alreadySent === true;
  } catch (error) {
    console.error('Email notification failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The email service could not confirm delivery. The application status was not changed. The Gmail relay deduplicates retries; check the Gmail Sent folder if the request timed out.' }, 502, origin);
  }

  const { data: updated, error: updateError } = await admin
    .from('membership_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, status')
    .maybeSingle();
  if (updateError || !updated) {
    console.error('Email sent but application status update failed:', updateError?.message ?? 'The application was reviewed concurrently.');
    return json({ error: 'The email was sent, but the application status could not be saved. Retry the action; the mail provider will deduplicate it.' }, 409, origin);
  }

  return json({ success: true, notificationSent: true, alreadySent, application: updated }, 200, origin);
});
