import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { useToast } from '../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AchievementItem, HeadlineNumber } from '../types';

export const AchievementsPage: React.FC = () => {
  const {
    achievements,
    headlineNumbers,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    updateHeadlineNumber,
  } = useGallery();
  const { showSuccess, showInfo } = useToast();
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const isAdminMode = isAuthenticated && isEditing;

  // Modal States
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);
  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<HeadlineNumber | null>(null);

  // Form State for Milestone
  const [formData, setFormData] = useState<Omit<AchievementItem, 'id'>>({
    title: '',
    award: '',
    event: '',
    date: '',
    year: '2026',
    category: 'Award',
    badge: 'Campus Honor',
    organizer: 'GCECT Art Club',
    description: '',
    imageUrl: '',
    significance: '',
    metrics: '',
  });

  const categories = ['All', 'Award', 'Installation', 'Exhibition', 'Media', 'Milestone'];

  const filtered = achievements.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const toggleAdminMode = () => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (isEditing) {
      setIsEditing(false);
      showInfo('Admin Edit Mode Disabled', 'Returned to public view.');
    } else {
      setIsEditing(true);
      showSuccess('Admin Edit Mode Enabled', 'You can now create, edit, and delete milestones.');
    }
  };

  const openCreateModal = () => {
    setEditingAchievement(null);
    setFormData({
      title: '',
      award: '',
      event: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      year: new Date().getFullYear().toString(),
      category: 'Award',
      badge: 'Gold Accolade',
      organizer: 'GCECT & Regional Board',
      description: '',
      imageUrl: '/artworks/studio-workshop.jpg',
      significance: '',
      metrics: '',
    });
    setAchievementModalOpen(true);
  };

  const openEditModal = (item: AchievementItem) => {
    setEditingAchievement(item);
    setFormData({
      title: item.title,
      award: item.award || item.title,
      event: item.event || item.organizer,
      date: item.date || `${item.year}`,
      year: item.year,
      category: item.category,
      badge: item.badge,
      organizer: item.organizer,
      description: item.description,
      imageUrl: item.imageUrl || '',
      significance: item.significance || '',
      metrics: item.metrics || '',
    });
    setAchievementModalOpen(true);
  };

  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAchievement) {
      updateAchievement(editingAchievement.id, formData);
    } else {
      addAchievement(formData);
    }
    setAchievementModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the achievements archive?`)) {
      deleteAchievement(id);
    }
  };

  const openEditMetricModal = (metric: HeadlineNumber) => {
    setEditingMetric(metric);
    setMetricModalOpen(true);
  };

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;
    updateHeadlineNumber(editingMetric.id, {
      value: editingMetric.value,
      label: editingMetric.label,
      description: editingMetric.description,
    });
    setMetricModalOpen(false);
  };

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-14">
      {/* 1. Header & Admin Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--line)] pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>CAMPUS HONORS & RECOGNITION ARCHIVE</span>
          </div>
          <h1 className="page-title text-[var(--ink)]">
            Achievements
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
            Documenting the inter-college championships, gallery recognitions, public campus installations,
            and institutional milestones attained by Brush and Bond since our inception in 2024.
          </p>
        </div>

        {/* Admin Edit Controls Toggle */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {isAdminMode && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleAdminMode}
            className={`px-3.5 py-2 rounded-full border text-xs font-mono flex items-center gap-2 transition-all ${
              isAdminMode
                ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-md'
                : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
            }`}
            title={isAdminMode ? 'Click to exit admin edit mode' : 'Click to enable admin editing'}
          >
            {isAdminMode ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Admin Edit Active</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Controls</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Four Headline Numbers (as in Home, Admin-editable) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
          <span>Key Scale & Impact Metrics</span>
          {isAdminMode && <span className="text-[var(--accent)] font-semibold">✦ Click any metric card to edit</span>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {headlineNumbers.map((hl) => (
            <div
              key={hl.id}
              onClick={() => isAdminMode && openEditMetricModal(hl)}
              className={`bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-5 sm:p-6 space-y-2 relative group transition-all duration-200 ${
                isAdminMode ? 'cursor-pointer hover:border-[var(--accent)] hover:shadow-md' : ''
              }`}
            >
              {isAdminMode && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-1 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)] block">
                    <Edit2 className="w-3 h-3" />
                  </span>
                </div>
              )}

              <span
                className={`block font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                  hl.accent ? 'text-[var(--accent)]' : 'text-[var(--ink)]'
                }`}
              >
                {hl.value}
              </span>

              <h4 className="font-display font-bold text-sm sm:text-base text-[var(--ink)]">
                {hl.label}
              </h4>

              <p className="text-xs text-[var(--muted)] font-sans leading-relaxed line-clamp-2">
                {hl.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Category Filter Chips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
          <span>Filter by recognition type:</span>
          <span>{filtered.length} milestones shown</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--line)] scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            >
              <span>{cat === 'All' ? 'All Milestones' : `${cat}s`}</span>
              <span className="text-[11px] opacity-70 ml-1.5 font-mono">
                (
                {cat === 'All'
                  ? achievements.length
                  : achievements.filter((a) => a.category === cat).length}
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. List of Milestones and Recognitions */}
      {/* Award, Event, Date, Short Description, Optional Photo */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <article
              key={item.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] overflow-hidden p-6 sm:p-8 hover:border-[var(--ink)] transition-all duration-200 hover:shadow-md relative group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Optional Photo Column */}
                {item.imageUrl ? (
                  <div className="md:col-span-4 aspect-[4/3] rounded-[6px] overflow-hidden bg-[var(--paper)] border border-[var(--line)] relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[var(--surface)]/90 backdrop-blur-sm px-2 py-0.5 rounded-[4px] text-[10px] font-mono text-[var(--muted)] border border-[var(--line)]">
                      {item.year}
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-3 bg-[var(--paper)] rounded-[6px] border border-[var(--line)] p-6 text-center flex flex-col items-center justify-center space-y-2 aspect-[4/3] md:aspect-auto">
                    <Trophy className="w-8 h-8 text-[var(--accent)] opacity-80" />
                    <span className="text-xs font-mono font-semibold text-[var(--ink)]">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      Year {item.year}
                    </span>
                  </div>
                )}

                {/* Content Column: Award, Event, Date, Description */}
                <div
                  className={`${
                    item.imageUrl ? 'md:col-span-8' : 'md:col-span-9'
                  } space-y-3.5`}
                >
                  {/* Badge & Category Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--on-accent)]">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono text-[var(--muted)]">
                        {item.category} • Year {item.year}
                      </span>
                    </div>

                    {/* Admin Edit / Delete Actions */}
                    {isAdminMode && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                          title="Edit milestone"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-red-500 hover:border-red-500 transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recognition Title */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-snug">
                    {item.title}
                  </h3>

                  {/* Award, Event & Date Specification Line */}
                  <div className="bg-[var(--paper)]/80 border border-[var(--line)] rounded-[6px] p-3 text-xs font-mono space-y-1.5">
                    {item.award && (
                      <div className="flex items-center gap-2 text-[var(--ink)]">
                        <Trophy className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span>
                          <strong className="text-[var(--muted)]">Award: </strong>
                          {item.award}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--muted)]">
                      {item.event && (
                        <span className="flex items-center gap-1.5 text-[var(--ink)]">
                          <Sparkles className="w-3 h-3 text-[var(--accent)] shrink-0" />
                          <span>
                            <strong className="text-[var(--muted)]">Event: </strong>
                            {item.event}
                          </span>
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[var(--muted)] shrink-0" />
                        <span>
                          <strong className="text-[var(--muted)]">Date: </strong>
                          {item.date || item.year}
                        </span>
                      </span>

                      {item.organizer && (
                        <span>
                          <strong className="text-[var(--muted)]">Conferred by: </strong>
                          {item.organizer}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-sm text-[var(--ink)]/90 leading-relaxed font-sans max-w-[68ch]">
                    {item.description}
                  </p>

                  {/* Significance or Metrics Footer */}
                  {(item.significance || item.metrics) && (
                    <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[var(--muted)] border-t border-[var(--line)]/60">
                      {item.significance && (
                        <span>
                          <strong className="text-[var(--accent)] font-semibold">Significance: </strong>
                          {item.significance}
                        </span>
                      )}
                      {item.metrics && (
                        <span className="opacity-80">
                          [{item.metrics}]
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 space-y-4 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)]">
            <Trophy className="w-10 h-10 text-[var(--muted)] mx-auto opacity-50" />
            <h3 className="font-display text-xl font-bold text-[var(--ink)]">
              No milestones found in this category
            </h3>
            <p className="text-sm text-[var(--muted)] max-w-sm mx-auto font-sans">
              Switch categories or add a new milestone using the admin controls.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="btn-secondary"
            >
              Show all milestones
            </button>
          </div>
        )}
      </div>

      {/* Admin Milestone Modal (Add / Edit) */}
      {achievementModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setAchievementModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl rounded-[8px] p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
                  Admin Honors Desk
                </span>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  {editingAchievement ? 'Edit Milestone' : 'Add New Milestone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAchievementModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Milestone / Recognition Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. First Prize: Eastern Region Fine Arts Salon"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Award Name / Prize
                  </label>
                  <input
                    type="text"
                    value={formData.award || ''}
                    onChange={(e) => setFormData({ ...formData, award: e.target.value })}
                    placeholder="e.g. Championship Gold & Trophy"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Event *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    placeholder="e.g. IIT Kharagpur Spring Fest"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. January 28, 2025"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2025"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as AchievementItem['category'],
                      })
                    }
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Award">Award</option>
                    <option value="Installation">Installation</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Media">Media</option>
                    <option value="Milestone">Milestone</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. 1st Place Gold"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                    Conferred by / Organizer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="e.g. IIT Kharagpur Fine Arts Division"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Short Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the accomplishment, participation, and outcome..."
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Optional Photo URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="e.g. /artworks/courtyard-mural.jpg (leave blank if no photo)"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-[11px] font-mono text-[var(--muted)] mt-1 block">
                  Tip: Use any path in /artworks/ or external URL. Can be left empty.
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAchievementModalOpen(false)}
                  className="btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5">
                  <Check className="w-4 h-4" />
                  <span>{editingAchievement ? 'Save Changes' : 'Create Milestone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Headline Metric Modal (Edit) */}
      {metricModalOpen && editingMetric && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setMetricModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--line)] shadow-2xl rounded-[8px] p-6 space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                Edit Headline Metric
              </h3>
              <button
                type="button"
                onClick={() => setMetricModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Metric Value (Big text) *
                </label>
                <input
                  type="text"
                  required
                  value={editingMetric.value}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, value: e.target.value })
                  }
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-sm font-bold font-display rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Metric Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingMetric.label}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, label: e.target.value })
                  }
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingMetric.description}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, description: e.target.value })
                  }
                  className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMetricModalOpen(false)}
                  className="btn-secondary py-1.5 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4">
                  Save Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
