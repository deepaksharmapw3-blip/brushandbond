import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const backupRoot = process.argv[2] && resolve(process.argv[2]);
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!backupRoot || !supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-supabase-storage.mjs <storage-backup-directory>');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(resolve(backupRoot, 'manifest.json'), 'utf8'));
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const expected = new Map();
for (const bucket of manifest.buckets ?? []) {
  for (const object of bucket.objects ?? []) expected.set(`${bucket.name}/${object.path}`, object);
}

async function listFiles(bucket, folder = '') {
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(bucket).list(folder, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`Could not verify Storage bucket ${bucket}: ${error.message}`);
    const entries = data ?? [];
    for (const entry of entries) {
      if (!entry.name || entry.name === '.' || entry.name === '..' || /[\\/\0]/.test(entry.name)) {
        throw new Error('Destination Storage returned an invalid object path.');
      }
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      if (entry.id == null && entry.metadata == null) files.push(...await listFiles(bucket, path));
      else files.push(path);
    }
    if (entries.length < 100) break;
  }
  return files;
}

const bucketsResult = await client.storage.listBuckets();
if (bucketsResult.error) throw new Error(`Could not list destination Storage buckets: ${bucketsResult.error.message}`);
const actual = new Set();
let checked = 0;
for (const bucket of bucketsResult.data ?? []) {
  for (const path of await listFiles(bucket.name)) {
    const key = `${bucket.name}/${path}`;
    actual.add(key);
    const expectedObject = expected.get(key);
    if (!expectedObject) throw new Error(`Unexpected Storage object found (total object count: ${actual.size}).`);
    const { data, error } = await client.storage.from(bucket.name).download(path);
    if (error) throw new Error(`Could not read a restored Storage object: ${error.message}`);
    const bytes = Buffer.from(await data.arrayBuffer());
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== expectedObject.sha256 || bytes.length !== expectedObject.size) {
      throw new Error('A restored Storage object failed its SHA-256 or size check.');
    }
    checked += 1;
  }
}

if (actual.size !== expected.size) {
  throw new Error(`Storage object count mismatch: expected ${expected.size}, found ${actual.size}.`);
}
console.log(`Storage restore verified: ${checked} object(s) match the backup SHA-256 and size.`);
