const CHECK_TIMEOUT_MS = 3_000;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return response.status(503).json({
      status: 'degraded',
      checks: { database: 'not_configured' },
      checkedAt: new Date().toISOString(),
    });
  }

  try {
    const endpoint = new URL('/rest/v1/site_stats?select=key&limit=1', supabaseUrl);
    const result = await fetch(endpoint, {
      method: 'GET',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });

    if (!result.ok) {
      return response.status(503).json({
        status: 'degraded',
        checks: { database: 'unavailable' },
        checkedAt: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      status: 'ok',
      checks: { database: 'ok' },
      checkedAt: new Date().toISOString(),
      deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    });
  } catch {
    return response.status(503).json({
      status: 'degraded',
      checks: { database: 'unavailable' },
      checkedAt: new Date().toISOString(),
    });
  }
}
