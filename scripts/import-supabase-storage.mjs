import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const backupArg = process.argv[2];
const backupRoot = backupArg && resolve(backupArg);
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!backupArg || !supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-supabase-storage.mjs <storage-backup-directory>');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const manifest = JSON.parse(await readFile(resolve(backupRoot, 'manifest.json'), 'utf8'));

function safePath(root, segments) {
  if (segments.some((segment) => !segment || segment === '.' || segment === '..' || /[\\/\0]/.test(segment))) {
    throw new Error('Backup manifest contains an unsafe path segment.');
  }
  const destination = resolve(root, ...segments);
  if (!destination.startsWith(`${root}${sep}`)) throw new Error('Backup object path escapes its directory.');
  return destination;
}

const existingResult = await client.storage.listBuckets();
if (existingResult.error) throw new Error(`Could not list destination Storage buckets: ${existingResult.error.message}`);
const existing = new Set((existingResult.data ?? []).map((bucket) => bucket.name));

for (const bucket of manifest.buckets ?? []) {
  if (!bucket.name || /[\\/\0]/.test(bucket.name) || bucket.name === '.' || bucket.name === '..') {
    throw new Error('Backup manifest contains an unsafe bucket name.');
  }
  const options = {
    public: Boolean(bucket.public),
    fileSizeLimit: bucket.fileSizeLimit ?? undefined,
    allowedMimeTypes: bucket.allowedMimeTypes ?? undefined,
  };
  const bucketResult = existing.has(bucket.name)
    ? await client.storage.updateBucket(bucket.name, options)
    : await client.storage.createBucket(bucket.name, options);
  if (bucketResult.error) throw new Error(`Could not prepare destination bucket ${bucket.name}: ${bucketResult.error.message}`);

  for (const object of bucket.objects ?? []) {
    const segments = object.path.split('/');
    const filePath = safePath(resolve(backupRoot, bucket.name), segments);
    const bytes = await readFile(filePath);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== object.sha256 || bytes.length !== object.size) {
      throw new Error(`Backup integrity check failed for ${bucket.name}/${object.path}.`);
    }
    const { error } = await client.storage.from(bucket.name).upload(object.path, bytes, {
      contentType: object.contentType ?? 'application/octet-stream',
      upsert: true,
    });
    if (error) throw new Error(`Could not restore ${bucket.name}/${object.path}: ${error.message}`);
  }
  console.log(`Restored ${bucket.objects?.length ?? 0} object(s) to Storage bucket ${bucket.name}.`);
}
