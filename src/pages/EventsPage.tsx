import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight, History, Image, Palette, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useGallery } from '../context/GalleryContext';
import { RegistrationModal } from '../components/events/RegistrationModal';
import type { EventItem } from '../types';

interface FilterOption {
  label: string;
  categoryMatch: string;
}

const EVENT_TYPE_FILTERS: FilterOption[] = [
  { label: 'All', categoryMatch: 'All' },
  { label: 'Workshops', categoryMatch: 'Workshop' },
  { label: 'Drawing competitions', categoryMatch: 'Drawing Competition' },
  { label: 'Live sketching', categoryMatch: 'Live Sketching' },
  { label: 'Painting competitions', categoryMatch: 'Painting Competition' },
  { label: 'Exhibitions', categoryMatch: 'Exhibition' },
  { label: 'Inter-club collaborations', categoryMatch: 'Inter-Club Collaboration' },
  { label: 'Creative challenges', categoryMatch: 'Creative Challenge' },
];

/** Extract sortable timestamp from human-readable date */
function extractSortableDate(dateStr: string): number {
  const match = dateStr.match(/(\w+\s+\d{1,2}).*?(\d{4})/);
  if (match) {
    const d = new Date(`${match[1]}, ${match[2]}`);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/** Parse large accent date block (big day number + small month text) */
function parseDateBlock(dateStr: string): { day: string; month: string; year: string } {
  const cleaned = dateStr.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '');
  
  // Try "Month Day, Year" or "Month Day – Day, Year"
  const monthFirst = cleaned.match(/^(\w+)\s+(\d{1,2}).*?(\d{4})/);
  if (monthFirst) {
    return {
      day: monthFirst[2],
      month: monthFirst[1].slice(0, 3).toUpperCase(),
      year: monthFirst[3],
    };
  }
  
  // Try "Day Month Year"
  const dayFirst = cleaned.match(/^(\d{1,2})\s+(\w+).*?(\d{4})/);
  if (dayFirst) {
    return {
      day: dayFirst[1],
      month: dayFirst[2].slice(0, 3).toUpperCase(),
      year: dayFirst[3],
    };
  }
  
  return { day: '—', month: '', year: '' };
}

export const EventsPage: React.FC = () => {
  const { events, registeredEventIds } = useGallery();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);

  // Filter matching
  const matchesCategory = (eventCategory: string, filterMatch: string) => {
    if (filterMatch === 'All') return true;
    if (filterMatch === 'Live Sketching') {
      return eventCategory === 'Live Sketching' || eventCategory === 'Plein Air';
    }
    if (filterMatch === 'Exhibition') {
      return eventCategory === 'Exhibition' || eventCategory === 'Open Studio';
    }
    return eventCategory.toLowerCase() === filterMatch.toLowerCase();
  };

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.status !== 'concluded')
      .filter((e) => matchesCategory(e.category, selectedFilter))
      .sort((a, b) => extractSortableDate(a.date) - extractSortableDate(b.date));
  }, [events, selectedFilter]);

  const pastEvents = useMemo(() => {
    return events
      .filter((e) => e.status === 'concluded')
      .filter((e) => matchesCategory(e.category, selectedFilter))
      .sort((a, b) => extractSortableDate(b.date) - extractSortableDate(a.date));
  }, [events, selectedFilter]);

  return (
    <>
      <SEO
        title="Events"
        description="Discover upcoming art exhibitions, workshops, plein air sessions, and collaborative events hosted by Brush and Bond at GCECT."
        canonicalPath="/events"
      />
    <div className="gallery-container py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <span>CAMPUS CALENDAR</span>
          <span>•</span>
          <span>GCECT ART CLUB</span>
        </div>
        <h1 className="page-title text-[var(--ink)]">
          Events
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          From open-theme drawing competitions and wet clay raku workshops to heritage plein-air walks
          and inter-club hackathons. Free and open to all engineering streams.
        </p>
      </div>

      {/* Tabs: Upcoming & Past events */}
      <div className="flex items-center gap-8 border-b border-[var(--line)]">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`relative pb-3 text-sm sm:text-base font-display font-bold transition-colors ${
            activeTab === 'upcoming'
              ? 'text-[var(--ink)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          aria-selected={activeTab === 'upcoming'}
        >
          <span>Upcoming Events</span>
          <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]">
            {events.filter((e) => e.status !== 'concluded').length}
          </span>
          {activeTab === 'upcoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`relative pb-3 text-sm sm:text-base font-display font-bold transition-colors ${
            activeTab === 'past'
              ? 'text-[var(--ink)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          aria-selected={activeTab === 'past'}
        >
          <span>Past Events</span>
          <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]">
            {events.filter((e) => e.status === 'concluded').length}
          </span>
          {activeTab === 'past' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
          )}
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {EVENT_TYPE_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setSelectedFilter(f.categoryMatch)}
            className={`filter-chip ${selectedFilter === f.categoryMatch ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* UPCOMING TAB: List of Event Rows */}
      {activeTab === 'upcoming' ? (
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => {
              const isRegistered = registeredEventIds.has(event.id);
              const dateBlock = parseDateBlock(event.date);

              return (
                <div
                  key={event.id}
                  className="group flex flex-col sm:flex-row items-stretch bg-[var(--surface)] border border-[var(--line)] rounded-[8px] overflow-hidden transition-all duration-200 hover:border-[var(--ink)] hover:shadow-md"
                >
                  {/* Large Accent Date Block (Day Big, Month Small) */}
                  <div className="shrink-0 w-full sm:w-[110px] md:w-[130px] bg-[var(--accent)]/10 border-b sm:border-b-0 sm:border-r border-[var(--line)] flex flex-row sm:flex-col items-center justify-between sm:justify-center py-4 px-5 sm:px-3 text-center">
                    <span className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[var(--accent)] leading-none tracking-tight">
                      {dateBlock.day}
                    </span>
                    <div className="text-right sm:text-center sm:mt-1">
                      <span className="text-xs sm:text-sm font-mono font-bold text-[var(--accent)] uppercase tracking-wider block">
                        {dateBlock.month}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted)] block">
                        {dateBlock.year}
                      </span>
                    </div>
                  </div>

                  {/* Main Event Information */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                          {event.category}
                        </span>
                        {isRegistered && (
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Registered</span>
                          </span>
                        )}
                      </div>

                      {/* Title linked to event detail */}
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                        <Link to={`/events/${event.slug || event.id}`}>
                          {event.title}
                        </Link>
                      </h2>

                      {/* One-line description */}
                      <p className="text-xs sm:text-sm text-[var(--muted)] font-sans line-clamp-1 leading-relaxed">
                        {event.tagline || event.description}
                      </p>

                      {/* Location & Time */}
                      <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono text-[var(--muted)]">
                        <span className="flex items-center gap-1.5 text-[var(--ink)] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                          <span>{event.venue}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                          <span>{event.time}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Register Button & View Details */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[var(--line)]/60">
                      {event.registrationOpen ? (
                        <button
                          type="button"
                          onClick={() => setRegisteringEvent(event)}
                          className={isRegistered ? 'btn-secondary text-xs py-2 px-4' : 'btn-primary text-xs py-2 px-5'}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{isRegistered ? 'View Your Pass' : 'Register Now'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-[var(--muted)] px-3 py-1.5 bg-[var(--paper)] rounded-full border border-[var(--line)]">
                          Registration opens soon
                        </span>
                      )}

                      <Link
                        to={`/events/${event.slug || event.id}`}
                        className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1 ml-auto"
                      >
                        <span>Full event details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 space-y-3 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)]">
              <p className="font-display text-xl font-bold text-[var(--ink)]">
                No upcoming events found for this filter
              </p>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
                Check back soon or reset the category filter to view all upcoming creative activities.
              </p>
              <button
                type="button"
                onClick={() => setSelectedFilter('All')}
                className="btn-secondary mt-2"
              >
                Show all events
              </button>
            </div>
          )}
        </div>
      ) : (
        /* PAST TAB: Card Grid */
        <div className="space-y-6">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pastEvents.map((event) => {
                const dateBlock = parseDateBlock(event.date);

                return (
                  <article
                    key={event.id}
                    className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] overflow-hidden group transition-all duration-300 hover:border-[var(--ink)] hover:shadow-lg flex flex-col"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--paper)]">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm text-[11px] font-mono font-medium text-[var(--ink)] border border-[var(--line)]">
                        {event.category}
                      </div>

                      {/* Concluded tag */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-mono text-white/90">
                        <History className="w-3 h-3 text-[var(--accent)]" />
                        <span>Concluded</span>
                      </div>

                      {/* Date pill overlay at bottom left */}
                      <div className="absolute bottom-3 left-3 bg-[var(--surface)]/95 backdrop-blur-sm border border-[var(--line)] rounded-[4px] px-3 py-1.5 flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-[var(--accent)] leading-none">
                          {dateBlock.day}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--muted)] uppercase font-semibold">
                          {dateBlock.month} {dateBlock.year}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                          <Link to={`/events/${event.slug || event.id}`}>
                            {event.title}
                          </Link>
                        </h2>

                        <p className="text-xs font-mono text-[var(--muted)] flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-[var(--accent)]" />
                          <span>{event.venue}</span>
                        </p>

                        <p className="text-xs sm:text-sm text-[var(--muted)] font-sans leading-relaxed line-clamp-2 pt-1">
                          {event.description}
                        </p>
                      </div>

                      {/* Winners summary if present */}
                      {event.winners && event.winners.length > 0 && (
                        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-3 text-xs font-mono space-y-1">
                          <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Salon Winners</span>
                          </span>
                          <div className="space-y-0.5 pt-0.5">
                            {event.winners.map((w) => (
                              <div key={w.place} className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[var(--ink)]">{w.place}: {w.name}</span>
                                <span className="text-[var(--muted)]">{w.department.split(',')[0]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: View photos & View participants' artwork */}
                      <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-2.5">
                        <Link
                          to={`/events/${event.slug || event.id}#photos`}
                          className="btn-secondary text-xs py-2 px-3.5 flex-1 inline-flex items-center justify-center gap-1.5"
                        >
                          <Image className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>View photos</span>
                        </Link>

                        <Link
                          to={`/events/${event.slug || event.id}#artworks`}
                          className="btn-secondary text-xs py-2 px-3.5 flex-1 inline-flex items-center justify-center gap-1.5"
                        >
                          <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>View participants' artwork</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 space-y-3 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)]">
              <p className="font-display text-xl font-bold text-[var(--ink)]">
                No past events match this filter
              </p>
              <p className="text-sm text-[var(--muted)]">
                Select "All" to review our complete exhibition archive.
              </p>
              <button
                type="button"
                onClick={() => setSelectedFilter('All')}
                className="btn-secondary mt-2"
              >
                Show all past events
              </button>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal Dialog */}
      <RegistrationModal
        event={registeringEvent}
        onClose={() => setRegisteringEvent(null)}
      />
    </div>
    </>
  );
};
