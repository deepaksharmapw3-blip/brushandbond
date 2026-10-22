import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Award, CalendarDays, Image, Mail, RefreshCw, UserCheck, Users } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { adminAnalyticsApi } from '../services/api';

type Overview = Awaited<ReturnType<typeof adminAnalyticsApi.getOverview>>;

const dashboardCards = [
  { key: 'artworks', label: 'Artworks', icon: Image, path: '/admin/gallery' },
  { key: 'events', label: 'Events', icon: CalendarDays, path: '/admin/events' },
  { key: 'applications', label: 'Membership applications', icon: Users, path: '/admin/members' },
  { key: 'registrations', label: 'Event registrations', icon: UserCheck, path: '/admin/events' },
  { key: 'messages', label: 'Contact messages', icon: Mail, path: '/admin/messages' },
  { key: 'achievements', label: 'Achievements', icon: Award, path: '/admin/achievements' },
] as const;

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOverview(await adminAnalyticsApi.getOverview());
    } catch (cause) {
      setOverview(null);
      setError(cause instanceof Error ? cause.message : 'Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Dashboard" description="Brush and Bond admin dashboard" canonicalPath="/admin" />
      <AdminLayout activeSection="dashboard">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Dashboard</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Live totals from Supabase.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={isLoading} className="btn-secondary">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">Dashboard data is unavailable: {error}</p>}
        {isLoading && <p className="py-12 text-center text-sm text-[var(--muted)]">Loading live database totals…</p>}

        {!isLoading && overview && (
          <>
            <section aria-label="Database totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dashboardCards.map(({ key, label, icon: Icon, path }) => (
                <button key={key} type="button" onClick={() => navigate(path)} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[var(--accent)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">{label}</span>
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <p className="text-3xl font-bold tabular-nums text-[var(--ink)]">{overview.totals[key].toLocaleString()}</p>
                </button>
              ))}
            </section>
            <section className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]"><Activity className="h-4 w-4 text-[var(--accent)]" /> Recent submissions</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">New records created in the last 30 days.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <p className="text-sm text-[var(--muted)]">Registrations <strong className="ml-2 text-[var(--ink)]">{overview.last30Days.registrations}</strong></p>
                <p className="text-sm text-[var(--muted)]">Applications <strong className="ml-2 text-[var(--ink)]">{overview.last30Days.applications}</strong></p>
                <p className="text-sm text-[var(--muted)]">Messages <strong className="ml-2 text-[var(--ink)]">{overview.last30Days.messages}</strong></p>
              </div>
              <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">Page views and traffic sources are not recorded. <button type="button" onClick={() => navigate('/admin/analytics')} className="underline underline-offset-2 hover:text-[var(--ink)]">Open analytics</button></p>
            </section>
          </>
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
