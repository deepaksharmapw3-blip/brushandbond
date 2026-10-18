import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Sparkles } from 'lucide-react';
import type { Artwork } from '../../types';
import { useGallery } from '../../context/GalleryContext';

interface ArtworkCardProps {
  artwork: Artwork;
  priority?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, priority = false }) => {
  const { openArtworkModal, toggleLike, likedArtworkIds } = useGallery();
  const isLiked = likedArtworkIds.has(artwork.id);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, isHovered: false });

  // Format department cleanly (e.g., "Ceramic Technology" instead of full string if desired)
  const departmentShort = artwork.artistDept
    ? artwork.artistDept.split(',')[0].replace(' Department', '').trim()
    : 'GCECT';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setCursorPos((prev) => ({ ...prev, isHovered: false }));
  };

  return (
    <article className="break-inside-avoid mb-6 w-full group relative bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-3 transition-all duration-300 hover:border-[var(--ink)] hover:shadow-xl flex flex-col">
      {/* Artwork Image Container with Natural Aspect Ratio */}
      <div
        className="relative overflow-hidden bg-[var(--paper)] rounded-[4px] cursor-pointer select-none"
        onClick={() => openArtworkModal(artwork)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Blur-up placeholder skeleton while loading */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-tr from-[var(--paper)] via-[var(--surface)] to-[var(--paper)] transition-opacity duration-700 pointer-events-none z-0 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-full h-56 min-h-[220px] animate-pulse flex items-center justify-center text-xs font-mono text-[var(--muted)] opacity-60">
            <span>Accessioning...</span>
          </div>
        </div>

        {/* Natural Aspect Ratio Image with Scale 1.02 on Hover */}
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto block object-cover transition-all duration-500 ease-out transform group-hover:scale-[1.02] ${
            isLoaded ? 'opacity-100 filter-none' : 'opacity-0 filter blur-sm scale-[0.98]'
          }`}
        />

        {/* Subtle dark gradient overlay on hover for contrast */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Interactive Desktop "View" Cursor following the pointer */}
        <AnimatePresence>
          {cursorPos.isHovered && (
            <motion.div
              className="hidden md:flex pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-mono font-medium shadow-2xl border border-[var(--line)]/30 backdrop-blur-md"
              style={{
                left: cursorPos.x,
                top: cursorPos.y,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>View</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile/Touch "View" hint (shown on touch devices) */}
        <div className="md:hidden absolute bottom-2 left-2 z-10 bg-[var(--ink)]/80 text-[var(--paper)] text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
          <Eye className="w-3 h-3 text-[var(--accent)]" />
          <span>Tap to view</span>
        </div>

        {/* Accession & Year pill in top left */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-[var(--surface)]/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-mono text-[var(--muted)] border border-[var(--line)] rounded-[4px] shadow-xs">
          <span>{artwork.accessionNo}</span>
          <span className="mx-1 opacity-50">·</span>
          <span>{artwork.year}</span>
        </div>

        {/* Featured Star Badge */}
        {artwork.featured && (
          <div className="absolute bottom-2.5 right-2.5 z-10 bg-[var(--accent)] text-[var(--on-accent)] px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        )}

        {/* Like Button in top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(artwork.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 flex items-center justify-center bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--line)] rounded-full transition-all duration-200 hover:scale-110 shadow-xs ${
            isLiked
              ? 'text-[var(--accent)] border-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-[var(--accent)]'
          }`}
          aria-label={isLiked ? `Unlike ${artwork.title}` : `Like ${artwork.title}`}
          title={isLiked ? 'Saved to bookmarks' : 'Appreciate artwork'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[var(--accent)]' : ''}`} />
        </button>
      </div>

      {/* Plaque Caption: Title in heading font + Artist · Department · Event */}
      <div className="pt-3.5 px-1 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Title in Heading Font */}
          <h3
            onClick={() => openArtworkModal(artwork)}
            className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] leading-snug hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {artwork.title}
          </h3>

          {/* Small Line: Artist · Department · Event */}
          <div className="mt-1.5 text-xs text-[var(--muted)] flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans leading-relaxed">
            <span className="font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
              {artwork.artistName}
            </span>
            <span className="text-[var(--muted)]/60 font-mono">·</span>
            <span className="text-[var(--muted)] font-medium">
              {departmentShort}
            </span>
            {artwork.eventTitle && (
              <>
                <span className="text-[var(--muted)]/60 font-mono">·</span>
                <span
                  className="text-[var(--accent)] font-medium truncate max-w-[200px]"
                  title={artwork.eventTitle}
                >
                  {artwork.eventTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hairline Divider & Archival Meta (Medium & Likes) */}
        <div className="mt-3 pt-2.5 border-t border-[var(--line)]/80 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
          <span className="truncate pr-2 font-medium text-[var(--ink)]/80">
            {artwork.medium}
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="capitalize">{(artwork?.category || 'art').replace('-', ' ')}</span>
            <span className="flex items-center gap-1 font-semibold text-[var(--ink)]">
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
              {artwork.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
