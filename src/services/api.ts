// All API calls now go through Supabase. This file re-exports everything from
// supabaseApi.ts so no import path in any component needs to change.
export * from './supabaseApi';

// ─── Legacy REST shim (kept for reference, no longer used) ───────────────────
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (body instanceof FormData) {
    const values: Record<string, unknown> = {};
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        values[key] = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Could not read the selected image.'));
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(value);
        });
      } else {
        values[key] = value;
      }
    }
    body = JSON.stringify(values);
  } else if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  if (body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    body,
    headers,
    credentials: 'same-origin',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiRequestError(payload.error || `Request failed (${response.status})`, response.status);
  }
  if (options.method && options.method !== 'GET' && /^\/(artworks|events|artists|achievements|headline-numbers)(\/|$)/.test(endpoint) && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('bb-data-updated'));
  }
  return payload as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const authApi = {
  login: (email: string, password: string) => request<{ success: boolean; admin: { id: string; email: string; name: string; role: 'admin' } }>('/auth/login', json('POST', { email, password })),
  getMe: () => request<{ success: boolean; admin: { id: string; email: string; name: string; role: 'admin' } }>('/auth/me'),
  logout: () => request<{ success: boolean }>('/auth/logout', json('POST')),
};

export const artworkApi = {
  getAll: (params?: { category?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    return request<{ success: boolean; total: number; artworks: any[] }>(`/artworks${query.size ? `?${query}` : ''}`);
  },
  getCategories: () => request<{ success: boolean; counts: Record<string, number> }>('/artworks/categories'),
  getFeatured: () => request<{ success: boolean; artworks: any[] }>('/artworks/featured'),
  getById: (id: number | string) => request<{ success: boolean; artwork: any }>(`/artworks/${encodeURIComponent(id)}`),
  create: (body: FormData | unknown) => request<{ success: boolean; artwork: any }>('/artworks', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  update: (id: number | string, body: FormData | unknown) => request<{ success: boolean; artwork: any }>(`/artworks/${encodeURIComponent(id)}`, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/artworks/${encodeURIComponent(id)}`, json('DELETE')),
  like: (id: number | string, liked: boolean) => request<{ success: boolean; likes: number; isLiked: boolean }>(`/artworks/${encodeURIComponent(id)}/like`, json('POST', { liked })),
};

export const eventApi = {
  getAll: (type?: 'upcoming' | 'past') => request<{ success: boolean; events: any[] }>(`/events${type ? `?type=${type}` : ''}`),
  getUpcoming: () => request<{ success: boolean; events: any[] }>('/events/upcoming'),
  getPast: () => request<{ success: boolean; events: any[] }>('/events/past'),
  getById: (id: number | string) => request<{ success: boolean; event: any }>(`/events/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; event: any }>('/events', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; event: any }>(`/events/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/events/${encodeURIComponent(id)}`, json('DELETE')),
  register: (id: number | string, payload: unknown) => request<{ success: boolean; message: string; registration: any; registeredCount: number }>(`/events/${encodeURIComponent(id)}/register`, json('POST', payload)),
  getRegistrations: (id: number | string) => request<{ success: boolean; registrations: any[] }>(`/events/${encodeURIComponent(id)}/registrations`),
};

export const artistApi = {
  getAll: (search?: string) => request<{ success: boolean; artists: any[] }>(`/artists${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getSpotlight: () => request<{ success: boolean; artists: any[] }>('/artists/spotlight'),
  getById: (id: number | string) => request<{ success: boolean; artist: any }>(`/artists/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; artist: any }>('/artists', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; artist: any }>(`/artists/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/artists/${encodeURIComponent(id)}`, json('DELETE')),
};

export const applicationApi = {
  submit: (payload: Record<string, unknown>) => request<{ success: boolean; message: string; application: any }>('/applications', json('POST', payload)),
  getAll: (status?: string) => request<{ success: boolean; applications: any[] }>(`/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateStatus: (id: number | string, status: 'APPROVED' | 'REJECTED' | 'PENDING', adminNotes?: string) => request<{ success: boolean; message: string; application: any }>(`/applications/${encodeURIComponent(id)}/status`, json('PATCH', { status, adminNotes })),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/applications/${encodeURIComponent(id)}`, json('DELETE')),
};

export const achievementApi = {
  getAll: () => request<{ success: boolean; achievements: any[] }>('/achievements'),
  create: (body: unknown) => request<{ success: boolean; achievement: any }>('/achievements', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; achievement: any }>(`/achievements/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/achievements/${encodeURIComponent(id)}`, json('DELETE')),
};

export const headlineNumberApi = {
  getAll: () => request<{ success: boolean; headlineNumbers: any[] }>('/headline-numbers'),
  update: (id: number | string, body: unknown) => request<{ success: boolean; headlineNumber: any }>(`/headline-numbers/${encodeURIComponent(id)}`, json('PUT', body)),
};

export const teamApi = {
  getAll: () => request<{ success: boolean; team: any[] }>('/team'),
  create: (body: unknown) => request<{ success: boolean; member: any }>('/team', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; member: any }>(`/team/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/team/${encodeURIComponent(id)}`, json('DELETE')),
};

export const campusArtApi = {
  getAll: () => request<{ success: boolean; artworks: any[] }>('/campus-art'),
  getById: (id: number | string) => request<{ success: boolean; artwork: any }>(`/campus-art/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; artwork: any }>('/campus-art', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; artwork: any }>(`/campus-art/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/campus-art/${encodeURIComponent(id)}`, json('DELETE')),
};

export const announcementApi = {
  getAll: () => request<{ success: boolean; announcements: any[] }>('/announcements'),
  create: (body: unknown) => request<{ success: boolean; announcement: any }>('/announcements', json('POST', body)),
  update: (id: number | string, body: unknown) => request<{ success: boolean; announcement: any }>(`/announcements/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/announcements/${encodeURIComponent(id)}`, json('DELETE')),
};

export const contactApi = {
  submit: (payload: { name: string; email: string; subject: string; message: string }) => request<{ success: boolean; message: string; contact: any }>('/contact', json('POST', payload)),
  getAll: (isRead?: boolean) => request<{ success: boolean; messages: any[] }>(`/contact${isRead === undefined ? '' : `?isRead=${isRead}`}`),
  markAsRead: (id: number | string) => request<{ success: boolean; contact: any }>(`/contact/${encodeURIComponent(id)}/read`, json('PATCH')),
  delete: (id: number | string) => request<{ success: boolean; message: string }>(`/contact/${encodeURIComponent(id)}`, json('DELETE')),
};

export const statsApi = {
  getStats: () => request<{ success: boolean; stats: any }>('/admin/stats'),
};

export const apiRequest = request;
