/**
 * supabaseApi.ts
 * Drop-in replacement for the old REST api.ts — same function signatures,
 * same return shapes, no page component changes needed.
 */
import { supabase } from '../lib/supabase';

// ─── helpers ────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd local time
}

// Supabase stores canonical snake_case columns while the UI models use
// camelCase (and a few domain names such as event `date` and `imageUrl`).
// Keep database keys for older admin screens, and add normalized UI keys at
// this boundary. Recursing also handles joined artist/event-photo rows.
const rowAliases: Record<string, string> = {
  event_date: 'date',
  event_time: 'time',
  event_name: 'title',
  image_url: 'imageUrl',
  cover_url: 'imageUrl',
  banner_url: 'imageUrl',
  avatar_url: 'avatarUrl',
  photo_url: 'avatarUrl',
};

function normalizeRow<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => normalizeRow(item)) as unknown as T;
  if (!value || typeof value !== 'object') return value;

  const row = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(row)) {
    normalized[key] = normalizeRow(item);
  }
  for (const [key, normalizedValue] of Object.entries(normalized)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    if (camelKey !== key && (normalized[camelKey] == null || normalized[camelKey] === '')) {
      normalized[camelKey] = normalizedValue;
    }
    const alias = rowAliases[key];
    if (alias && (normalized[alias] == null || normalized[alias] === '')) {
      normalized[alias] = normalizedValue;
    }
  }
  return normalized as unknown as T;
}

async function getFunctionError(error: unknown): Promise<string> {
  if (error && typeof error === 'object' && 'context' in error && error.context instanceof Response) {
    try {
      const body = await error.context.clone().json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // Fall back to the SDK's message when the response body is unavailable.
    }
  }
  return error instanceof Error ? error.message : 'The submission could not be saved. Please try again.';
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account does not have the admin role.');
    }
    return {
      success: true,
      admin: {
        id: data.user.id,
        email: data.user.email ?? '',
        name: profile.full_name ?? data.user.email ?? '',
        role: 'admin' as const,
      },
    };
  },

  getMe: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const err = Object.assign(new Error('No session'), { status: 401 });
      throw err;
    }
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single();
    if (error || !profile || profile.role !== 'admin') {
      const err = Object.assign(new Error('Not an admin'), { status: 401 });
      throw err;
    }
    return {
      success: true,
      admin: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: profile.full_name ?? session.user.email ?? '',
        role: 'admin' as const,
      },
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { success: true };
  },
};

// ─── Artworks ────────────────────────────────────────────────────────────────

