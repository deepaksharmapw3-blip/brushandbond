import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Upload,
  Grid3X3,
  Search,
  X,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState } from '../components/admin/AdminUtils';
import { artworkApi, artistApi, uploadImage } from '../services/api';

const ARTWORKS_PER_PAGE = 24;

export const AdminGalleryPage: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SKETCHES');
  const [artistId, setArtistId] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArtworks = async () => {
    try {
      const res = await artworkApi.getAll({ limit: 500 });
      if (res.success && Array.isArray(res.artworks)) {
        setArtworks(res.artworks);
      }
    } catch (err: any) {
      console.warn('Failed to load artworks:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await artistApi.getAll();
      if (res.success && Array.isArray(res.artists)) {
        setArtists(res.artists);
      }
    } catch {}
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- These start async reads; state changes follow the API responses.
    fetchArtworks();
    fetchArtists();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCategory('SKETCHES');
    setArtistId('');
    setDescription('');
    setTags('');
    setFeatured(false);
    setImageUrl('');
    setImageFile(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }
    if (!imageFile && !imageUrl.trim()) {
      setToast({ message: 'Please upload an image file or provide an Image URL', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map category to Supabase enum values
      const categoryMap: Record<string, string> = {
        SKETCHES: 'sketches',
        PAINTINGS: 'paintings',
        DIGITAL_ART: 'digitalart',
        PHOTOGRAPHY: 'photography',
        CALLIGRAPHY: 'calligraphy',
        DOODLES: 'doodles',
      };
      const mappedCategory = categoryMap[category] ?? category.toLowerCase();

      // Generate a slug from the title
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        + '-' + Date.now();

      const currentYear = new Date().getFullYear();

      let finalImageUrl = imageUrl.trim();
      let width = 800;
      let height = 600;

      if (imageFile) {
        // Upload to Supabase Storage first
        const uploaded = await uploadImage('artworks', imageFile, String(currentYear));
        finalImageUrl = uploaded.publicUrl;
        if (uploaded.width) width = uploaded.width;
        if (uploaded.height) height = uploaded.height;
      }

      await artworkApi.create({
        title: title.trim(),
        slug,
        category: mappedCategory,
        image_url: finalImageUrl,
        width,
        height,
        alt: title.trim(),
        art_year: currentYear,
        artist_id: artistId || null,
        description: description.trim() || null,
        featured,
        is_published: true,
      });

      setToast({ message: 'Artwork uploaded successfully to Gallery!', type: 'success' });
      setCurrentPage(1);
      setIsUploadOpen(false);
      resetForm();
      fetchArtworks();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to upload artwork', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArtwork) return;
    try {
      await artworkApi.delete(selectedArtwork.id);
      setToast({ message: `Artwork "${selectedArtwork.title}" deleted`, type: 'success' });
      setIsDeleteOpen(false);
      setSelectedArtwork(null);
      fetchArtworks();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete artwork', type: 'error' });
    }
  };

  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.artist && art.artist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (Array.isArray(art.tags) ? art.tags.join(', ') : art.tags || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || String(art.category).toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesCategory;
  });
  const pageCount = Math.max(1, Math.ceil(filteredArtworks.length / ARTWORKS_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleArtworks = filteredArtworks.slice(
    (safePage - 1) * ARTWORKS_PER_PAGE,
    safePage * ARTWORKS_PER_PAGE,
  );

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Gallery" description="Manage gallery" canonicalPath="/admin/gallery" />
      <AdminLayout activeSection="gallery">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Manage Artwork & Gallery</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Upload, edit, and organize artworks across all categories ({filteredArtworks.length} items)
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsUploadOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-semibold hover:opacity-95 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Artwork
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search by title, artist, or tag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)]"
          >
            <option value="All">All Categories</option>
            <option value="SKETCHES">Sketches</option>
            <option value="PAINTINGS">Paintings</option>
            <option value="DIGITAL_ART">Digital Art</option>
            <option value="PHOTOGRAPHY">Photography</option>
          </select>
        </div>

        {/* Gallery Grid */}
        {filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-all shadow-xs flex flex-col"
              >
                <div className="aspect-square bg-[var(--paper)] overflow-hidden relative">
                  <img
                    src={artwork.image_url || artwork.imageUrl}
                    alt={artwork.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {artwork.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-bold rounded-md uppercase">
                      Featured
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono rounded-md">
                    {artwork.category}
                  </span>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)] line-clamp-1">{artwork.title}</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {artwork.artist ? artwork.artist.name : 'Unknown Artist'}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--muted)] font-mono">
                      ❤️ {artwork.likes || 0} likes
                    </span>
                    <button
                      onClick={() => {
                        setSelectedArtwork(artwork);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete Artwork"
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
            icon={Grid3X3}
            title={isLoading ? 'Loading artworks...' : 'No artworks found'}
            description={searchQuery ? 'Try adjusting your search filters' : 'Upload your first artwork to the gallery'}
            actionLabel="Upload Artwork"
            onAction={() => {
              resetForm();
              setIsUploadOpen(true);
            }}
          />
        )}

        {filteredArtworks.length > ARTWORKS_PER_PAGE && (
          <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Artwork pages">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--muted)]" aria-live="polite">
              Page {safePage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={safePage === pageCount}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}

        {/* ── UPLOAD ARTWORK MODAL ── */}
        <AnimatePresence>
          {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
                  <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[var(--accent)]" />
                    Upload New Artwork
                  </h3>
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Charcoal Silhouette of Heritage Kiln"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  {/* Category & Artist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        <option value="SKETCHES">Sketches</option>
                        <option value="PAINTINGS">Paintings</option>
                        <option value="DIGITAL_ART">Digital Art</option>
                        <option value="PHOTOGRAPHY">Photography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Artist
                      </label>
                      <select
                        value={artistId}
                        onChange={(e) => setArtistId(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        <option value="">Select Artist (Optional)</option>
                        {artists.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.department || 'GCECT'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image: File Upload OR Image URL */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Artwork Image *
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent)] file:text-[var(--on-accent)] hover:file:opacity-90"
                      />
                      <div className="text-center text-[11px] text-[var(--muted)] font-mono">— OR ENTER IMAGE URL —</div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                      Description / Medium
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief note about inspiration, medium used, or dimension..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  {/* Tags & Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="charcoal, landscape, campus"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:pt-4">
                      <input
                        type="checkbox"
                        id="featured-check"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <label htmlFor="featured-check" className="text-xs font-medium text-[var(--ink)] cursor-pointer">
                        Feature on Home page
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-[var(--line)] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[var(--accent)] text-[var(--on-accent)] text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Uploading...' : 'Publish Artwork'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Artwork"
          description={
            selectedArtwork
              ? `Are you sure you want to delete "${selectedArtwork.title}"? This cannot be undone.`
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
