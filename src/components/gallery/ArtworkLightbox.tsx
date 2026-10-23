import React, { useCallback, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Sparkles,
  Maximize2,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { useToast } from '../../context/ToastContext';

export const ArtworkLightbox: React.FC = () => {
  const navigate = useNavigate();
  const {
    artworks,
    activeArtworkModal,
    openArtworkModal,
    closeArtworkModal,
    nextArtwork,
    prevArtwork,
    toggleLike,
    likedArtworkIds,
  } = useGallery();
  const { showSuccess } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync with URL query parameter ?artwork=art-xxx or ?art=art-xxx
  useEffect(() => {
    const artworkQueryId = searchParams.get('artwork') || searchParams.get('art');
    if (artworkQueryId && (!activeArtworkModal || activeArtworkModal.id !== artworkQueryId)) {
      const match = artworks.find(
        (a) => a.id === artworkQueryId || a.accessionNo.toLowerCase() === artworkQueryId.toLowerCase()
      );
      if (match) {
        openArtworkModal(match);
      }
    }
  }, [searchParams, artworks, activeArtworkModal, openArtworkModal]);

  // When activeArtworkModal changes, keep URL in sync so modal is directly shareable
  useEffect(() => {
    if (activeArtworkModal) {
      const currentParam = searchParams.get('artwork');
      if (currentParam !== activeArtworkModal.id) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('artwork', activeArtworkModal.id);
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [activeArtworkModal, searchParams, setSearchParams]);

  // Handle closing modal and removing URL param
  const handleClose = useCallback(() => {
    closeArtworkModal();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('artwork');
    nextParams.delete('art');
    setSearchParams(nextParams, { replace: true });
  }, [closeArtworkModal, searchParams, setSearchParams]);

  // Keyboard navigation support: Left / Right / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeArtworkModal) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevArtwork();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextArtwork();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArtworkModal, prevArtwork, nextArtwork, handleClose]);

  if (!activeArtworkModal) return null;

  const artwork = activeArtworkModal;
  const isLiked = likedArtworkIds.has(artwork.id);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/gallery?artwork=${artwork.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showSuccess(
        'Direct link copied',
        `Permanent modal link for "${artwork.title}" copied to clipboard.`
      );
    });
  };

  return (
    <AnimatePresence mode="wait">
      {activeArtworkModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label={artwork.title}
      >
        {/* Desktop Previous Artwork Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevArtwork();
          }}
          className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-2xl transition-all hover:scale-110 active:scale-95"
          aria-label="Previous artwork (Left Arrow key)"
          title="Previous artwork (← Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Desktop Next Artwork Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextArtwork();
          }}
          className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-2xl transition-all hover:scale-110 active:scale-95"
          aria-label="Next artwork (Right Arrow key)"
          title="Next artwork (→ Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Modal Window Container */}
        <motion.div
          key={artwork.id}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl rounded-[8px] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Control Bar Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--line)] bg-[var(--paper)]/60">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
              <span className="font-bold text-[var(--accent)]">{artwork.accessionNo}</span>
              <span>•</span>
              <span className="capitalize">{(artwork.category || 'art').replace('-', ' ')}</span>
              <span>•</span>
              <span>{artwork.year}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Arrows in Header */}
              <div className="flex md:hidden items-center border border-[var(--line)] rounded-full overflow-hidden bg-[var(--surface)]">
                <button
                  type="button"
                  onClick={prevArtwork}
                  className="px-2.5 py-1 text-[var(--ink)] hover:text-[var(--accent)] border-r border-[var(--line)]"
                  aria-label="Previous artwork"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextArtwork}
                  className="px-2.5 py-1 text-[var(--ink)] hover:text-[var(--accent)]"
                  aria-label="Next artwork"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
                title="Share link"
                aria-label="Copy direct share link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all font-bold active:scale-95"
                aria-label="Close artwork details (Escape)"
                title="Close (Escape)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Main Content: Image & Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
            {/* Left Column: Large Image Display */}
            <div className="lg:col-span-7 bg-[var(--paper)] flex flex-col items-center justify-center p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-[var(--line)] relative min-h-[300px] sm:min-h-[460px]">
              <div className="relative max-h-[70vh] flex items-center justify-center">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="max-h-[66vh] w-auto max-w-full object-contain rounded-[4px] shadow-sm select-none"
                />
              </div>

              {/* Physical location pill below image */}
              {artwork.physicalLocation && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--muted)] font-sans text-center">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span>Archived location: {artwork.physicalLocation}</span>
                </div>
              )}
            </div>

            {/* Right Column: Curatorial Metadata & Description */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Title & Category Line */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider mb-1">
                    <Link
                      to={`/gallery/${artwork.category}`}
                      onClick={handleClose}
                      className="hover:underline"
                    >
                      {(artwork.category || 'art').replace('-', ' ')}
                    </Link>
                    <span>•</span>
                    <span className="text-[var(--muted)]">{artwork.year}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight">
                    {artwork.title}
                  </h2>
                </div>

                {/* Artist Attribution with link to artist profile */}
                <div className="bg-[var(--paper)]/70 border border-[var(--line)] p-3.5 rounded-[6px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      Artist Profile
                    </span>
                    <Link
                      to={`/artists/${artwork.artistSlug || ''}`}
                      onClick={handleClose}
                      className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View bio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <User className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <Link
                      to={`/artists/${artwork.artistSlug || ''}`}
                      onClick={handleClose}
                      className="font-display text-base font-bold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                    >
                      {artwork.artistName}
                    </Link>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-sans pl-6">
                    {artwork.artistDept}
                  </p>
                </div>

                {/* Event Attribution with link to event */}
                {artwork.eventTitle && (
                  <div className="bg-[var(--paper)]/70 border border-[var(--line)] p-3.5 rounded-[6px] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                        Event Exhibition
                      </span>
                      {artwork.eventSlug && (
                        <Link
                          to={`/events/${artwork.eventSlug}`}
                          onClick={handleClose}
                          className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Event info</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <Calendar className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span className="font-medium text-[var(--ink)]">
                        {artwork.eventTitle}
                      </span>
                    </div>
                  </div>
                )}

                {/* Technical Dimensions and Medium */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[var(--paper)]/50 p-3 rounded-[6px] border border-[var(--line)]">
                  <div>
                    <span className="text-[var(--muted)] block text-[11px]">Medium</span>
                    <span className="text-[var(--ink)] font-semibold truncate block">
                      {artwork.medium}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block text-[11px]">Dimensions</span>
                    <span className="text-[var(--ink)] font-semibold truncate block">
                      {artwork.dimensions}
                    </span>
                  </div>
                </div>

                {/* Artwork Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider block">
                    Artwork Statement & Description
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--ink)]/90 leading-relaxed font-sans">
                    {artwork.description}
                  </p>
                </div>

                {/* Curator's Note */}
                {artwork.curatorNote && (
                  <div className="space-y-1 pt-1">
                    <span className="text-xs font-mono text-[var(--accent)] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Curator's Commentary</span>
                    </span>
                    <p className="text-xs text-[var(--muted)] italic leading-relaxed pl-3 border-l-2 border-[var(--accent)] font-sans">
                      &ldquo;{artwork.curatorNote}&rdquo;
                    </p>
                  </div>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {artwork.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[var(--accent)]" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleLike(artwork.id)}
                  className={`flex-1 ${isLiked ? 'btn-primary' : 'btn-secondary'} min-h-[42px] py-2`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Saved' : `Like (${artwork.likes})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setTimeout(() => {
                      navigate(`/gallery/${artwork.id}`);
                    }, 200);
                  }}
                  className="btn-secondary min-h-[42px] py-2 hover:bg-[var(--accent)]/10 active:scale-95 transition-all"
                  title="Open dedicated standalone page"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Full page</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
