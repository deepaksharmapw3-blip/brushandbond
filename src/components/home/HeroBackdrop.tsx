import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeroBackdropProps {
  className?: string;
}

/**
 * HeroBackdrop Component
 * 
 * Renders the college building photo as a calm, premium hero background with:
 * - Responsive image with WebP srcset and 640/1280/1920px optimization
 * - Gradient overlay (dark top to blended bottom with paper color fade)
 * - Soft vignette effect
 * - Subtle zoom-in animation on load (respects prefers-reduced-motion)
 * - Full accessibility support (decorative image, aria-hidden)
 * 
 * Image positioning:
 * - Desktop: 50% 35% (shows sky, clouds, top of building)
 * - Mobile: 50% 50% (shows more of building)
 * 
 * Overlay strategy:
 * - Top 55% opacity at top, darkens to 80% at 70% height
 * - Bottom 25%: fades to transparent to blend with --paper background
 * - Radial vignette: 25% black at edges, transparent center
 */
export const HeroBackdrop: React.FC<HeroBackdropProps> = ({ className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-[var(--ink)] ${className}`}>
      {/* Blurred placeholder while image loads - solid dark fallback */}
      {!isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(21, 19, 15, 0.95) 0%, rgba(27, 26, 22, 0.95) 100%)',
          }}
        />
      )}

      {/* Main background image with zoom animation */}
      <motion.img
        src="/images/hero-building.jpg"
        alt=""
        aria-hidden="true"
        srcSet="/images/hero-building-640w.webp 640w, /images/hero-building-1280w.webp 1280w, /images/hero-building-1920w.webp 1920w, /images/hero-building.jpg 1920w"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 100vw"
        fetchPriority="high"
        loading="eager"
        onLoad={() => setIsLoaded(true)}
        initial={{ scale: prefersReducedMotion ? 1 : 1.05 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 8, ease: 'easeOut' }
        }
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: 'clamp(0%, 50%, 100%) clamp(0%, var(--hero-object-pos-y, 35%), 100%)',
          filter: 'saturate(0.7) contrast(0.95)',
        }}
      />

      {/* Vertical gradient overlay: dark top → fading to paper color at bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(21, 19, 15, 0.55) 0%,
            rgba(21, 19, 15, 0.70) 40%,
            rgba(21, 19, 15, 0.80) 70%,
            rgba(21, 19, 15, 0.50) 85%,
            rgba(245, 241, 234, 0) 100%
          )`,
        }}
      />

      {/* Soft vignette: radial gradient (25% black at edges) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.25) 100%)',
        }}
      />

      {/* Dark theme: slightly stronger overlay for better text contrast */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-15 transition-opacity duration-200"
        style={{
          background: 'rgba(0, 0, 0, 0.15)',
        }}
      />
    </div>
  );
};
