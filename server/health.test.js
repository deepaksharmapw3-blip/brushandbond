import test from 'node:test';
import assert from 'node:assert/strict';
import { getReadiness } from './health.js';

const healthyMonitoring = {
  disk: { status: 'ok' },
  backup: { configured: true, status: 'success' },
};

test('production is ready when storage and a recent backup are healthy', () => {
  assert.deepEqual(getReadiness(healthyMonitoring, true), {
    ready: true,
    status: 'ready',
  });
});

test('production is degraded when backups are not configured', () => {
  assert.deepEqual(getReadiness({
    disk: { status: 'ok' },
    backup: { configured: false, status: 'not-configured' },
  }, true), {
    ready: false,
    status: 'degraded',
  });
});

test('critical disk usage prevents readiness', () => {
  assert.deepEqual(getReadiness({
    disk: { status: 'critical' },
    backup: { configured: true, status: 'success' },
  }, true), {
    ready: false,
    status: 'degraded',
  });
});

test('a missing backup does not block non-production readiness', () => {
  assert.deepEqual(getReadiness({
    disk: { status: 'ok' },
    backup: { configured: false, status: 'not-configured' },
  }, false), {
    ready: true,
    status: 'ready',
  });
});
