import { createClient } from 'npm:@supabase/supabase-js@2';

// Browser origins allowed to call this function. The production site and local
// dev servers are built in, so forms keep working without any configuration.
// To allow more origins (e.g. a preview deployment), set the ALLOWED_ORIGINS
// secret to a comma-separated list; they are added to the built-in ones:
//   supabase secrets set ALLOWED_ORIGINS="https://preview.example.app"
// A leading "*." label matches any subdomain of a domain you control.
const DEFAULT_ORIGINS = [
  'https://brushandbond.gcect.ac.in',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
];
const extraOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);
const allowedOrigins = [...DEFAULT_ORIGINS, ...extraOrigins];

const originAllowed = (origin: string) =>
  allowedOrigins.some((rule) => {
    if (!rule.includes('*')) return rule === origin;
    const [scheme, host = ''] = rule.split('://');
    const suffix = host.replace(/^\*/, ''); // "*.example.app" -> ".example.app"
    try {
      const url = new URL(origin);
      return url.protocol === `${scheme}:` && url.hostname.endsWith(suffix) && url.hostname.length > suffix.length;
    } catch {
      return false;
    }
  });

const corsHeaders = (origin: string | null): Record<string, string> => ({
  ...(origin && originAllowed(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const emailValue = (value: unknown) => text(value, 254).toLowerCase();
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
// Accepts an http(s) link (scheme optional) or a social handle such as
// "@name". Returns '' when empty and null when the value is not acceptable, so
// javascript:/data: style strings never reach the database.
const portfolioValue = (value: unknown): string | null => {
  const raw = text(value, 500);
  if (!raw) return '';
  if (/\s/.test(raw)) return null;
  if (/^@?[A-Za-z0-9_]{1,30}$/.test(raw) || /^@[A-Za-z0-9._]{1,30}$/.test(raw)) return raw;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password || !url.hostname.includes('.')) return null;
    return url.href.length <= 500 ? url.href : null;
  } catch {
    return null;
  }
};
const validUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (origin && !originAllowed(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
    return json({ error: 'Submission is too large.' }, 413, origin);
  }

  // Supabase's Cloudflare edge supplies this address. Never accept an IP from
  // the submitted JSON body or a caller-controlled forwarding header.
  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return json({ error: 'Could not identify the request source.' }, 503, origin);

  let body: { type?: unknown; data?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid request body.' }, 400, origin);
  }
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return json({ error: 'Invalid submission.' }, 400, origin);
  }
  const data = body.data as Record<string, unknown>;
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Submission service is not configured.' }, 503, origin);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const limits: Record<string, { max: number; seconds: number }> = {
    contact: { max: 5, seconds: 15 * 60 },
    membership: { max: 3, seconds: 60 * 60 },
    'event-registration': { max: 8, seconds: 15 * 60 },
  };
  const type = typeof body.type === 'string' ? body.type : '';
  const policy = limits[type];
  if (!policy) return json({ error: 'Unknown submission type.' }, 400, origin);

  try {
    const clientKey = await sha256(`${type}:${clientIp}`);
    const { data: allowed, error: limitError } = await admin.rpc('consume_public_form_rate_limit', {
      p_form_scope: type,
      p_client_key: clientKey,
      p_limit: policy.max,
      p_window_seconds: policy.seconds,
    });
    if (limitError) throw limitError;
    if (!allowed) return json({ error: 'Too many submissions. Please wait and try again.' }, 429, origin);

    if (type === 'contact') {
      const name = text(data.name, 100);
      const email = emailValue(data.email);
      const message = text(data.message, 2000);
      const subject = text(data.subject, 150);
      if (name.length < 2 || !validEmail(email) || message.length < 5) {
        return json({ error: 'Please check the contact form fields and try again.' }, 400, origin);
      }
      const { error } = await admin.from('contact_messages').insert({
        name,
        email,
        message: subject ? `[${subject}] ${message}` : message,
      });
      if (error) throw error;
      return json({ success: true, message: 'Message sent!' }, 200, origin);
    }

    if (type === 'membership') {
      const name = text(data.name ?? data.fullName, 100);
      const email = emailValue(data.email);
      const department = text(data.department, 120);
      const year = text(data.year ?? data.yearOfStudy ?? data.academicYear, 40);
      const interest = text(data.interest ?? data.areaOfInterest ?? data.primaryWing ?? data.artInterests, 120);
      const portfolio = portfolioValue(data.portfolio ?? data.portfolioUrl);
      const reason = text(data.reason ?? data.reasonToJoin ?? data.motivation ?? data.whyJoin, 2000);
      if (portfolio === null) {
        return json({ error: 'Please enter a valid portfolio link (https://…) or an Instagram handle.' }, 400, origin);
      }
      if (name.length < 2 || !validEmail(email) || !department || !year || !interest || reason.length < 5) {
        return json({ error: 'Please check the application fields and try again.' }, 400, origin);
      }
      const { data: application, error } = await admin
        .from('membership_applications')
        .insert({ name, email, department, year, interest, portfolio: portfolio || null, reason, status: 'pending' })
        .select('id, created_at')
        .single();
      if (error) throw error;
      return json({
        success: true,
        message: 'Application submitted!',
        application: { ...application, name, email, department, year, interest, portfolio, reason },
      }, 200, origin);
    }

    const eventId = text(data.eventId ?? data.event_id, 64);
    const name = text(data.name ?? data.applicant_name, 100);
    const email = emailValue(data.email ?? data.applicant_email);
    const phone = text(data.phone ?? data.applicant_phone, 30);
    if (!validUuid(eventId) || name.length < 2 || !validEmail(email)) {
      return json({ error: 'Please check the registration fields and try again.' }, 400, origin);
    }
    const { data: event, error: eventError } = await admin
      .from('events')
      .select('id, registration_open, is_published')
      .eq('id', eventId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event?.registration_open || !event.is_published) {
      return json({ error: 'Registration is closed for this event.' }, 409, origin);
    }
    const { data: registration, error } = await admin
      .from('event_registrations')
      .insert({
        event_id: eventId,
        name,
        email,
        phone: phone || null,
        department: text(data.department, 120) || null,
        year: text(data.year ?? data.yearOfStudy, 40) || null,
        roll_number: text(data.rollNumber ?? data.roll_number, 80) || null,
        experience_level: text(data.experienceLevel ?? data.experience_level, 80) || null,
        notes: text(data.notes, 1000) || null,
      })
      .select('id, created_at')
      .single();
    if (error?.code === '23505') return json({ error: 'You are already registered for this event.' }, 409, origin);
    if (error) throw error;
    const { count, error: countError } = await admin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (countError) throw countError;
    return json({
      success: true,
      message: 'Registered successfully!',
      registration: { ...registration, passCode: registration.id.replaceAll('-', '').slice(0, 8).toUpperCase() },
      registeredCount: count ?? 0,
    }, 200, origin);
  } catch (error) {
    console.error('Public submission failed:', error);
    return json({ error: 'We could not save your submission. Please try again.' }, 500, origin);
  }
});
