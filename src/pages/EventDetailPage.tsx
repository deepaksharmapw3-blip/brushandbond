import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Share2,
  Sparkles,
  AlertCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Palette,
  Ticket,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGallery } from '../context/GalleryContext';
import { useToast } from '../context/ToastContext';
import { RegistrationModal } from '../components/events/RegistrationModal';
import type { RegistrationPayload } from '../types';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { events, artworks, registeredEventIds, openArtworkModal, registerForEvent } = useGallery();
  const { showSuccess } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryLightbox, setGalleryLightbox] = useState<number | null>(null);

  // Embedded form state
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('Ceramic Technology');
  const [regYear, setRegYear] = useState('1st Year');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regErrors, setRegErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [ticketPass, setTicketPass] = useState<string | null>(null);

  const event = events.find((e) => e.slug === slug || e.id === slug);

  // Smooth scroll to hash anchor on mount (#photos or #artworks)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash]);

  if (!event) {
    return (
      <div className="gallery-container py-24 text-center space-y-6">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)]">
          Event not found
        </h1>
        <p className="text-base text-[var(--muted)] max-w-md mx-auto">
          The event you are looking for does not exist or may have been updated.
        </p>
        <Link to="/events" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to all events</span>
        </Link>
      </div>
    );
  }

  const isRegistered = registeredEventIds.has(event.id);
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);

  // Participant artworks from gallery
  const participantArtworks = event.participantArtworkIds
    ? artworks.filter((a) => event.participantArtworkIds!.includes(a.id))
    : [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Event link copied', 'Share this event with your campus peers.');
  };

  // Embedded Registration Submit
  const handleEmbeddedRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof regErrors = {};

    if (!regName.trim()) {
      errs.name = 'Please enter your full name.';
    }
    if (!regEmail.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (regPhone.trim() && !/^[0-9+\s-]{7,15}$/.test(regPhone.trim())) {
      errs.phone = 'Please enter a valid phone number or leave blank.';
    }

    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: RegistrationPayload = {
      eventId: event.id,
      name: regName.trim(),
      department: regDept,
      yearOfStudy: regYear,
      email: regEmail.trim(),
      phone: regPhone.trim(),
      rollNumber: `GCECT-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceLevel: 'Practicing Artist',
    };

    try {
      const res = await registerForEvent(payload);
      if (!res.success) return;
      setTicketPass(res.passCode);
      showSuccess('Registration confirmed', `Your pass ${res.passCode} has been issued.`);
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2F3CFF', '#15130F', '#F5F1EA'],
        });
      } catch {
        // ignore
      }
    } catch (error) {
      setRegErrors((current) => ({ ...current, email: error instanceof Error ? error.message : 'Could not register for this event. Please try again.' }));
    }
  };

  // Gallery lightbox controls
  const galleryImages = event.galleryImages || [];
  const openGalleryAt = (idx: number) => setGalleryLightbox(idx);
  const closeGallery = () => setGalleryLightbox(null);
  const nextGalleryImage = () => {
    if (galleryLightbox !== null) {
      setGalleryLightbox((galleryLightbox + 1) % galleryImages.length);
    }
  };
  const prevGalleryImage = () => {
    if (galleryLightbox !== null) {
      setGalleryLightbox((galleryLightbox - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-12">
      {/* Top back navigation & share */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all events</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="p-2 border border-[var(--line)] rounded-full text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
          title="Share event link"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Section — Cover image + key info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left column: Key Information */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
              {event.category}
            </span>
            <span
              className={`font-mono text-xs px-3 py-1 rounded-full border ${
                event.status === 'concluded'
                  ? 'border-[var(--line)] text-[var(--muted)]'
                  : event.status === 'open'
                  ? 'border-green-400/40 text-green-600 dark:text-green-400 bg-green-500/5'
                  : 'border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/5'
              }`}
            >
              {event.status === 'concluded'
                ? 'Concluded'
                : event.status === 'open'
                ? 'Open for registration'
                : 'Upcoming'}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight leading-[1.1]">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] font-sans leading-relaxed">
            {event.tagline}
          </p>

          {/* Quick schedule grid: Date, Time, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 text-sm">
              <Calendar className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[var(--ink)] font-display">Date</strong>
                <span className="text-[var(--muted)] font-mono text-xs">{event.date}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 text-sm">
              <Clock className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[var(--ink)] font-display">Time</strong>
                <span className="text-[var(--muted)] font-mono text-xs">{event.time}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 text-sm sm:col-span-2">
              <MapPin className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[var(--ink)] font-display">Location</strong>
                <span className="text-[var(--muted)]">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Status summary banner */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {event.status === 'concluded' ? (
              <div className="px-4 py-2 rounded-full bg-[var(--paper)] border border-[var(--line)] text-xs font-mono text-[var(--muted)]">
                This event has concluded. Retrospective archived below.
              </div>
            ) : isRegistered ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are registered for this event</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {event.registeredCount} / {event.capacity} seats filled ({seatsRemaining} remaining)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Cover image */}
        <div className="lg:col-span-5">
          <div className="aspect-[4/3] rounded-[8px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-sm">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Content & Registration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8 border-t border-[var(--line)]">
        {/* Left Column (8 cols): Description, Materials, Guidelines, Winners, Gallery, Participants */}
        <div className="lg:col-span-8 space-y-12">
          {/* 1. Full Description */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
              About this event
            </h2>
            <p className="text-base text-[var(--ink)]/90 leading-relaxed font-sans max-w-[65ch]">
              {event.description}
            </p>
          </section>

          {/* 2. Materials Provided */}
          {event.materialsProvided && event.materialsProvided.length > 0 && (
            <section className="space-y-4 bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  Materials provided by the club
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--muted)] font-sans">
                {event.materialsProvided.map((mat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. Guidelines */}
          {event.guidelines && event.guidelines.length > 0 && event.guidelines[0] !== 'Archived retrospective display.' && event.guidelines[0] !== 'Archived event.' && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  Guidelines for participants
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--muted)] font-sans">
                {event.guidelines.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--line)] mt-2 shrink-0" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. Winners Section (if any) */}
          {event.winners && event.winners.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                  Event Winners
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {event.winners.map((winner, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-[var(--surface)] border rounded-[8px] p-5 text-center space-y-2 ${
                      winner.place === '1st'
                        ? 'border-[var(--accent)] shadow-md'
                        : 'border-[var(--line)]'
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-display font-bold text-lg ${
                        winner.place === '1st'
                          ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                          : winner.place === '2nd'
                          ? 'bg-[var(--ink)]/10 text-[var(--ink)]'
                          : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {winner.place.replace(/\D/g, '')}
                    </div>
                    <h4 className="font-display font-bold text-[var(--ink)]">
                      {winner.name}
                    </h4>
                    <p className="text-xs text-[var(--muted)] font-sans">{winner.department}</p>
                    {winner.artworkTitle && (
                      <p className="text-xs font-mono text-[var(--accent)] italic">
                        "{winner.artworkTitle}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Photo Gallery (with Lightbox and #photos anchor) */}
          {galleryImages.length > 0 && (
            <section id="photos" className="space-y-5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                    Event Photo Gallery
                  </h2>
                </div>
                <span className="text-xs font-mono text-[var(--muted)]">
                  {galleryImages.length} images · click to expand
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openGalleryAt(idx)}
                    className="group relative aspect-[4/3] rounded-[6px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`Event photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] font-mono text-white bg-black/60 px-2 py-1 rounded-full">
                        Enlarge
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 6. Participants' Artwork Grid (with #artworks anchor) */}
          {participantArtworks.length > 0 && (
            <section id="artworks" className="space-y-5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                    Participants' Artwork
                  </h2>
                </div>
                <span className="text-xs font-mono text-[var(--muted)]">
                  {participantArtworks.length} pieces exhibited
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participantArtworks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => openArtworkModal(art)}
                    className="group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] overflow-hidden text-left transition-all hover:border-[var(--ink)] hover:shadow-md cursor-pointer"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[var(--paper)]">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-display font-bold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[var(--muted)] font-sans">
                        {art.artistName} · {art.artistDept.split(',')[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (4 cols): Registration Form for Upcoming Events & Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Registration Form for Upcoming Events */}
          {event.status !== 'concluded' && (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 shadow-sm space-y-5">
              <div className="border-b border-[var(--line)] pb-3">
                <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
                  Registration Desk
                </span>
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  Register for this event
                </h3>
              </div>

              {isRegistered || ticketPass ? (
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[6px] p-4 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[var(--accent)] mx-auto" />
                  <div>
                    <h4 className="font-display font-bold text-base text-[var(--ink)]">
                      You are registered!
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Your attendance pass is confirmed for {event.title}.
                    </p>
                  </div>
                  <div className="bg-[var(--paper)] py-2 px-3 rounded-[4px] font-mono text-xs text-[var(--accent)] font-bold">
                    PASS: {ticketPass || 'GCECT-PASS-CONFIRMED'}
                  </div>
                </div>
              ) : event.registrationOpen ? (
                <form onSubmit={handleEmbeddedRegister} className="space-y-3.5 text-xs font-sans" noValidate>
                  {/* Name */}
                  <div>
                    <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                      Name <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (regErrors.name) setRegErrors((p) => ({ ...p, name: undefined }));
                      }}
                      placeholder="Your full name"
                      className={`w-full bg-[var(--paper)] border px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none ${
                        regErrors.name ? 'border-red-500' : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {regErrors.name && (
                      <p className="text-[11px] text-red-500 mt-1 font-mono">{regErrors.name}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                      Department <span className="text-[var(--accent)]">*</span>
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="Ceramic Technology">Ceramic Technology</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Other Department">Other Department</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                      Year <span className="text-[var(--accent)]">*</span>
                    </label>
                    <select
                      value={regYear}
                      onChange={(e) => setRegYear(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                      Email <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regErrors.email) setRegErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="student@gcect.ac.in"
                      className={`w-full bg-[var(--paper)] border px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none ${
                        regErrors.email ? 'border-red-500' : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {regErrors.email && (
                      <p className="text-[11px] text-red-500 mt-1 font-mono">{regErrors.email}</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label className="block font-mono font-medium text-[var(--ink)] mb-1">
                      Phone <span className="text-[var(--muted)] font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        if (regErrors.phone) setRegErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-[var(--paper)] border px-3 py-2 text-xs rounded-[6px] text-[var(--ink)] focus:outline-none ${
                        regErrors.phone ? 'border-red-500' : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {regErrors.phone && (
                      <p className="text-[11px] text-red-500 mt-1 font-mono">{regErrors.phone}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full btn-primary py-2.5 text-xs">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Submit Registration</span>
                    </button>
                    <p className="text-[10px] text-[var(--muted)] text-center mt-2 font-mono">
                      {seatsRemaining} seats left · Free for students
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-xs font-mono text-[var(--muted)]">
                  Registration for this event will open soon.
                </div>
              )}
            </div>
          )}

          {/* Curator card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 space-y-3">
            <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
              Curator & Faculty Lead
            </span>
            <h4 className="font-display text-lg font-bold text-[var(--ink)]">
              {event.curator}
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-sans">
              Supervising workshop activities, technical critique, and studio safety.
            </p>
          </div>

          {/* Help card */}
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] p-6 space-y-2 text-xs font-mono text-[var(--muted)]">
            <strong className="text-[var(--ink)] block font-sans text-sm">
              Questions about this event?
            </strong>
            <p className="font-sans">
              Drop by Studio 204 or submit an inquiry through our contact portal.
            </p>
            <Link to="/contact" className="text-[var(--accent)] hover:underline inline-block pt-1 font-semibold">
              Contact curatorial desk →
            </Link>
          </div>
        </div>
      </div>

      {/* Photo Gallery Lightbox */}
      <AnimatePresence>
        {galleryLightbox !== null && galleryImages.length > 0 && (
          <GalleryLightbox
            images={galleryImages}
            currentIndex={galleryLightbox}
            onClose={closeGallery}
            onNext={nextGalleryImage}
            onPrev={prevGalleryImage}
          />
        )}
      </AnimatePresence>

      {/* Modal Dialog fallback */}
      <RegistrationModal
        event={modalOpen ? event : null}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

/* Photo Gallery Fullscreen Lightbox */
const GalleryLightbox: React.FC<{
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
      >
        <img
          src={images[currentIndex]}
          alt={`Event photo ${currentIndex + 1}`}
          className="max-h-[80vh] w-auto max-w-full object-contain rounded-[4px] shadow-2xl"
        />
        <div className="mt-3 text-xs font-mono text-white/70">
          Photo {currentIndex + 1} of {images.length}
        </div>
      </div>
    </div>
  );
};
