import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, originAllowed } from './origin-policy.mjs';

const json = (body: Record<string, unknown>, status: number, _origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(_origin), 'Content-Type': 'application/json' },
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
const publicImageUrl = (value: unknown): string | null => {
  const raw = text(value, 1000);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password || !url.hostname.includes('.')) {
      return null;
    }
    return url.href;
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

async function signVisitorId(visitorId: string, signingKey: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`artwork-like:${visitorId}`));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const signaturesEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

const getServiceRoleKey = () => {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    try {
      const keys = JSON.parse(secretKeys) as Record<string, string>;
      if (keys.default) return keys.default;
    } catch {
      // Fall back to the legacy service-role secret below.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (origin && !originAllowed(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);

  // Supabase's Cloudflare edge supplies this address. Never accept an IP from
  // the submitted JSON body or a caller-controlled forwarding header.
  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return json({ error: 'Could not identify the request source.' }, 503, origin);

  let body: { type?: unknown; data?: unknown };
  let imageFile: File | null = null;
  if (request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > 1_100_000) return json({ error: 'Choose an image smaller than 1 MB.' }, 413, origin);
    try {
      const form = await request.formData();
      const formData: Record<string, string> = {};
      const allowedFields = new Set([
        'contributorName', 'email', 'batchYear', 'department', 'title',
        'approxYear', 'location', 'description', 'year', 'category', 'medium',
      ]);
      let textBytes = 0;
      let invalidForm = false;
      for (const [key, value] of form.entries()) {
        if (key === 'type') continue;
        if (key === 'image' && value instanceof File) {
          if (imageFile) invalidForm = true;
          else imageFile = value;
        } else if (allowedFields.has(key) && typeof value === 'string') {
          textBytes += value.length;
          if (textBytes > 8_000) invalidForm = true;
          formData[key] = value;
        } else invalidForm = true;
      }
      if (invalidForm) return json({ error: 'The upload form contains invalid or oversized fields.' }, 413, origin);
      body = { type: form.get('type'), data: formData };
    } catch {
      return json({ error: 'Invalid upload form.' }, 400, origin);
    }
  } else {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
      return json({ error: 'Submission is too large.' }, 413, origin);
    }
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: 'Invalid request body.' }, 400, origin);
    }
  }
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return json({ error: 'Invalid submission.' }, 400, origin);
  }
  const data = body.data as Record<string, unknown>;
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Submission service is not configured.' }, 503, origin);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const limits: Record<string, { max: number; seconds: number }> = {
    contact: { max: 5, seconds: 15 * 60 },
    // Membership and event forms can be submitted by a large campus group
    // behind one shared NAT address. Match the database RPC's hard cap so a
    // single shared IP can submit for up to 100 people in the relevant window.
    membership: { max: 100, seconds: 60 * 60 },
    'event-registration': { max: 100, seconds: 15 * 60 },
    'artwork-like': { max: 100, seconds: 15 * 60 },
    'campus-art-contribution': { max: 5, seconds: 60 * 60 },
    'artwork-submission': { max: 5, seconds: 60 * 60 },
  };
  const type = typeof body.type === 'string' ? body.type : '';
  const rateLimitScope = type === 'artwork-like-identity' || type === 'artwork-like' ? 'artwork-like' : type;
  const policy = limits[rateLimitScope];
  if (!policy) return json({ error: 'Unknown submission type.' }, 400, origin);

  try {
    const clientKey = await sha256(`${rateLimitScope}:${clientIp}`);
    const { data: allowed, error: limitError } = await admin.rpc('consume_public_form_rate_limit', {
      p_form_scope: rateLimitScope,
      p_client_key: clientKey,
      p_limit: policy.max,
      p_window_seconds: policy.seconds,
    });
    if (limitError) throw limitError;
    if (!allowed) return json({ error: 'Too many submissions. Please wait and try again.' }, 429, origin);

    if (type === 'artwork-like-identity') {
      // Preserve the older browser UUID when it is valid, but sign it here so
      // the client cannot invoke the SECURITY DEFINER RPC with arbitrary IDs.
      const requestedVisitorId = text(data.visitorId, 64);
      const visitorId = validUuid(requestedVisitorId) ? requestedVisitorId : crypto.randomUUID();
      const signature = await signVisitorId(visitorId, serviceRoleKey);
      return json({ success: true, visitorToken: `${visitorId}.${signature}` }, 200, origin);
    }

    if (type === 'artwork-like') {
      const artworkId = text(data.artworkId, 64);
      const visitorToken = text(data.visitorToken, 120);
      const [visitorId, signature, extra] = visitorToken.split('.');
      if (!validUuid(artworkId) || !validUuid(visitorId ?? '') || !signature || extra !== undefined) {
        return json({ error: 'Artwork or visitor identity is invalid.' }, 400, origin);
      }
      const expectedSignature = await signVisitorId(visitorId, serviceRoleKey);
      if (!signaturesEqual(signature, expectedSignature)) {
        return json({ error: 'Visitor identity is invalid. Refresh the page and try again.' }, 401, origin);
      }

      const { data: likeResult, error: likeError } = await admin.rpc('toggle_artwork_like', {
        p_artwork_id: artworkId,
        p_visitor_id: visitorId,
      });
      if (likeError?.code === 'P0002') return json({ error: 'Artwork not found.' }, 404, origin);
      if (likeError) throw likeError;
      const row = Array.isArray(likeResult) ? likeResult[0] : likeResult;
      return json({ success: true, likes: row?.likes ?? 0, isLiked: row?.is_liked ?? false }, 200, origin);
    }

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

    if (type === 'campus-art-contribution') {
      const contributorName = text(data.contributorName, 100);
      const email = emailValue(data.email);
      const batchYear = text(data.batchYear, 40);
      const department = text(data.department, 120);
      const title = text(data.title, 180);
      const approximateYear = text(data.approxYear, 32);
      const location = text(data.location, 180);
      const description = text(data.description, 3000);
      let imageUrl = publicImageUrl(data.imageUrl);
      if (
        contributorName.length < 2
        || (email && !validEmail(email))
        || department.length < 2
        || title.length < 2
        || !approximateYear
        || description.length < 10
        || imageUrl === null
        || (imageFile !== null && Boolean(imageUrl))
      ) {
        return json({ error: 'Please check the contribution form fields and try again.' }, 400, origin);
      }

      let uploadedImagePath: string | null = null;
      if (imageFile) {
        const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const extension = extensions[imageFile.type];
        if (!extension || imageFile.size === 0 || imageFile.size > 1_048_576) {
          return json({ error: 'Choose a JPEG, PNG, or WebP image smaller than 1 MB.' }, 400, origin);
        }
        uploadedImagePath = `campus-contributions/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await admin.storage
          .from('artworks')
          .upload(uploadedImagePath, imageFile, {
            contentType: imageFile.type,
            cacheControl: '31536000',
            upsert: false,
          });
        if (uploadError) throw uploadError;
        imageUrl = admin.storage.from('artworks').getPublicUrl(uploadedImagePath).data.publicUrl;
      }

      const { data: contribution, error } = await admin
        .from('campus_art_contributions')
        .insert({
          contributor_name: contributorName,
          email: email || null,
          batch_year: batchYear || null,
          department,
          title,
          approximate_year: approximateYear,
          location: location || null,
          description,
          image_url: imageUrl || null,
          status: 'pending',
        })
        .select('id, created_at, image_url')
        .single();
      if (error) {
        if (uploadedImagePath) await admin.storage.from('artworks').remove([uploadedImagePath]);
        throw error;
      }
      return json({ success: true, contribution }, 200, origin);
    }

    if (type === 'artwork-submission') {
      const contributorName = text(data.contributorName, 100);
      const email = emailValue(data.email);
      const batchYear = text(data.batchYear, 40);
      const department = text(data.department, 120);
      const title = text(data.title, 180);
      const year = Number(text(data.year, 4));
      const description = text(data.description, 3000);
      const category = text(data.category, 32);
      const medium = text(data.medium, 120);
      const allowedCategories = new Set(['sketches', 'paintings', 'digital-art', 'photography', 'calligraphy', 'doodles']);
      if (
        contributorName.length < 2
        || (email && !validEmail(email))
        || department.length < 2
        || title.length < 2
        || !Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1
        || !allowedCategories.has(category)
        || medium.length < 2
        || description.length < 10
        || !imageFile
      ) {
        return json({ error: 'Please check the artwork submission fields and attach an image.' }, 400, origin);
      }

      const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      const extension = extensions[imageFile.type];
      if (!extension || imageFile.size === 0 || imageFile.size > 1_048_576) {
        return json({ error: 'Choose a JPEG, PNG, or WebP image smaller than 1 MB.' }, 400, origin);
      }

      const uploadedImagePath = `gallery-submissions/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await admin.storage
        .from('artworks')
        .upload(uploadedImagePath, imageFile, {
          contentType: imageFile.type,
          cacheControl: '31536000',
          upsert: false,
        });
      if (uploadError) throw uploadError;
      const imageUrl = admin.storage.from('artworks').getPublicUrl(uploadedImagePath).data.publicUrl;

      const { data: contribution, error } = await admin
        .from('campus_art_contributions')
        .insert({
          submission_type: 'gallery-artwork',
          contributor_name: contributorName,
          email: email || null,
          batch_year: batchYear || null,
          department,
          title,
          approximate_year: String(year),
          category,
          medium,
          description,
          image_url: imageUrl,
          status: 'pending',
        })
        .select('id, created_at, image_url')
        .single();
      if (error) {
        await admin.storage.from('artworks').remove([uploadedImagePath]);
        throw error;
      }
      return json({ success: true, contribution }, 200, origin);
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
    const databaseError = error as { code?: string; message?: string };
    if (databaseError.code === 'P0001' && databaseError.message === 'EVENT_CAPACITY_REACHED') {
      return json({ error: 'This event has reached capacity.' }, 409, origin);
    }
    if (databaseError.code === 'P0001' && databaseError.message === 'REGISTRATION_CLOSED') {
      return json({ error: 'Registration is closed for this event.' }, 409, origin);
    }
    console.error('Public submission failed:', error);
    return json({ error: 'We could not save your submission. Please try again.' }, 500, origin);
  }
});
