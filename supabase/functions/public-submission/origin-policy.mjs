export const createOriginPolicy = (allowedOrigins) => {
  const originAllowed = (origin) => allowedOrigins.some((rule) => {
    if (!rule.includes('*')) return rule === origin;
    const [scheme, host = ''] = rule.split('://');
    const suffix = host.replace(/^\*/, '');
    try {
      const url = new URL(origin);
      return url.protocol === `${scheme}:`
        && url.hostname.endsWith(suffix)
        && url.hostname.length > suffix.length;
    } catch {
      return false;
    }
  });

  const corsHeaders = (origin) => ({
    ...(origin && originAllowed(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  });

  return { originAllowed, corsHeaders };
};
