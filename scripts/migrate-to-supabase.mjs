/**
 * migrate-to-supabase.mjs
 *
 * Pulls every record from the live Render API, re-uploads any /uploads/…
 * image to Supabase Storage, then inserts all rows into Supabase Postgres.
 *
 * Prerequisites:
 *   1. Run supabase/rls_policies.sql  in the Supabase SQL Editor.
 *   2. Run supabase/schema_additions.sql in the Supabase SQL Editor.
 *   3. Create a profiles row for at least one admin (Section 7 of the guide).
 *   4. Set env vars (see below) then run:
 *        node --env-file=.env.local scripts/migrate-to-supabase.mjs
 *
 * Required env vars (in .env.local):
 *   VITE_SUPABASE_URL        – your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY   – anon public key  (read/insert only)
 *   RENDER_API_URL           – e.g. https://brushandbond-1.onrender.com/api
 *   RENDER_ADMIN_EMAIL       – admin email on Render
 *   RENDER_ADMIN_PASSWORD    – admin password on Render
 *
 * The script is idempotent: records whose slug already exists are skipped.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON    = process.env.VITE_SUPABASE_ANON_KEY;
const RENDER_API       = (process.env.RENDER_API_URL || 'https://brushandbond-1.onrender.com/api').replace(/\/$/, '');
const RENDER_EMAIL     = process.env.RENDER_ADMIN_EMAIL;
const RENDER_PASSWORD  = process.env.RENDER_ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('❌  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}
if (!RENDER_EMAIL || !RENDER_PASSWORD) {
  console.error('❌  Set RENDER_ADMIN_EMAIL and RENDER_ADMIN_PASSWORD in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const RENDER_BASE = RENDER_API.replace('/api', ''); // for /uploads/ paths

// ─── Helpers ─────────────────────────────────────────────────────────────────

let renderCookies = '';

async function renderFetch(path, options = {}) {
  const res = await fetch(`${RENDER_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: renderCookies,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Render ${path} → HTTP ${res.status}`);
  return res.json();
}

async function loginToRender() {
  const res = await fetch(`${RENDER_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: RENDER_EMAIL, password: RENDER_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Render login failed: HTTP ${res.status}`);
  // Capture session cookie
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) renderCookies = setCookie.split(';')[0];
  const body = await res.json();
  console.log(`✅  Logged in to Render as ${body?.admin?.email ?? RENDER_EMAIL}`);
}

/** Slug generator — same logic as AdminGalleryPage */
function makeSlug(title, suffix = '') {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + (suffix ? `-${suffix}` : '');
}

/** Download a /uploads/… file from Render and upload to Supabase Storage.
 *  Returns the public URL, or the original URL if it's already https://. */
async function migrateImage(rawUrl, bucket, folder) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) return rawUrl;

  // Relative path like /uploads/uuid.ext
  const absoluteUrl = `${RENDER_BASE}${rawUrl}`;
  try {
    const res = await fetch(absoluteUrl);
    if (!res.ok) {
      console.warn(`  ⚠️  Could not download ${absoluteUrl} (${res.status}) — keeping original URL`);
      return rawUrl;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = rawUrl.split('.').pop() || 'jpg';
    const path = folder ? `${folder}/${crypto.randomUUID()}.${ext}` : `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: res.headers.get('content-type') || 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) {
      console.warn(`  ⚠️  Storage upload failed for ${rawUrl}: ${error.message}`);
      return rawUrl;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn(`  ⚠️  Image migration error for ${rawUrl}: ${err.message}`);
    return rawUrl;
  }
}

let skipped = 0;
let inserted = 0;
let errors = 0;

async function upsertRow(table, row, conflictColumn = 'slug') {
  const { error } = await supabase.from(table).upsert(row, { onConflict: conflictColumn, ignoreDuplicates: true });
  if (error) {
    console.error(`  ❌  ${table}: ${error.message}`);
    errors++;
  } else {
    inserted++;
  }
}

// ─── Migration functions ──────────────────────────────────────────────────────

async function migrateArtworks(artists) {
  console.log('\n📦  Migrating artworks…');
  const { artworks } = await renderFetch('/artworks?limit=1000');
  if (!artworks?.length) { console.log('  (none found)'); return; }

  // Build slug → artist_id map
  const artistMap = new Map(artists.map((a) => [String(a._renderId), a.id]));

  for (const art of artworks) {
    const imageUrl = await migrateImage(art.imageUrl, 'artworks', String(new Date().getFullYear()));
    const categoryMap = { SKETCHES: 'sketches', PAINTINGS: 'paintings', DIGITAL_ART: 'digitalart', PHOTOGRAPHY: 'photography' };
    const slug = makeSlug(art.title, art.id);

    await upsertRow('artworks', {
      slug,
      title: art.title,
      image_url: imageUrl || 'https://placehold.co/800x600',
      width: art.width || 800,
      height: art.height || 600,
      alt: art.title,
      category: categoryMap[art.category] ?? 'sketches',
      artist_id: art.artistId ? artistMap.get(String(art.artistId)) ?? null : null,
      department: art.department || null,
      art_year: art.year || new Date().getFullYear(),
      description: art.description || null,
      featured: Boolean(art.featured),
      likes: art.likes || 0,
      is_published: true,
    });
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${artworks.length} artworks processed`);
}

