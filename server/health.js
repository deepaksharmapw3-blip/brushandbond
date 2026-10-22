const unhealthyBackupStates = new Set([
  'failed',
  'stale',
  'no-backup-recorded',
  'status-file-invalid',
]);

/**
 * Liveness means the process is running and serving requests. Readiness also
 * checks whether its data and backup requirements are safe for production.
 */
export function getReadiness(monitoring, isProduction) {
  const backup = monitoring.backup;
  const ready = monitoring.disk.status !== 'critical'
    && !unhealthyBackupStates.has(backup.status)
    && !(isProduction && !backup.configured);

  return {
    ready,
    status: ready ? 'ready' : 'degraded',
  };
}
