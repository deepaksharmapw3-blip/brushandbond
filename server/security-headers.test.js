import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const required = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const netlify = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
const siteHeaders = vercel.headers.find((rule) => rule.source === '/(.*)')?.headers ?? [];
const valueOf = (key) => siteHeaders.find((header) => header.key === key)?.value ?? '';

test('vercel.json sets every required security header', () => {
  for (const key of required) assert.ok(valueOf(key), `${key} missing from vercel.json`);
});

test('netlify.toml sets the same security headers as vercel.json', () => {
  for (const key of required) {
    assert.ok(netlify.includes(`${key} = "${valueOf(key)}"`), `${key} missing or different in netlify.toml`);
  }
});

test('content security policy blocks inline scripts, plugins and framing', () => {
  const csp = valueOf('Content-Security-Policy');
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-(inline|eval)/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.supabase\.co/);
});
