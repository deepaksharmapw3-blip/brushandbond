import { createServer } from 'node:http';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mockArtworks, mockEvents, mockArtists, mockAchievements, mockTeamMembers, mockHeadlineNumbers } from '../src/data/mockData.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'data');
const uploadsDir = resolve(process.env.UPLOADS_DIR || resolve(root, 'uploads'));
mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadsDir, { recursive: true });
const dbPath = resolve(process.env.DATABASE_PATH || resolve(dataDir, 'brushandbond.sqlite'));
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
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

const loginAttempts = new Map();
const queries = {
  list: db.prepare('SELECT data FROM records WHERE collection = ? ORDER BY created_at DESC'),
  get: db.prepare('SELECT data FROM records WHERE collection = ? AND id = ?'),
  insert: db.prepare('INSERT INTO records (id, collection, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'),
  update: db.prepare('UPDATE records SET data = ?, updated_at = ? WHERE collection = ? AND id = ?'),
  delete: db.prepare('DELETE FROM records WHERE collection = ? AND id = ?'),
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

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 10 * 1024 * 1024) throw Object.assign(new Error('Request body is too large (10 MB limit).'), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }); }
}

function storeImage(data) {
  if (typeof data !== 'string' || !data.startsWith('data:image/')) return data;
  const match = data.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error('Image must be PNG, JPEG, WebP, or GIF.'), { status: 400 });
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const filename = `${randomUUID()}.${extension}`;
  writeFileSync(resolve(uploadsDir, filename), Buffer.from(match[2], 'base64'), { flag: 'wx' });
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
  return record;
}

function decorateRecord(collection, record) {
  if (collection === 'events') {
    return { ...record, event_name: record.event_name || record.title, event_date: record.event_date || record.date, event_time: record.event_time || record.time, max_capacity: record.max_capacity ?? record.capacity, is_past: record.is_past ?? record.status === 'concluded' };
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
  if ((url.pathname === '/api' || url.pathname === '/api/health') && req.method === 'GET') return send(res, 200, { success: true, service: 'Brush and Bond API', storage: 'sqlite', health: '/api/health' });
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
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method || '') ? await readBody(req) : {};

  if (resource === 'auth' && id === 'login' && req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown';
    const attempts = loginAttempts.get(ip) || [];
    const recentAttempts = attempts.filter((at) => Date.now() - at < 60_000);
    if (recentAttempts.length >= 8) return send(res, 429, { error: 'Too many sign-in attempts. Try again in a minute.' });
    recentAttempts.push(Date.now());
    loginAttempts.set(ip, recentAttempts);
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
    if (!body.name?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '') || !body.message?.trim()) return send(res, 400, { error: 'Name, valid email, and message are required.' });
    const contact = save('contacts', { id: randomUUID(), name: body.name.trim(), email: body.email.trim().toLowerCase(), subject: String(body.subject || 'Website inquiry').trim(), message: body.message.trim(), isRead: false, submittedAt: new Date().toISOString() });
    return send(res, 201, { success: true, message: 'Your message has been saved.', contact });
  }
  if (resource === 'applications' && !id && req.method === 'POST') {
    if (!body.fullName?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '') || !body.department?.trim()) return send(res, 400, { error: 'Name, valid email, and department are required.' });
    const application = save('applications', { ...body, id: randomUUID(), fullName: body.fullName.trim(), email: body.email.trim().toLowerCase(), phone: String(body.phone || ''), rollNumber: String(body.rollNumber || ''), status: 'PENDING', submittedAt: new Date().toISOString() });
    return send(res, 201, { success: true, message: 'Application received.', application });
  }
  if (resource === 'events' && id && action === 'register' && req.method === 'POST') {
    const event = get('events', id);
    if (!event) return send(res, 404, { error: 'Event not found.' });
    if (!body.name?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || '')) return send(res, 400, { error: 'Name and valid email are required.' });
    const visitor = visitorSession(req);
    const registration = { id: randomUUID(), eventId: id, name: body.name.trim(), email: body.email.trim().toLowerCase(), phone: body.phone || '', department: body.department || '', yearOfStudy: body.yearOfStudy || '', rollNumber: body.rollNumber || '', passCode: `GCECT-ART-${randomBytes(3).toString('hex').toUpperCase()}`, submittedAt: new Date().toISOString() };
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
  handler(req, res).catch((error) => {
    console.error('API request failed:', error);
    send(res, error.status || 500, { error: error.status ? error.message : 'The server could not complete this request.' });
  });
});

const port = Number(process.env.PORT || 3002);
server.listen(port, process.env.HOST || '127.0.0.1', () => {
  console.log(`Brush and Bond API listening on http://${process.env.HOST || '127.0.0.1'}:${port}/api`);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) console.warn('Admin sign-in is disabled until ADMIN_EMAIL and ADMIN_PASSWORD are configured.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { db.close(); server.close(() => process.exit(0)); });
}
