// Keep one canonical client adapter. In particular, public form submissions
// must pass through the Supabase Edge Function, where rate limits are enforced.
export * from './supabaseApi';
