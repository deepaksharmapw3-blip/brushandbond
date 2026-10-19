/**
 * Backend API Service
 * Uses localStorage-backed mock data for persistence
 * Can be extended to connect to a real backend
 */

// Note: agent-shield backend is for approval/audit, not data management
// Using localStorage persistence for demo/development
const STORAGE_PREFIX = 'bb_';

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
    this.initializeData();
  }

  private initializeData() {
    // Initialize localStorage with default data if empty
    if (!localStorage.getItem(`${STORAGE_PREFIX}artworks`)) {
      localStorage.setItem(
        `${STORAGE_PREFIX}artworks`,
        JSON.stringify([
          {
            id: 1,
            title: 'Urban Dreams',
            category: 'Oil on Canvas',
            image_url: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb',
            artist_name: 'Priya Sharma',
            created_at: new Date().toISOString(),
            featured: true,
          },
          {
            id: 2,
            title: 'Terracotta Dream',
            category: 'Sculpture',
            image_url: 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa',
            artist_name: 'Rohan Gupta',
            created_at: new Date().toISOString(),
            featured: false,
          },
        ])
      );
    }
    if (!localStorage.getItem(`${STORAGE_PREFIX}events`)) {
      localStorage.setItem(
        `${STORAGE_PREFIX}events`,
        JSON.stringify([
          {
            id: 1,
            title: 'The Canvas 2026',
            date: '2026-11-15',
            location: 'GCECT Main Hall',
            description: 'Annual Art Exhibition',
            registrations: 85,
          },
          {
            id: 2,
            title: 'Art Masterclass',
            date: '2026-11-22',
            location: 'Art Studio',
            description: 'Learn digital painting techniques',
            registrations: 45,
          },
        ])
      );
    }
    if (!localStorage.getItem(`${STORAGE_PREFIX}members`)) {
      localStorage.setItem(
        `${STORAGE_PREFIX}members`,
        JSON.stringify([
          {
            id: 1,
            name: 'Priya Sharma',
            email: 'priya@gcect.edu',
            department: 'Computer Science',
            status: 'active',
            joined_at: '2026-01-15',
          },
          {
            id: 2,
            name: 'Rohan Gupta',
            email: 'rohan@gcect.edu',
            department: 'Mechanical',
            status: 'pending',
            joined_at: '2026-10-10',
          },
        ])
      );
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    await this.simulateNetworkDelay();
    
    const artworks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}artworks`) || '[]') as Artwork[];
    const events = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}events`) || '[]') as Event[];
    const members = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}members`) || '[]') as Member[];

    return {
      totalArtworks: artworks.length,
      upcomingEvents: events.length,
      activeMembers: members.filter((m) => m.status === 'active').length,
      totalRegistrations: events.reduce((sum, e) => sum + e.registrations, 0),
      weekStats: {
        views: 2458,
        likes: 342,
        comments: 48,
      },
      recentActivity: [
        {
          id: '1',
          type: 'artwork',
          title: 'New artwork uploaded',
          description: artworks[0]?.title ? `${artworks[0].category}: "${artworks[0].title}" by ${artworks[0].artist_name}` : 'Urban Dreams',
          timestamp: '2 hours ago',
          user: artworks[0]?.artist_name || 'Artist',
        },
        {
          id: '2',
          type: 'member',
          title: 'New member application',
          description: members[0]?.name ? `${members[0].name} applied to join Brush and Bond` : 'New member applied',
          timestamp: '3 hours ago',
          user: members[0]?.name || 'Member',
        },
        {
          id: '3',
          type: 'event',
          title: 'Event created',
          description: events[0]?.title ? `${events[0].title} - ${events[0].description}` : 'New event created',
          timestamp: '1 day ago',
          user: 'Admin',
        },
        {
          id: '4',
          type: 'comment',
          title: 'New feedback',
          description: 'Comment on artwork: "Terracotta Dream"',
          timestamp: '2 days ago',
          user: 'Amitabh Kumar',
        },
      ],
    };
  }

  // Artworks
  async getArtworks(params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Artwork[]; total: number }> {
    await this.simulateNetworkDelay();
    
    let artworks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}artworks`) || '[]') as Artwork[];
    
    if (params?.search) {
      const term = params.search.toLowerCase();
      artworks = artworks.filter((a) => a.title.toLowerCase().includes(term) || a.artist_name.toLowerCase().includes(term));
    }
    if (params?.category) {
      artworks = artworks.filter((a) => a.category === params.category);
    }

    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const start = (page - 1) * limit;
    
    return {
      data: artworks.slice(start, start + limit),
      total: artworks.length,
    };
  }

  async createArtwork(artwork: Partial<Artwork>): Promise<Artwork> {
    await this.simulateNetworkDelay();
    
    const artworks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}artworks`) || '[]') as Artwork[];
    const newArtwork: Artwork = {
      id: Math.max(...artworks.map((a) => a.id), 0) + 1,
      title: artwork.title || 'Untitled',
      category: artwork.category || 'Uncategorized',
      image_url: artwork.image_url || '',
      artist_name: artwork.artist_name || 'Unknown',
      created_at: new Date().toISOString(),
      featured: artwork.featured || false,
    };
    
    artworks.push(newArtwork);
    localStorage.setItem(`${STORAGE_PREFIX}artworks`, JSON.stringify(artworks));
    return newArtwork;
  }

  async updateArtwork(id: number, artwork: Partial<Artwork>): Promise<Artwork> {
    await this.simulateNetworkDelay();
    
    const artworks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}artworks`) || '[]') as Artwork[];
    const index = artworks.findIndex((a) => a.id === id);
    
    if (index === -1) {
      throw new Error(`Artwork ${id} not found`);
    }
    
    artworks[index] = { ...artworks[index], ...artwork };
    localStorage.setItem(`${STORAGE_PREFIX}artworks`, JSON.stringify(artworks));
    return artworks[index];
  }

  async deleteArtwork(id: number): Promise<{ success: boolean }> {
    await this.simulateNetworkDelay();
    
    const artworks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}artworks`) || '[]') as Artwork[];
    const filtered = artworks.filter((a) => a.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}artworks`, JSON.stringify(filtered));
    return { success: true };
  }

  // Events
  async getEvents(status?: 'upcoming' | 'past'): Promise<Event[]> {
    await this.simulateNetworkDelay();
    
    let events = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}events`) || '[]') as Event[];
    
    if (status === 'upcoming') {
      events = events.filter((e) => new Date(e.date) > new Date());
    } else if (status === 'past') {
      events = events.filter((e) => new Date(e.date) <= new Date());
    }
    
    return events;
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    await this.simulateNetworkDelay();
    
    const events = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}events`) || '[]') as Event[];
    const newEvent: Event = {
      id: Math.max(...events.map((e) => e.id), 0) + 1,
      title: event.title || 'Untitled Event',
      date: event.date || new Date().toISOString().split('T')[0],
      location: event.location || 'TBD',
      description: event.description || '',
      registrations: event.registrations || 0,
    };
    
    events.push(newEvent);
    localStorage.setItem(`${STORAGE_PREFIX}events`, JSON.stringify(events));
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    await this.simulateNetworkDelay();
    
    const events = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}events`) || '[]') as Event[];
    const index = events.findIndex((e) => e.id === id);
    
    if (index === -1) {
      throw new Error(`Event ${id} not found`);
    }
    
    events[index] = { ...events[index], ...event };
    localStorage.setItem(`${STORAGE_PREFIX}events`, JSON.stringify(events));
    return events[index];
  }

  async deleteEvent(id: number): Promise<{ success: boolean }> {
    await this.simulateNetworkDelay();
    
    const events = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}events`) || '[]') as Event[];
    const filtered = events.filter((e) => e.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}events`, JSON.stringify(filtered));
    return { success: true };
  }

  // Members
  async getMembers(status?: string): Promise<Member[]> {
    await this.simulateNetworkDelay();
    
    let members = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}members`) || '[]') as Member[];
    
    if (status) {
      members = members.filter((m) => m.status === status);
    }
    
    return members;
  }

  async approveMember(id: number): Promise<Member> {
    await this.simulateNetworkDelay();
    
    const members = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}members`) || '[]') as Member[];
    const index = members.findIndex((m) => m.id === id);
    
    if (index === -1) {
      throw new Error(`Member ${id} not found`);
    }
    
    members[index].status = 'approved';
    localStorage.setItem(`${STORAGE_PREFIX}members`, JSON.stringify(members));
    return members[index];
  }

  async rejectMember(id: number): Promise<{ success: boolean }> {
    await this.simulateNetworkDelay();
    
    const members = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}members`) || '[]') as Member[];
    const filtered = members.filter((m) => m.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}members`, JSON.stringify(filtered));
    return { success: true };
  }

  // Activity Log
  async getActivityLog(limit = 10): Promise<ActivityLog[]> {
    await this.simulateNetworkDelay();
    const log: ActivityLog[] = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}activity`) || '[]');
    return log.slice(0, limit);
  }
}

export const backendApi = new BackendApiService();
