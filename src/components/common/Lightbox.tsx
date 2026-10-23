import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export interface LightboxImage {
  id?: string;
  url: string;
  title?: string;
  caption?: string;
  credit?: string;
}

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex = 0,
  onIndexChange,
  title,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const activeImage = images[currentIndex] || images[0];

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [currentIndex, images.length, onIndexChange]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  };

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

  if (!isOpen || !activeImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mobile-viewport fixed inset-0 z-50 flex flex-col bg-black/95 text-white backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Image Lightbox"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 shrink-0 z-20 bg-black/40">
          <div className="space-y-0.5">
            <span className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider block">
              {title || 'Gallery Viewer'} • {currentIndex + 1} of {images.length}
            </span>
            {activeImage.title && (
              <h3 className="text-base sm:text-lg font-display font-bold text-white truncate max-w-md sm:max-w-xl">
                {activeImage.title}
              </h3>
            )}
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

        {/* Center Stage with Prev/Next buttons */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-transform hover:scale-110 active:scale-95"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.img
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.title || 'Preview'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="max-h-[70vh] max-h-[70dvh] sm:max-h-[76vh] sm:max-h-[76dvh] max-w-full object-contain rounded-[4px] shadow-2xl border border-white/10"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-transform hover:scale-110 active:scale-95"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Details & Filmstrip */}
        <div className="border-t border-white/10 bg-black/70 px-4 sm:px-8 py-3.5 space-y-3 shrink-0 z-20">
          {(activeImage.caption || activeImage.credit) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {activeImage.caption && (
                <p className="text-sm text-neutral-300 font-sans max-w-3xl leading-relaxed">
                  {activeImage.caption}
                </p>
              )}
              {activeImage.credit && (
                <span className="text-xs font-mono text-neutral-400 shrink-0">
                  {activeImage.credit}
                </span>
              )}
            </div>
          )}

          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar justify-center">
              {images.map((img, idx) => (
                <button
                  key={img.url || idx}
                  type="button"
                  onClick={() => onIndexChange && onIndexChange(idx)}
                  className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-[4px] overflow-hidden border-2 transition-all shrink-0 ${idx === currentIndex
                      ? 'border-[var(--accent)] scale-105 opacity-100 shadow-md ring-2 ring-[var(--accent)]/50'
                      : 'border-transparent opacity-50 hover:opacity-90'
                    }`}
                  aria-label={`Jump to image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.title || ''}
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
