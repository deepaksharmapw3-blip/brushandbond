import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, statfsSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mockArtworks, mockEvents, mockArtists, mockAchievements, mockTeamMembers, mockHeadlineNumbers } from '../src/data/mockData.ts';
import { getReadiness } from './health.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'data');
const isProduction = process.env.NODE_ENV === 'production';
const configuredDatabasePath = process.env.DATABASE_PATH?.trim();
const configuredUploadsDir = process.env.UPLOADS_DIR?.trim();
const configuredBackupDir = process.env.BACKUP_DIR?.trim();
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim();
const configuredAdminPassword = process.env.ADMIN_PASSWORD;

if (isProduction) {
  const missingStoragePaths = [
    ['DATABASE_PATH', configuredDatabasePath],
    ['UPLOADS_DIR', configuredUploadsDir],
  ].filter(([, value]) => !value || !isAbsolute(value)).map(([name]) => name);
  if (missingStoragePaths.length) {
    throw new Error(`Production requires absolute persistent-storage paths for: ${missingStoragePaths.join(', ')}.`);
  }
  if (!configuredAdminEmail || !configuredAdminPassword || configuredAdminPassword.length < 16) {
    throw new Error('Production requires ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters.');
  }
}

const uploadsDir = resolve(configuredUploadsDir || resolve(root, 'uploads'));
mkdirSync(uploadsDir, { recursive: true });
const dbPath = resolve(configuredDatabasePath || resolve(dataDir, 'brushandbond.sqlite'));
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS records_collection_idx ON records(collection);
  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    email TEXT NOT NULL,
    visitor_id TEXT,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(event_id, email)
  );
  CREATE TABLE IF NOT EXISTS artwork_likes (
    artwork_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (artwork_id, visitor_id)
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    user_data TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
if (!db.prepare('PRAGMA table_info(registrations)').all().some((column) => column.name === 'visitor_id')) {
  db.exec('ALTER TABLE registrations ADD COLUMN visitor_id TEXT');
}

const seedCollections = { artworks: mockArtworks, events: mockEvents, artists: mockArtists, achievements: mockAchievements, headlineNumbers: mockHeadlineNumbers, team: mockTeamMembers };
const wasSeeded = db.prepare('SELECT value FROM metadata WHERE key = ?');
const rowCount = db.prepare('SELECT count(*) AS count FROM records WHERE collection = ?');
const addSeed = db.prepare('INSERT INTO records (id, collection, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
const allowSampleContent = process.env.SEED_DEMO_DATA === 'true';
if (allowSampleContent) {
  for (const [collection, rows] of Object.entries(seedCollections)) {
    const seedKey = `seeded:${collection}`;
    if (wasSeeded.get(seedKey)) continue;
    // Migrate the previous one-flag seed marker without restoring records an administrator removed.
    if (wasSeeded.get('seeded') && rowCount.get(collection).count > 0) {
      db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run(seedKey, '1');
      continue;
    }
    const now = new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of rows) addSeed.run(row.id, collection, JSON.stringify(collection === 'artworks' ? { ...row, _likesBaseline: Number(row.likes || 0) } : row), now, now);
      db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run(seedKey, '1');
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

const rateLimitBuckets = new Map();
const MAX_RATE_LIMIT_BUCKETS = 20_000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
let rateLimitChecks = 0;
const apiErrorEvents = [];
const API_ERROR_RETENTION_MS = 60 * 60 * 1000;
const MAX_API_ERROR_EVENTS = 500;
const percentSetting = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 100 ? parsed : fallback;
};
const diskWarningPercent = percentSetting(process.env.DISK_WARNING_PERCENT, 80);
const diskCriticalPercent = Math.max(diskWarningPercent + 1, percentSetting(process.env.DISK_CRITICAL_PERCENT, 90));
const configuredBackupMaxAgeHours = Number(process.env.BACKUP_MAX_AGE_HOURS);
const backupMaxAgeHours = Number.isFinite(configuredBackupMaxAgeHours) && configuredBackupMaxAgeHours > 0 && configuredBackupMaxAgeHours <= 8760 ? configuredBackupMaxAgeHours : 26;
let monitoringSnapshot = null;
let monitoringSnapshotAt = 0;
const queries = {
  list: db.prepare('SELECT data FROM records WHERE collection = ? ORDER BY created_at DESC'),
  get: db.prepare('SELECT data FROM records WHERE collection = ? AND id = ?'),
  insert: db.prepare('INSERT INTO records (id, collection, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'),
  update: db.prepare('UPDATE records SET data = ?, updated_at = ? WHERE collection = ? AND id = ?'),
  delete: db.prepare('DELETE FROM records WHERE collection = ? AND id = ?'),
  registrationCount: db.prepare('SELECT count(*) AS count FROM registrations WHERE event_id = ?'),
};
const parse = (value) => JSON.parse(value);
const list = (collection) => queries.list.all(collection).map((row) => decorateRecord(collection, parse(row.data)));
const get = (collection, id) => {
  const row = queries.get.get(collection, String(id));
  return row ? decorateRecord(collection, parse(row.data)) : null;
};
const save = (collection, record) => {
  const now = new Date().toISOString();
  const existing = get(collection, record.id);
  if (existing) queries.update.run(JSON.stringify(record), now, collection, record.id);
  else queries.insert.run(record.id, collection, JSON.stringify(record), now, now);
  return record;
};
const remove = (collection, id) => queries.delete.run(collection, String(id)).changes > 0;

function send(res, status, value, extraHeaders = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders });
  res.end(JSON.stringify(value));
}

