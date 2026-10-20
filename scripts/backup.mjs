import { cp, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { DatabaseSync, backup } from 'node:sqlite';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDatabase = resolve(process.env.DATABASE_PATH || join(root, 'data', 'brushandbond.sqlite'));
const sourceUploads = resolve(process.env.UPLOADS_DIR || join(root, 'uploads'));
const destinationRoot = process.argv[2] || process.env.BACKUP_DIR;

if (!destinationRoot || !isAbsolute(destinationRoot)) {
  console.error('Set BACKUP_DIR to an absolute backup directory or pass one: npm run backup -- <absolute-backup-directory>');
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
const statusPath = join(resolvedDestination, 'backup-status.json');
let db;
let backupCompleted = false;
const writeStatus = async (status) => {
  const temporaryPath = `${statusPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(status, null, 2)}\n`);
  await rename(temporaryPath, statusPath);
};

try {
  await mkdir(dirname(target), { recursive: true });
  db = new DatabaseSync(sourceDatabase, { readOnly: true });
  await mkdir(target);
  await backup(db, join(target, basename(sourceDatabase)));
  await cp(sourceUploads, join(target, 'uploads'), { recursive: true, errorOnExist: true });
  const completedAt = new Date().toISOString();
  await writeFile(join(target, 'BACKUP_COMPLETE'), `Created ${completedAt}\n`, { flag: 'wx' });
  backupCompleted = true;
  await writeStatus({ status: 'success', completedAt, backupPath: target });
  console.log(`Backup created at ${target}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (backupCompleted) {
    console.error(`Backup snapshot is complete, but its status could not be recorded: ${message}`);
    process.exitCode = 1;
  } else {
    await rm(target, { recursive: true, force: true }).catch((cleanupError) => {
      console.error(`Could not remove incomplete backup directory: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
    });
  }
  try {
    if (!backupCompleted) {
      await mkdir(resolvedDestination, { recursive: true });
      await writeStatus({ status: 'failed', failedAt: new Date().toISOString(), error: message });
    }
  } catch (statusError) {
    console.error(`Could not record backup failure status: ${statusError instanceof Error ? statusError.message : String(statusError)}`);
  }
  console.error(`Backup failed: ${message}`);
  process.exitCode = 1;
} finally {
  db?.close();
}