async function migrateArtists() {
  console.log('\n👨‍🎨  Migrating artists…');
  const { artists } = await renderFetch('/artists');
  if (!artists?.length) { console.log('  (none found)'); return []; }

  const result = [];
  for (const art of artists) {
    const photoUrl = await migrateImage(art.avatarUrl || art.photoUrl, 'artists');
    const slug = makeSlug(art.name, art.id);

    const { data, error } = await supabase.from('artists').upsert({
      slug,
      name: art.name,
      department: art.department || null,
      batch_year: art.year ? parseInt(art.year) || null : null,
      photo_url: photoUrl || null,
      bio: art.bio || null,
      quote: art.quote || null,
      interview: art.interview || [],
      spotlight_month: art.isSpotlight ? new Date().toISOString().slice(0, 10) : null,
      is_published: true,
    }, { onConflict: 'slug', ignoreDuplicates: true }).select('id').single();

    if (error) {
      console.error(`  ❌  artist "${art.name}": ${error.message}`);
      errors++;
    } else {
      result.push({ _renderId: art.id, id: data.id, slug });
      inserted++;
    }
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${artists.length} artists processed`);
  return result;
}

async function migrateEvents() {
  console.log('\n🎪  Migrating events…');
  const [{ events: upcoming }, { events: past }] = await Promise.all([
    renderFetch('/events/upcoming'),
    renderFetch('/events/past'),
  ]);
  const all = [...(upcoming || []), ...(past || [])];
  if (!all.length) { console.log('  (none found)'); return []; }

  const typeMap = {
    Workshop: 'workshop', Competition: 'competition', Exhibition: 'exhibition',
    'Live Sketching': 'livesketching', Collaboration: 'collaboration', Challenge: 'challenge',
  };
  const result = [];
  for (const ev of all) {
    const coverUrl = await migrateImage(ev.bannerUrl || ev.coverUrl, 'events');
    const slug = makeSlug(ev.title || ev.event_name, ev.id);
    const eventDate = ev.eventDate || ev.event_date || new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase.from('events').upsert({
      slug,
      title: ev.title || ev.event_name,
      event_date: eventDate,
      event_time: ev.eventTime || ev.event_time || null,
      location: ev.venue || ev.location || null,
      description: ev.description || '',
      cover_url: coverUrl || null,
      type: typeMap[ev.category] ?? 'workshop',
      registration_open: Boolean(ev.registrationOpen),
      is_published: true,
    }, { onConflict: 'slug', ignoreDuplicates: true }).select('id').single();

    if (error) {
      console.error(`  ❌  event "${ev.title}": ${error.message}`);
      errors++;
    } else {
      result.push({ _renderId: ev.id || ev.event_id, id: data.id });
      inserted++;
    }
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${all.length} events processed`);
  return result;
}

async function migrateTeam() {
  console.log('\n👥  Migrating team…');
  const { team } = await renderFetch('/team');
  if (!team?.length) { console.log('  (none found)'); return; }

  for (let i = 0; i < team.length; i++) {
    const m = team[i];
    const photoUrl = await migrateImage(m.avatarUrl || m.photoUrl, 'team');

    await upsertRow('team_members', {
      name: m.name,
      role_title: m.role || m.roleTitle || 'Member',
      photo_url: photoUrl || null,
      tier: (m.tier === 'executive' || m.isLead) ? 'executive' : 'member',
      join_year: m.year ? parseInt(m.year) || null : null,
      instagram: m.instagramUrl || m.instagram || null,
      linkedin: m.linkedinUrl || m.linkedin || null,
      sort_order: m.displayOrder ?? i,
      is_active: true,
    }, 'name');
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${team.length} team members processed`);
}

async function migrateAchievements() {
  console.log('\n🏆  Migrating achievements…');
  const { achievements } = await renderFetch('/achievements');
  if (!achievements?.length) { console.log('  (none found)'); return; }

  for (const ach of achievements) {
    const photoUrl = await migrateImage(ach.imageUrl, 'artworks', 'achievements');
    await upsertRow('achievements', {
      title: ach.title,
      achieved_on: ach.awardDate || null,
      description: ach.description || null,
      photo_url: photoUrl || null,
    }, 'title');
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${achievements.length} achievements processed`);
}