function directoryBytes(directory) {
  let bytes = 0;
  const visit = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile()) bytes += statSync(child).size;
    }
  };
  visit(directory);
  return bytes;
}

function diskUsage(path, storedBytes) {
  const fs = statfsSync(path);
  const totalBytes = Number(fs.blocks) * Number(fs.bsize);
  const availableBytes = Number(fs.bavail) * Number(fs.bsize);
  const usedPercent = totalBytes ? Math.round(((totalBytes - availableBytes) / totalBytes) * 1000) / 10 : 0;
  return {
    storedBytes,
    totalBytes,
    availableBytes,
    usedPercent,
    status: usedPercent >= diskCriticalPercent ? 'critical' : usedPercent >= diskWarningPercent ? 'warning' : 'ok',
  };
}

function getMonitoringSnapshot() {
  const now = Date.now();
  if (monitoringSnapshot && now - monitoringSnapshotAt < 60_000) return monitoringSnapshot;
  const cutoff = now - API_ERROR_RETENTION_MS;
  while (apiErrorEvents.length && apiErrorEvents[0].timestampMs < cutoff) apiErrorEvents.shift();
  const databaseBytes = ['','-wal','-shm'].reduce((total, suffix) => {
    const path = `${dbPath}${suffix}`;
    return total + (existsSync(path) ? statSync(path).size : 0);
  }, 0);
  const backupStatusPath = configuredBackupDir ? resolve(configuredBackupDir, 'backup-status.json') : null;
  let backup = { configured: Boolean(backupStatusPath), status: 'not-configured' };
  if (backupStatusPath && existsSync(backupStatusPath)) {
    try {
      const status = JSON.parse(readFileSync(backupStatusPath, 'utf8'));
      backup = { configured: true, status: status.status, completedAt: status.completedAt, failedAt: status.failedAt, backupPath: status.backupPath, error: status.error };
      if (!['success', 'failed'].includes(backup.status)) backup.status = 'status-file-invalid';
      if (backup.status === 'success') {
        const completedAt = Date.parse(backup.completedAt || '');
        if (!Number.isFinite(completedAt) || completedAt > now || now - completedAt > backupMaxAgeHours * 60 * 60 * 1000) backup.status = 'stale';
      }
    } catch {
      backup = { configured: true, status: 'status-file-invalid' };
    }
  } else if (backupStatusPath) {
    backup = { configured: true, status: 'no-backup-recorded' };
  }
  const databaseDisk = diskUsage(dirname(dbPath), databaseBytes);
  const uploadsDisk = diskUsage(uploadsDir, directoryBytes(uploadsDir));
  const diskStatus = databaseDisk.status === 'critical' || uploadsDisk.status === 'critical' ? 'critical'
    : databaseDisk.status === 'warning' || uploadsDisk.status === 'warning' ? 'warning' : 'ok';
  monitoringSnapshot = {
    checkedAt: new Date(now).toISOString(),
    disk: { status: diskStatus, database: databaseDisk, uploads: uploadsDisk, warningPercent: diskWarningPercent, criticalPercent: diskCriticalPercent },
    apiErrors: { lastHour: apiErrorEvents.length, recent: apiErrorEvents.slice(-20).map((event) => ({ timestamp: event.timestamp, method: event.method, path: event.path, status: event.status, durationMs: event.durationMs })) },
    backup: { ...backup, maxAgeHours: backupMaxAgeHours },
  };
  monitoringSnapshotAt = now;
  return monitoringSnapshot;
}

async function readBody(req) {
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > 6 * 1024 * 1024) throw Object.assign(new Error('Request body is too large (6 MB limit).'), { status: 413 });
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 6 * 1024 * 1024) throw Object.assign(new Error('Request body is too large (6 MB limit).'), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(new Error('JSON body must be an object.'), { status: 400 });
  }
  return body;
}

function allowRateLimitedRequest(req, res, scope, limit, windowMs) {
  const now = Date.now();
  const ip = req.socket.remoteAddress || 'unknown';
  const key = `${scope}:${ip}`;
  let bucket = rateLimitBuckets.get(key);

  if ((++rateLimitChecks & 127) === 0) {
    for (const [bucketKey, value] of rateLimitBuckets) {
      if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }

  if (!bucket || bucket.resetAt <= now) {
    if (!bucket && rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) {
      send(res, 429, { error: 'The service is busy. Please try again shortly.' });
      return false;
    }
    bucket = { count: 0, resetAt: now + windowMs };
    rateLimitBuckets.set(key, bucket);
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    send(res, 429, { error: 'Too many requests. Please try again later.' }, { 'Retry-After': String(retryAfter) });
    return false;
  }

  bucket.count += 1;
  return true;
}

function textField(value, label, maxLength, { required = true } = {}) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string') throw Object.assign(new Error(`${label} must be text.`), { status: 400 });
  const normalized = value.trim();
  if (required && !normalized) throw Object.assign(new Error(`${label} is required.`), { status: 400 });
  if (normalized.length > maxLength) throw Object.assign(new Error(`${label} must be ${maxLength} characters or fewer.`), { status: 400 });
  return normalized;
}

