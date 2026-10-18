import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Tag, Sparkles, User, ChevronRight, Eye } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { useToast } from '../context/ToastContext';

export const ArtworkDetailPage: React.FC = () => {
  const { id, param } = useParams<{ id?: string; param?: string }>();
  const { artworks, likedArtworkIds, toggleLike, openArtworkModal } = useGallery();
  const { showSuccess } = useToast();

  const targetId = id || param;
  const artwork = artworks.find(
    (a) => a.id === targetId || a.accessionNo.toLowerCase() === targetId?.toLowerCase()
  );

  if (!artwork) {
    return (
      <div className="gallery-container py-24 text-center space-y-6">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)]">
          Artwork not found
        </h1>
        <p className="text-base text-[var(--muted)] max-w-md mx-auto">
          The artwork accession code you requested does not exist or has been relocated in the archive.
        </p>
        <Link to="/gallery" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to canvas gallery</span>
        </Link>
      </div>
    );
  }

  const isLiked = likedArtworkIds.has(artwork.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Link copied to clipboard', 'Share this artwork with fellow students and faculty.');
  };

  const relatedArtworks = artworks
    .filter((a) => a.id !== artwork.id && a.category === artwork.category)
    .slice(0, 3);

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-12">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all artwork</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleLike(artwork.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${
              isLiked
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[var(--accent)]' : ''}`} />
            <span>{artwork.likes}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 border border-[var(--line)] rounded-full text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
            title="Share artwork link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Artwork Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Artwork Visual Display */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 sm:p-6 shadow-sm overflow-hidden group cursor-zoom-in"
            onClick={() => openArtworkModal(artwork)}
          >
            <div className="relative rounded-[4px] overflow-hidden bg-[var(--paper)]">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full max-h-[650px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-3 right-3 bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--line)] px-3 py-1.5 rounded-full text-xs font-mono text-[var(--ink)] flex items-center gap-1.5 opacity-90">
                <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Click for full inspection</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] px-2">
            <span>Dimensions: {artwork.dimensions}</span>
            <span>Archived: {new Date(artwork.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Artwork Metadata & Commentary */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full">
                {artwork.accessionNo}
              </span>
              <Link
                to={`/gallery/${artwork.category}`}
                className="font-mono text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                {artwork.category}
              </Link>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
              {artwork.title}
            </h1>

            <p className="text-sm font-medium text-[var(--muted)]">
              {artwork.medium} • {artwork.year}
            </p>
          </div>

          {/* Artist Card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider">
                Artist Attribution
              </span>
              <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                {artwork.artistName}
              </h3>
              <p className="text-xs text-[var(--muted)]">{artwork.artistDept}</p>
            </div>
            <Link
              to={`/artists/${artwork.artistSlug || ''}`}
              className="p-2.5 border border-[var(--line)] rounded-full text-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              title="View artist profile"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>

          {/* Event Association */}
          {artwork.eventTitle && (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 flex items-center justify-between text-xs font-sans">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                  Exhibition & Event
                </span>
                <span className="font-semibold text-[var(--ink)] block">
                  {artwork.eventTitle}
                </span>
              </div>
              {artwork.eventSlug && (
                <Link
                  to={`/events/${artwork.eventSlug}`}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <span>Event</span>
                </Link>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
              Artwork Overview
            </h4>
            <p className="text-sm text-[var(--ink)]/90 leading-relaxed font-sans">
              {artwork.description}
            </p>
          </div>

          {/* Curator's Note */}
          <div className="border-l-2 border-[var(--accent)] pl-4 py-1 space-y-1 bg-[var(--accent)]/5 rounded-r-[6px] p-4">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curator's Commentary</span>
            </div>
            <p className="text-xs italic text-[var(--ink)]/90 leading-relaxed">
              "{artwork.curatorNote}"
            </p>
          </div>

          {/* Physical Location on Campus */}
          <div className="flex items-start gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 text-xs">
            <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-semibold text-[var(--ink)] block">
                Current Campus Location
              </span>
              <span className="text-[var(--muted)]">{artwork.physicalLocation}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--muted)]">Archive Tags:</span>
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]"
                >
                  <Tag className="w-3 h-3 text-[var(--muted)]" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Artworks */}
      {relatedArtworks.length > 0 && (
        <div className="pt-12 border-t border-[var(--line)] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
              More in {artwork.category}
            </h3>
            <Link
              to={`/gallery/${artwork.category}`}
              className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Explore category</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArtworks.map((item) => (
              <Link
                key={item.id}
                to={`/gallery/${item.id}`}
                className="group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] overflow-hidden hover:border-[var(--ink)] transition-colors p-3 space-y-3"
              >
                <div className="aspect-[4/3] bg-[var(--paper)] rounded-[4px] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)]">{item.artistName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
