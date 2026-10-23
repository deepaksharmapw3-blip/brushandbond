import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useGallery } from '../context/GalleryContext';
import { ArtworkCard } from '../components/gallery/ArtworkCard';
import { HeroBackdrop } from '../components/home/HeroBackdrop';
import { ClubNumbers } from '../components/home/ClubNumbers';
import { EventRow } from '../components/home/EventRow';
import { InstagramStrip } from '../components/home/InstagramStrip';

export const HomePage: React.FC = () => {
  const { artworks, events, artists, isLoadingSharedData, sharedDataError } = useGallery();
  const heroRef = useRef<HTMLElement | null>(null);

  // 8 artworks for masonry preview
  const canvasPreviewArtworks = artworks.slice(0, 8);

  // Featured artwork of the week
  const featuredWeekArt = artworks.find((a) => a.id === 'art-002') || artworks[0];
  const featuredWeekEvent = events.find((e) => e.slug === 'the-canvas-2026') || events[1] || events[0];

  // Next 3 events for upcoming events strip
  const nextThreeEvents = events.filter((e) => e.status !== 'concluded').slice(0, 3);

  // Only feature an artist that is explicitly marked as a spotlight in the API.
  const featuredArtist = artists.find((artist) => artist.isSpotlight);

  return (
    <div className="space-y-[clamp(64px,10vw,130px)] pb-0">
      <SEO
        title="Brush and Bond — GCECT Art Club & The Canvas Archive"
        description="Official art club of the Government College of Engineering and Ceramic Technology (GCECT), est. 2024. Explore student artwork, creative campus projects, upcoming exhibitions, and salons. Creativity connects."
        canonicalPath="/"
      />
      
      {/* =========================================================
          1. Hero Section (Section 5.1)
         ========================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between py-12 sm:py-16 overflow-hidden bg-[var(--paper)]"
      >
        {/* Hero background image with overlays */}
        <HeroBackdrop />

        {/* Main Hero Content */}
        <div className="gallery-container relative z-10 flex-1 flex flex-col justify-center my-auto space-y-8 sm:space-y-10">
          {/* Giant two-line wordmark: Brush (ink) and and Bond (accent), tight tracking, filling most of the width */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black leading-[0.85] tracking-[-0.04em] text-[clamp(64px,16vw,230px)] select-none"
            >
              <div className="text-[#F5F1EA]">Brush</div>
              <div className="flex items-baseline">
                <span className="text-[#F5F1EA] mr-3 sm:mr-6 text-[0.82em]">and</span>
                <span className="text-[#7E88FF]">Bond</span>
              </div>
            </motion.div>

            {/* Small line under it */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm font-mono text-[#F5F1EA]/80"
            >
              The art club of GCECT, est. 2024
            </motion.p>
          </div>

          {/* Below it: "Creativity connects." (about 28px) and two buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-5 max-w-xl"
          >
            <p className="font-display font-bold text-[26px] sm:text-[30px] text-[#F5F1EA] tracking-tight">
              Creativity connects.
            </p>

            {/* Two buttons: Explore our art (scrolls to gallery preview) and Join the club */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('gallery-preview')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7E88FF] text-white rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Explore our art</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/join"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#F5F1EA] text-[#F5F1EA] rounded-full font-medium text-sm hover:bg-[#F5F1EA]/10 transition-colors"
              >
                <span>Join the club</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Small support line: Creativity • Expression • Community */}
            <p className="text-xs font-mono text-[#F5F1EA]/70 font-semibold tracking-wider pt-1">
              Creativity • Expression • Community
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar: Stats Ribbon + Small hint at bottom right (hidden on touch) */}
        <div className="gallery-container relative z-10 pt-8 border-t border-[#F5F1EA]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {!isLoadingSharedData && !sharedDataError && <div className="flex items-center gap-8 sm:gap-14 text-left">
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[#F5F1EA]">
                {artworks.length}
              </span>
              <span className="text-xs font-mono text-[#F5F1EA]/60">
                Published artworks
              </span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                {artists.length}
              </span>
              <span className="text-xs font-mono text-[var(--muted)]">
                Artist profiles
              </span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                Studio 204
              </span>
              <span className="text-xs font-mono text-[var(--muted)]">
                Campus sanctuary
              </span>
            </div>
          </div>}

          {/* Small hint at bottom right: "Move your cursor to paint" (hidden on touch) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[var(--muted)] select-none">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>Move your cursor to paint</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. The GCECT Canvas Preview (Masonry of 8 Artworks)
         ========================================================= */}
      <section id="gallery-preview" className="gallery-container scroll-mt-24 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="section-title text-[var(--ink)]">
            The GCECT Canvas
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
            A growing archive of what GCECT students make. Every artwork becomes part of the college's creative history.
          </p>
        </div>

        {/* Masonry Layout for 8 Artworks */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {canvasPreviewArtworks.map((art, idx) => (
            <div key={art.id} className="break-inside-avoid">
              <ArtworkCard artwork={art} priority={idx < 2} />
            </div>
          ))}
        </div>

        {/* View Full Gallery CTA */}
        <div className="text-center pt-6">
          <Link to="/gallery" className="btn-primary inline-flex">
            <span>View the full gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* =========================================================
          3. Featured Artwork of the Week (Two-Column)
         ========================================================= */}
      {featuredWeekArt && <section className="gallery-container">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left: Large artwork image */}
            <div className="lg:col-span-6">
              <Link
                to={`/gallery/${featuredWeekArt.id}`}
                className="group relative block aspect-[4/3] rounded-[4px] overflow-hidden bg-[var(--paper)] border border-[var(--line)]"
              >
                <img
                  src={featuredWeekArt.imageUrl}
                  alt={featuredWeekArt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[var(--surface)]/90 backdrop-blur-sm px-3 py-1 text-xs font-mono text-[var(--accent)] border border-[var(--line)] rounded-[4px] font-semibold">
                  Accession {featuredWeekArt.accessionNo}
                </div>
              </Link>
            </div>

            {/* Right: Text details & button */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
                  Featured artwork of the week
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] leading-tight">
                  <Link
                    to={`/gallery/${featuredWeekArt.id}`}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {featuredWeekArt.title}
                  </Link>
                </h3>
                <p className="text-sm font-medium text-[var(--ink)] font-sans">
                  By {featuredWeekArt.artistName}
                </p>
                <p className="text-xs font-mono text-[var(--muted)]">
                  {featuredWeekArt.artistDept} • {featuredWeekArt.medium}
                </p>
              </div>

              {/* Event Badge */}
              {featuredWeekEvent && <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 rounded-[4px] border border-[var(--line)] w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Exhibited at: {featuredWeekEvent.title}</span>
              </div>}

              {/* Short Note */}
              <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[55ch]">
                {featuredWeekArt.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                {featuredWeekEvent && <Link
                  to={`/events/${featuredWeekEvent.slug}`}
                  className="btn-primary"
                >
                  <span>See the event</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>}

                <Link
                  to={`/gallery/${featuredWeekArt.id}`}
                  className="btn-secondary"
                >
                  <span>Inspect artwork</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* =========================================================
          4. Upcoming Events Strip (Horizontal List with Accent Dates)
         ========================================================= */}
      <section className="gallery-container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--line)] pb-4 gap-4">
          <div>
            <h2 className="section-title text-[var(--ink)]">
              Upcoming events
            </h2>
            <p className="text-xs font-mono text-[var(--muted)] mt-1">
              Next gatherings, open kilns, and campus salons
            </p>
          </div>

          <Link
            to="/events"
            className="text-sm font-sans font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
          >
            <span>All events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] divide-y divide-[var(--line)] overflow-hidden shadow-sm">
          {nextThreeEvents.map((evt) => (
            <EventRow key={evt.id} event={evt} />
          ))}
        </div>
      </section>

      {/* =========================================================
          5. Featured Artist
         ========================================================= */}
      {featuredArtist && <section className="gallery-container">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Large portrait/artwork left */}
            <div className="lg:col-span-5">
              <Link
                to={`/artists/${featuredArtist.slug}`}
                className="group block aspect-square rounded-[6px] overflow-hidden bg-[var(--paper)] border border-[var(--line)] relative"
              >
                <img
                  src={featuredArtist.avatarUrl}
                  alt={featuredArtist.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-[var(--surface)]/90 backdrop-blur-sm px-3 py-1 text-xs font-mono text-[var(--ink)] border border-[var(--line)] rounded-[4px]">
                  {featuredArtist.role}
                </div>
              </Link>
            </div>

            {/* Big pull quote, short bio, button right */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block mb-1">
                  Featured artist
                </span>
                <h3 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
                  <Link
                    to={`/artists/${featuredArtist.slug}`}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {featuredArtist.name}
                  </Link>
                </h3>
                <p className="text-xs font-mono text-[var(--muted)] mt-1">
                  {featuredArtist.department} • {featuredArtist.batch}
                </p>
              </div>

              {/* Big pull quote */}
              <blockquote className="font-display text-xl sm:text-2xl text-[var(--ink)] border-l-4 border-[var(--accent)] pl-5 py-1 italic leading-snug">
                &ldquo;{featuredArtist.statement}&rdquo;
              </blockquote>

              {/* Short bio */}
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
                {featuredArtist.bio}
              </p>

              {/* Button "Read the interview" */}
              <div className="pt-2">
                <Link
                  to={`/artists/${featuredArtist.slug}`}
                  className="btn-primary"
                >
                  <span>View artist profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* =========================================================
          6. Club in Numbers (Count Up Once In View + Heavy Top Rule)
         ========================================================= */}
      <ClubNumbers />

      {/* =========================================================
          7. Instagram Strip (Grid of 6 Posts)
         ========================================================= */}
      <InstagramStrip />

      {/* =========================================================
          8. Join CTA Band (Full-Width Accent-Colored Band)
         ========================================================= */}
      <section className="w-full bg-[var(--accent)] text-[var(--on-accent)] py-16 sm:py-24 transition-colors">
        <div className="gallery-container text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            Think you're not an artist? Think again.
          </h2>
          <p className="text-base sm:text-xl opacity-90 max-w-xl mx-auto leading-relaxed font-sans">
            You don't have to be an expert to create. You just need the courage to start.
          </p>
          <div className="pt-4">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-sans font-bold text-base transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--paper)] shadow-lg"
            >
              <span>Join the club</span>
              <ArrowUpRight className="w-5 h-5 text-[var(--accent)]" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
