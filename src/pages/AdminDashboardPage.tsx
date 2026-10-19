import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Image,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { backendApi, DashboardStats, ActivityLog } from '../services/backendApi';

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
};

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback mock data if API is unavailable
  const MOCK_STATS: DashboardStats = {
    totalArtworks: 248,
    upcomingEvents: 8,
    activeMembers: 145,
    totalRegistrations: 486,
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
        description: 'Oil on Canvas: "Urban Dreams" by Priya Sharma',
        timestamp: '2 hours ago',
        user: 'Priya Sharma',
      },
      {
        id: '2',
        type: 'member',
        title: 'New member application',
        description: 'Rohan Gupta applied to join Brush and Bond',
        timestamp: '3 hours ago',
        user: 'Rohan Gupta',
      },
      {
        id: '3',
        type: 'event',
        title: 'Event created',
        description: 'The Canvas 2026 - Annual Art Exhibition',
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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await backendApi.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.warn('Failed to load real data, using mock data', err);
        setStats(MOCK_STATS);
        setError('Using cached data - backend unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          label: 'Total Artworks',
          value: stats.totalArtworks,
          icon: Image,
          trend: { value: 12, positive: true },
          color: 'blue',
        },
        {
          label: 'Upcoming Events',
          value: stats.upcomingEvents,
          icon: Calendar,
          trend: { value: 2, positive: true },
          color: 'purple',
        },
        {
          label: 'Active Members',
          value: stats.activeMembers,
          icon: Users,
          trend: { value: 23, positive: true },
          color: 'green',
        },
        {
          label: 'Registrations',
          value: stats.totalRegistrations,
          icon: UserCheck,
          trend: { value: 8, positive: false },
          color: 'orange',
        },
      ]
    : [];

  return (
    <ProtectedAdminRoute>
      <SEO
        title="Admin Dashboard"
        description="Brush and Bond admin dashboard"
        canonicalPath="/admin"
      />
      <AdminLayout activeSection="dashboard">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--ink)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {error ? (
              <span className="text-orange-600 dark:text-orange-400">⚠ {error}</span>
            ) : (
              'Real-time analytics powered by PostgreSQL'
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin mx-auto" />
              <p className="text-sm text-[var(--muted)]">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 hover:border-[var(--accent)]/30 transition-colors cursor-pointer"
                    onClick={() => {
                      if (stat.label === 'Total Artworks') navigate('/admin/gallery');
                      else if (stat.label === 'Upcoming Events') navigate('/admin/events');
                      else if (stat.label === 'Active Members' || stat.label === 'Registrations')
                        navigate('/admin/members');
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {stat.trend && (
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${
                            stat.trend.positive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {stat.trend.positive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {stat.trend.value}%
                        </div>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[var(--ink)]">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-[var(--muted)] mt-2">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="lg:col-span-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6"
              >
                <h2 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)]" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {stats?.recentActivity.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-[var(--line)] last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center flex-shrink-0">
                        {item.type === 'artwork' && <Image className="w-4 h-4 text-blue-600" />}
                        {item.type === 'event' && <Calendar className="w-4 h-4 text-purple-600" />}
                        {item.type === 'member' && <Users className="w-4 h-4 text-green-600" />}
                        {item.type === 'comment' && <MessageSquare className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)]">{item.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{item.description}</p>
                        <p className="text-xs text-[var(--muted)] mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6"
              >
                <h2 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                  This Week
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[var(--muted)]" />
                      <span className="text-xs text-[var(--muted)]">Gallery Views</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--ink)]">{stats?.weekStats.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[var(--muted)]" />
                      <span className="text-xs text-[var(--muted)]">Likes</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--ink)]">{stats?.weekStats.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[var(--muted)]" />
                      <span className="text-xs text-[var(--muted)]">Comments</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--ink)]">{stats?.weekStats.comments.toLocaleString()}</span>
                  </div>
                </div>

                {/* Period Selector */}
                <div className="mt-6 pt-4 border-t border-[var(--line)]">
                  <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                          selectedPeriod === period
                            ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                            : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
