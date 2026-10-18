import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import type { MediumCategory } from '../types';
import { useGallery } from '../context/GalleryContext';
import { ArtworkCard } from '../components/gallery/ArtworkCard';

export const CanvasPage: React.FC = () => {
  const { artworks, selectedMedium, setSelectedMedium, searchQuery, setSearchQuery, sortBy, setSortBy, openArtworkModal } = useGallery();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mediumFilters: MediumCategory[] = [
    'All',
    'Terracotta & Ceramic',
    'Oil on Canvas',
    'Digital & Concept',
    'Charcoal & Graphite',
    'Watercolour & Gouache',
  ];

  const filteredArtworks = useMemo(() => {
    return artworks
      .filter((art) => {
        const matchesMedium = selectedMedium === 'All' || art.medium === selectedMedium;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          art.title.toLowerCase().includes(query) ||
          art.artistName.toLowerCase().includes(query) ||
          art.accessionNo.toLowerCase().includes(query) ||
          art.tags.some((t) => t.toLowerCase().includes(query)) ||
          art.medium.toLowerCase().includes(query);

        return matchesMedium && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') return b.likes - a.likes;
        if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [artworks, selectedMedium, searchQuery, sortBy]);

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-12">
      
      {/* Header - Huge left-aligned page title */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="page-title text-[var(--ink)]">
          The GCECT canvas
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          Artwork made by students right here at GCECT. Filter by medium, search by title or artist, or click any piece to see the full details.
        </p>
      </div>

      {/* Control Bar: Search, Filters, Sorting, View toggle */}
      <div className="space-y-4 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 sm:p-6 shadow-sm">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, or medium..."
              className="w-full bg-[var(--paper)] border border-[var(--line)] pl-9 pr-4 py-2.5 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'recent' | 'likes')}
                className="bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="featured">Curator's choice</option>
                <option value="likes">Most liked</option>
                <option value="recent">Recently added</option>
              </select>
            </div>

            {/* View switcher */}
            <div className="hidden sm:flex items-center border border-[var(--line)] rounded-full overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                aria-label="Grid gallery view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                aria-label="Catalogue index view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Medium Filter Chips per Section 3.5: 1.5px line border, selected state is ink fill with paper text */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-2 scrollbar-none">
          {mediumFilters.map((med) => {
            const isSelected = selectedMedium === med;
            return (
              <button
                key={med}
                type="button"
                onClick={() => setSelectedMedium(med)}
                className={`filter-chip ${isSelected ? 'active' : ''}`}
              >
                {med}
              </button>
            );
          })}
        </div>

        {/* Archive summary status */}
        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono text-[var(--muted)]">
          <span>Displaying {filteredArtworks.length} of {artworks.length} archived works</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[var(--accent)] underline hover:opacity-80"
            >
              Clear search filter
            </button>
          )}
        </div>

      </div>

      {/* Artworks Display - framed like on a white gallery wall with generous whitespace */}
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-24 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] space-y-4">
          <p className="font-display text-2xl font-bold text-[var(--ink)]">
            No artworks match your search parameters.
          </p>
          <p className="text-xs font-mono text-[var(--muted)]">
            Try adjusting your medium filter or clearing the search keyword.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedMedium('All');
              setSearchQuery('');
            }}
            className="btn-primary"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtworks.map((art) => (
            <ArtworkCard key={art.id} artwork={art} />
          ))}
        </div>
      ) : (
        /* Catalogue Index List View */
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] divide-y divide-[var(--line)] overflow-hidden">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              onClick={() => openArtworkModal(art)}
              className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--paper)] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-[4px] shrink-0 border border-[var(--line)]"
                />
                <div>
                  <span className="text-xs font-mono text-[var(--muted)] block">
                    {art.accessionNo}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)]">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] font-sans">
                    {art.artistName} • {art.artistDept}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end sm:items-end justify-between w-full sm:w-auto text-xs font-mono text-[var(--muted)]">
                <span className="text-[var(--ink)] font-semibold">{art.medium}</span>
                <span>{art.dimensions} • {art.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
