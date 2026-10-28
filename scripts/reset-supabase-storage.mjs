import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const backupRoot = process.argv[2] && resolve(process.argv[2]);
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!backupRoot || !supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/reset-supabase-storage.mjs <storage-backup-directory>');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(resolve(backupRoot, 'manifest.json'), 'utf8'));
const validBucketName = (name) => typeof name === 'string' && name.length > 0 && !/[\\/\0]/.test(name) && name !== '.' && name !== '..';
if (!Array.isArray(manifest.buckets) || manifest.buckets.some((bucket) => !validBucketName(bucket.name))) {
  throw new Error('Backup Storage manifest contains an invalid bucket list.');
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const expectedBuckets = new Set(manifest.buckets.map((bucket) => bucket.name));
const bucketResult = await client.storage.listBuckets();
if (bucketResult.error) throw new Error(`Could not list destination Storage buckets: ${bucketResult.error.message}`);

async function collectFiles(bucket, folder = '') {
  const paths = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(bucket).list(folder, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`Could not list Storage bucket ${bucket}: ${error.message}`);
    const entries = data ?? [];
    for (const entry of entries) {
      if (!entry.name || entry.name === '.' || entry.name === '..' || /[\\/\0]/.test(entry.name)) {
        throw new Error('Destination Storage returned an invalid object path.');
      }
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      if (entry.id == null && entry.metadata == null) paths.push(...await collectFiles(bucket, path));
      else paths.push(path);
    }
    if (entries.length < 100) break;
  }
  return paths;
}

let removedObjects = 0;
let removedBuckets = 0;
for (const bucket of bucketResult.data ?? []) {
  const paths = await collectFiles(bucket.name);
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await client.storage.from(bucket.name).remove(paths.slice(index, index + 100));
    if (error) throw new Error(`Could not clear Storage bucket ${bucket.name}: ${error.message}`);
  }
  removedObjects += paths.length;
  if (!expectedBuckets.has(bucket.name)) {
    const { error } = await client.storage.deleteBucket(bucket.name);
    if (error) throw new Error(`Could not remove obsolete Storage bucket ${bucket.name}: ${error.message}`);
    removedBuckets += 1;
  }
}
console.log(`Cleared ${removedObjects} Storage object(s) and removed ${removedBuckets} bucket(s) absent from the backup.`);
