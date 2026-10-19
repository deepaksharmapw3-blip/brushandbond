import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Artist } from '../../types';

export interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  className = '',
}) => {
  return (
    <div
      className={`group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] overflow-hidden hover:border-[var(--ink)] transition-all duration-300 flex flex-col justify-between shadow-xs ${className}`}
    >
      <Link
        to={`/artists/${artist.slug}`}
        className="block aspect-square overflow-hidden bg-[var(--paper)] relative border-b border-[var(--line)]"
      >
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-[var(--surface)]/90 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-[var(--accent)] border border-[var(--line)] rounded-[4px] font-semibold">
          {artist.role}
        </div>
      </Link>

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                <Link to={`/artists/${artist.slug}`}>{artist.name}</Link>
              </h3>
              <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
                {artist.department} • {artist.batch}
              </p>
            </div>
            <Link
              to={`/artists/${artist.slug}`}
              className="p-2 rounded-full border border-[var(--line)] text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors shrink-0"
              aria-label={`View ${artist.name}'s profile`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {artist.statement && (
            <p className="text-xs sm:text-sm text-[var(--muted)] italic line-clamp-2 font-sans pt-1">
              &ldquo;{artist.statement}&rdquo;
            </p>
          )}
        </div>

        {artist.specialties && artist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--line)]/60">
            {artist.specialties.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
