import React, { useCallback, useEffect, useState } from 'react';
import { Award, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { achievementApi } from '../services/api';
import type { AchievementItem } from '../types';

type AchievementForm = {
  title: string;
  award: string;
  event: string;
  date: string;
  category: AchievementItem['category'];
  badge: string;
  organizer: string;
  description: string;
  imageUrl: string;
  significance: string;
  metrics: string;
};

const emptyForm = (): AchievementForm => ({
  title: '', award: '', event: '', date: new Date().toISOString().slice(0, 10),
  category: 'Award', badge: '', organizer: '', description: '', imageUrl: '', significance: '', metrics: '',
});

const inputClass = 'w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export const AdminAchievementsPage: React.FC = () => {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [form, setForm] = useState<AchievementForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    try {
      const result = await achievementApi.getAll();
      setItems(result.achievements as AchievementItem[]);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load achievements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAchievements = () => {
    setIsLoading(true);
    setError(null);
    void loadAchievements();
  };

  useEffect(() => {
    const task = window.setTimeout(() => { void loadAchievements(); }, 0);
    return () => window.clearTimeout(task);
  }, [loadAchievements]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setNotice(null);
    setIsFormOpen(true);
  };

  const startEdit = (item: AchievementItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title ?? '', award: item.award ?? '', event: item.event ?? '',
      date: item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : '',
      category: item.category ?? 'Award', badge: item.badge ?? '', organizer: item.organizer ?? '',
      description: item.description ?? '', imageUrl: item.imageUrl ?? '',
      significance: item.significance ?? '', metrics: item.metrics ?? '',
    });
    setNotice(null);
    setIsFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) {
      setError('Title and date are required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(), award: form.award.trim() || null, event: form.event.trim() || null,
        date: form.date, year: form.date.slice(0, 4), category: form.category,
        badge: form.badge.trim() || null, organizer: form.organizer.trim() || null,
        description: form.description.trim() || null, image_url: form.imageUrl.trim() || null,
        significance: form.significance.trim() || null, metrics: form.metrics.trim() || null,
        achieved_on: form.date,
      };
      if (editingId) await achievementApi.update(editingId, payload);
      else await achievementApi.create(payload);
      setIsFormOpen(false);
      setNotice(editingId ? 'Achievement updated.' : 'Achievement created.');
      await loadAchievements();
      window.dispatchEvent(new Event('bb-data-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the achievement.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (item: AchievementItem) => {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError(null);
    try {
      await achievementApi.delete(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice('Achievement deleted.');
      window.dispatchEvent(new Event('bb-data-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the achievement.');
    }
  };

  return (
    <ProtectedAdminRoute>
      <SEO title="Manage Achievements" description="Manage published achievements" canonicalPath="/admin/achievements" />
      <AdminLayout activeSection="achievements">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Achievements</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Create, edit, and remove published achievement records.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={refreshAchievements} className="btn-secondary" aria-label="Refresh achievements"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button type="button" onClick={startCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add achievement</button>
          </div>
        </div>

        {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{notice}</p>}
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}

        {isFormOpen && (
          <form onSubmit={save} className="mb-7 space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--ink)]">{editingId ? 'Edit achievement' : 'New achievement'}</h2>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close form" className="rounded p-1 text-[var(--muted)] hover:text-[var(--ink)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1 text-sm">Title *<input required maxLength={160} className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Award<input maxLength={160} className={inputClass} value={form.award} onChange={(e) => setForm({ ...form, award: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Event<input maxLength={160} className={inputClass} value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Date *<input required type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Category<select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AchievementItem['category'] })}>{['Exhibition', 'Award', 'Installation', 'Media', 'Milestone'].map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="space-y-1 text-sm">Badge<input maxLength={100} className={inputClass} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Organizer<input maxLength={160} className={inputClass} value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></label>
              <label className="space-y-1 text-sm sm:col-span-2">Image URL<input type="url" maxLength={1000} className={inputClass} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
              <label className="space-y-1 text-sm sm:col-span-2 lg:col-span-3">Description<textarea rows={3} maxLength={2000} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label className="space-y-1 text-sm sm:col-span-2 lg:col-span-3">Significance<textarea rows={2} maxLength={2000} className={inputClass} value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Metrics<input maxLength={300} className={inputClass} value={form.metrics} onChange={(e) => setForm({ ...form, metrics: e.target.value })} /></label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Create achievement'}</button>
            </div>
          </form>
        )}

        {isLoading ? <p className="py-12 text-center text-sm text-[var(--muted)]">Loading achievements…</p> : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
            <Award className="mx-auto mb-3 h-8 w-8 text-[var(--muted)]" />
            <p className="font-medium text-[var(--ink)]">No achievements yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Add an achievement to publish it on the public archive.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="divide-y divide-[var(--line)]">
              {items.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--paper)]"><Award className="h-6 w-6 text-[var(--accent)]" /></div>}
                    <div className="min-w-0">
                      <h2 className="font-semibold text-[var(--ink)]">{item.title}</h2>
                      <p className="text-sm text-[var(--muted)]">{[item.award, item.event, item.year].filter(Boolean).join(' · ') || item.category}</p>
                      {item.description && <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => startEdit(item)} className="btn-secondary text-xs"><Pencil className="h-4 w-4" /> Edit</button>
                    <button type="button" onClick={() => void remove(item)} className="btn-secondary text-xs text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
