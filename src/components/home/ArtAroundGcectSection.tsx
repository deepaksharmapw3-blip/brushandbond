import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Eye,
  Camera,
  Sparkles,
  Compass,
} from 'lucide-react';
import { CAMPUS_ART_GROUPS } from '../../data/campusArtData';
import { CampusArtLightbox } from '../campus-art/CampusArtLightbox';
import type { CampusArtPhoto } from '../../types/campusArt';

export const ArtAroundGcectSection: React.FC = () => {
  const [activeGroupId, setActiveGroupId] = useState<string>('creative-walls');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<CampusArtPhoto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const activeGroup =
    CAMPUS_ART_GROUPS.find((g) => g.id === activeGroupId) || CAMPUS_ART_GROUPS[0];

  // Aggregate all photos from the active group's projects
  const groupPhotos: CampusArtPhoto[] = activeGroup.projects.flatMap((p) => p.photoSet);

  const handleOpenPhoto = (photos: CampusArtPhoto[], index: number, title: string) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  return (
    <section className="gallery-container space-y-10 sm:space-y-12">
      {/* 1. Header & Curatorial Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold tracking-wider uppercase">
            <Compass className="w-4 h-4" />
            <span>COLLEGE ARTISTIC HERITAGE • EST. 1941</span>
            <span>•</span>
            <span>LIVING DIGITAL RECORD</span>
          </div>

          <h2 className="section-title text-[var(--ink)]">
            Art around GCECT
          </h2>

          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
            Art at GCECT is woven into the very fabric of our engineering campus.
            Explore our permanent digital record documenting creative corridors, festival pavilions,
            and kiln sculptures created by student engineers across generations.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            to="/gallery/campus-art"
            className="btn-primary inline-flex"
          >
            <span>Explore complete campus archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. Five Groups Navigation Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {CAMPUS_ART_GROUPS.map((group) => {
              const isActive = group.id === activeGroup.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={`filter-chip ${isActive ? 'active' : ''}`}
                  aria-pressed={isActive}
                >
                  <span className="capitalize">{group.title}</span>
                  <span className="text-[11px] opacity-70 ml-1.5 font-mono">
                    ({group.projects.flatMap((p) => p.photoSet).length} photos)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Selected Group Feature Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 sm:p-10 lg:p-12 shadow-sm space-y-8"
        >
          {/* Top Showcase Banner: Group Meta + Short Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Description & Archival Mission */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    {activeGroup.badge}
                  </span>
                  <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{activeGroup.locationHighlight}</span>
                  </span>
                </div>

                <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--ink)] leading-tight">
                  {activeGroup.title}
                </h3>
              </div>

              {/* Required Short Description */}
              <p className="text-base sm:text-lg text-[var(--ink)] font-sans leading-relaxed font-normal">
                {activeGroup.shortDescription}
              </p>

              {/* Curatorial Context Note */}
              <blockquote className="border-l-3 border-[var(--accent)] pl-4 py-1 text-sm text-[var(--muted)] italic font-sans">
                &ldquo;{activeGroup.curatorStatement}&rdquo;
              </blockquote>

              {/* Group CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/gallery/campus-art?group=${activeGroup.slug}`}
                  className="btn-primary"
                >
                  <span>Explore {activeGroup.title} in archive</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleOpenPhoto(groupPhotos, 0, activeGroup.title)}
                  className="btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect photo set ({groupPhotos.length})</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Feature */}
            <div className="lg:col-span-5">
              <div
                onClick={() => handleOpenPhoto(groupPhotos, 0, activeGroup.title)}
                className="group relative block aspect-[16/11] rounded-[6px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] cursor-pointer shadow-md"
              >
                <img
                  src={activeGroup.heroImage}
                  alt={activeGroup.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-white/80 block">
                      Archived Photo Set
                    </span>
                    <span className="font-display text-base font-bold text-white">
                      {groupPhotos[0]?.title || activeGroup.title}
                    </span>
                  </div>

                  <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 border border-white/20">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{groupPhotos.length} Photos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Set Strip for this group */}
          <div className="border-t border-[var(--line)] pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
                Photo Set Documenting {activeGroup.title} ({groupPhotos.length} captures)
              </span>
              <span className="text-xs font-mono text-[var(--accent)]">
                Click any photo to zoom in
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groupPhotos.map((photo, pIdx) => (
                <div
                  key={photo.id}
                  onClick={() => handleOpenPhoto(groupPhotos, pIdx, activeGroup.title)}
                  className="group relative aspect-[16/10] rounded-[4px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] cursor-pointer shadow-xs hover:border-[var(--ink)] transition-colors"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[var(--surface)] text-[var(--ink)] px-3 py-1 rounded-full text-xs font-mono font-medium shadow-md border border-[var(--line)] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Zoom</span>
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white font-mono truncate">
                    {photo.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 4. Archival Long-Term Mission Bar */}
      <div className="border border-[var(--line)] bg-[var(--surface)] rounded-[8px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE LONG-TERM MISSION</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">
            A Living Digital Record of GCECT's Artistic History
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-[65ch] font-sans">
            Every chalkboard corridor, festive clay structure, and student sculpture is archived with photographic provenance and curatorial records for posterity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/gallery/campus-art"
            className="btn-primary"
          >
            <span>Open digital record</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Photo Lightbox */}
      <CampusArtLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex}
        onSelectIndex={setLightboxIndex}
        projectTitle={lightboxTitle}
        groupName={activeGroup.title}
      />
    </section>
  );
};