function validEmail(value) {
  return value.length <= 254 && /^\S+@\S+\.\S+$/.test(value);
}

function validateGifFrames(buffer) {
  let offset = 13;
  let frameCount = 0;
  let totalPixels = 0;
  const globalColorTable = buffer[10] & 0x80;
  if (globalColorTable) offset += 3 * (2 ** ((buffer[10] & 0x07) + 1));

  const skipSubBlocks = (start) => {
    let cursor = start;
    while (cursor < buffer.length) {
      const length = buffer[cursor++];
      if (length === 0) return cursor;
      if (cursor + length > buffer.length) return -1;
      cursor += length;
    }
    return -1;
  };

  while (offset < buffer.length) {
    const marker = buffer[offset++];
    if (marker === 0x3b) return frameCount > 0 && offset === buffer.length && totalPixels <= MAX_IMAGE_PIXELS;
    if (marker === 0x21) {
      if (offset >= buffer.length) return false;
      offset = skipSubBlocks(offset + 1);
      if (offset < 0) return false;
      continue;
    }
    if (marker !== 0x2c || offset + 9 > buffer.length) return false;

    const frameWidth = buffer.readUInt16LE(offset + 4);
    const frameHeight = buffer.readUInt16LE(offset + 6);
    const packed = buffer[offset + 8];
    offset += 9;
    if (!frameWidth || !frameHeight || frameWidth > 10_000 || frameHeight > 10_000) return false;
    totalPixels += frameWidth * frameHeight;
    frameCount += 1;
    if (frameCount > 100 || totalPixels > MAX_IMAGE_PIXELS) return false;

    if (packed & 0x80) offset += 3 * (2 ** ((packed & 0x07) + 1));
    if (offset >= buffer.length) return false;
    offset = skipSubBlocks(offset + 1);
    if (offset < 0) return false;
  }
  return false;
}

function validateImage(buffer, mimeType) {
  let width = 0;
  let height = 0;
  let matchesMime = false;

  if (mimeType === 'png') {
    matchesMime = buffer.length >= 45 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && buffer.toString('ascii', 12, 16) === 'IHDR';
    if (matchesMime) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
      let offset = 8;
      let hasImageData = false;
      let hasEnd = false;
      while (offset + 12 <= buffer.length) {
        const chunkLength = buffer.readUInt32BE(offset);
        if (chunkLength > buffer.length - offset - 12) break;
        const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
        if (offset === 8 && (chunkType !== 'IHDR' || chunkLength !== 13)) break;
        if (chunkType === 'IDAT') hasImageData = true;
        offset += chunkLength + 12;
        if (chunkType === 'IEND' && chunkLength === 0) {
          hasEnd = true;
          break;
        }
      }
      matchesMime = matchesMime && hasImageData && hasEnd && offset === buffer.length;
    }
  } else if (mimeType === 'gif') {
    matchesMime = buffer.length >= 14 && ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6)) && validateGifFrames(buffer);
    if (matchesMime) {
      width = buffer.readUInt16LE(6);
      height = buffer.readUInt16LE(8);
    }
  } else if (mimeType === 'webp') {
    matchesMime = buffer.length >= 25 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' && buffer.readUInt32LE(4) + 8 <= buffer.length;
    if (matchesMime) {
      const chunk = buffer.toString('ascii', 12, 16);
      const chunkLength = buffer.readUInt32LE(16);
      if (chunkLength > buffer.length - 20) matchesMime = false;
      else if (chunk === 'VP8X' && chunkLength >= 10 && buffer.length >= 30) {
        width = 1 + buffer.readUIntLE(24, 3);
        height = 1 + buffer.readUIntLE(27, 3);
      } else if (chunk === 'VP8L' && chunkLength >= 5 && buffer[20] === 0x2f) {
        width = 1 + buffer[21] + ((buffer[22] & 0x3f) << 8);
        height = 1 + ((buffer[22] >> 6) & 0x03) + (buffer[23] << 2) + ((buffer[24] & 0x0f) << 10);
      } else if (chunk === 'VP8 ' && chunkLength >= 10 && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
        width = buffer.readUInt16LE(26) & 0x3fff;
        height = buffer.readUInt16LE(28) & 0x3fff;
      } else {
        matchesMime = false;
      }
    }
  } else if (mimeType === 'jpeg') {
    matchesMime = buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer.lastIndexOf(Buffer.from([0xff, 0xd9])) > 1;
    if (matchesMime) {
      const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
      let offset = 2;
      while (offset + 8 < buffer.length) {
        if (buffer[offset] !== 0xff) { offset += 1; continue; }
        while (buffer[offset] === 0xff) offset += 1;
        const marker = buffer[offset++];
        if (marker === 0xd9 || marker === 0xda) break;
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        if (offset + 2 > buffer.length) break;
        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
        if (frameMarkers.has(marker) && segmentLength >= 7) {
          height = buffer.readUInt16BE(offset + 3);
          width = buffer.readUInt16BE(offset + 5);
          break;
        }
        offset += segmentLength;
      }
      if (!width || !height) matchesMime = false;
    }
  }

  if (!matchesMime || !width || !height) {
    throw Object.assign(new Error('The uploaded file is not a valid image matching its declared type.'), { status: 400 });
  }
  if (width > 10_000 || height > 10_000 || width * height > MAX_IMAGE_PIXELS) {
    throw Object.assign(new Error('Image dimensions exceed the 40-megapixel limit.'), { status: 413 });
  }
}

