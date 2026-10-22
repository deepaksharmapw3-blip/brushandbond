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
    return { success: true, total: count ?? 0, artworks: data ?? [] };
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
    return { success: true, artworks: data ?? [] };
  },

  getById: async (id: number | string) => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
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
    try {
      visitorId = localStorage.getItem('bb_visitor_id') ?? '';
      if (!visitorId) {
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
    return { success: true, events: data ?? [] };
  },

  getUpcoming: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .gte('event_date', todayISO())
      .order('event_date', { ascending: true });
    if (error) throw new Error(error.message);
    return { success: true, events: data ?? [] };
  },

  getPast: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .lt('event_date', todayISO())
      .order('event_date', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, events: data ?? [] };
  },

  getById: async (id: number | string) => {
    // Try by id first, fallback to slug
    const byId = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('id', id)
      .maybeSingle();
    if (byId.data) return { success: true, event: byId.data };
    const { data, error } = await supabase
      .from('events')
      .select('*, event_photos(*)')
      .eq('slug', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, event: data };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('events').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, event: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('events').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, event: data };
  },

  delete: async (id: number | string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Event deleted.' };
  },

  register: async (id: number | string, payload: Record<string, unknown>) => {
    const { error } = await supabase.from('event_registrations').insert({
      event_id: id,
      name: payload.name,
      department: payload.department,
      year: payload.year,
      email: payload.email,
      phone: payload.phone ?? null,
    });
    if (error?.code === '23505') throw new Error('You are already registered for this event.');
    if (error) throw new Error('Registration failed. Please try again.');
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);
    return { success: true, message: 'Registered successfully!', registration: payload, registeredCount: count ?? 0 };
  },

  getRegistrations: async (id: number | string) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, registrations: data ?? [] };
  },
};

// ─── Artists ─────────────────────────────────────────────────────────────────

export const artistApi = {
  getAll: async (search?: string) => {
    let q = supabase.from('artists').select('*, artworks(*)').order('name');
    if (search) q = q.ilike('name', `%${search}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { success: true, artists: data ?? [] };
  },

  getSpotlight: async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .not('spotlight_month', 'is', null)
      .order('spotlight_month', { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);
    return { success: true, artists: data ?? [] };
  },

  getById: async (id: number | string) => {
    const byId = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .eq('id', id)
      .maybeSingle();
    if (byId.data) return { success: true, artist: byId.data };
    const { data, error } = await supabase
      .from('artists')
      .select('*, artworks(*)')
      .eq('slug', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artist: data };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artists').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artist: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artists').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artist: data };
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
    const { error } = await supabase.from('membership_applications').insert({
      name: (payload.fullName || payload.name) as string,
      department: payload.department as string,
      year: (payload.academicYear || payload.year) as string,
      email: payload.email as string,
      interest: (payload.artInterests || payload.interest) as string,
      portfolio: (payload.portfolioUrl ?? null) as string | null,
      reason: (payload.whyJoin || payload.reason || null) as string | null,
    });
    if (error) throw new Error('We could not send your application. Please try again.');
    // Return shape that membershipService.ts expects
    const application = {
      id: crypto.randomUUID(),
      fullName: payload.fullName || payload.name,
      email: payload.email,
      department: payload.department,
      academicYear: payload.academicYear || payload.year,
      artInterests: payload.artInterests || payload.interest,
      portfolioUrl: payload.portfolioUrl || null,
      whyJoin: payload.whyJoin || payload.reason,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    return { success: true, message: 'Application submitted!', application };
  },

  getAll: async (status?: string) => {
    let q = supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    if (status && status !== 'ALL') q = q.eq('status', status.toLowerCase());
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { success: true, applications: data ?? [] };
  },

  updateStatus: async (id: number | string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const { data, error } = await supabase
      .from('membership_applications')
      .update({ status: status.toLowerCase() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, message: 'Status updated.', application: data };
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
    return { success: true, achievements: data ?? [] };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('achievements').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, achievement: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('achievements').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, achievement: data };
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
    const headlineNumbers = (data ?? []).map((r) => ({ id: r.key, label: r.key, value: r.value }));
    return { success: true, headlineNumbers };
  },

  update: async (id: number | string, body: { value?: number }) => {
    const { data, error } = await supabase
      .from('site_stats')
      .update({ value: body.value })
      .eq('key', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, headlineNumber: data };
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
    return { success: true, team: data ?? [] };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('team_members').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, member: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('team_members').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, member: data };
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
    return { success: true, artworks: data ?? [] };
  },

  getById: async (id: number | string) => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:artists(id, name, slug)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert({ ...body, category: 'campus-art' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('artworks').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, artwork: data };
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
    return { success: true, announcements: data ?? [] };
  },

  create: async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('announcements').insert(body).select().single();
    if (error) throw new Error(error.message);
    return { success: true, announcement: data };
  },

  update: async (id: number | string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.from('announcements').update(body).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, announcement: data };
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
    const { error } = await supabase.from('contact_messages').insert({
      name: payload.name,
      email: payload.email,
      message: payload.subject ? `[${payload.subject}] ${payload.message}` : payload.message,
    });
    if (error) throw new Error('Could not send your message. Please try again.');
    return { success: true, message: 'Message sent!', contact: payload };
  },

  getAll: async (_isRead?: boolean) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { success: true, messages: data ?? [] };
  },

  markAsRead: async (id: number | string) => {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, contact: data };
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

// ─── Image upload helper ─────────────────────────────────────────────────────

export async function uploadImage(
  bucket: 'artworks' | 'events' | 'artists' | 'team',
  file: File,
  folder?: string,
): Promise<{ publicUrl: string; width: number; height: number }> {
  const ext = 'webp';
  const path = folder
    ? `${folder}/${crypto.randomUUID()}.${ext}`
    : `${crypto.randomUUID()}.${ext}`;

  const { error: upError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: 'image/webp', cacheControl: '31536000' });
  if (upError) throw new Error(upError.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  // Read dimensions from the file
  const dims = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });

  return { publicUrl: data.publicUrl, ...dims };
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
