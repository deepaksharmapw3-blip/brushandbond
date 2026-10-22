import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Plus,
  Trash2,
  Search,
  Star,
  X,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState } from '../components/admin/AdminUtils';
import { artistApi } from '../services/api';

export const AdminArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Ceramic Technology');
  const [year, setYear] = useState('3rd Year');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArtists = async () => {
    try {
      const res = await artistApi.getAll();
      if (res.success && Array.isArray(res.artists)) {
        setArtists(res.artists);
      }
    } catch (err: any) {
      console.warn('Failed to load artists:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- This starts an async read; state changes follow the API response.
    fetchArtists();
  }, []);

  const resetForm = () => {
    setName('');
    setDepartment('Ceramic Technology');
    setYear('3rd Year');
    setBio('');
    setAvatarUrl('');
    setInstagram('');
    setPortfolioUrl('');
    setIsSpotlight(false);
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Artist name is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await artistApi.create({
        name: name.trim(),
        department: department.trim(),
        year: year.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        instagram: instagram.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        isSpotlight,
      });

      setToast({ message: 'Artist profile created successfully!', type: 'success' });
      setIsAddOpen(false);
      resetForm();
      fetchArtists();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to create artist profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpotlight = async (artist: any) => {
    try {
      const nextStatus = !artist.isSpotlight;
      await artistApi.update(artist.id, { isSpotlight: nextStatus });
      setToast({
        message: `${artist.name} ${nextStatus ? 'added to' : 'removed from'} Artist Spotlight`,
        type: 'success',
      });
      fetchArtists();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update spotlight status', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedArtist) return;
    try {
      await artistApi.delete(selectedArtist.id);
      setToast({ message: `Artist "${selectedArtist.name}" removed`, type: 'success' });
      setIsDeleteOpen(false);
      setSelectedArtist(null);
      fetchArtists();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete artist', type: 'error' });
    }
  };

  const filteredArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department && a.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Artists" description="Manage artists" canonicalPath="/admin/artists" />
      <AdminLayout activeSection="artists">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Manage Artists & Spotlight</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Curate club artists, feature talents in Spotlight, and manage bios ({filteredArtists.length} artists)
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
            Add Artist
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search artists by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
          />
        </div>

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredArtists.map((artist) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <img
                      src={artist.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name}`}
                      alt={artist.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[var(--line)] shrink-0"
                    />
                    <button
                      onClick={() => toggleSpotlight(artist)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                        artist.isSpotlight
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                          : 'bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                      }`}
                      title={artist.isSpotlight ? 'Featured in Artist Spotlight' : 'Click to feature in Spotlight'}
                    >
                      <Star className={`w-3.5 h-3.5 ${artist.isSpotlight ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{artist.isSpotlight ? 'Spotlight' : 'Promote'}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-[var(--ink)]">{artist.name}</h3>
                  <p className="text-xs text-[var(--accent)] font-medium mt-0.5">
                    {artist.department} • {artist.year || 'Member'}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-2.5 line-clamp-3 leading-relaxed">
                    {artist.bio || 'No artist statement provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    🎨 {artist._count?.artworks ?? 0} artworks
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedArtist(artist);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete Artist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Palette}
            title={isLoading ? 'Loading artists...' : 'No artists found'}
            description="Add your first student artist profile to the club roster"
            actionLabel="Add Artist"
            onAction={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          />
        )}

        {/* ── ADD ARTIST MODAL ── */}
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
                    <Palette className="w-4 h-4 text-[var(--accent)]" />
                    Add Artist Profile
                  </h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddArtist} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sagnik Mukherjee"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        <option value="Ceramic Technology">Ceramic Technology</option>
                        <option value="Computer Science & Engineering">Computer Science & Eng</option>
                        <option value="Information Technology">Information Technology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Academic Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Alumni">Alumni</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Avatar / Profile Picture URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Artist Bio & Mediums of Interest
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specializes in terracotta, watercolor, and monochrome portraits..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Portfolio Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://behance.net/..."
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="spotlight-check"
                      checked={isSpotlight}
                      onChange={(e) => setIsSpotlight(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="spotlight-check" className="text-xs font-medium text-[var(--ink)] cursor-pointer">
                      Feature on Artist Spotlight page
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
                      {isSubmitting ? 'Saving...' : 'Add Artist'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Artist"
          description={
            selectedArtist
              ? `Are you sure you want to remove artist "${selectedArtist.name}"?`
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
