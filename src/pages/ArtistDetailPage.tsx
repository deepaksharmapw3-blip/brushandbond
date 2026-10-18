import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Camera } from 'lucide-react';
import { mockArtists } from '../data/mockData';
import { useGallery } from '../context/GalleryContext';
import { useToast } from '../context/ToastContext';
import { ArtworkCard } from '../components/gallery/ArtworkCard';

export const ArtistDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { artworks } = useGallery();
  const { showSuccess } = useToast();

  const artist = mockArtists.find(
    (a) => a.slug === slug || a.id === slug || a.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!artist) {
    return (
      <div className="gallery-container py-24 text-center space-y-6">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)]">
          Artist profile not found
        </h1>
        <p className="text-base text-[var(--muted)] max-w-md mx-auto">
          The student artist profile you requested may have graduated or the URL has changed.
        </p>
        <Link to="/artists" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to artist spotlight</span>
        </Link>
      </div>
    );
  }

  const artistArtworks = artworks.filter(
    (a) => a.artistId === artist.id || a.artistName.toLowerCase() === artist.name.toLowerCase()
  );

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(artist.handle);
    showSuccess('Instagram handle copied', `${artist.handle} copied to your clipboard.`);
  };

  const otherArtists = mockArtists.filter((a) => a.id !== artist.id).slice(0, 3);

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-16">
      {/* Back Link */}
      <div>
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all artists</span>
        </Link>
      </div>

      {/* Artist Profile Hero Header */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Avatar */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-square rounded-[6px] border border-[var(--line)] overflow-hidden bg-[var(--paper)]">
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bio Details */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
                {artist.role}
              </span>
              <span className="font-mono text-xs text-[var(--muted)]">
                {artist.department} • {artist.batch}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
              {artist.name}
            </h1>

            <button
              type="button"
              onClick={handleCopyHandle}
              className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)] hover:underline"
            >
              <Camera className="w-4 h-4" />
              <span>{artist.handle}</span>
            </button>

            <blockquote className="font-display text-lg sm:text-xl text-[var(--ink)] border-l-2 border-[var(--accent)] pl-4 py-1 italic leading-snug">
              &ldquo;{artist.statement}&rdquo;
            </blockquote>

            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
              {artist.bio}
            </p>

            {/* Specialties Badges */}
            <div className="pt-2 flex flex-wrap gap-2">
              {artist.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Created by this Artist */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="section-title text-[var(--ink)]">
              Archived works by {artist.name}
            </h2>
            <p className="text-xs font-mono text-[var(--muted)] mt-1">
              {artistArtworks.length} {artistArtworks.length === 1 ? 'artwork' : 'artworks'} accessioned into The GCECT Canvas
            </p>
          </div>

          <Link
            to="/gallery"
            className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>View all gallery works</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {artistArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artistArtworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-[var(--line)] rounded-[6px] text-center text-sm text-[var(--muted)]">
            New pieces by {artist.name} are currently undergoing studio drying and accessioning.
          </div>
        )}
      </section>

      {/* Other Artists Spotlight */}
      <section className="pt-8 border-t border-[var(--line)] space-y-6">
        <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
          Explore more student artists
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {otherArtists.map((other) => (
            <Link
              key={other.id}
              to={`/artists/${other.slug || other.id}`}
              className="group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 hover:border-[var(--ink)] transition-colors flex items-center gap-4"
            >
              <img
                src={other.avatarUrl}
                alt={other.name}
                className="w-14 h-14 rounded-[4px] object-cover border border-[var(--line)] shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[11px] font-mono text-[var(--accent)] block font-semibold truncate">
                  {other.role}
                </span>
                <h4 className="font-display text-base font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {other.name}
                </h4>
                <p className="text-xs text-[var(--muted)] truncate">{other.department}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
