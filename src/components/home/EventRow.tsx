import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Clock, Users } from 'lucide-react';
import type { EventItem } from '../../types';

interface EventRowProps {
  event: EventItem;
}

export const EventRow: React.FC<EventRowProps> = ({ event }) => {
  // Parse readable short date: e.g. "Nov 07"
  const extractAccentDate = (dateStr: string) => {
    // Check if matches month + day format
    const parts = dateStr.split(',');
    if (parts.length > 1) {
      const monthDay = parts[1].trim(); // e.g. "November 7"
      const tokens = monthDay.split(' ');
      if (tokens.length >= 2) {
        const monthShort = tokens[0].slice(0, 3);
        const day = tokens[1].padStart(2, '0');
        return { month: monthShort, day };
      }
    }
    // Fallback
    return { month: 'Upcoming', day: '2026' };
  };

  const { month, day } = extractAccentDate(event.date);

  return (
    <Link
      to={`/events/${event.slug || event.id}`}
      className="group block border-b border-[var(--line)] py-6 sm:py-8 hover:bg-[var(--surface)] transition-all px-4 sm:px-6 rounded-[6px]"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Large Accent Date + Main Title */}
        <div className="flex items-start sm:items-center gap-6 sm:gap-8">
          {/* Large Accent Date */}
          <div className="text-left shrink-0 w-20 sm:w-24">
            <span className="block text-xs font-mono uppercase tracking-widest text-[var(--muted)] font-semibold">
              {month}
            </span>
            <span className="block font-display font-black text-3xl sm:text-4xl text-[var(--accent)] leading-none">
              {day}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-semibold">
                {event.category}
              </span>
              <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--accent)]" />
                <span>{event.time}</span>
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors leading-snug">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Right: Registration status & Arrow */}
        <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]/50">
          <div className="text-left md:text-right text-xs font-mono text-[var(--muted)]">
            <span className="flex items-center md:justify-end gap-1 text-[var(--ink)] font-medium">
              <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{event.registeredCount} / {event.capacity} seats</span>
            </span>
            <span className="text-[11px] text-[var(--accent)]">
              {event.registrationOpen ? 'Free registration open' : 'Coming soon'}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
