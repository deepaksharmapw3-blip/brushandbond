import assert from 'node:assert/strict';
import test from 'node:test';
import { createOriginPolicy } from '../supabase/functions/public-submission/origin-policy.mjs';

const { originAllowed, corsHeaders } = createOriginPolicy([
  'https://brushandbond.gcect.ac.in',
  'https://*.gcect.ac.in',
  'http://localhost:5173',
]);

test('CORS allows the canonical site and its www hostname', () => {
  assert.equal(originAllowed('https://brushandbond.gcect.ac.in'), true);
  assert.equal(originAllowed('https://www.brushandbond.gcect.ac.in'), true);
});

test('CORS rejects other domains and insecure GCECT origins', () => {
  assert.equal(originAllowed('https://attacker.example'), false);
  assert.equal(originAllowed('http://www.brushandbond.gcect.ac.in'), false);
  assert.equal(originAllowed('https://gcect.ac.in'), false);
});

test('preflight headers echo only an allowed origin', () => {
  assert.equal(corsHeaders('https://www.brushandbond.gcect.ac.in')['Access-Control-Allow-Origin'], 'https://www.brushandbond.gcect.ac.in');
  assert.equal(corsHeaders('https://attacker.example')['Access-Control-Allow-Origin'], undefined);
});
