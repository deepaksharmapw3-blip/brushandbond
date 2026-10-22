<<<<<<< HEAD
import { statsApi } from './api';

export interface ActivityLog {
  id: string;
  type: 'artwork' | 'event' | 'member' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardStats {
  totalArtworks: number;
  upcomingEvents: number;
  activeMembers: number;
  totalRegistrations: number;
  recentActivity: ActivityLog[];
  weekStats: { views: number; likes: number; comments: number };
}

export const backendApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const result = await statsApi.getStats();
    return result.stats;
  },
};
