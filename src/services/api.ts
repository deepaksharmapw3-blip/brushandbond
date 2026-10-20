const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bb-auth-token') || localStorage.getItem('bb-admin-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }
  return data as T;
}

// 1. Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ success: boolean; token: string; admin: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getMe: async () => {
    return request<{ success: boolean; admin: any }>('/auth/me');
  },
};

// 2. Artworks API
export const artworkApi = {
  getAll: async (params?: { category?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'All') q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    if (params?.featured !== undefined) q.set('featured', String(params.featured));
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; total: number; artworks: any[] }>(`/artworks${qs}`);
  },
  getCategories: async () => {
    return request<{ success: boolean; counts: any }>('/artworks/categories');
  },
  getFeatured: async () => {
    return request<{ success: boolean; artworks: any[] }>('/artworks/featured');
  },
  getById: async (id: number | string) => {
    return request<{ success: boolean; artwork: any }>(`/artworks/${id}`);
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; artwork: any }>('/artworks', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; artwork: any }>(`/artworks/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/artworks/${id}`, {
      method: 'DELETE',
    });
  },
  like: async (id: number | string) => {
    return request<{ success: boolean; likes: number }>(`/artworks/${id}/like`, {
      method: 'POST',
    });
  },
};

// 3. Events API
export const eventApi = {
  getAll: async (type?: 'upcoming' | 'past') => {
    const q = type ? `?type=${type}` : '';
    return request<{ success: boolean; events: any[] }>(`/events${q}`);
  },
  getUpcoming: async () => {
    return request<{ success: boolean; events: any[] }>('/events/upcoming');
  },
  getPast: async () => {
    return request<{ success: boolean; events: any[] }>('/events/past');
  },
  getById: async (id: number | string) => {
    return request<{ success: boolean; event: any }>(`/events/${id}`);
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; event: any }>('/events', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; event: any }>(`/events/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
  register: async (id: number | string, payload: any) => {
    return request<{ success: boolean; message: string; registration: any }>(`/events/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getRegistrations: async (id: number | string) => {
    return request<{ success: boolean; registrations: any[] }>(`/events/${id}/registrations`);
  },
};

// 4. Artists API
export const artistApi = {
  getAll: async (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{ success: boolean; artists: any[] }>(`/artists${q}`);
  },
  getSpotlight: async () => {
    return request<{ success: boolean; artists: any[] }>('/artists/spotlight');
  },
  getById: async (id: number | string) => {
    return request<{ success: boolean; artist: any }>(`/artists/${id}`);
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; artist: any }>('/artists', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; artist: any }>(`/artists/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/artists/${id}`, {
      method: 'DELETE',
    });
  },
};

// 5. Applications API (Join the Club)
export const applicationApi = {
  submit: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    rollNumber: string;
    academicYear: string;
    artInterests: string;
    portfolioUrl?: string;
    whyJoin: string;
  }) => {
    return request<{ success: boolean; message: string; application: any }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getAll: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<{ success: boolean; applications: any[] }>(`/applications${q}`);
  },
  updateStatus: async (id: number | string, status: 'APPROVED' | 'REJECTED' | 'PENDING', adminNotes?: string) => {
    return request<{ success: boolean; message: string; application: any }>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  },
};

// 6. Achievements API
export const achievementApi = {
  getAll: async () => {
    return request<{ success: boolean; achievements: any[] }>('/achievements');
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; achievement: any }>('/achievements', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; achievement: any }>(`/achievements/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/achievements/${id}`, {
      method: 'DELETE',
    });
  },
};

// 7. Team API
export const teamApi = {
  getAll: async () => {
    return request<{ success: boolean; team: any[] }>('/team');
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; member: any }>('/team', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; member: any }>(`/team/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/team/${id}`, {
      method: 'DELETE',
    });
  },
};

// 8. Campus Art API (Art Around GCECT)
export const campusArtApi = {
  getAll: async () => {
    return request<{ success: boolean; artworks: any[] }>('/campus-art');
  },
  getById: async (id: number | string) => {
    return request<{ success: boolean; artwork: any }>(`/campus-art/${id}`);
  },
  create: async (body: FormData | any) => {
    return request<{ success: boolean; artwork: any }>('/campus-art', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: FormData | any) => {
    return request<{ success: boolean; artwork: any }>(`/campus-art/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/campus-art/${id}`, {
      method: 'DELETE',
    });
  },
};

// 9. Announcements API
export const announcementApi = {
  getAll: async () => {
    return request<{ success: boolean; announcements: any[] }>('/announcements');
  },
  create: async (body: any) => {
    return request<{ success: boolean; announcement: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update: async (id: number | string, body: any) => {
    return request<{ success: boolean; announcement: any }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};

// 10. Contact API
export const contactApi = {
  submit: async (payload: { name: string; email: string; subject: string; message: string }) => {
    return request<{ success: boolean; message: string; contact: any }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getAll: async (isRead?: boolean) => {
    const q = isRead !== undefined ? `?isRead=${isRead}` : '';
    return request<{ success: boolean; messages: any[] }>(`/contact${q}`);
  },
  markAsRead: async (id: number | string) => {
    return request<{ success: boolean; contact: any }>(`/contact/${id}/read`, {
      method: 'PATCH',
    });
  },
  delete: async (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/contact/${id}`, {
      method: 'DELETE',
    });
  },
};

// 11. Admin Stats API
export const statsApi = {
  getStats: async () => {
    return request<{ success: boolean; stats: any }>('/admin/stats');
  },
};
