import assert from 'node:assert/strict';
import test from 'node:test';
import { corsHeaders } from '../supabase/functions/public-submission/origin-policy.mjs';

test('public submission CORS accepts requests from any origin without credentials', () => {
  assert.equal(corsHeaders['Access-Control-Allow-Origin'], '*');
  assert.equal(corsHeaders['Access-Control-Allow-Methods'], 'POST, OPTIONS');
  assert.match(corsHeaders['Access-Control-Allow-Headers'], /authorization/);
  assert.match(corsHeaders['Access-Control-Allow-Headers'], /apikey/);
  assert.equal('Access-Control-Allow-Credentials' in corsHeaders, false);
});
