import React, { useState } from 'react';
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

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
  color: 'blue' | 'purple' | 'green' | 'orange';
}

interface ActivityItem {
  id: string;
  type: 'artwork' | 'event' | 'member' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

import { useEffect } from 'react';
import { statsApi } from '../services/api';

const DEFAULT_STAT_CARDS: StatCard[] = [
  {
    label: 'Total Artworks',
    value: 8,
    icon: Image,
    color: 'blue',
  },
  {
    label: 'Upcoming Events',
    value: 5,
    icon: Calendar,
    color: 'purple',
  },
  {
    label: 'Active Members',
    value: 4,
    icon: Users,
    color: 'green',
  },
  {
    label: 'Pending Applications',
    value: 1,
    icon: UserCheck,
    color: 'orange',
  },
];

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
};

export const AdminDashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [statCards, setStatCards] = useState<StatCard[]>(DEFAULT_STAT_CARDS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    statsApi
      .getStats()
      .then((res) => {
        if (res.success && res.stats) {
          const s = res.stats;
          setStatCards([
            {
              label: 'Total Artworks',
              value: s.artworks.total,
              icon: Image,
              color: 'blue',
            },
            {
              label: 'Upcoming Events',
              value: s.events.upcoming,
              icon: Calendar,
              color: 'purple',
            },
            {
              label: 'Active Members',
              value: s.members,
              icon: Users,
              color: 'green',
            },
            {
              label: 'Pending Applications',
              value: s.applications.pending,
              icon: UserCheck,
              color: 'orange',
            },
          ]);

          const acts: ActivityItem[] = [];
          if (Array.isArray(s.recentApplications)) {
            s.recentApplications.forEach((app: any) => {
              acts.push({
                id: `app-${app.id}`,
                type: 'member',
                title: `Application: ${app.fullName}`,
                description: `${app.department} (${app.academicYear}) - ${app.artInterests}`,
                timestamp: new Date(app.createdAt).toLocaleDateString(),
                user: app.fullName,
              });
            });
          }
          if (Array.isArray(s.recentArtworks)) {
            s.recentArtworks.forEach((art: any) => {
              acts.push({
                id: `art-${art.id}`,
                type: 'artwork',
                title: `Artwork: ${art.title}`,
                description: `Category: ${art.category} | ${art.artist ? art.artist.name : 'Unknown Artist'}`,
                timestamp: new Date(art.createdAt).toLocaleDateString(),
                user: art.artist ? art.artist.name : 'Artist',
              });
            });
          }
          if (acts.length > 0) {
            setActivities(acts);
          }
        }
      })
      .catch(() => {
        // Fallback gracefully to default stats
      });
  }, []);

  const navigate = useNavigate();

  const getStatRoute = (label: string) => {
    switch (label) {
      case 'Total Artworks':
        return '/admin/gallery';
      case 'Upcoming Events':
        return '/admin/events';
      case 'Active Members':
      case 'Pending Applications':
        return '/admin/members';
      default:
        return '/admin';
    }
  };

  return (
    <ProtectedAdminRoute>
      <SEO
        title="Admin Dashboard"
        description="Brush and Bond admin dashboard"
        canonicalPath="/admin"
      />
      <AdminLayout activeSection="dashboard">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">Admin Dashboard</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              GCECT Art Club management controls & real-time overview.
            </p>
          </div>
        </div>

        {/* ── CORE ADMIN ACTION BUTTONS (from user tree) ── */}
        <div className="mb-8 p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-sm">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] font-bold mb-3">
            Quick Management Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
              <Users className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Manage Artists</span>
            </button>
            <button
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group"
            >
              <UserCheck className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Manage Applications</span>
            </button>
            <button
              onClick={() => navigate('/admin/announcements')}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all text-xs font-semibold text-[var(--ink)] shadow-xs group col-span-2 sm:col-span-1"
            >
              <Activity className="w-4 h-4 text-[var(--accent)] group-hover:text-[var(--on-accent)] shrink-0" />
              <span>Announcements</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const targetRoute = getStatRoute(stat.label);
            return (
              <motion.div
                key={stat.label}
                onClick={() => navigate(targetRoute)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 hover:border-[var(--accent)] hover:shadow-md transition-all cursor-pointer group"
                title={`Click to view ${stat.label}`}
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
              {(activities.length > 0 ? activities : [
                {
                  id: '1',
                  type: 'artwork',
                  title: 'Heritage Charcoal Sketch',
                  description: 'Ceramic Kiln Sketch by Sagnik Mukherjee',
                  timestamp: 'Recent',
                  user: 'Sagnik Mukherjee',
                },
                {
                  id: '2',
                  type: 'member',
                  title: 'New member application',
                  description: 'Application received for Review',
                  timestamp: 'Recent',
                  user: 'Student Applicant',
                },
              ] as ActivityItem[]).map((item) => (
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
                <span className="text-sm font-bold text-[var(--ink)]">2,458</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[var(--muted)]" />
                  <span className="text-xs text-[var(--muted)]">Likes</span>
                </div>
                <span className="text-sm font-bold text-[var(--ink)]">342</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--muted)]" />
                  <span className="text-xs text-[var(--muted)]">Comments</span>
                </div>
                <span className="text-sm font-bold text-[var(--ink)]">48</span>
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
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
