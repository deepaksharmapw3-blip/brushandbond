import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Download,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import {
  AdminToast,
  ConfirmDialog,
  AdminEmptyState,
  AdminTableActions,
  AdminBadge,
} from '../components/admin/AdminUtils';
import { useGallery } from '../context/GalleryContext';

interface AdminEvent extends Record<string, unknown> {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  category: string;
  status: 'upcoming' | 'open' | 'concluded';
  registeredCount: number;
  capacity: number;
}

export const AdminEventsPage: React.FC = () => {
  const { events } = useGallery();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'registrations' | 'title'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'open' | 'concluded'>('all');
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const mockAdminEvents: AdminEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    date: e.date,
    time: e.time,
    location: e.venue,
    category: e.category,
    status: e.status as 'upcoming' | 'open' | 'concluded',
    registeredCount: e.registeredCount,
    capacity: e.capacity,
  }));

  const filteredEvents = useMemo(() => {
    return mockAdminEvents
      .filter((event) => {
        const matchesSearch =
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'registrations') return b.registeredCount - a.registeredCount;
        return a.title.localeCompare(b.title);
      });
  }, [mockAdminEvents, searchQuery, filterStatus, sortBy]);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDeleteOpen(false);
    setSelectedEvent(null);
    setToast({ message: `Event "${selectedEvent.title}" deleted`, type: 'success' });
  };

  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsFormOpen(false);
    setToast({
      message: selectedEvent
        ? `Event "${selectedEvent.title}" updated`
        : 'New event created',
      type: 'success',
    });
  };

  const handleExportCSV = () => {
    if (!selectedEvent) return;

    const participants = Array.from({ length: selectedEvent.registeredCount }, (_, i) => ({
      name: `Participant ${i + 1}`,
      email: `participant${i + 1}@example.com`,
      department: ['Ceramic Technology', 'Computer Science', 'Information Technology'][
        i % 3
      ],
      roll: `CB${String(i + 1).padStart(3, '0')}`,
    }));

    const csv = [
      ['Name', 'Email', 'Department', 'Roll Number'],
      ...participants.map((p) => [p.name, p.email, p.department, p.roll]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.slug}-participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({ message: 'Participants exported as CSV', type: 'success' });
  };

  return (
    <ProtectedAdminRoute>
      <SEO
        title="Admin Events"
        description="Manage events"
        canonicalPath="/admin/events"
      />
      <AdminLayout activeSection="events">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Events</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Manage exhibitions, workshops, and events ({filteredEvents.length})
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="concluded">Concluded</option>
          </select>
          <button
            onClick={() => setSortBy((prev) => {
              const order: Array<typeof sortBy> = ['date', 'registrations', 'title'];
              return order[(order.indexOf(prev) + 1) % order.length];
            })}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Events Table */}
        {filteredEvents.length > 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--paper)]">
                    <th className="px-6 py-3 text-left font-medium text-[var(--muted)] text-xs">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--muted)] text-xs">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--muted)] text-xs">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--muted)] text-xs">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-[var(--muted)] text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--ink)]">{event.title}</p>
                          <p className="text-xs text-[var(--muted)]">{event.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--muted)]" />
                          <span className="text-[var(--ink)]">
                            {event.registeredCount}/{event.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge
                          variant={
                            event.status === 'concluded'
                              ? 'info'
                              : event.status === 'open'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AdminTableActions
                          actions={[
                            {
                              icon: Eye,
                              label: 'View',
                              onClick: () => setSelectedEvent(event),
                            },
                            {
                              icon: Edit,
                              label: 'Edit',
                              onClick: () => {
                                setSelectedEvent(event);
                                setIsFormOpen(true);
                              },
                            },
                            {
                              icon: Download,
                              label: 'Export',
                              onClick: () => {
                                setSelectedEvent(event);
                                handleExportCSV();
                              },
                            },
                            {
                              icon: Trash2,
                              label: 'Delete',
                              isDangerous: true,
                              onClick: () => {
                                setSelectedEvent(event);
                                setIsDeleteOpen(true);
                              },
                            },
                          ]}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={Calendar}
            title="No events found"
            description={searchQuery ? 'Try adjusting your search' : 'Create your first event'}
            actionLabel="Add Event"
            onAction={() => setIsFormOpen(true)}
          />
        )}

        {/* Forms & Dialogs */}
        <ConfirmDialog
          title="Delete Event"
          description={
            selectedEvent
              ? `Are you sure you want to delete "${selectedEvent.title}"? This action cannot be undone.`
              : ''
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
