import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { EventItem } from '../../types';
import { RegistrationModal } from './RegistrationModal';
import { useGallery } from '../../context/GalleryContext';
import { useToast } from '../../context/ToastContext';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { registeredEventIds } = useGallery();
  const { showInfo } = useToast();

  const isRegistered = registeredEventIds.has(event.id);
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);

  const handleAction = () => {
    if (!event.registrationOpen) {
      showInfo('Registrations open soon', `Admission for "${event.title}" will open next month. Watch our dispatches.`);
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <article className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] flex flex-col md:flex-row overflow-hidden transition-colors duration-200 hover:border-[var(--ink)]">
        {/* Visual Poster Column - 4px radius inner */}
        <div className="md:w-5/12 p-3 pb-0 md:pb-3 md:pr-0">
          <div className="relative aspect-[16/10] md:h-full md:aspect-auto bg-[var(--paper)] rounded-[4px] overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out hover:scale-[1.02]"
            />

            {/* Category Tag */}
            <div className="absolute top-3 left-3 bg-[var(--surface)] border border-[var(--line)] px-3 py-1 rounded-full text-xs font-sans font-medium text-[var(--ink)]">
              {event.category}
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-3 left-3 bg-[var(--ink)] text-[var(--paper)] text-[12px] font-mono px-3 py-1 rounded-full">
              {isRegistered ? (
                <span className="text-[var(--accent)] font-semibold">Pass reserved ✓</span>
              ) : event.registrationOpen ? (
                <span>{seatsRemaining} seats remaining</span>
              ) : (
                <span>Announced • Coming soon</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Details Column */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            {/* Meta details with date in ACCENT COLOR per Section 3.2 */}
            <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs font-mono mb-2">
              <span className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                <Clock className="w-3.5 h-3.5" />
                {event.time}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight mb-2">
              <Link to={`/events/${event.slug || event.id}`} className="hover:text-[var(--accent)] transition-colors">
                {event.title}
              </Link>
            </h3>

            <p className="text-xs font-mono text-[var(--muted)] mb-3">
              {event.tagline}
            </p>

            <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 max-w-[65ch] font-sans">
              {event.description}
            </p>

            {/* Venue & Curator */}
            <div className="space-y-1.5 text-xs font-mono text-[var(--muted)]">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span>Curated by {event.curator}</span>
              </div>
            </div>
          </div>

          {/* Action Row with Pill Buttons */}
          <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Link
              to={`/events/${event.slug || event.id}`}
              className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>View full salon details & guidelines</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleAction}
              className={isRegistered ? 'btn-secondary' : event.registrationOpen ? 'btn-primary' : 'btn-secondary'}
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  <span>Pass reserved (view pass)</span>
                </>
              ) : event.registrationOpen ? (
                <>
                  <span>Register for this event</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              ) : (
                <span>Notify me when open</span>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Registration Modal */}
      <RegistrationModal
        event={modalOpen ? event : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