export const artworkApi = {
  getAll: async (params?: { category?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
    const page = params?.page ?? 0;
    const size = params?.limit ?? 24;
    let q = supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * size, page * size + size - 1);
    if (params?.category) q = q.eq('category', params.category);
    if (params?.featured) q = q.eq('featured', true);
    if (params?.search) q = q.ilike('title', `%${params.search}%`);
    const { data, error, count } = await q;
    if (error) throw new Error(error.message);
    return { success: true, total: count ?? 0, artworks: normalizeRow(data ?? []) };
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('category');
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.category] = (counts[row.category] ?? 0) + 1;
    }
    return { success: true, counts };
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('featured', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, artworks: normalizeRow(data ?? []) };
  },

  getById: async (id: number | string) => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    // Also remove the file from storage
    const { data: artwork } = await supabase
      .from('artworks')
      .select('image_url')
      .eq('id', id)
      .single();
    if (artwork?.image_url) {
      const url = new URL(artwork.image_url);
      const path = url.pathname.split('/artworks/')[1];
      if (path) await supabase.storage.from('artworks').remove([path]);
    }
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Artwork deleted.' };
  },

  like: async (id: number | string, _liked: boolean) => {
    // Get or create a stable anonymous visitor id stored in localStorage
    let visitorId = '';
    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    try {
      visitorId = localStorage.getItem('bb_visitor_id') ?? '';
      if (!isUuid(visitorId)) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('bb_visitor_id', visitorId);
      }
    } catch {
      visitorId = crypto.randomUUID(); // fallback if localStorage blocked
    }
    const { data, error } = await supabase.rpc('toggle_artwork_like', {
      p_artwork_id: id,
      p_visitor_id: visitorId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return { success: true, likes: row?.likes ?? 0, isLiked: row?.is_liked ?? false };
  },
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const eventApi = {
  getAll: async (type?: 'upcoming' | 'past') => {
    const today = todayISO();
    let q = supabase.from('events').select('*, event_photos(*)');
    if (type === 'upcoming') q = q.gte('event_date', today).order('event_date', { ascending: true });
    else if (type === 'past') q = q.lt('event_date', today).order('event_date', { ascending: false });
    else q = q.order('event_date', { ascending: false });
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { success: true, events: normalizeRow(data ?? []) };
  },

  getUpcoming: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .gte('event_date', todayISO())
      .order('event_date', { ascending: true });
    if (error) throw new Error(error.message);
    return { success: true, events: normalizeRow(data ?? []) };
  },

  getPast: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .lt('event_date', todayISO())
      .order('event_date', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, events: normalizeRow(data ?? []) };
  },

  getById: async (id: number | string) => {
    // Try by id first, fallback to slug
    const byId = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('id', id)
      .maybeSingle();
    if (byId.data) return { success: true, event: normalizeRow(byId.data) };
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('slug', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, event: normalizeRow(data) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('events').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, event: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('events').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, event: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Event deleted.' };
  },

  register: async (id: number | string, payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('public-submission', {
      body: { type: 'event-registration', data: { ...payload, eventId: id } },
    });
    if (error) throw new Error(await getFunctionError(error));
    if (!data?.success) throw new Error(data?.error ?? 'Registration failed. Please try again.');
    return {
      success: true,
      message: data.message,
      registration: { ...payload, ...data.registration },
      registeredCount: data.registeredCount ?? 0,
    };
  },

  getRegistrations: async (id: number | string) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, registrations: normalizeRow(data ?? []) };
  },
};

// ─── Artists ─────────────────────────────────────────────────────────────────

