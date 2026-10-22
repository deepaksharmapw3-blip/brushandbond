import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Check,
  X,
  Trash2,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState, AdminBadge } from '../components/admin/AdminUtils';
import { applicationApi } from '../services/api';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await applicationApi.getAll();
      if (res.success && Array.isArray(res.applications)) {
        setApplications(res.applications);
      }
    } catch (err: any) {
      console.warn('Failed to load applications:', err.message);
      setLoadError(err.message || 'Could not load membership applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- This starts an async read; state changes follow the API response.
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    try {
      const result = await applicationApi.updateStatus(id, status);
      setToast({
        message: result.notificationSent
          ? `Application ${status.toLowerCase()} and notification email sent.`
          : `Application ${status.toLowerCase()} successfully. The notification email was already processed.`,
        type: 'success',
      });
      fetchApplications();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update application status', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    try {
      await applicationApi.delete(selectedApp.id);
      setToast({ message: `Application from "${selectedApp.fullName}" removed`, type: 'success' });
      setIsDeleteOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete application', type: 'error' });
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = [app.fullName, app.name, app.email, app.department, app.rollNumber, app.roll_number]
      .some((value) => String(value ?? '').toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <ProtectedAdminRoute>
      <SEO title="Manage Applications" description="Review club applications" canonicalPath="/admin/members" />
      <AdminLayout activeSection="members">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Manage Club Applications</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Review and approve student admission requests ({pendingCount} pending review)
            </p>
          </div>
        </div>

        {/* Filters & Status Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search by name, roll, email, or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-medium self-start sm:self-auto">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === tab
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                {tab === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loadError ? (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-800">
            <p className="font-semibold">Could not load membership applications.</p>
            <p className="mt-1 break-words">{loadError}</p>
            <button
              type="button"
              onClick={() => void fetchApplications()}
              className="mt-3 rounded-lg bg-red-700 px-3 py-1.5 font-semibold text-white hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 hover:border-[var(--accent)]/40 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Applicant details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-base text-[var(--ink)]">{app.fullName || app.name || 'Name not provided'}</h3>
                      {(app.rollNumber || app.roll_number) && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)] font-mono">
                          {app.rollNumber || app.roll_number}
                        </span>
                      )}
                      <AdminBadge
                        variant={
                          app.status === 'APPROVED'
                            ? 'success'
                            : app.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {app.status}
                      </AdminBadge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                      <span>🏛️ {app.department || 'Department not provided'}{app.academicYear || app.year ? ` (${app.academicYear || app.year})` : ''}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${app.email}`} className="hover:underline text-[var(--ink)]">
                          {app.email}
                        </a>
                      </span>
                      {app.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{app.phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Art Interests & Statement */}
                    <div className="mt-3 p-3 bg-[var(--paper)] rounded-lg text-xs space-y-1.5 border border-[var(--line)]">
                      <p className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                        Wings of Interest: <span className="font-normal text-[var(--muted)]">{app.artInterests || app.interest || 'Not provided'}</span>
                      </p>
                      <p className="text-[var(--ink)] leading-relaxed">
                        <strong className="text-[var(--muted)]">Why join: </strong>
                        {app.whyJoin || app.reason || 'Not provided'}
                      </p>
                      {app.portfolioUrl && (
                        <div className="pt-1">
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Candidate Portfolio / Artworks
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                          disabled={actionLoadingId === app.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Approve and admit into club"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          disabled={actionLoadingId === app.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Reject application"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete application record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Users}
            title={isLoading ? 'Loading applications...' : 'No applications found'}
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'No student join requests found under this status tab.'
            }
          />
        )}

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Application"
          description={
            selectedApp
              ? `Are you sure you want to permanently delete application from "${selectedApp.fullName}"?`
              : 'Are you sure?'
          }
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
