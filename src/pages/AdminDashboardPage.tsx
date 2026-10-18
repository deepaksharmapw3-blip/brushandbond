import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Plus,
  Check,
  X,
  Calendar,
  Users,
  Image as ImageIcon,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { mockAdminSubmissions, mockEvents, mockArtworks } from '../data/mockData';
import type { AdminSubmission, EventItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useGallery } from '../context/GalleryContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();
  const { achievements, deleteAchievement } = useGallery();

  const [activeTab, setActiveTab] = useState<'submissions' | 'events' | 'members' | 'broadcast' | 'achievements'>('submissions');
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(mockAdminSubmissions);
  const [eventsList, setEventsList] = useState<EventItem[]>(mockEvents);

  // New Event Modal State
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    tagline: '',
    date: '',
    time: '',
    venue: 'Studio 204 & Courtyard',
    category: 'Workshop' as EventItem['category'],
    capacity: 40,
    description: '',
  });

  // Noticeboard Broadcast State
  const [broadcastActive, setBroadcastActive] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Studio 204 Open Wheel Saturday session scheduled for Nov 7. Clean aprons provided at the curatorial desk.'
  );

  const handleSignOut = () => {
    localStorage.removeItem('bb-admin-auth');
    showInfo('Signed out of admin dashboard');
    navigate('/admin/login');
  };

  const handleApproveSubmission = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: 'approved' } : sub))
    );
    showSuccess('Artwork Approved & Accessioned', 'Piece has been assigned an accession ID and moved to The GCECT Canvas archive.');
  };

  const handleRejectSubmission = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: 'rejected' } : sub))
    );
    showInfo('Submission Declined', 'Student author notified with curatorial feedback notes.');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title) return;

    const newEvt: EventItem = {
      id: `evt-${Date.now().toString().slice(-3)}`,
      slug: newEventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newEventData.title,
      tagline: newEventData.tagline || 'Open campus salon session.',
      date: newEventData.date || 'TBD 2026',
      time: newEventData.time || '4:00 PM IST',
      venue: newEventData.venue,
      category: newEventData.category,
      status: 'open',
      registrationOpen: true,
      capacity: newEventData.capacity,
      registeredCount: 0,
      description: newEventData.description,
      curator: 'Anamika Sen & Subhajit Mukherjee',
      materialsProvided: ['Drawing paper', 'Clay', 'Basic modeling tools'],
      guidelines: ['Open to all GCECT students'],
      imageUrl: '/artworks/studio-workshop.jpg',
    };

    setEventsList([newEvt, ...eventsList]);
    setNewEventModalOpen(false);
    showSuccess('New Salon Scheduled', `"${newEventData.title}" is now published.`);
    setNewEventData({
      title: '',
      tagline: '',
      date: '',
      time: '',
      venue: 'Studio 204 & Courtyard',
      category: 'Workshop',
      capacity: 40,
      description: '',
    });
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-10">
      {/* Top Bar with Admin Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--line)] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>CURATORIAL EXECUTIVE CONTROL PANEL (UI ONLY)</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] mt-1">
            Studio Dashboard
          </h1>
          <p className="text-xs font-mono text-[var(--muted)]">
            Active Session: Anamika Sen (Curatorial Lead) • GCECT Ceramic Block
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/gallery"
            className="text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] transition-colors px-3 py-1.5 border border-[var(--line)] rounded-full"
          >
            Public Canvas
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] rounded-full text-xs font-mono text-red-600 hover:border-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Canvas Archive</span>
            <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[var(--ink)]">
            {mockArtworks.length}
          </div>
          <span className="text-[11px] font-mono text-[var(--accent)]">
            Masterworks published
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Pending Review</span>
            <AlertCircle className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[var(--accent)]">
            {pendingCount}
          </div>
          <span className="text-[11px] font-mono text-[var(--muted)]">
            Submissions in queue
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Active Salons</span>
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[var(--ink)]">
            {eventsList.length}
          </div>
          <span className="text-[11px] font-mono text-[var(--accent)]">
            Workshops & exhibitions
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Club Members</span>
            <Users className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[var(--ink)]">
            142
          </div>
          <span className="text-[11px] font-mono text-[var(--accent)]">
            Across CSE, IT & Ceramic
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--line)] pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`filter-chip ${activeTab === 'submissions' ? 'active' : ''}`}
        >
          <span>Submissions Queue ({pendingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`filter-chip ${activeTab === 'events' ? 'active' : ''}`}
        >
          <span>Event & Salon Manager</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`filter-chip ${activeTab === 'members' ? 'active' : ''}`}
        >
          <span>Membership Inductions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`filter-chip ${activeTab === 'broadcast' ? 'active' : ''}`}
        >
          <span>Studio Broadcast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`filter-chip ${activeTab === 'achievements' ? 'active' : ''}`}
        >
          <span>Achievements & Honors ({achievements.length})</span>
        </button>
      </div>

      {/* Tab 1: Artwork Submissions Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-[var(--ink)]">
              Student Artwork Review Queue
            </h2>
            <span className="text-xs font-mono text-[var(--muted)]">
              Curatorial standards: verify resolution, department attribution, and medium accuracy
            </span>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                <div className="md:col-span-3 aspect-[4/3] rounded-[4px] overflow-hidden bg-[var(--paper)] border border-[var(--line)]">
                  <img
                    src={sub.imageUrl}
                    alt={sub.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)] uppercase">
                      {sub.category}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted)]">
                      Submitted {sub.submittedAt}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    {sub.title}
                  </h3>

                  <p className="text-xs font-mono text-[var(--muted)]">
                    By <strong>{sub.studentName}</strong> • {sub.department} ({sub.yearOfStudy})
                  </p>

                  <p className="text-xs text-[var(--muted)] font-mono">
                    Medium: {sub.medium} • Dimensions: {sub.dimensions}
                  </p>

                  <p className="text-xs text-[var(--ink)]/90 italic font-sans">
                    "{sub.statement}"
                  </p>
                </div>

                <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                  {sub.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveSubmission(sub.id)}
                        className="btn-primary text-xs justify-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Accession</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectSubmission(sub.id)}
                        className="btn-secondary text-xs justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Request Revision</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 rounded-[4px] bg-[var(--paper)] border border-[var(--line)]">
                      <span className="text-xs font-mono uppercase font-semibold text-[var(--accent)]">
                        Status: {sub.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Event & Salon Manager */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-[var(--ink)]">
              Scheduled Campus Salons & Workshops
            </h2>
            <button
              type="button"
              onClick={() => setNewEventModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="border border-[var(--line)] rounded-[6px] divide-y divide-[var(--line)] bg-[var(--surface)]">
            {eventsList.map((evt) => (
              <div key={evt.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[var(--accent)]">
                      {evt.category}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted)]">• {evt.date}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] font-mono">
                    Venue: {evt.venue} • Curator: {evt.curator}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)]">
                  <span>
                    {evt.registeredCount} / {evt.capacity} seats filled
                  </span>
                  <Link
                    to={`/events/${evt.slug || evt.id}`}
                    className="p-2 border border-[var(--line)] rounded-full hover:border-[var(--ink)] text-[var(--ink)] transition-colors"
                    title="View public salon page"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Membership Inductions */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-[var(--ink)]">
              Incoming Member Applications
            </h2>
            <span className="text-xs font-mono text-[var(--accent)] font-semibold">
              Semester Recruitment Batch 2026
            </span>
          </div>

          <div className="border border-[var(--line)] rounded-[6px] divide-y divide-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 text-xs font-mono text-[var(--muted)] bg-[var(--paper)]">
              <span className="col-span-3">Applicant</span>
              <span className="col-span-3">Department & Year</span>
              <span className="col-span-3">Primary Wing</span>
              <span className="col-span-3 text-right">Action</span>
            </div>

            {[
              {
                name: 'Kallol Banerjee',
                roll: '102-CSE-24',
                dept: 'Computer Science & Engineering',
                year: '2nd Year',
                wing: 'Digital & Illustration',
                exp: 'Blender 3D modeling and concept sketching in Procreate.',
              },
              {
                name: 'Swati Ganguly',
                roll: '041-CT-25',
                dept: 'Ceramic Technology',
                year: '1st Year',
                wing: 'Ceramic & Terracotta',
                exp: 'Self-taught hand-building with terracotta clay and coil pots.',
              },
              {
                name: 'Arindam Das',
                roll: '088-IT-24',
                dept: 'Information Technology',
                year: '3rd Year',
                wing: 'Curatorial & Documentation',
                exp: 'Film photography and high-resolution archiving.',
              },
            ].map((app, idx) => (
              <div key={idx} className="grid grid-cols-12 px-6 py-4 items-center text-sm">
                <div className="col-span-3">
                  <strong className="block text-[var(--ink)] font-display">{app.name}</strong>
                  <span className="text-xs font-mono text-[var(--muted)]">{app.roll}</span>
                </div>
                <div className="col-span-3 text-xs text-[var(--muted)] font-mono">
                  {app.dept} • {app.year}
                </div>
                <div className="col-span-3 text-xs font-mono text-[var(--accent)] font-semibold">
                  {app.wing}
                </div>
                <div className="col-span-3 text-right">
                  <button
                    type="button"
                    onClick={() => showSuccess('Member Inducted', `${app.name} assigned Studio 204 access pass.`)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <span>Approve pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Studio Broadcast Banner */}
      {activeTab === 'broadcast' && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="section-title text-[var(--ink)]">
              Studio Noticeboard Broadcast
            </h2>
            <p className="text-xs text-[var(--muted)] font-mono">
              Controls the live announcement strip displayed across the studio website.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activeBroadcast"
                checked={broadcastActive}
                onChange={(e) => {
                  setBroadcastActive(e.target.checked);
                  showInfo(e.target.checked ? 'Broadcast activated' : 'Broadcast hidden');
                }}
                className="w-4 h-4 text-[var(--accent)] rounded border-[var(--line)]"
              />
              <label htmlFor="activeBroadcast" className="text-sm font-medium text-[var(--ink)]">
                Display broadcast announcement banner on public pages
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                Announcement Copy
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--line)] p-3 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <button
              type="button"
              onClick={() => showSuccess('Broadcast Saved', 'Public banner text updated successfully.')}
              className="btn-primary"
            >
              <span>Save announcement</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Achievements & Honors Management */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="section-title text-[var(--ink)]">
                Campus Honors & Milestones Manager
              </h2>
              <p className="text-xs font-mono text-[var(--muted)]">
                Manage club awards, exhibition milestones, and the four headline impact numbers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/achievements" className="btn-primary text-xs py-2 px-4">
                <span>View & Edit on Honors Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--accent)] text-[var(--on-accent)]">
                      {item.badge}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted)]">
                      {item.category} • {item.date || item.year}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)] font-mono">
                    Conferred by: {item.organizer} {item.event ? `· Event: ${item.event}` : ''}
                  </p>
                  <p className="text-xs text-[var(--ink)]/80 font-sans line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete milestone "${item.title}"?`)) {
                        deleteAchievement(item.id);
                      }
                    }}
                    className="p-2 rounded-full border border-[var(--line)] text-red-500 hover:border-red-500 transition-colors"
                    title="Delete milestone"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link
                    to="/achievements"
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <span>Edit details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                Schedule New Salon or Workshop
              </h3>
              <button
                type="button"
                onClick={() => setNewEventModalOpen(false)}
                className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  placeholder="The Alchemical Glaze Intensive"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 rounded-[6px] text-sm text-[var(--ink)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                  Tagline / Brief Subtitle
                </label>
                <input
                  type="text"
                  value={newEventData.tagline}
                  onChange={(e) => setNewEventData({ ...newEventData, tagline: e.target.value })}
                  placeholder="Hands-on wood-ash glaze mixing and reduction firing."
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 rounded-[6px] text-sm text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                    placeholder="November 28, 2026"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 rounded-[6px] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={newEventData.capacity}
                    onChange={(e) => setNewEventData({ ...newEventData, capacity: parseInt(e.target.value) || 30 })}
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 rounded-[6px] text-sm text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                  placeholder="Explain what materials will be covered..."
                  className="w-full bg-[var(--paper)] border border-[var(--line)] p-3 rounded-[6px] text-sm text-[var(--ink)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setNewEventModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Publish salon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
