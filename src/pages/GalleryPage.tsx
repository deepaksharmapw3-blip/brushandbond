import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  Heart,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';
import type { GalleryCategory, Artwork } from '../types';
import { SEO } from '../components/common/SEO';
import { useGallery } from '../context/GalleryContext';
import { ArtworkCard } from '../components/gallery/ArtworkCard';
import { resolveArtworkArchiveYear } from '../lib/artworkArchiveYear';

interface CategoryMeta {
  slug: GalleryCategory | 'all';
  label: string;
}

const CATEGORIES: CategoryMeta[] = [
  { slug: 'all', label: 'All' },
  { slug: 'sketches', label: 'Sketches' },
  { slug: 'paintings', label: 'Paintings' },
  { slug: 'digital-art', label: 'Digital art' },
  { slug: 'photography', label: 'Photography' },
  { slug: 'calligraphy', label: 'Calligraphy' },
  { slug: 'doodles', label: 'Doodles' },
  { slug: 'campus-art', label: 'Campus art' },
];

const PAGE_SIZE = 8;

export const GalleryPage: React.FC = () => {
  const { category: routeCategory, param } = useParams<{ category?: string; param?: string }>();
  const navigate = useNavigate();
  const { artworks, openArtworkModal, likedArtworkIds, toggleLike } = useGallery();

  // Local filter states
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'featured' | 'likes'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', count: PAGE_SIZE });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Active Category from URL or state
  const rawParam = (routeCategory || param || '').toLowerCase();
  const activeCategorySlug = CATEGORIES.some((c) => c.slug === rawParam)
    ? (rawParam as GalleryCategory)
    : 'all';
  const filterKey = JSON.stringify([activeCategorySlug, selectedYear, sortBy, searchQuery]);
  const visibleCount = pagination.filterKey === filterKey ? pagination.count : PAGE_SIZE;
  const setVisibleCount = useCallback((update: number | ((current: number) => number)) => {
    setPagination((current) => {
      const currentCount = current.filterKey === filterKey ? current.count : PAGE_SIZE;
      return {
        filterKey,
        count: typeof update === 'function' ? update(currentCount) : update,
      };
    });
  }, [filterKey]);

  // Multi-year archive years list
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(artworks.map((a) => resolveArtworkArchiveYear(a.year)))
    ).sort((a, b) => b - a);
    return ['all', ...years.map(String)];
  }, [artworks]);

  // Gallery spotlight uses the same admin-selected Artwork of the Month as Home.
  const featuredArtworkOfWeek: Artwork | undefined = useMemo(() => {
    return artworks.find((artwork) => artwork.featured && artwork.category !== 'campus-art');
  }, [artworks]);

  // Filtered artworks computation
  const filteredArtworks = useMemo(() => {
    return artworks
      .filter((art) => {
        // Category filter
        const matchesCategory =
          activeCategorySlug === 'all' || art.category === activeCategorySlug;

        // Year filter
        const matchesYear =
          selectedYear === 'all' ||
          resolveArtworkArchiveYear(art.year).toString() === selectedYear;

        // Search query filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          art.title.toLowerCase().includes(query) ||
          art.artistName.toLowerCase().includes(query) ||
          art.accessionNo.toLowerCase().includes(query) ||
          art.medium.toLowerCase().includes(query) ||
          (art.eventTitle && art.eventTitle.toLowerCase().includes(query)) ||
          art.tags.some((t) => t.toLowerCase().includes(query));

        return matchesCategory && matchesYear && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return b.likes - a.likes;
        }
        if (sortBy === 'likes') {
          return b.likes - a.likes;
        }
        // 'newest' default: by year and then createdAt date
        const yearA = resolveArtworkArchiveYear(a.year);
        const yearB = resolveArtworkArchiveYear(b.year);
        if (yearB !== yearA) return yearB - yearA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [artworks, activeCategorySlug, selectedYear, sortBy, searchQuery]);

  // Infinite scroll trigger with intersection observer
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredArtworks.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 4, filteredArtworks.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredArtworks.length, setVisibleCount]);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      navigate('/gallery');
    } else if (slug === 'campus-art') {
      navigate('/gallery/campus-art');
    } else {
      navigate(`/gallery/${slug}`);
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 4, filteredArtworks.length));
      setIsLoadingMore(false);
    }, 200);
  };

  const clearFilters = () => {
    setSelectedYear('all');
    setSortBy('newest');
    setSearchQuery('');
    navigate('/gallery');
  };

  const isHeroLiked = featuredArtworkOfWeek
    ? likedArtworkIds.has(featuredArtworkOfWeek.id)
    : false;

  return (
    <>
      <SEO
        title="Gallery"
        description="Explore the Brush and Bond art gallery. View student artwork spanning sketches, paintings, digital art, photography, calligraphy, and more."
        canonicalPath="/gallery"
      />
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* 1. Page Title & Intro Text */}
      <section className="gallery-container space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold tracking-wider uppercase">
          <span>THE GCECT CANVAS</span>
          <span>•</span>
          <span>CAMPUS ARCHIVE</span>
          <span>•</span>
          <span>EST. 2024</span>
        </div>

        <h1 className="page-title text-[var(--ink)]">
          The GCECT Canvas
        </h1>

        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[68ch] font-sans">
          The permanent visual archive of the Government College of Engineering and Ceramic Technology.
          Explore the creative collision of high-fire ceramic alchemy, computer science, and fine art crafted
          by student engineers across our multi-year archive.
        </p>
      </section>

      {/* 2. Admin-selected Artwork of the Month (Top Hero Tile) */}
      {featuredArtworkOfWeek && activeCategorySlug === 'all' && selectedYear === 'all' && !searchQuery && (
        <section className="gallery-container">
          <div className="relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-4 sm:p-7 shadow-lg transition-all duration-300 hover:border-[var(--ink)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Image Preview Container */}
              <div
                className="lg:col-span-7 relative overflow-hidden rounded-[6px] bg-[var(--paper)] cursor-pointer group"
                onClick={() => openArtworkModal(featuredArtworkOfWeek)}
              >
                <img
                  src={featuredArtworkOfWeek.imageUrl}
                  alt={featuredArtworkOfWeek.title}
                  className="w-full h-auto max-h-[460px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-[var(--surface)] text-[var(--ink)] px-4 py-2 text-xs font-mono font-medium rounded-full flex items-center gap-2 shadow-xl border border-[var(--line)]">
                    <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>View in Fullscreen</span>
                  </div>
                </div>

                {/* Hero Badge */}
                <div className="absolute top-3 left-3 bg-[var(--accent)] text-[var(--on-accent)] px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Artwork of the Month</span>
                </div>

                {/* Accession tag */}
                <div className="absolute bottom-3 left-3 bg-[var(--surface)]/90 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-[var(--muted)] border border-[var(--line)] rounded-[4px]">
                  {featuredArtworkOfWeek.accessionNo} • {featuredArtworkOfWeek.year}
                </div>
              </div>

              {/* Curatorial Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
                    <span>Curatorial Spotlight</span>
                    <span>•</span>
                    <span className="capitalize">{(featuredArtworkOfWeek.category || 'art').replace('-', ' ')}</span>
                  </div>

                  <h2
                    onClick={() => openArtworkModal(featuredArtworkOfWeek)}
                    className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--ink)] leading-tight hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {featuredArtworkOfWeek.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-[var(--muted)] font-sans">
                    <User className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <Link
                      to={`/artists/${featuredArtworkOfWeek.artistSlug || ''}`}
                      className="font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                    >
                      {featuredArtworkOfWeek.artistName}
                    </Link>
                    <span>·</span>
                    <span>{featuredArtworkOfWeek.artistDept.split(',')[0]}</span>
                  </div>
                </div>

                {/* Medium & Dimensions */}
                <div className="text-xs font-mono text-[var(--muted)] border-y border-[var(--line)] py-2 flex items-center justify-between">
                  <span>{featuredArtworkOfWeek.medium}</span>
                  <span>{featuredArtworkOfWeek.dimensions}</span>
                </div>

                {/* Curatorial Note Quote */}
                {featuredArtworkOfWeek.curatorNote && (
                  <p className="text-xs sm:text-sm text-[var(--muted)] italic leading-relaxed pl-3 border-l-2 border-[var(--accent)]">
                    &ldquo;{featuredArtworkOfWeek.curatorNote}&rdquo;
                  </p>
                )}

                {/* Event Association */}
                {featuredArtworkOfWeek.eventTitle && (
                  <div className="text-xs text-[var(--muted)] font-sans">
                    <span>Created for </span>
                    <strong className="text-[var(--ink)]">{featuredArtworkOfWeek.eventTitle}</strong>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openArtworkModal(featuredArtworkOfWeek)}
                    className="btn-primary flex-1 sm:flex-none"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Inspect Artwork</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLike(featuredArtworkOfWeek.id)}
                    className={`p-2.5 rounded-full border transition-colors ${
                      isHeroLiked
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]'
                    }`}
                    aria-label="Appreciate featured artwork"
                    title={isHeroLiked ? 'Saved' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${isHeroLiked ? 'fill-[var(--accent)]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Sticky Filter Bar (Sticky below navbar) */}
      <div className="sticky top-20 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-y border-[var(--line)] shadow-xs transition-colors">
        <div className="gallery-container py-3 space-y-3">
          {/* Top Row: Category Chips */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategorySlug === cat.slug;
                const count =
                  cat.slug === 'all'
                    ? artworks.length
                    : artworks.filter((a) => a.category === cat.slug).length;

                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[11px] opacity-70 ml-1.5 font-mono">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Year Selector, Sort Selector & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[var(--line)]/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artwork, artist, medium, tag..."
                className="w-full bg-[var(--surface)] border border-[var(--line)] pl-9 pr-8 py-2 text-xs sm:text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Year Selector & Sort Selector */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Year Selector (Multi-Year Archive) */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1.5 rounded-[6px]">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="hidden md:inline">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-[var(--ink)] font-semibold focus:outline-none cursor-pointer"
                  aria-label="Archive Year"
                >
                  <option value="all">All Years</option>
                  {availableYears
                    .filter((y) => y !== 'all')
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sort Selector: Newest, Featured */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1.5 rounded-[6px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'newest' | 'featured' | 'likes')
                  }
                  className="bg-transparent text-[var(--ink)] font-semibold focus:outline-none cursor-pointer"
                  aria-label="Sort Order"
                >
                  <option value="newest">Newest first</option>
                  <option value="featured">Featured first</option>
                  <option value="likes">Most appreciated</option>
                </select>
              </div>

              {/* Work Count Badge */}
              <div className="hidden lg:flex items-center px-2 py-1 text-[11px] font-mono text-[var(--muted)]">
                <span>{filteredArtworks.length} works</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Masonry Grid / Empty State */}
      <section className="gallery-container">
        {filteredArtworks.length > 0 ? (
          <div className="space-y-10">
            {/* CSS Columns Masonry Grid: 1 col on mobile, 2 on tablet, 3-4 on desktop */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
              {filteredArtworks.slice(0, visibleCount).map((artwork, index) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  priority={index < 4}
                />
              ))}
            </div>

            {/* Load More Button & Infinite Scroll Anchor */}
            <div className="pt-6 pb-4 flex flex-col items-center justify-center space-y-3">
              {visibleCount < filteredArtworks.length ? (
                <>
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="btn-secondary group px-8"
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
                        <span>Loading more works...</span>
                      </>
                    ) : (
                      <>
                        <span>Load more</span>
                        <span className="text-xs font-mono opacity-60">
                          ({filteredArtworks.length - visibleCount} more)
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-xs font-mono text-[var(--muted)]">
                    Showing {Math.min(visibleCount, filteredArtworks.length)} of {filteredArtworks.length} works
                  </p>
                  {/* Intersection observer trigger anchor */}
                  <div ref={loadMoreRef} className="h-4 w-full" />
                </>
              ) : (
                <div className="text-center py-6 text-xs font-mono text-[var(--muted)] border-t border-[var(--line)] w-full">
                  <span>✦ You have reached the end of the archive for this selection ✦</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 5. Required Empty State: "No artwork here yet. Be the first to add one." with a Join button */
          <div className="text-center py-20 sm:py-28 space-y-6 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)] px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--paper)] flex items-center justify-center border border-[var(--line)] text-[var(--muted)]">
              <Sparkles className="w-8 h-8 text-[var(--accent)]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                No artwork here yet. Be the first to add one.
              </h3>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto font-sans">
                GCECT students across Ceramic Technology, Computer Science, and Information Technology
                are invited to submit their original work for accessioning.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/join" className="btn-primary">
                <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary"
              >
                <span>Reset all filters</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Curator Banner */}
      <section className="gallery-container pt-6">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 rounded-[8px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">
              Submit your work to The GCECT Canvas
            </h3>
            <p className="text-sm text-[var(--muted)] max-w-[55ch] font-sans">
              All mediums welcome — from high-fire terracotta and wheel-thrown stoneware to oil impasto,
              generative shaders, and micron pen spreads.
            </p>
          </div>
          <Link to="/submit-artwork" className="btn-primary shrink-0">
            <span>Submit artwork</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};
