// This endpoint accepts public submissions and does not use cookies or other
// browser credentials. CORS is therefore open; validation and rate limits in
// the handler, not the Origin header, protect the endpoint.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
