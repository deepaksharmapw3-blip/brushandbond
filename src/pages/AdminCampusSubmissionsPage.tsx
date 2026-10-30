import React, { useCallback, useEffect, useState } from 'react';
import { Check, Inbox, RefreshCw, Trash2, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ConfirmDialog } from '../components/admin/AdminUtils';
import { campusArtContributionApi } from '../services/api';

type Submission = {
  id: string; contributorName: string; email?: string; batchYear?: string; department: string;
  title: string; approxYear: string; location?: string; description: string; imageUrl?: string;
  submissionType?: 'campus-record' | 'gallery-artwork'; category?: string; medium?: string;
  submittedAt: string; status: 'pending' | 'approved' | 'rejected';
};

export const AdminCampusSubmissionsPage: React.FC = () => {
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await campusArtContributionApi.getAll() as Submission[]);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load contributions.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const updateStatus = async (item: Submission, status: 'approved' | 'rejected') => {
    setBusyId(item.id); setError(null); setNotice(null);
    try {
      await campusArtContributionApi.updateStatus(item.id, status);
      setNotice(status === 'approved'
        ? item.submissionType === 'gallery-artwork'
          ? 'Artwork approved and published in the Gallery.'
          : 'Contribution approved and added to the public archive.'
        : 'Contribution rejected.');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update contribution.'); }
    finally { setBusyId(null); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id); setError(null);
    try {
      await campusArtContributionApi.delete(deleteTarget.id);
      setNotice('Contribution deleted.'); setDeleteTarget(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete contribution.'); }
    finally { setBusyId(null); }
  };

  const visible = items.filter((item) => filter === 'all' || item.status === filter);

  return (
    <ProtectedAdminRoute>
      <SEO title="Artwork Submissions" />
      <AdminLayout activeSection="campus-submissions">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold text-[var(--ink)]">Artwork & Campus Submissions</h1><p className="mt-1 text-sm text-[var(--muted)]">Review public submissions. Approving Gallery artwork publishes it to the Gallery; approving campus records adds them to the archive.</p></div>
          <button type="button" onClick={() => { setLoading(true); void load(); }} className="btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
        {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{notice}</p>}
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}
        <div className="mb-5 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((state) => (
            <button key={state} type="button" onClick={() => setFilter(state)} className={`rounded-full border px-4 py-2 text-sm capitalize ${filter === state ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--line)] text-[var(--muted)]'}`}>
              {state}{state === 'pending' ? ` (${items.filter((item) => item.status === 'pending').length})` : ''}
            </button>
          ))}
        </div>
        {loading ? <p className="py-12 text-center text-sm text-[var(--muted)]">Loading contributions…</p> : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center"><Inbox className="mx-auto mb-3 h-8 w-8 text-[var(--muted)]" /><p className="font-medium text-[var(--ink)]">No {filter === 'all' ? '' : `${filter} `}contributions</p><p className="mt-1 text-sm text-[var(--muted)]">Public submissions will appear here for review.</p></div>
        ) : <div className="space-y-4">{visible.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            {item.imageUrl && <img src={item.imageUrl} alt="Submitted artwork" loading="lazy" className="max-h-72 w-full object-cover" />}
            <div className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="mb-1 flex flex-wrap gap-2 text-xs text-[var(--muted)]"><span className="rounded-full bg-[var(--paper)] px-2 py-1 uppercase">{item.status}</span><span className="rounded-full bg-[var(--paper)] px-2 py-1">{item.submissionType === 'gallery-artwork' ? 'Gallery artwork' : 'Campus archive record'}</span><span>{item.approxYear}</span><span>{new Date(item.submittedAt).toLocaleDateString()}</span></div><h2 className="text-xl font-bold text-[var(--ink)]">{item.title}</h2><p className="text-sm text-[var(--muted)]">{[item.contributorName, item.email, item.batchYear, item.department, item.location, item.category, item.medium].filter(Boolean).join(' · ')}</p></div>
                <div className="flex shrink-0 gap-2">
                  {item.status !== 'approved' && <button type="button" disabled={busyId === item.id} onClick={() => void updateStatus(item, 'approved')} className="btn-primary text-xs"><Check className="h-4 w-4" /> {item.submissionType === 'gallery-artwork' ? 'Approve & publish' : 'Approve'}</button>}
                  {item.status === 'pending' && <button type="button" disabled={busyId === item.id} onClick={() => void updateStatus(item, 'rejected')} className="btn-secondary text-xs"><X className="h-4 w-4" /> Reject</button>}
                  <button type="button" disabled={busyId === item.id} onClick={() => setDeleteTarget(item)} className="btn-secondary text-xs text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
            </div>
          </article>
        ))}</div>}
        <ConfirmDialog isOpen={Boolean(deleteTarget)} isLoading={Boolean(deleteTarget && busyId === deleteTarget.id)} title="Delete this contribution?" description="This permanently removes the record from the archive. This action is admin-only." confirmText="Delete record" isDangerous onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
