/**
 * Client-side token-bucket rate limiter backed by localStorage.
 *
 * Each scope gets its own bucket. Buckets reset automatically after
 * `windowMs` milliseconds. This is only a UX guardrail; the public-submission
 * Supabase Edge Function enforces the actual limits before database writes.
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const PREFIX = 'bb_rl_';

function readBucket(scope: string): Bucket {
  try {
    const raw = localStorage.getItem(PREFIX + scope);
    if (raw) {
      const b = JSON.parse(raw) as Bucket;
      if (typeof b.count === 'number' && typeof b.resetAt === 'number') return b;
    }
  } catch {
    // localStorage unavailable — fail open
  }
  return { count: 0, resetAt: 0 };
}

function writeBucket(scope: string, bucket: Bucket): void {
  try {
    localStorage.setItem(PREFIX + scope, JSON.stringify(bucket));
  } catch {
    // ignore
  }
}

/**
 * Returns true if the request is allowed (and increments the counter).
 * Returns false if the limit has been reached for the current window.
 */
export function checkRateLimit(scope: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let bucket = readBucket(scope);

  if (now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    writeBucket(scope, bucket);
    return false;
  }

  bucket.count += 1;
  writeBucket(scope, bucket);
  return true;
}

/** Milliseconds until the current window resets (0 if already expired). */
export function getRateLimitRetryAfterMs(scope: string): number {
  return Math.max(0, readBucket(scope).resetAt - Date.now());
}

/** Human-readable wait message, e.g. "Please wait 4 minutes and 30 seconds." */
export function rateLimitMessage(scope: string): string {
  const ms = getRateLimitRetryAfterMs(scope);
  if (ms <= 0) return 'Please try again.';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0 && sec > 0) return `Please wait ${min} min ${sec} sec.`;
  if (min > 0) return `Please wait ${min} minute${min > 1 ? 's' : ''}.`;
  return `Please wait ${sec} second${sec > 1 ? 's' : ''}.`;
}
