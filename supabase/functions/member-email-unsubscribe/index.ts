import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const html = (content: string, status = 200) => new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brush &amp; Bond email preferences</title></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:12vh auto;padding:24px;color:#25221f;line-height:1.6">
<main><h1 style="font-size:24px">Brush &amp; Bond email updates</h1>${content}</main></body></html>`, {
  status,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  },
});

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

Deno.serve(async (request) => {
  if (!['GET', 'POST'].includes(request.method)) return html('<p>This link cannot be used with that request.</p>', 405);

  const url = new URL(request.url);
  let token = url.searchParams.get('token') ?? '';
  if (request.method === 'POST') {
    try {
      const form = await request.formData();
      token = String(form.get('token') ?? '');
    } catch {
      return html('<p>That unsubscribe request could not be read. Please try again.</p>', 400);
    }
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return html('<p>This email preference link is invalid or incomplete.</p>', 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = getSecretKey();
  if (!supabaseUrl || !serviceKey) return html('<p>Email preferences are temporarily unavailable. Please try again later.</p>', 503);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  if (request.method === 'GET') {
    const { data: member, error } = await admin
      .from('membership_applications')
      .select('id, email_updates_opt_in')
      .eq('email_unsubscribe_token', token)
      .eq('status', 'approved')
      .maybeSingle();
    if (error || !member) return html('<p>This preference link is invalid or has expired.</p>', 404);
    if (!member.email_updates_opt_in) return html('<p>You are already unsubscribed from Brush &amp; Bond member email updates.</p>');
    return html(`<p>Confirm that you want to stop receiving Brush &amp; Bond event and club update emails.</p>
      <form method="post"><input type="hidden" name="token" value="${token}"><button type="submit" style="padding:10px 16px;cursor:pointer">Unsubscribe</button></form>`);
  }

  const { data: member, error: lookupError } = await admin
    .from('membership_applications')
    .select('id, email_updates_opt_in')
    .eq('email_unsubscribe_token', token)
    .eq('status', 'approved')
    .maybeSingle();
  if (lookupError) return html('<p>We could not save your preference. Please try again later.</p>', 500);
  if (!member) return html('<p>This preference link is invalid or has expired.</p>', 404);

  const { error: updateError } = await admin
    .from('membership_applications')
    .update({ email_updates_opt_in: false, updated_at: new Date().toISOString() })
    .eq('id', member.id);
  if (updateError) return html('<p>We could not save your preference. Please try again later.</p>', 500);
  return html('<p>You have been unsubscribed from Brush &amp; Bond member email updates. Membership status is unchanged.</p>');
});