function storeImage(data) {
  if (typeof data !== 'string') throw Object.assign(new Error('Image must be a URL or an uploaded image.'), { status: 400 });
  if (!data.startsWith('data:image/')) {
    if (data.length > 2048) throw Object.assign(new Error('Image URL must be 2048 characters or fewer.'), { status: 400 });
    if (data && !/^https?:\/\//i.test(data) && (!data.startsWith('/') || data.startsWith('//') || data.includes('\\'))) {
      throw Object.assign(new Error('Image URL must use HTTP(S) or a same-site path.'), { status: 400 });
    }
    return data;
  }
  const match = data.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error('Image must be PNG, JPEG, WebP, or GIF.'), { status: 400 });
  const encoded = match[2];
  if (encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) throw Object.assign(new Error('Uploaded images are limited to 4 MB.'), { status: 413 });
  const buffer = Buffer.from(encoded, 'base64');
  if (buffer.length > MAX_IMAGE_BYTES || buffer.toString('base64') !== encoded) {
    throw Object.assign(new Error('Uploaded images must be valid base64 files no larger than 4 MB.'), { status: 400 });
  }
  validateImage(buffer, match[1]);
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const filename = `${randomUUID()}.${extension}`;
  writeFileSync(resolve(uploadsDir, filename), buffer, { flag: 'wx' });
  return `/uploads/${filename}`;
}

function cleanRecord(collection, input, existing = {}) {
  const record = { ...existing, ...input, id: existing.id || String(input.id || randomUUID()) };
  if (collection === 'artworks') {
    record.imageUrl = storeImage(record.imageUrl || record.image || '');
    if (typeof record.tags === 'string') record.tags = record.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (!Array.isArray(record.tags)) record.tags = [];
    if (!record.artistName && record.artistId) record.artistName = get('artists', record.artistId)?.name || '';
    record._likesBaseline = Number(existing._likesBaseline ?? input._likesBaseline ?? input.likes ?? 0);
    record.likes = record._likesBaseline;
    record.views = Number(record.views || 0);
    record.createdAt ||= new Date().toISOString().slice(0, 10);
  }
  if (collection === 'events') {
    record.title = record.title || record.event_name || 'Untitled event';
    record.event_name = record.title;
    record.date = record.date || record.event_date || '';
    record.event_date = record.date;
    record.time = record.time || record.event_time || 'TBA';
    record.event_time = record.time;
    record.venue = record.venue || record.location || 'GCECT Campus';
    record.capacity = Number(record.capacity ?? record.max_capacity ?? 100);
    record.max_capacity = record.capacity;
    record.is_past = Boolean(record.is_past || record.status === 'concluded');
    record.status = record.is_past ? 'concluded' : 'upcoming';
    record.registeredCount = Number(record.registeredCount || 0);
    record.registrationOpen = !record.is_past;
    record.slug ||= record.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    record.imageUrl = storeImage(record.imageUrl || record.banner_url || '');
    record.banner_url = record.imageUrl;
    record.tagline ||= '';
    record.materialsProvided ||= [];
    record.guidelines ||= [];
  }
  if (collection === 'artists') {
    record.avatarUrl = storeImage(record.avatarUrl || '');
    record.slug ||= String(record.name || 'artist').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    record.year ||= record.batch || '';
    record.batch ||= String(record.year);
    record.bio ||= '';
    record.avatarUrl ||= '';
    record.isSpotlight = Boolean(record.isSpotlight ?? record.spotlight);
    record.handle ||= '';
    record.specialties ||= [];
    record.joinedYear ||= new Date().getFullYear();
  }
  if (collection === 'announcements') {
    record.content = String(record.content || '');
    record.isPinned = Boolean(record.isPinned);
    record.createdAt ||= new Date().toISOString();
  }
  if (collection === 'achievements') record.imageUrl = storeImage(record.imageUrl || '');
  if (collection === 'team') record.avatarUrl = storeImage(record.avatarUrl || '');
  if (collection === 'campusArt') record.imageUrl = storeImage(record.imageUrl || '');
  return record;
}

function decorateRecord(collection, record) {
  if (collection === 'events') {
    const registeredCount = Number(queries.registrationCount.get(record.id).count);
    return { ...record, registeredCount, event_name: record.event_name || record.title, event_date: record.event_date || record.date, event_time: record.event_time || record.time, max_capacity: record.max_capacity ?? record.capacity, is_past: record.is_past ?? record.status === 'concluded' };
  }
  if (collection === 'artworks') {
    const artist = record.artist || (record.artistId ? get('artists', record.artistId) : null);
    const likes = db.prepare('SELECT count(*) AS count FROM artwork_likes WHERE artwork_id = ?').get(record.id).count;
    return { ...record, likes: Number(record._likesBaseline ?? record.likes ?? 0) + likes, artist: artist ? { id: artist.id, name: artist.name } : (record.artistName ? { name: record.artistName } : null) };
  }
  if (collection === 'artists') {
    return { ...record, year: record.year || record.batch || '', isSpotlight: Boolean(record.isSpotlight ?? record.spotlight) };
  }
  return record;
}

