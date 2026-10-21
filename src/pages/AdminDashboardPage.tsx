import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Image,
  Calendar,
  Users,
  UserCheck,
  Palette,
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
import { backendApi, type DashboardStats } from '../services/backendApi';

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await backendApi.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setStats(null);
        setError(err instanceof Error ? err.message : 'The API is unavailable.');
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
          color: 'blue',
        },
        {
          label: 'Upcoming Events',
          value: stats.upcomingEvents,
          icon: Calendar,
          color: 'purple',
        },
        {
          label: 'Active Members',
          value: stats.activeMembers,
          icon: Users,
          color: 'green',
        },
        {
          label: 'Registrations',
          value: stats.totalRegistrations,
          icon: UserCheck,
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
              'Shared data stored in SQLite'
            )}
          </p>
        </div>

        {/* ── CORE ADMIN ACTION BUTTONS (from user tree) ── */}
        <div className="mb-8 p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-sm">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] font-bold mb-3">
            Quick Management Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => navigate('/admin/gallery')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <Image className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Upload Artwork</span>
            </button>
            <button
              onClick={() => navigate('/admin/events')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <Calendar className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Manage Events</span>
            </button>
            <button
              onClick={() => navigate('/admin/artists')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <Palette className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Manage Artists</span>
            </button>
            <button
              onClick={() => navigate('/admin/team')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <Users className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Manage Team</span>
            </button>
            <button
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <UserCheck className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Applications</span>
            </button>
            <button
              onClick={() => navigate('/admin/announcements')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <Activity className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Announcements</span>
            </button>
          </div>
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
            {!stats && error && (
              <p role="alert" className="mb-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
                Dashboard data is unavailable. Check that the API is running, then refresh this page.
              </p>
            )}
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
                      else if (stat.label === 'Active Members') navigate('/admin/members');
                      else if (stat.label === 'Registrations') navigate('/admin/events');
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
