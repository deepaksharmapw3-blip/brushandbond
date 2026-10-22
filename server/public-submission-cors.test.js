import assert from 'node:assert/strict';
import test from 'node:test';
import { corsHeaders, originAllowed } from '../supabase/functions/public-submission/origin-policy.mjs';

test('CORS allows only the production sites and local development origins', () => {
  assert.equal(originAllowed('https://brushandbond.gcect.ac.in'), true);
  assert.equal(originAllowed('https://www.brushandbond.gcect.ac.in'), true);
  assert.equal(originAllowed('http://localhost:5173'), true);
  assert.equal(originAllowed('https://preview.example.net'), false);
  assert.equal(originAllowed('https://attacker.gcect.ac.in'), false);
});

test('CORS echoes an explicitly allowed origin and omits unapproved origins', () => {
  assert.equal(corsHeaders('https://brushandbond.gcect.ac.in')['Access-Control-Allow-Origin'], 'https://brushandbond.gcect.ac.in');
  assert.equal(corsHeaders('https://preview.example.net')['Access-Control-Allow-Origin'], undefined);
  assert.equal(corsHeaders('https://preview.example.net').Vary, 'Origin');
  assert.equal('Access-Control-Allow-Credentials' in corsHeaders('https://brushandbond.gcect.ac.in'), false);
});