async function migrateAnnouncements() {
  console.log('\n📢  Migrating announcements…');
  const { announcements } = await renderFetch('/announcements');
  if (!announcements?.length) { console.log('  (none found)'); return; }

  for (const ann of announcements) {
    const text = ann.content || ann.text || ann.title;
    if (!text) continue;
    const { error } = await supabase.from('announcements').upsert({
      text,
      link: ann.link || null,
      active: ann.active ?? true,
      expires_at: ann.expiresAt || null,
    }, { onConflict: 'text', ignoreDuplicates: true });
    if (error) { errors++; } else { inserted++; }
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${announcements.length} announcements processed`);
}

async function migrateStats() {
  console.log('\n📊  Migrating headline numbers…');
  const { headlineNumbers } = await renderFetch('/headline-numbers');
  if (!headlineNumbers?.length) { console.log('  (none found)'); return; }

  const keyMap = {
    eventsConducted: 'events_conducted', studentArtists: 'student_artists',
    workshops: 'workshops', collaborations: 'collaborations',
  };
  for (const hn of headlineNumbers) {
    const key = keyMap[hn.id] || hn.id;
    const { error } = await supabase.from('site_stats').upsert({ key, value: hn.value || 0 }, { onConflict: 'key' });
    if (error) { errors++; } else { inserted++; }
  }
  console.log(`  ✅  ${headlineNumbers.length} stats processed`);
}

async function migrateApplications() {
  console.log('\n📝  Migrating membership applications…');
  const { applications } = await renderFetch('/applications');
  if (!applications?.length) { console.log('  (none found)'); return; }

  for (const app of applications) {
    const { error } = await supabase.from('membership_applications').insert({
      name: app.fullName || app.name,
      department: app.department,
      year: app.academicYear || app.year || 'Unknown',
      email: app.email,
      interest: app.artInterests || app.interest || 'General',
      portfolio: app.portfolioUrl || null,
      reason: app.whyJoin || app.reason || null,
      status: (app.status || 'PENDING').toLowerCase(),
      created_at: app.createdAt || new Date().toISOString(),
    });
    if (error && error.code !== '23505') { // skip duplicates silently
      errors++;
    } else {
      inserted++;
    }
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${applications.length} applications processed`);
}

async function migrateContacts() {
  console.log('\n✉️   Migrating contact messages…');
  const { messages } = await renderFetch('/contact');
  if (!messages?.length) { console.log('  (none found)'); return; }

  for (const msg of messages) {
    const { error } = await supabase.from('contact_messages').insert({
      name: msg.name,
      email: msg.email,
      message: msg.subject ? `[${msg.subject}] ${msg.message}` : msg.message,
      is_read: msg.isRead || false,
      created_at: msg.createdAt || new Date().toISOString(),
    });
    if (error && error.code !== '23505') { errors++; } else { inserted++; }
    process.stdout.write('.');
  }
  console.log(`\n  ✅  ${messages.length} messages processed`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Brush and Bond — Render → Supabase Migration');
  console.log(`    Render API : ${RENDER_API}`);
  console.log(`    Supabase   : ${SUPABASE_URL}\n`);

  await loginToRender();

  const artists = await migrateArtists();
  await migrateArtworks(artists);
  await migrateEvents();
  await migrateTeam();
  await migrateAchievements();
  await migrateAnnouncements();
  await migrateStats();
  await migrateApplications();
  await migrateContacts();

  console.log('\n─────────────────────────────────────────────────');
  console.log(`✅  Done. inserted=${inserted}  skipped=${skipped}  errors=${errors}`);

  if (errors > 0) {
    console.log('\n⚠️   Some records failed. Re-run the script — upsert skips already-migrated rows.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n💥  Migration aborted:', err.message);
  process.exit(1);
});
