import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useGallery } from '../context/GalleryContext';

export const ArtistsPage: React.FC = () => {
  const { artists, artworks, openArtworkModal } = useGallery();
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const departments = [
    'All',
    'Ceramic Technology',
    'Computer Science & Engineering',
    'Information Technology',
  ];

  const filteredArtists = artists.filter(
    (artist) => selectedDept === 'All' || artist.department === selectedDept
  );

  return (
    <>
      <SEO
        title="Artists"
        description="Meet the talented student artists behind Brush and Bond. Explore their portfolios, specialties, and artistic journeys at GCECT."
        canonicalPath="/artists"
      />
    <div className="gallery-container py-10 sm:py-16 space-y-16">
      
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="page-title text-[var(--ink)]">
          Artists and heritage
        </h1>
        <p className="text-xs font-mono text-[var(--accent)] font-semibold">
          Creativity • Expression • Community
        </p>
        <p className="text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          Meet the students making art on our campus, and look back at how Brush and Bond came to life in 2024. Follow us on Instagram at <strong className="text-[var(--accent)]">@brushandbond</strong>.
        </p>
      </div>

      {/* Part 1: Student Artists Roster */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-4">
          <div>
            <h2 className="section-title text-[var(--ink)]">
              Student artists
            </h2>
            <p className="text-xs font-mono text-[var(--muted)] mt-1">
              Active members contributing works to the canvas
            </p>
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`filter-chip ${selectedDept === dept ? 'active' : ''}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArtists.map((artist) => {
            const artistWorks = artworks.filter((a) => a.artistId === artist.id || a.artistName === artist.name);

            return (
              <div
                key={artist.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Link to={`/artists/${artist.slug || artist.id}`}>
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-[4px] border border-[var(--line)] shrink-0 hover:border-[var(--accent)] transition-colors"
                      />
                    </Link>
                    <div>
                      <span className="text-xs font-mono text-[var(--accent)] font-semibold block">
                        {artist.role}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                        <Link to={`/artists/${artist.slug || artist.id}`} className="hover:text-[var(--accent)] transition-colors">
                          {artist.name}
                        </Link>
                      </h3>
                      <p className="text-xs font-mono text-[var(--muted)]">
                        {artist.department} • {artist.batch}
                      </p>
                      <Link
                        to={`/artists/${artist.slug || artist.id}`}
                        className="text-xs font-mono text-[var(--accent)] mt-1.5 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View profile & works</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <blockquote className="font-display text-lg text-[var(--ink)] border-l-2 border-[var(--accent)] pl-3.5 leading-snug">
                    &ldquo;{artist.statement}&rdquo;
                  </blockquote>

                  <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
                    {artist.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {artist.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-xs font-mono px-3 py-1 bg-[var(--paper)] border border-[var(--line)] rounded-full text-[var(--muted)]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked artworks thumbnail row */}
                {artistWorks.length > 0 && (
                  <div className="pt-4 border-t border-[var(--line)] space-y-2">
                    <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider block">
                      Archived in the canvas ({artistWorks.length})
                    </span>
                    <div className="flex gap-2">
                      {artistWorks.map((work) => (
                        <div
                          key={work.id}
                          onClick={() => openArtworkModal(work)}
                          className="flex items-center gap-2 p-1.5 bg-[var(--paper)] rounded-[4px] border border-[var(--line)] hover:border-[var(--ink)] cursor-pointer transition-colors flex-1"
                        >
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            className="w-10 h-10 object-cover rounded-[2px] shrink-0"
                          />
                          <div className="min-w-0 pr-1">
                            <span className="text-xs font-display font-bold block truncate text-[var(--ink)]">
                              {work.title}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--muted)] block">
                              {work.accessionNo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Part 2: Studio Space & Location Visit */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-display text-3xl font-bold text-[var(--ink)]">
              Visit Studio 204 on campus
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
              Located on the second floor of the Ceramic Engineering Wing, Studio 204 is stocked with pottery wheels, easels, drawing tables, and clay. Drop in on Tuesday or Thursday after classes.
            </p>
            <div className="pt-2">
              <Link
                to="/join"
                className="btn-primary"
              >
                <span>Join the club</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-5 text-xs font-mono text-[var(--muted)] space-y-2">
            <p className="text-[var(--ink)] font-bold text-sm">
              Open studio hours
            </p>
            <p>Tuesday: 4:30 PM – 7:30 PM</p>
            <p>Thursday: 4:30 PM – 7:30 PM</p>
            <p>Saturday: 11:00 AM – 5:00 PM</p>
            <p className="pt-2 text-xs text-[var(--accent)] font-semibold">
              Ceramic Block, GCECT Kolkata
            </p>
          </div>
        </div>
      </section>

    </div>
    </>
  );
};
