import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { CAMPUS_ART_GROUPS } from '../../data/campusArtData';

export const ArtAroundGcectSection: React.FC = () => {
  const [activeGroupId, setActiveGroupId] = useState<string>('creative-walls');
  const activeGroup =
    CAMPUS_ART_GROUPS.find((g) => g.id === activeGroupId) || CAMPUS_ART_GROUPS[0];

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

      {/* 2. Archive Group Navigation */}
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
                    ({group.projects.length} projects)
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

              </div>
            </div>

            {/* Right Column: Text-only archive summary */}
            <div className="lg:col-span-5 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                  Archive overview
                </span>
                <p className="font-display text-2xl font-bold text-[var(--ink)]">
                  {activeGroup.projects.length} {activeGroup.projects.length === 1 ? 'project' : 'projects'} documented
                </p>
              </div>
              <p className="text-sm text-[var(--muted)] font-sans leading-relaxed">
                {activeGroup.longDescription}
              </p>
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
            Every chalkboard corridor, festive clay structure, and student sculpture is archived with context and curatorial records for posterity.
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

    </section>
  );
};
