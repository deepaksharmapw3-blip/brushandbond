import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import type { CampusArtPhoto } from '../../types/campusArt';

interface CampusArtLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: CampusArtPhoto[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  projectTitle?: string;
  groupName?: string;
}

export const CampusArtLightbox: React.FC<CampusArtLightboxProps> = ({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onSelectIndex,
  projectTitle,
  groupName,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const currentPhoto = photos[currentIndex] || photos[0];

  const handlePrev = useCallback(() => {
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    onSelectIndex((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Lock scroll
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

  if (!isOpen || !currentPhoto) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mobile-viewport fixed inset-0 z-50 flex flex-col bg-black/95 text-white backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Campus Art Archival Photo Lightbox"
      >
        {/* Top Bar: Title & Controls */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 shrink-0 z-20 bg-black/40">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-wider">
              <span>{groupName || 'Campus Art Archive'}</span>
              <span>•</span>
              <span>Photo {currentIndex + 1} of {photos.length}</span>
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-white truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
              {projectTitle ? `${projectTitle} — ` : ''}{currentPhoto.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close (Esc)"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Image Stage with Arrow Controls */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-8 overflow-hidden">
          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/15 transition-transform hover:scale-110 active:scale-95"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Photo with smooth transition */}
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
            <motion.img
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={currentPhoto.title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-h-[68vh] max-h-[68dvh] sm:max-h-[72vh] sm:max-h-[72dvh] max-w-full object-contain rounded-[4px] shadow-2xl border border-white/10"
            />
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/15 transition-transform hover:scale-110 active:scale-95"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Panel: Photo Metadata & Caption */}
        <div className="border-t border-white/10 bg-black/70 px-4 sm:px-8 py-3.5 space-y-3 shrink-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            {/* Caption */}
            <p className="text-sm text-neutral-300 font-sans max-w-3xl leading-relaxed">
              {currentPhoto.caption}
            </p>

            {/* Badges / Credits */}
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 shrink-0 flex-wrap">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{currentPhoto.location}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentPhoto.year}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentPhoto.photographer}</span>
              </span>

              <span className="px-2 py-0.5 rounded bg-white/10 text-white uppercase text-[10px] tracking-wider font-semibold">
                {currentPhoto.type} Shot
              </span>
            </div>
          </div>

          {/* Thumbnail Filmstrip (if more than 1 photo in set) */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar justify-center">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-[4px] overflow-hidden border-2 transition-all shrink-0 ${
                    idx === currentIndex
                      ? 'border-[var(--accent)] scale-105 opacity-100 shadow-md ring-2 ring-[var(--accent)]/50'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                  aria-label={`Jump to photo ${idx + 1}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
