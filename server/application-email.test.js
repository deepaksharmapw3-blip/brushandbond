import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEmail } from '../supabase/functions/admin-application-status/email-template.mjs';

test('approval email includes the applicant name in safe HTML and plain text', () => {
  const email = buildEmail('approved', 'Mira Sen');

  assert.match(email.subject, /approved/i);
  assert.match(email.html, /Welcome to Brush and Bond, Mira!/);
  assert.match(email.text, /Mira/);
});

test('rejection email escapes applicant names and admin feedback in HTML', () => {
  const email = buildEmail('rejected', '<img src=x onerror=alert(1)>', '<script>alert(1)</script>');

  assert.doesNotMatch(email.html, /<img|<script>/);
  assert.match(email.html, /&lt;img/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.text, /<script>alert\(1\)<\/script>/);
});

test('emails fall back to a generic greeting for an empty name', () => {
  const email = buildEmail('approved', '');
  assert.match(email.html, /Welcome to Brush and Bond, artist!/);
  assert.match(email.text, /artist/);
});