function sessionUser(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.match(/(?:^|;\s*)bb_session=([^;]+)/)?.[1];
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const session = db.prepare('SELECT user_data, expires_at FROM admin_sessions WHERE token_hash = ?').get(tokenHash);
  if (session && session.expires_at > Date.now()) return parse(session.user_data);
  if (session) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
  return null;
}

function visitorSession(req) {
  const visitorId = (req.headers.cookie || '').match(/(?:^|;\s*)bb_visitor=([^;]+)/)?.[1];
  if (visitorId) return { id: visitorId, cookie: null };
  const id = randomBytes(24).toString('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return { id, cookie: `bb_visitor=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${secure}` };
}

function addVisitorState(collection, items, req) {
  if (collection !== 'events') return items;
  const visitorId = (req.headers.cookie || '').match(/(?:^|;\s*)bb_visitor=([^;]+)/)?.[1];
  return items.map((event) => ({
    ...event,
    isRegistered: visitorId ? Boolean(db.prepare('SELECT 1 AS registered FROM registrations WHERE event_id = ? AND visitor_id = ?').get(event.id, visitorId)) : false,
  }));
}

function adminOnly(req, res) {
  if (sessionUser(req)) return true;
  send(res, 401, { error: 'Sign in as an administrator to continue.' });
  return false;
}

function applyFilter(collection, items, url) {
  const query = (url.searchParams.get('search') || '').toLowerCase();
  let result = items;
  if (query) result = result.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
  if (collection === 'artworks') {
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured');
    if (category && category !== 'All') result = result.filter((item) => item.category?.toLowerCase() === category.toLowerCase());
    if (featured !== null) result = result.filter((item) => item.featured === (featured === 'true'));
  }
  if (collection === 'events') {
    const type = url.searchParams.get('type');
    if (type === 'upcoming') result = result.filter((item) => !item.is_past);
    if (type === 'past') result = result.filter((item) => item.is_past);
  }
  if (collection === 'artists' && url.pathname.endsWith('/spotlight')) result = result.filter((item) => item.isSpotlight);
  if (collection === 'applications') {
    const status = url.searchParams.get('status');
    if (status) result = result.filter((item) => item.status === status.toUpperCase());
  }
  if (collection === 'contacts') {
    const isRead = url.searchParams.get('isRead');
    if (isRead !== null) result = result.filter((item) => item.isRead === (isRead === 'true'));
  }
  return result;
}

async function handler(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if ((url.pathname === '/api' || url.pathname === '/api/health') && req.method === 'GET') {
    const monitoring = getMonitoringSnapshot();
    const readiness = getReadiness(monitoring, isProduction);
    return send(res, 200, {
      success: true,
      status: 'ok',
      service: 'Brush and Bond API',
      storage: 'sqlite',
      health: '/api/health',
      readiness: { ...readiness, endpoint: '/api/ready' },
      disk: { status: monitoring.disk.status, database: monitoring.disk.database.status, uploads: monitoring.disk.uploads.status },
      backup: { status: monitoring.backup.status, completedAt: monitoring.backup.completedAt || null },
    });
  }
  if (url.pathname === '/api/ready' && req.method === 'GET') {
    const monitoring = getMonitoringSnapshot();
    const readiness = getReadiness(monitoring, isProduction);
    return send(res, readiness.ready ? 200 : 503, {
      success: readiness.ready,
      status: readiness.status,
      service: 'Brush and Bond API',
      storage: 'sqlite',
      health: '/api/health',
      disk: { status: monitoring.disk.status, database: monitoring.disk.database.status, uploads: monitoring.disk.uploads.status },
      backup: { status: monitoring.backup.status, completedAt: monitoring.backup.completedAt || null },
    });
  }
  if (url.pathname.startsWith('/uploads/')) {
    const name = url.pathname.slice('/uploads/'.length);
    if (!/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(name)) return send(res, 404, { error: 'Not found.' });
    const path = resolve(uploadsDir, name);
    if (!existsSync(path)) return send(res, 404, { error: 'Image not found.' });
    res.writeHead(200, { 'Content-Type': ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' })[extname(path)], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    return createReadStream(path).pipe(res);
  }
  if (!url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found.' });

  const path = url.pathname.slice(5).split('/').filter(Boolean).map(decodeURIComponent);
  const [resource, id, action] = path;
  if (resource === 'admin' && id === 'monitoring' && req.method === 'GET') {
    if (!adminOnly(req, res)) return;
    return send(res, 200, { success: true, monitoring: getMonitoringSnapshot() });
  }
  if (req.method === 'POST' && resource === 'auth' && id === 'login' && !allowRateLimitedRequest(req, res, 'admin-login', 8, 60_000)) return;
  if (req.method === 'POST' && resource === 'contact' && !id && !allowRateLimitedRequest(req, res, 'contact-form', 5, 15 * 60_000)) return;
  if (req.method === 'POST' && resource === 'applications' && !id && !allowRateLimitedRequest(req, res, 'membership-form', 3, 60 * 60_000)) return;
  if (req.method === 'POST' && resource === 'events' && id && action === 'register' && !allowRateLimitedRequest(req, res, 'event-registration', 8, 15 * 60_000)) return;
  if (req.method === 'POST' && resource === 'artworks' && id && action === 'like' && !allowRateLimitedRequest(req, res, 'artwork-like', 120, 60_000)) return;
  const isPublicForm = (resource === 'events' && id && action === 'register') || (resource === 'artworks' && id && action === 'like');
  const isAdminContentWrite = ['POST', 'PUT'].includes(req.method || '') && ['artworks', 'events', 'artists', 'achievements', 'team', 'campus-art'].includes(resource) && !isPublicForm;
  if (isAdminContentWrite) {
    if (!adminOnly(req, res)) return;
    if (!allowRateLimitedRequest(req, res, 'admin-content-write', 40, 10 * 60_000)) return;
  }
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method || '') ? await readBody(req) : {};

  if (resource === 'auth' && id === 'login' && req.method === 'POST') {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return send(res, 503, { error: 'Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server.' });
    const supplied = String(body.password || '');
    const passwordMatches = supplied.length <= 1024 && timingSafeEqual(scryptSync(supplied, email, 32), scryptSync(password, email, 32));
    if (String(body.email || '').trim().toLowerCase() !== email || !passwordMatches) return send(res, 401, { error: 'Email or password is incorrect.' });
    const token = randomBytes(32).toString('base64url');
    const user = { id: 'admin', email, name: process.env.ADMIN_NAME?.trim() || 'Administrator', role: 'admin' };
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    db.prepare('INSERT OR REPLACE INTO admin_sessions (token_hash, user_data, expires_at) VALUES (?, ?, ?)').run(createHash('sha256').update(token).digest('hex'), JSON.stringify(user), expiresAt);
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return send(res, 200, { success: true, admin: user }, { 'Set-Cookie': `bb_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}` });
  }
  if (resource === 'auth' && id === 'me' && req.method === 'GET') {
    const user = sessionUser(req);
    return user ? send(res, 200, { success: true, admin: user }) : send(res, 401, { error: 'Not signed in.' });
  }
  if (resource === 'auth' && id === 'logout' && req.method === 'POST') {
    const token = (req.headers.cookie || '').match(/(?:^|;\s*)bb_session=([^;]+)/)?.[1];
    if (token) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(createHash('sha256').update(token).digest('hex'));
    return send(res, 200, { success: true }, { 'Set-Cookie': 'bb_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
  }

  if (resource === 'contact' && !id && req.method === 'POST') {
    const name = textField(body.name, 'Name', 100);
    const email = textField(body.email, 'Email', 254).toLowerCase();
    const subject = textField(body.subject ?? 'Website inquiry', 'Subject', 120);
    const message = textField(body.message, 'Message', 5000);
    if (!validEmail(email)) return send(res, 400, { error: 'Enter a valid email address.' });
    const contact = save('contacts', { id: randomUUID(), name, email, subject, message, isRead: false, submittedAt: new Date().toISOString() });
    return send(res, 201, { success: true, message: 'Your message has been saved.', contact });
  }
  if (resource === 'applications' && !id && req.method === 'POST') {
    const fullName = textField(body.fullName, 'Name', 120);
    const email = textField(body.email, 'Email', 254).toLowerCase();
    const department = textField(body.department, 'Department', 120);
    const academicYear = textField(body.academicYear, 'Academic year', 40);
    const artInterests = textField(body.artInterests, 'Art interests', 300);
    const portfolioUrl = textField(body.portfolioUrl, 'Portfolio URL', 2048, { required: false });
    const whyJoin = textField(body.whyJoin, 'Reason for joining', 3000);
    const phone = textField(body.phone, 'Phone', 30, { required: false });
    const rollNumber = textField(body.rollNumber, 'Roll number', 40, { required: false });
    if (!validEmail(email)) return send(res, 400, { error: 'Enter a valid email address.' });
    if (portfolioUrl && !/^https?:\/\//i.test(portfolioUrl) && !/^@?[\w.-]{3,}$/.test(portfolioUrl)) return send(res, 400, { error: 'Portfolio URL must be an HTTP(S) URL or a valid handle.' });
    const application = save('applications', { id: randomUUID(), fullName, email, department, academicYear, artInterests, portfolioUrl, whyJoin, phone, rollNumber, status: 'PENDING', submittedAt: new Date().toISOString() });
    return send(res, 201, { success: true, message: 'Application received.', application });
  }
  if (resource === 'events' && id && action === 'register' && req.method === 'POST') {
    const event = get('events', id);
    if (!event) return send(res, 404, { error: 'Event not found.' });
    const name = textField(body.name, 'Name', 120);
    const email = textField(body.email, 'Email', 254).toLowerCase();
    const phone = textField(body.phone, 'Phone', 30, { required: false });
    const department = textField(body.department, 'Department', 120, { required: false });
    const yearOfStudy = textField(body.yearOfStudy, 'Year of study', 40, { required: false });
    const rollNumber = textField(body.rollNumber, 'Roll number', 40, { required: false });
    if (!validEmail(email)) return send(res, 400, { error: 'Enter a valid email address.' });
    const visitor = visitorSession(req);
    const registration = { id: randomUUID(), eventId: id, name, email, phone, department, yearOfStudy, rollNumber, passCode: `GCECT-ART-${randomBytes(3).toString('hex').toUpperCase()}`, submittedAt: new Date().toISOString() };
    const prior = db.prepare('SELECT data FROM registrations WHERE event_id = ? AND email = ?').get(id, registration.email);
    if (prior) {
      db.prepare('UPDATE registrations SET visitor_id = ? WHERE event_id = ? AND email = ?').run(visitor.id, id, registration.email);
      return send(res, 200, { success: true, message: 'You are already registered for this event.', registration: parse(prior.data), registeredCount: Number(event.registeredCount || 0) }, visitor.cookie ? { 'Set-Cookie': visitor.cookie } : {});
    }
    if (event.is_past || event.registrationOpen === false) return send(res, 409, { error: 'Registration for this event is closed.' });
    if (event.capacity && event.registeredCount >= event.capacity) return send(res, 409, { error: 'This event has reached its registration capacity.' });
    db.prepare('INSERT INTO registrations (id, event_id, email, visitor_id, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(registration.id, id, registration.email, visitor.id, JSON.stringify(registration), registration.submittedAt);
    event.registeredCount = Number(event.registeredCount || 0) + 1;
    save('events', event);
    return send(res, 201, { success: true, message: 'Registration confirmed.', registration, registeredCount: event.registeredCount }, visitor.cookie ? { 'Set-Cookie': visitor.cookie } : {});
  }

  if (resource === 'admin' && id === 'stats' && req.method === 'GET') {
    if (!adminOnly(req, res)) return;
    const events = list('events');
    return send(res, 200, { success: true, stats: { totalArtworks: list('artworks').length, upcomingEvents: events.filter((event) => !event.is_past).length, activeMembers: list('applications').filter((application) => application.status === 'APPROVED').length, totalRegistrations: db.prepare('SELECT count(*) AS count FROM registrations').get().count, weekStats: { views: list('artworks').reduce((total, art) => total + Number(art.views || 0), 0), likes: list('artworks').reduce((total, art) => total + Number(art.likes || 0), 0), comments: 0 }, recentActivity: [] } });
  }

  const collectionAliases = { 'campus-art': 'campusArt', 'headline-numbers': 'headlineNumbers', contact: 'contacts', messages: 'contacts' };
  const collection = collectionAliases[resource] || resource;
  const publicCollections = new Set(['artworks', 'events', 'artists', 'achievements', 'headlineNumbers', 'team', 'campusArt']);
  const adminCollections = new Set(['artworks', 'events', 'artists', 'achievements', 'headlineNumbers', 'team', 'campusArt', 'announcements', 'applications', 'contacts']);
  if (!adminCollections.has(collection)) return send(res, 404, { error: 'Not found.' });

  const isPublicWrite = (collection === 'artworks' && id && action === 'like' && req.method === 'POST');
  const isPublicRead = req.method === 'GET' && publicCollections.has(collection) && collection !== 'announcements' && (!action || (collection === 'artworks' && ['categories', 'featured'].includes(id)) || (collection === 'events' && ['upcoming', 'past'].includes(id)) || (collection === 'artists' && id === 'spotlight'));
  const isPublicSubmit = (collection === 'announcements' && false);
  if (!isPublicRead && !isPublicWrite && !isPublicSubmit && !adminOnly(req, res)) return;

  if (isPublicWrite) {
    const art = get('artworks', id);
    if (!art) return send(res, 404, { error: 'Artwork not found.' });
    let visitorId = (req.headers.cookie || '').match(/(?:^|;\s*)bb_visitor=([^;]+)/)?.[1];
    const cookieHeaders = {};
    if (!visitorId) {
      visitorId = randomBytes(24).toString('base64url');
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      cookieHeaders['Set-Cookie'] = `bb_visitor=${visitorId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${secure}`;
    }
    if (body.liked === false) db.prepare('DELETE FROM artwork_likes WHERE artwork_id = ? AND visitor_id = ?').run(id, visitorId);
    else db.prepare('INSERT OR IGNORE INTO artwork_likes (artwork_id, visitor_id, created_at) VALUES (?, ?, ?)').run(id, visitorId, new Date().toISOString());
    art.likes = Number(art._likesBaseline ?? art.likes ?? 0);
    save('artworks', art);
    const likes = art.likes + db.prepare('SELECT count(*) AS count FROM artwork_likes WHERE artwork_id = ?').get(id).count;
    return send(res, 200, { success: true, likes, isLiked: body.liked !== false }, cookieHeaders);
  }

  if (collection === 'events' && id && action === 'registrations' && req.method === 'GET') {
    const registrations = db.prepare('SELECT data FROM registrations WHERE event_id = ? ORDER BY created_at DESC').all(id).map((row) => parse(row.data));
    return send(res, 200, { success: true, registrations });
  }
  if (collection === 'artworks' && id === 'categories' && req.method === 'GET') {
    const result = {};
    for (const art of list('artworks')) result[art.category] = (result[art.category] || 0) + 1;
    return send(res, 200, { success: true, counts: result });
  }
  if (collection === 'artworks' && id === 'featured' && req.method === 'GET') return send(res, 200, { success: true, artworks: list('artworks').filter((art) => art.featured) });
  if (collection === 'events' && ['upcoming', 'past'].includes(id) && req.method === 'GET') {
    const events = addVisitorState('events', list('events').filter((event) => id === 'past' ? event.is_past : !event.is_past), req);
    return send(res, 200, { success: true, events });
  }
  if (collection === 'artists' && id === 'spotlight' && req.method === 'GET') {
    return send(res, 200, { success: true, artists: list('artists').filter((artist) => artist.isSpotlight) });
  }

  if (!id && req.method === 'GET') {
    let items = applyFilter(collection, list(collection), url);
    items = addVisitorState(collection, items, req);
    if (collection === 'artworks') {
      const visitorId = (req.headers.cookie || '').match(/(?:^|;\s*)bb_visitor=([^;]+)/)?.[1];
      items = items.map((art) => ({ ...art, isLiked: visitorId ? Boolean(db.prepare('SELECT 1 AS liked FROM artwork_likes WHERE artwork_id = ? AND visitor_id = ?').get(art.id, visitorId)) : false }));
    }
    if (collection === 'artists' && url.pathname.endsWith('/spotlight')) items = items.filter((artist) => artist.isSpotlight);
    if (collection === 'contacts' || collection === 'applications') return send(res, 200, { success: true, [collection === 'contacts' ? 'messages' : 'applications']: items });
    if (collection === 'team') return send(res, 200, { success: true, team: items });
    if (collection === 'campusArt') return send(res, 200, { success: true, artworks: items });
    return send(res, 200, { success: true, [collection]: items, total: items.length });
  }
  if (id && req.method === 'GET') {
    const record = get(collection, id);
    if (!record) return send(res, 404, { error: 'Record not found.' });
    if (collection === 'artworks') return send(res, 200, { success: true, artwork: record });
    if (collection === 'events') return send(res, 200, { success: true, event: record });
    if (collection === 'artists') return send(res, 200, { success: true, artist: record });
    return send(res, 200, { success: true, [collection === 'campusArt' ? 'artwork' : collection.slice(0, -1)]: record });
  }
  if (!id && req.method === 'POST') {
    const record = cleanRecord(collection, body);
    if (collection === 'applications') record.status = 'PENDING';
    const saved = save(collection, record);
    const responseKey = { artworks: 'artwork', events: 'event', artists: 'artist', applications: 'application', announcements: 'announcement', team: 'member', campusArt: 'artwork', achievements: 'achievement' }[collection] || 'record';
    return send(res, 201, { success: true, [responseKey]: saved });
  }
  if (id && action === 'status' && req.method === 'PATCH' && collection === 'applications') {
    const application = get(collection, id);
    if (!application) return send(res, 404, { error: 'Application not found.' });
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(body.status)) return send(res, 400, { error: 'Invalid application status.' });
    Object.assign(application, { status: body.status, adminNotes: String(body.adminNotes || ''), reviewedAt: new Date().toISOString() });
    save(collection, application);
    return send(res, 200, { success: true, message: 'Application updated.', application });
  }
  if (id && action === 'read' && req.method === 'PATCH' && collection === 'contacts') {
    const contact = get(collection, id);
    if (!contact) return send(res, 404, { error: 'Message not found.' });
    contact.isRead = true;
    save(collection, contact);
    return send(res, 200, { success: true, contact });
  }
  if (id && req.method === 'PUT') {
    const existing = get(collection, id);
    if (!existing) return send(res, 404, { error: 'Record not found.' });
    const saved = save(collection, cleanRecord(collection, body, existing));
    const responseKey = { artworks: 'artwork', events: 'event', artists: 'artist', announcements: 'announcement', team: 'member', campusArt: 'artwork', achievements: 'achievement' }[collection] || 'record';
    return send(res, 200, { success: true, [responseKey]: saved });
  }
  if (id && req.method === 'DELETE') {
    if (!remove(collection, id)) return send(res, 404, { error: 'Record not found.' });
    return send(res, 200, { success: true, message: 'Record deleted.' });
  }
  send(res, 405, { error: 'Method not allowed.' });
}

const server = createServer((req, res) => {
  const startedAt = Date.now();
  res.once('finish', () => {
    if (!req.url?.startsWith('/api/') || res.statusCode < 400) return;
    const event = {
      timestamp: new Date().toISOString(),
      method: req.method || 'UNKNOWN',
      path: req.url.split('?')[0],
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    };
    apiErrorEvents.push({ ...event, timestampMs: Date.now() });
    if (apiErrorEvents.length > MAX_API_ERROR_EVENTS) apiErrorEvents.splice(0, apiErrorEvents.length - MAX_API_ERROR_EVENTS);
    monitoringSnapshot = null;
    if (res.statusCode >= 500) console.error(JSON.stringify({ level: 'error', type: 'api_error', ...event }));
  });
  handler(req, res).catch((error) => {
    console.error('API request failed:', error);
    send(res, error.status || 500, { error: error.status ? error.message : 'The server could not complete this request.' });
  });
});

const port = Number(process.env.PORT || 3002);
const host = process.env.HOST || (isProduction ? '0.0.0.0' : '127.0.0.1');
server.listen(port, host, () => {
  console.log(`Brush and Bond API listening on http://${host}:${port}/api`);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) console.warn('Admin sign-in is disabled until ADMIN_EMAIL and ADMIN_PASSWORD are configured.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { db.close(); server.close(() => process.exit(0)); });
}
