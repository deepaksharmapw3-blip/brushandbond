import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Trash2,
  Pin,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState, AdminBadge } from '../components/admin/AdminUtils';
import { announcementApi } from '../services/api';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await announcementApi.getAll();
      if (res.success && Array.isArray(res.announcements)) {
        setAnnouncements(res.announcements);
      }
    } catch (err: any) {
      console.warn('Failed to load announcements:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('General');
    setIsPinned(false);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setToast({ message: 'Title and content are required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await announcementApi.create({
        title: title.trim(),
        content: content.trim(),
        category,
        isPinned,
      });

      setToast({ message: 'Announcement published successfully!', type: 'success' });
      setIsAddOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to publish announcement', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await announcementApi.delete(selectedAnnouncement.id);
      setToast({ message: 'Announcement removed', type: 'success' });
      setIsDeleteOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete announcement', type: 'error' });
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Announcements" description="Publish announcements" canonicalPath="/admin/announcements" />
      <AdminLayout activeSection="announcements">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Publish Announcements & Notices</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Broadcast calls for entry, workshop updates, and urgent alerts ({filteredAnnouncements.length} notices)
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
          />
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {filteredAnnouncements.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[var(--surface)] border rounded-xl p-5 transition-all shadow-xs ${
                  item.isPinned ? 'border-[var(--accent)]/60 bg-[var(--accent)]/5' : 'border-[var(--line)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-bold uppercase tracking-wider">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <AdminBadge variant={item.category === 'Urgent' ? 'error' : 'info'}>
                        {item.category}
                      </AdminBadge>
                      <h3 className="font-bold text-base text-[var(--ink)]">{item.title}</h3>
                    </div>

                    <p className="text-xs text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>

                    <p className="text-[11px] text-[var(--muted)] font-mono pt-1">
                      Posted by: {item.author || 'Art Club Admin'} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAnnouncement(item);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Bell}
            title={isLoading ? 'Loading notices...' : 'No announcements published'}
            description="Broadcast your first notice or call for entries"
            actionLabel="Publish Notice"
            onAction={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          />
        )}

        {/* ── CREATE ANNOUNCEMENT MODAL ── */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
                  <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[var(--accent)]" />
                    Publish Announcement
                  </h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Notice Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Call for Entries: Annual Art Exhibition 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option value="General">General Notice</option>
                      <option value="Exhibition">Exhibition / Fest</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Competition">Competition</option>
                      <option value="Urgent">Urgent Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Content / Notice Body *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write full announcement details, deadlines, and submission instructions..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pin-check"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="pin-check" className="text-xs font-medium text-[var(--ink)] cursor-pointer">
                      Pin to top of public homepage and notices
                    </label>
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[var(--accent)] text-[var(--on-accent)] text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Notice"
          description="Are you sure you want to remove this notice?"
          isOpen={isDeleteOpen}
          isDangerous
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />

        {/* Toast */}
        {toast && (
          <AdminToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
