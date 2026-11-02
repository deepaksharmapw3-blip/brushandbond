import React from 'react';
import { MapPin } from 'lucide-react';
import type { CampusArtLandmark } from '../../types/campusArt';

interface CampusArtMapProps {
  onSelectLandmark?: (landmark: CampusArtLandmark) => void;
  onOpenPhoto?: (photoUrl: string, title: string) => void;
}

/** Empty until approved community submissions provide campus locations. */
export const CampusArtMap: React.FC<CampusArtMapProps> = () => (
  <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center space-y-3">
    <MapPin className="mx-auto h-8 w-8 text-[var(--muted)]" />
    <h3 className="font-display text-xl font-bold text-[var(--ink)]">
      No campus art locations yet
    </h3>
    <p className="text-sm text-[var(--muted)]">
      Approved community submissions will appear here when they include a campus location.
    </p>
  </div>
);
