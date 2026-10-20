import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { DatabaseSync, backup } from 'node:sqlite';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDatabase = resolve(process.env.DATABASE_PATH || join(root, 'data', 'brushandbond.sqlite'));
const sourceUploads = resolve(process.env.UPLOADS_DIR || join(root, 'uploads'));
const destinationRoot = process.argv[2];

if (!destinationRoot || !isAbsolute(destinationRoot)) {
  console.error('Usage: npm run backup -- <absolute-backup-directory>');
  process.exit(1);
}

const resolvedDestination = resolve(destinationRoot);
const overlaps = (first, second) => {
  const path = relative(first, second);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
};
if (overlaps(sourceUploads, resolvedDestination) || overlaps(resolvedDestination, sourceUploads)) {
  console.error('The backup destination must be outside the uploads directory.');
  process.exit(1);
}

const now = new Date().toISOString().replaceAll(':', '-');
const target = join(resolvedDestination, `brushandbond-${now}`);
await mkdir(dirname(target), { recursive: true });
const db = new DatabaseSync(sourceDatabase, { readOnly: true });

try {
  await mkdir(target);
  await backup(db, join(target, basename(sourceDatabase)));
  await cp(sourceUploads, join(target, 'uploads'), { recursive: true, errorOnExist: true });
  await writeFile(join(target, 'BACKUP_COMPLETE'), `Created ${new Date().toISOString()}\n`, { flag: 'wx' });
  console.log(`Backup created at ${target}`);
} catch (error) {
  await rm(target, { recursive: true, force: true });
  throw error;
} finally {
  db.close();
}
