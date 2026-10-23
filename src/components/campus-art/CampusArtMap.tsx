import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { CAMPUS_ART_LANDMARKS } from '../../data/campusArtData';
import type { CampusArtLandmark } from '../../types/campusArt';

interface CampusArtMapProps {
  onSelectLandmark?: (landmark: CampusArtLandmark) => void;
  onOpenPhoto?: (photoUrl: string, title: string) => void;
}

export const CampusArtMap: React.FC<CampusArtMapProps> = ({
  onSelectLandmark,
}) => {
  const [selectedId, setSelectedId] = useState<string>(CAMPUS_ART_LANDMARKS[0].id);

  const activeLandmark =
    CAMPUS_ART_LANDMARKS.find((l) => l.id === selectedId) || CAMPUS_ART_LANDMARKS[0];

  const handleSelect = (landmark: CampusArtLandmark) => {
    setSelectedId(landmark.id);
    if (onSelectLandmark) onSelectLandmark(landmark);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-5 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>CAMPUS GEOGRAPHY & SITES</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">
            Interactive Campus Art Landmarks
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-sans mt-0.5">
            Discover permanent frescoes, active chalkboard sanctuaries, and historic kiln pavilions across GCECT.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Landmark Navigation List / Schematic */}
        <div className="lg:col-span-5 space-y-2">
          {CAMPUS_ART_LANDMARKS.map((landmark) => {
            const isActive = landmark.id === activeLandmark.id;
            return (
              <button
                key={landmark.id}
                type="button"
                onClick={() => handleSelect(landmark)}
                className={`w-full text-left p-3.5 rounded-[6px] border transition-all flex items-start gap-3.5 ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--paper)] shadow-sm'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink)]/50'
                }`}
              >
                <div
                  className={`p-2 rounded-full shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                      : 'bg-[var(--paper)] text-[var(--muted)]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm sm:text-base font-bold text-[var(--ink)] truncate">
                      {landmark.name}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--accent)] shrink-0 font-semibold">
                      {landmark.projectCount} works
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-mono truncate">
                    {landmark.building} • {landmark.zone}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Landmark Showcase Card */}
        <div className="lg:col-span-7">
          <motion.div
            key={activeLandmark.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-[var(--line)] rounded-[6px] overflow-hidden bg-[var(--paper)] flex flex-col sm:flex-row gap-5 p-4 sm:p-6"
          >
            {/* Thumbnail */}
            <div className="sm:w-1/2 aspect-[4/3] rounded-[4px] overflow-hidden border border-[var(--line)] relative group shrink-0 bg-[var(--surface)]">
              <img
                src={activeLandmark.heroImage}
                alt={activeLandmark.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 bg-[var(--surface)]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-[var(--accent)] rounded-[3px] border border-[var(--line)] font-semibold">
                {activeLandmark.zone}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                  {activeLandmark.building}
                </span>

                <h4 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] leading-snug">
                  {activeLandmark.name}
                </h4>

                <p className="text-xs sm:text-sm text-[var(--muted)] font-sans leading-relaxed">
                  {activeLandmark.description}
                </p>

                <div className="pt-1">
                  <span className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Featured Landmark Piece:
                  </span>
                  <span className="text-xs text-[var(--accent)] font-medium font-sans">
                    {activeLandmark.topProjectTitle}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>Documented in GCECT Archival Record</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
