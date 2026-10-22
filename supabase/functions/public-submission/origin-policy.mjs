const allowedOrigins = new Set([
  'https://brushandbond.gcect.ac.in',
  'https://www.brushandbond.gcect.ac.in',
  'https://brushandbond.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
]);

export const originAllowed = (origin) => allowedOrigins.has(origin);

export const corsHeaders = (origin) => ({
  ...(originAllowed(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
