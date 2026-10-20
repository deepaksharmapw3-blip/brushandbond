import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Ticket, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventItem, RegistrationPayload } from '../../types';
import { useGallery } from '../../context/GalleryContext';
import { useToast } from '../../context/ToastContext';

interface RegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ event, onClose }) => {
  const { registerForEvent, registeredEventIds } = useGallery();
  const { showSuccess } = useToast();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Ceramic Technology');
  const [year, setYear] = useState('1st Year');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    department?: string;
    year?: string;
    email?: string;
    phone?: string;
  }>({});

  const [ticketPass, setTicketPass] = useState<string | null>(null);

  if (!event) return null;

  const isAlreadyRegistered = registeredEventIds.has(event.id);

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!name.trim()) {
      errs.name = 'Please enter your full name.';
    }

    if (!department) {
      errs.department = 'Please select your department.';
    }

    if (!year) {
      errs.year = 'Please select your academic year.';
    }

    if (!email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (phone.trim() && !/^[0-9+\s-]{7,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number or leave blank.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: RegistrationPayload = {
      eventId: event.id,
      name: name.trim(),
      department,
      yearOfStudy: year,
      email: email.trim(),
      phone: phone.trim(),
      rollNumber: `GCECT-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceLevel: 'Practicing Artist',
    };

    try {
      const result = await registerForEvent(payload);
      if (!result.success) return;
      setTicketPass(result.passCode);
      showSuccess('Registration confirmed', `Your event pass ${result.passCode} has been issued.`);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2F3CFF', '#15130F', '#F5F1EA'],
        });
      } catch {
        // ignore fallback
      }
    } catch (error) {
      setErrors((current) => ({ ...current, email: error instanceof Error ? error.message : 'Could not register for this event. Please try again.' }));
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Register for ${event.title}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 14 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] shadow-2xl rounded-[8px] p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {!ticketPass && !isAlreadyRegistered ? (
            <div>
              {/* Event Header info */}
              <div className="mb-6">
                <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block mb-1">
                  Event Registration
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight">
                  {event.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-y-1.5 gap-x-4 text-xs font-mono text-[var(--muted)]">
                  <span className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.venue}
                  </span>
                </div>
              </div>

              {/* Form fields: Name, Department, Year, Email, Phone (optional) */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans" noValidate>
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--ink)] mb-1">
                    Name <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full bg-[var(--paper)] border px-3 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none transition-colors ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--line)] focus:border-[var(--accent)]'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* 2. Department & 3. Year in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-[var(--ink)] mb-1">
                      Department <span className="text-[var(--accent)]">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="Ceramic Technology">Ceramic Technology</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Other Department / Guest">Other Department / Guest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[var(--ink)] mb-1">
                      Year <span className="text-[var(--accent)]">*</span>
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Alumni / Faculty">Alumni / Faculty</option>
                    </select>
                  </div>
                </div>

                {/* 4. Email */}
                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--ink)] mb-1">
                    Email <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    type="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="student@gcect.ac.in or personal email"
                    className={`w-full bg-[var(--paper)] border px-3 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--line)] focus:border-[var(--accent)]'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* 5. Phone (optional) */}
                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--ink)] mb-1">
                    Phone <span className="text-[var(--muted)] font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="+91 98765 43210"
                    className={`w-full bg-[var(--paper)] border px-3 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none transition-colors ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--line)] focus:border-[var(--accent)]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3">
                  <button type="submit" className="w-full btn-primary">
                    <Ticket className="w-4 h-4" />
                    <span>Confirm Registration</span>
                  </button>
                  <p className="text-[11px] text-[var(--muted)] text-center mt-2 font-mono">
                    Free admission for all GCECT students and art club members.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Registration Successful
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  You're in!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] font-sans max-w-sm mx-auto">
                  Your spot for <strong className="text-[var(--ink)]">{event.title}</strong> has been confirmed.
                </p>
              </div>

              {/* Digital Pass Ticket Card */}
              <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-4 text-left font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs">
                  <span className="text-[var(--muted)]">PASS CODE</span>
                  <span className="text-[var(--accent)] font-bold text-sm tracking-wider">
                    {ticketPass || 'GCECT-ART-PASS'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Attendee:</span>
                    <span className="text-[var(--ink)] font-semibold">{name || 'Registered Student'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Department:</span>
                    <span className="text-[var(--ink)]">{department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Date & Time:</span>
                    <span className="text-[var(--ink)]">{event.date} • {event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Location:</span>
                    <span className="text-[var(--ink)]">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary w-full"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
