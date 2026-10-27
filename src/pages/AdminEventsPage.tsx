import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Trash2,
  Users,
  Search,
  X,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState, AdminBadge } from '../components/admin/AdminUtils';
import { eventApi } from '../services/api';

const isEventDatePast = (event: any) => {
  const value = event.event_date || event.date;
  if (!value) return false;
  const date = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    && date < new Date().toLocaleDateString('en-CA');
};

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [eventAttendees, setEventAttendees] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('GCECT Campus');
  const [category, setCategory] = useState('Workshop');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPreviewFailed, setBannerPreviewFailed] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [savingRegistrationId, setSavingRegistrationId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await eventApi.getAll();
      if (res.success && Array.isArray(res.events)) {
        setEvents(res.events);
      }
    } catch (err: any) {
      console.warn('Failed to load events:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- This starts an async read; state changes follow the API response.
    fetchEvents();
  }, []);

  const resetForm = () => {
    setEventName('');
    setEventDate('');
    setEventTime('');
    setVenue('GCECT Campus');
    setCategory('Workshop');
    setMaxCapacity('100');
    setDescription('');
    setBannerUrl('');
    setBannerPreviewFailed(false);
    setIsPast(false);
    setRegistrationOpen(true);
    setSelectedEvent(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventDate) {
      setToast({ message: 'Event name and date are required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const eventIsPast = isPast || isEventDatePast({ event_date: eventDate });
      await eventApi.create({
        event_name: eventName.trim(),
        event_date: eventDate,
        event_time: eventTime.trim() || 'TBA',
        venue: venue.trim() || 'GCECT Campus',
        category,
        max_capacity: parseInt(maxCapacity, 10) || 100,
        description: description.trim(),
        banner_url: bannerUrl.trim() || 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
        is_past: eventIsPast,
        registration_open: !eventIsPast && registrationOpen,
        status: !eventIsPast && registrationOpen ? 'open' : eventIsPast ? 'concluded' : 'upcoming',
      });

      setToast({ message: 'Event created successfully!', type: 'success' });
      setIsFormOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to create event', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRegistration = async (event: any) => {
    const id = event.event_id || event.id;
    if (!id || event.is_past || event.status === 'concluded' || isEventDatePast(event)) return;

    const isOpen = Boolean(event.registration_open ?? event.registrationOpen);
    const nextIsOpen = !isOpen;
    const nextStatus = nextIsOpen
      ? 'open'
      : event.status === 'open'
        ? 'upcoming'
        : event.status;

    setSavingRegistrationId(String(id));
    try {
      await eventApi.update(id, {
        registration_open: nextIsOpen,
        status: nextStatus,
      });
      setEvents((current) => current.map((item) => (
        String(item.event_id || item.id) === String(id)
          ? { ...item, registration_open: nextIsOpen, registrationOpen: nextIsOpen, status: nextStatus }
          : item
      )));
      setToast({
        message: nextIsOpen ? 'Event registration is now open' : 'Event registration is now closed',
        type: 'success',
      });
    } catch (err: any) {
      setToast({ message: err.message || 'Could not update registration status', type: 'error' });
    } finally {
      setSavingRegistrationId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await eventApi.delete(selectedEvent.event_id || selectedEvent.id);
      setToast({ message: `Event "${selectedEvent.event_name || selectedEvent.title}" deleted`, type: 'success' });
      setIsDeleteOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete event', type: 'error' });
    }
  };

  const viewAttendees = async (event: any) => {
    setSelectedEvent(event);
    setEventAttendees([]);
    setRegistrationsModalOpen(true);
    try {
      const res = await eventApi.getRegistrations(event.event_id || event.id);
      if (res.success && Array.isArray(res.registrations)) {
        setEventAttendees(res.registrations);
      }
    } catch {
      setEventAttendees([]);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const title = evt.event_name || evt.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'upcoming') return matchesSearch && !evt.is_past;
    if (filterType === 'past') return matchesSearch && evt.is_past;
    return matchesSearch;
  });

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Events" description="Manage events" canonicalPath="/admin/events" />
      <AdminLayout activeSection="events">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Manage Events & Workshops</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Create and manage upcoming art fests, exhibitions, and past recaps ({filteredEvents.length} events)
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* Events Table / Grid */}
        {filteredEvents.length > 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--paper)] border-b border-[var(--line)] text-xs font-mono uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-6 py-3.5">Event Name</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Venue</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Registration</th>
                    <th className="px-6 py-3.5">Attendees</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredEvents.map((event) => {
                    const id = event.event_id || event.id;
                    const name = event.event_name || event.title;
                    const date = event.event_date || event.date;
                    const regCount = event._count?.registrations ?? event.registeredCount ?? 0;
                    return (
                      <tr key={id} className="hover:bg-[var(--paper)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[var(--ink)]">{name}</p>
                            <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">{event.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-medium text-[var(--ink)]">
                            {date ? new Date(date).toLocaleDateString() : 'TBA'}
                          </p>
                          <p className="text-[11px] text-[var(--muted)]">{event.event_time || event.time || '10:00 AM'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-[var(--muted)] whitespace-nowrap">
                          {event.venue || 'GCECT Campus'}
                        </td>
                        <td className="px-6 py-4">
                          <AdminBadge variant={event.is_past ? 'info' : 'success'}>
                            {event.category || 'Workshop'}
                          </AdminBadge>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const registrationIsOpen = Boolean(event.registration_open ?? event.registrationOpen);
                            const registrationIsSaving = savingRegistrationId === String(id);
                            return (
                              <button
                                type="button"
                                onClick={() => toggleRegistration(event)}
                                disabled={registrationIsSaving || event.is_past || event.status === 'concluded' || isEventDatePast(event)}
                                aria-label={`${registrationIsOpen ? 'Close' : 'Open'} registration for ${name}`}
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                  registrationIsOpen
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--accent)]'
                                }`}
                              >
                                {registrationIsSaving ? 'Saving…' : registrationIsOpen ? 'Open · Close' : 'Closed · Open'}
                              </button>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => viewAttendees(event)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--paper)] border border-[var(--line)] text-xs font-medium hover:border-[var(--accent)] transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{regCount} RSVPs</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <AdminEmptyState
            icon={Calendar}
            title={isLoading ? 'Loading events...' : 'No events found'}
            description={searchQuery ? 'Try adjusting your search query' : 'Create your first art workshop or exhibition'}
            actionLabel="Add Event"
            onAction={() => {
              resetForm();
              setIsFormOpen(true);
            }}
          />
        )}

        {/* ── CREATE EVENT MODAL ── */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
                  <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--accent)]" />
                    Create New Club Event
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Fine Arts Carnival 2026"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 11:00 AM - 4:00 PM"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Venue
                      </label>
                      <input
                        type="text"
                        placeholder="Main Auditorium / Quadrangle"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
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
                        <option value="Workshop">Workshop</option>
                        <option value="Exhibition">Exhibition</option>
                        <option value="Competition">Competition</option>
                        <option value="Carnival">Carnival</option>
                        <option value="Outdoor">Outdoor art</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Max Participant Capacity
                    </label>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Paste a direct image URL (https://…jpg, .png, .webp)"
                      value={bannerUrl}
                      onChange={(e) => {
                        setBannerUrl(e.target.value);
                        setBannerPreviewFailed(false);
                      }}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    {bannerUrl.trim() && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--paper)]">
                        {bannerPreviewFailed ? (
                          <p className="p-3 text-xs text-red-500" role="status">
                            This link did not load as an image. Use a direct, publicly accessible image URL.
                          </p>
                        ) : (
                          <img
                            src={bannerUrl.trim()}
                            alt="Event poster preview"
                            onError={() => setBannerPreviewFailed(true)}
                            className="max-h-48 w-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Description & Guidelines
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Event details, what participants should bring, etc..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="past-check"
                      checked={isPast}
                      onChange={(e) => setIsPast(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="past-check" className="text-xs font-medium text-[var(--ink)] cursor-pointer">
                      Mark as Past Event (Archive)
                    </label>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="registration-open-check"
                      checked={registrationOpen && !isPast && !isEventDatePast({ event_date: eventDate })}
                      disabled={isPast || isEventDatePast({ event_date: eventDate })}
                      onChange={(e) => setRegistrationOpen(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="registration-open-check" className="text-xs font-medium text-[var(--ink)] cursor-pointer">
                      Open registration immediately (show “Register Now”)
                    </label>
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[var(--accent)] text-[var(--on-accent)] text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Publish Event'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── ATTENDEES MODAL ── */}
        <AnimatePresence>
          {registrationsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
                  <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    Registered Attendees for "{selectedEvent?.event_name || selectedEvent?.title}"
                  </h3>
                  <button
                    onClick={() => setRegistrationsModalOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {eventAttendees.length > 0 ? (
                    <div className="space-y-3">
                      {eventAttendees.map((att) => {
                        const attendeeName = att.name || att.applicant_name || att.members?.name || 'Unknown attendee';
                        const attendeeEmail = att.email || att.applicant_email || att.members?.email;
                        const registeredAt = att.submittedAt || att.registered_at || att.createdAt;
                        const registeredDate = registeredAt ? new Date(registeredAt) : null;
                        return (
                          <div
                            key={att.registration_id || att.id}
                            className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-xs"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-semibold text-[var(--ink)]">{attendeeName}</p>
                                {attendeeEmail && <a href={`mailto:${attendeeEmail}`} className="mt-1 block break-all text-[var(--accent)] hover:underline">{attendeeEmail}</a>}
                              </div>
                              <span className="shrink-0 text-[10px] text-[var(--muted)] font-mono">
                                {registeredDate && !Number.isNaN(registeredDate.getTime()) ? registeredDate.toLocaleDateString() : 'Date unavailable'}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[var(--muted)]">
                              <span>{att.department || 'Department not provided'}</span>
                              {att.yearOfStudy && <span>{att.yearOfStudy}</span>}
                              {att.rollNumber && <span>Roll: {att.rollNumber}</span>}
                              {att.phone && <span>Phone: {att.phone}</span>}
                              {att.passCode && <span>Pass: {att.passCode}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--muted)] text-center py-6">No registrations recorded yet.</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Event"
          description={
            selectedEvent
              ? `Are you sure you want to delete "${selectedEvent.event_name || selectedEvent.title}"?`
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
