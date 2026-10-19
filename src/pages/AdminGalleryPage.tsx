import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Edit, Trash2, Upload, Grid3X3, Search } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState } from '../components/admin/AdminUtils';
import { useGallery } from '../context/GalleryContext';

export const AdminGalleryPage: React.FC = () => {
  const { artworks } = useGallery();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredArtworks = artworks.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDeleteOpen(false);
    setToast({ message: 'Artwork deleted successfully', type: 'success' });
  };

  return (
    <ProtectedAdminRoute>
      <SEO title="Admin Gallery" description="Manage gallery" canonicalPath="/admin/gallery" />
      <AdminLayout activeSection="gallery">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Gallery</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Manage artwork submissions ({filteredArtworks.length})
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Upload className="w-4 h-4" />
            Upload Artwork
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search artworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Gallery Grid */}
        {filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredArtworks.slice(0, 12).map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden hover:border-[var(--accent)]/50 transition-colors"
              >
                <div className="aspect-square bg-[var(--paper)] overflow-hidden">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedArtwork(artwork.id)}
                    className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArtwork(artwork.id);
                      setIsDeleteOpen(true);
                    }}
                    className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-[var(--ink)] line-clamp-1">{artwork.title}</p>
                  <p className="text-xs text-[var(--muted)]">{artwork.artistName}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Grid3X3}
            title="No artworks found"
            description={searchQuery ? 'Try adjusting your search' : 'Upload your first artwork'}
            actionLabel="Upload Artwork"
            onAction={() => setIsUploadOpen(true)}
          />
        )}

        {/* Delete Confirm */}
        <ConfirmDialog
          title="Delete Artwork"
          description="Are you sure? This action cannot be undone."
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