export const artistApi = {
  getAll: async (search?: string) => {
    let q = supabase.from('artists').select('*, artworks(*)').order('name');
    if (search) q = q.ilike('name', `%${search}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { success: true, artists: normalizeRow(data ?? []) };
  },

  getSpotlight: async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .not('spotlight_month', 'is', null)
      .order('spotlight_month', { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);
    return { success: true, artists: normalizeRow(data ?? []) };
  },

  getById: async (id: number | string) => {
    const byId = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .eq('id', id)
      .maybeSingle();
    if (byId.data) return { success: true, artist: normalizeRow(byId.data) };
    const { data, error } = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .eq('slug', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artist: normalizeRow(data) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artists').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artist: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artists').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artist: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('artists').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Artist deleted.' };
  },
};

// ─── Applications ────────────────────────────────────────────────────────────

export const applicationApi = {
  submit: async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('public-submission', {
      body: { type: 'membership', data: payload },
    });
    if (error) throw new Error(await getFunctionError(error));
    if (!data?.success) throw new Error(data?.error ?? 'We could not send your application. Please try again.');
    const saved = data.application;
    return {
      success: true,
      message: data.message,
      application: {
        id: saved.id,
        fullName: saved.name,
        name: saved.name,
        email: payload.email,
        department: saved.department,
        academicYear: saved.year,
        year: saved.year,
        artInterests: saved.interest,
        areaOfInterest: saved.interest,
        portfolioUrl: saved.portfolio ?? undefined,
        whyJoin: saved.reason,
        reasonToJoin: saved.reason,
        submittedAt: saved.created_at,
        status: 'PENDING',
      },
    };
  },

  getAll: async (status?: string) => {
    let q = supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    if (status && status !== 'ALL') q = q.eq('status', status.toLowerCase());
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const applications = (normalizeRow(data ?? []) as Array<Record<string, any>>).map((application) => ({
      ...application,
      fullName: application.fullName || application.name || '',
      academicYear: application.academicYear || application.year || '',
      artInterests: application.artInterests || application.interest || application.primaryWing || '',
      portfolioUrl: application.portfolioUrl || application.portfolio_url || application.portfolio || '',
      whyJoin: application.whyJoin || application.reason || application.motivation || '',
      status: String(application.status ?? 'pending').toUpperCase(),
    }));
    return { success: true, applications };
  },

  updateStatus: async (id: number | string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const { data, error } = await supabase
      .from('membership_applications')
      .update({ status: status.toLowerCase() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, message: 'Status updated.', application: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('membership_applications').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Application deleted.' };
  },
};

// ─── Achievements ────────────────────────────────────────────────────────────

export const achievementApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('achieved_on', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, achievements: normalizeRow(data ?? []) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('achievements').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, achievement: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('achievements').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, achievement: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Achievement deleted.' };
  },
};

// ─── Headline numbers (site_stats) ───────────────────────────────────────────

export const headlineNumberApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('site_stats').select('key, value');
    if (error) throw new Error(error.message);
    // Map to the shape the old API returned: [{ id: key, label: key, value }]
    const headlineNumbers = (data ?? []).map((r) => ({ id: r.key, label: r.key, value: String(r.value), description: '' }));
    return { success: true, headlineNumbers };
  },

  update: async (id: number | string, body: { value?: string }) => {
    const { data, error } = await supabase
      .from('site_stats')
      .update({ value: body.value === undefined ? undefined : Number(body.value) })
      .eq('key', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      success: true,
      headlineNumber: { id: data.key, label: data.key, value: String(data.value), description: '' },
    };
  },
};

// ─── Team ────────────────────────────────────────────────────────────────────

export const teamApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('tier')
      .order('sort_order');
    if (error) throw new Error(error.message);
    return { success: true, team: normalizeRow(data ?? []) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('team_members').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, member: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('team_members').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, member: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Member deleted.' };
  },
};

// ─── Campus Art (mapped to artworks with category='campus-art') ───────────────

export const campusArtApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('category', 'campus-art')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, artworks: normalizeRow(data ?? []) };
  },

  getById: async (id: number | string) => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert({ ...body, category: 'campus-art' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artworks').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Campus art deleted.' };
  },
};

// ─── Announcements ───────────────────────────────────────────────────────────

export const announcementApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, announcements: normalizeRow(data ?? []) };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('announcements').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, announcement: normalizeRow(data) };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('announcements').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, announcement: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Announcement deleted.' };
  },
};

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactApi = {
  submit: async (payload: { name: string; email: string; subject?: string; message: string }) => {
    const { data, error } = await supabase.functions.invoke('public-submission', {
      body: { type: 'contact', data: payload },
    });
    if (error) throw new Error(await getFunctionError(error));
    if (!data?.success) throw new Error(data?.error ?? 'Could not send your message. Please try again.');
    return { success: true, message: data.message, contact: payload };
  },

  getAll: async (_isRead?: boolean) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, messages: normalizeRow(data ?? []) };
  },

  markAsRead: async (id: number | string) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, contact: normalizeRow(data) };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Message deleted.' };
  },
};

// ─── Stats (admin dashboard counts) ─────────────────────────────────────────

export const statsApi = {
  getStats: async () => {
    const [artworks, events, members, registrations] = await Promise.all([
      supabase.from('artworks').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('membership_applications').select('*', { count: 'exact', head: true }),
      supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
    ]);
    return {
      success: true,
      stats: {
        totalArtworks: artworks.count ?? 0,
        totalEvents: events.count ?? 0,
        totalMembers: members.count ?? 0,
        totalRegistrations: registrations.count ?? 0,
      },
    };
  },
};

// ─── Admin analytics (database-backed counts only) ───────────────────────────

async function countRows(table: string, createdSince?: string) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  if (createdSince) query = query.gte('created_at', createdSince);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function sumPublishedArtworkLikes() {
  // The artwork_likes table deliberately denies direct reads so visitor IDs
  // remain private. The public artwork aggregate is safe to use for analytics.
  const { data, error } = await supabase.from('artworks').select('likes');
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((total, artwork) => total + (artwork.likes ?? 0), 0);
}

export const adminAnalyticsApi = {
  getOverview: async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [
      artworks, artists, events, registrations, applications, messages, achievements, likes,
      recentRegistrations, recentApplications, recentMessages,
    ] = await Promise.all([
      countRows('artworks'),
      countRows('artists'),
      countRows('events'),
      countRows('event_registrations'),
      countRows('membership_applications'),
      countRows('contact_messages'),
      countRows('achievements'),
      sumPublishedArtworkLikes(),
      countRows('event_registrations', since),
      countRows('membership_applications', since),
      countRows('contact_messages', since),
    ]);

    return {
      totals: { artworks, artists, events, registrations, applications, messages, achievements, likes },
      last30Days: { registrations: recentRegistrations, applications: recentApplications, messages: recentMessages },
      generatedAt: new Date().toISOString(),
    };
  },
};

// ─── Image upload helper ─────────────────────────────────────────────────────

export async function uploadImage(
  bucket: 'artworks' | 'events' | 'artists' | 'team',
  file: File,
  folder?: string,
): Promise<{ publicUrl: string; width: number; height: number }> {
  const maxInputBytes = 20 * 1024 * 1024;
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }
  if (file.size === 0 || file.size > maxInputBytes) {
    throw new Error('Choose an image smaller than 20 MB to upload.');
  }

  // Decode and optimize before upload so corrupt/oversized images do not
  // consume Storage quota. Always release the temporary browser object URL.
  const objectUrl = URL.createObjectURL(file);
  const decoded = await new Promise<{ image: HTMLImageElement; width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('The selected file is not a valid image.'));
    img.src = objectUrl;
  }).finally(() => URL.revokeObjectURL(objectUrl));
  if (!decoded.width || !decoded.height || decoded.width > 10_000 || decoded.height > 10_000 || decoded.width * decoded.height > 24_000_000) {
    throw new Error('Image dimensions are too large. Use an image under 24 megapixels.');
  }

  const targetBytes = 350 * 1024;
  const hardLimitBytes = 1 * 1024 * 1024;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot process the selected image.');

  let maxDimension = 2000;
  let optimized: Blob | null = null;
  let outputWidth = 0;
  let outputHeight = 0;
  while (maxDimension >= 1000) {
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    canvas.width = Math.max(1, Math.round(decoded.width * scale));
    canvas.height = Math.max(1, Math.round(decoded.height * scale));
    outputWidth = canvas.width;
    outputHeight = canvas.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.86, 0.8, 0.74, 0.68]) {
      optimized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (optimized && optimized.size <= targetBytes) break;
    }
    if (optimized && optimized.size <= targetBytes) break;
    maxDimension -= 250;
  }
  canvas.width = 0;
  canvas.height = 0;

  if (!optimized || optimized.size > hardLimitBytes) {
    throw new Error('This image could not be compressed below 1 MB. Choose a smaller image.');
  }

  const path = folder
    ? `${folder}/${crypto.randomUUID()}.webp`
    : `${crypto.randomUUID()}.webp`;

  const { error: upError } = await supabase.storage
    .from(bucket)
    .upload(path, optimized, { contentType: 'image/webp', cacheControl: '31536000' });
  if (upError) throw new Error(upError.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { publicUrl: data.publicUrl, width: outputWidth, height: outputHeight };
}

// Re-export ApiRequestError shape so existing catch blocks still work
export class ApiRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export const apiRequest = async () => { throw new Error('Use supabaseApi directly.'); };
