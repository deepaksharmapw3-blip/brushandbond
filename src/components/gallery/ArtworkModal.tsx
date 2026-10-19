import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Share2,
  Sparkles,
  MapPin,
  Check,
  Maximize2,
} from 'lucide-react';
import type { Artwork } from '../../types';
import { useGallery } from '../../context/GalleryContext';
import { useToast } from '../../context/ToastContext';

export interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullscreen?: (artwork: Artwork) => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  isOpen,
  onClose,
  onOpenFullscreen,
}) => {
  const { likedArtworkIds, toggleLike } = useGallery();
  const { showSuccess } = useToast();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !artwork) return null;

  const isLiked = likedArtworkIds.has(artwork.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/gallery/${artwork.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      showSuccess('Link copied to clipboard!', artwork.title);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[8px] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase">
              <span>{artwork.accessionNo}</span>
              <span>•</span>
              <span>{artwork.year}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenFullscreen && onOpenFullscreen(artwork)}
                className="p-2 rounded-full border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                title="Fullscreen view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                title="Share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors ml-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Image Container */}
              <div className="lg:col-span-7 space-y-3">
                <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden bg-[var(--paper)] border border-[var(--line)]">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  {artwork.featured && (
                    <div className="absolute top-3 left-3 bg-[var(--accent)] text-[var(--on-accent)] px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] px-1">
                  <span>{artwork.medium}</span>
                  <span>{artwork.dimensions}</span>
                </div>
              </div>

              {/* Right: Curatorial Details */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
                    {artwork.category.replace('-', ' ')}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight">
                    {artwork.title}
                  </h2>

                  <div className="space-y-0.5 pt-1">
                    <p className="text-sm font-semibold text-[var(--ink)] font-sans">
                      {artwork.artistSlug ? (
                        <Link
                          to={`/artists/${artwork.artistSlug}`}
                          onClick={onClose}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {artwork.artistName}
                        </Link>
                      ) : (
                        artwork.artistName
                      )}
                    </p>
                    <p className="text-xs font-mono text-[var(--muted)]">
                      {artwork.artistDept}
                    </p>
                  </div>
                </div>

                {artwork.description && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase text-[var(--muted)] font-semibold block">
                      Artist Description
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--muted)] font-sans leading-relaxed">
                      {artwork.description}
                    </p>
                  </div>
                )}

                {artwork.curatorNote && (
                  <div className="space-y-1 bg-[var(--paper)] p-3.5 rounded-[6px] border border-[var(--line)]">
                    <span className="text-[11px] font-mono uppercase text-[var(--accent)] font-semibold block">
                      Curator’s Note
                    </span>
                    <p className="text-xs text-[var(--muted)] italic font-sans leading-relaxed">
                      &ldquo;{artwork.curatorNote}&rdquo;
                    </p>
                  </div>
                )}

                {artwork.physicalLocation && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span>Location: {artwork.physicalLocation}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-[var(--line)] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleLike(artwork.id)}
                    className={`flex-1 py-2.5 px-4 rounded-full border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all ${
                      isLiked
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                        : 'border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-[var(--accent)]' : ''}`} />
                    <span>{isLiked ? 'Appreciated' : 'Appreciate Artwork'}</span>
                    <span className="opacity-70">({artwork.likes + (isLiked ? 1 : 0)})</span>
                  </button>

                  <Link
                    to={`/gallery/${artwork.id}`}
                    onClick={onClose}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    <span>Full record</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tags Strip */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="pt-4 border-t border-[var(--line)] flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-[var(--muted)] mr-1">Tags:</span>
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
