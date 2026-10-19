/**
 * Backend API Service
 * Connects to the agent-shield backend API with PostgreSQL
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export interface DashboardStats {
  totalArtworks: number;
  upcomingEvents: number;
  activeMembers: number;
  totalRegistrations: number;
  recentActivity: ActivityLog[];
  weekStats: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface ActivityLog {
  id: string;
  type: 'artwork' | 'event' | 'member' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface Artwork {
  id: number;
  title: string;
  category: string;
  image_url: string;
  artist_name: string;
  created_at: string;
  featured: boolean;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  registrations: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'pending' | 'approved';
  joined_at: string;
}

class BackendApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('bb-auth-token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('bb-auth-token');
          window.location.href = '/admin/login';
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/stats');
  }

  // Artworks
  async getArtworks(params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Artwork[]; total: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request(`/artworks${qs}`);
  }

  async createArtwork(artwork: Partial<Artwork>): Promise<Artwork> {
    return this.request('/artworks', {
      method: 'POST',
      body: JSON.stringify(artwork),
    });
  }

  async updateArtwork(id: number, artwork: Partial<Artwork>): Promise<Artwork> {
    return this.request(`/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artwork),
    });
  }

  async deleteArtwork(id: number): Promise<{ success: boolean }> {
    return this.request(`/artworks/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async getEvents(status?: 'upcoming' | 'past'): Promise<Event[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/events${qs}`);
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: number): Promise<{ success: boolean }> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Members
  async getMembers(status?: string): Promise<Member[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/members${qs}`);
  }

  async approveMember(id: number): Promise<Member> {
    return this.request(`/members/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectMember(id: number): Promise<{ success: boolean }> {
    return this.request(`/members/${id}/reject`, {
      method: 'POST',
    });
  }

  // Activity Log
  async getActivityLog(limit = 10): Promise<ActivityLog[]> {
    return this.request(`/admin/activity?limit=${limit}`);
  }
}

export const backendApi = new BackendApiService();
