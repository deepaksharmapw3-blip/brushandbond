import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const outputArg = process.argv[2];
const outputRoot = outputArg && resolve(outputArg);
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!outputArg || !supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/export-supabase-storage.mjs <output-directory>');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function safePath(root, segments) {
  if (segments.some((segment) => !segment || segment === '.' || segment === '..' || /[\\/\0]/.test(segment))) {
    throw new Error('Storage returned an unsafe path segment.');
  }
  const destination = resolve(root, ...segments);
  if (!destination.startsWith(`${root}${sep}`)) {
    throw new Error('Storage object path escapes the backup directory.');
  }
  return destination;
}

async function listPage(bucket, folder, offset) {
  const { data, error } = await client.storage.from(bucket).list(folder, {
    limit: 100,
    offset,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw new Error(`Could not list Storage bucket ${bucket}: ${error.message}`);
  return data ?? [];
}

const bucketsResult = await client.storage.listBuckets();
if (bucketsResult.error) throw new Error(`Could not list Storage buckets: ${bucketsResult.error.message}`);

await mkdir(outputRoot, { recursive: true });
const manifest = { sourceProjectRef: new URL(supabaseUrl).hostname.split('.')[0], exportedAt: new Date().toISOString(), buckets: [] };

for (const bucket of bucketsResult.data ?? []) {
  if (!bucket.name || /[\\/\0]/.test(bucket.name) || bucket.name === '.' || bucket.name === '..') {
    throw new Error('Storage returned an unsafe bucket name.');
  }
  const record = {
    id: bucket.id,
    name: bucket.name,
    public: bucket.public,
    fileSizeLimit: bucket.file_size_limit,
    allowedMimeTypes: bucket.allowed_mime_types,
    objects: [],
  };
  const bucketRoot = join(outputRoot, bucket.name);
  await mkdir(bucketRoot, { recursive: true });

  async function walk(folder, pathSegments) {
    for (let offset = 0; ; offset += 100) {
      const entries = await listPage(bucket.name, folder, offset);
      for (const entry of entries) {
        const segments = [...pathSegments, entry.name];
        if (entry.id == null && entry.metadata == null) {
          await walk(folder ? `${folder}/${entry.name}` : entry.name, segments);
          continue;
        }

        const objectPath = segments.join('/');
        const { data, error } = await client.storage.from(bucket.name).download(objectPath);
        if (error) throw new Error(`Could not download ${bucket.name}/${objectPath}: ${error.message}`);
        const bytes = Buffer.from(await data.arrayBuffer());
        const destination = safePath(bucketRoot, segments);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, bytes, { flag: 'wx', mode: 0o600 });
        record.objects.push({
          path: objectPath,
          size: bytes.length,
          contentType: entry.metadata?.mimetype ?? 'application/octet-stream',
          sha256: createHash('sha256').update(bytes).digest('hex'),
        });
      }
      if (entries.length < 100) break;
    }
  }

  await walk('', []);
  manifest.buckets.push(record);
  console.log(`Exported ${record.objects.length} object(s) from Storage bucket ${bucket.name}.`);
}

await writeFile(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
