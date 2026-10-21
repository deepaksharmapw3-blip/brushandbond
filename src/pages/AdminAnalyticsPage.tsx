import React, { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, Image, Mail, RefreshCw, ThumbsUp, UserCheck, Users } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { adminAnalyticsApi } from '../services/api';

type Overview = Awaited<ReturnType<typeof adminAnalyticsApi.getOverview>>;

const cards = [
  { key: 'artworks', label: 'Artworks', icon: Image },
  { key: 'artists', label: 'Artists', icon: Users },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'registrations', label: 'Event registrations', icon: UserCheck },
  { key: 'applications', label: 'Membership applications', icon: Users },
  { key: 'messages', label: 'Contact messages', icon: Mail },
  { key: 'achievements', label: 'Achievements', icon: Activity },
  { key: 'likes', label: 'Artwork likes', icon: ThumbsUp },
] as const;

const recentCards = [
  { key: 'registrations', label: 'Event registrations', color: 'bg-indigo-500' },
  { key: 'applications', label: 'Membership applications', color: 'bg-emerald-500' },
  { key: 'messages', label: 'Contact messages', color: 'bg-amber-500' },
] as const;

export const AdminAnalyticsPage: React.FC = () => {
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
      setError(cause instanceof Error ? cause.message : 'Could not load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const maxRecent = overview
    ? Math.max(1, ...recentCards.map(({ key }) => overview.last30Days[key]))
    : 1;

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Analytics" description="Database-backed content and submission analytics" canonicalPath="/admin/analytics" />
      <AdminLayout activeSection="analytics">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Analytics</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Live counts from the Supabase database.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={isLoading} className="btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">Analytics are unavailable: {error}</div>}
        {isLoading && <p className="py-12 text-center text-sm text-[var(--muted)]">Loading live database counts…</p>}
        {!isLoading && overview && (
          <>
            <section aria-label="Content totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(({ key, label, icon: Icon }) => (
                <article key={key} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">{label}</span>
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <p className="text-3xl font-bold tabular-nums text-[var(--ink)]">{overview.totals[key].toLocaleString()}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
              <h2 className="font-semibold text-[var(--ink)]">Submissions in the last 30 days</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Counts are based on each record’s creation time.</p>
              <div className="mt-6 space-y-5">
                {recentCards.map(({ key, label, color }) => {
                  const value = overview.last30Days[key];
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="text-[var(--ink)]">{label}</span>
                        <span className="font-semibold tabular-nums text-[var(--ink)]">{value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--paper)]">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${value === 0 ? 0 : Math.max(5, (value / maxRecent) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
                Page views and traffic sources are not recorded by this app, so they are not shown as analytics.
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">Updated {new Date(overview.generatedAt).toLocaleString()}</p>
            </section>
          </>
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
