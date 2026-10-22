import React, { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, ExternalLink } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useToast } from '../context/ToastContext';
import { CLUB_EMAIL } from '../lib/contact';

// ── Inline SVG brand icons ──
const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const ContactPage: React.FC = () => {
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const { contactApi } = await import('../services/api');
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        subject: 'Website Inquiry',
        message: formData.message,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'We could not save your message. Please try again.');
      return;
    }
    setSubmitted(true);
    showSuccess(
      'Message saved for Studio 204',
      'The student coordinators can review your message and follow up by email.'
    );
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Brush and Bond. Reach out with questions, collaboration inquiries, or feedback about our art club at GCECT."
        canonicalPath="/contact"
      />
    <div className="gallery-container py-10 sm:py-16 space-y-16">
      {/* ────────────────────────────────────────────────── */}
      {/* Page Header */}
      {/* ────────────────────────────────────────────────── */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Studio correspondence</span>
        </div>
        <h1 className="page-title text-[var(--ink)]">
          Contact
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          Have questions about the studio, want to acquire student artwork, or plan a cross-campus collaboration? Reach out below or drop by Studio 204.
        </p>
      </header>

      {/* ────────────────────────────────────────────────── */}
      {/* 2-Column Layout: Form + Info */}
      {/* ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* ── Left Column: Contact Form ── */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            Send a dispatch to the curatorial team
          </h2>

          {submitted ? (
            <div className="p-8 border border-[var(--accent)]/30 bg-[var(--accent)]/5 rounded-[6px] space-y-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mx-auto" />
              <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                Thank you for reaching out
              </h3>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto font-sans">
                Your message has been saved for the student coordinators. They can follow up at <strong className="text-[var(--ink)]">{formData.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSubmitError('');
                  setFormData({ name: '', email: '', message: '' });
                }}
                className="btn-secondary text-xs"
              >
                Send another dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <p role="alert" className="rounded-[6px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {submitError}
                </p>
              )}
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    maxLength={100}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Subhajit Roy"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    maxLength={254}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gcect.ac.in"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-mono text-[var(--ink)] font-semibold block">
                  Your Message *
                </label>
                <textarea
                  id="contact-message"
                  maxLength={5000}
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you'd like to explore, build, or ask..."
                  className="w-full bg-[var(--paper)] border border-[var(--line)] p-4 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] resize-y transition-colors"
                />
              </div>

              <button type="submit" id="contact-submit" className="btn-primary w-full sm:w-auto">
                <span>Send message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* ── Right Column: Studio Info ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Location card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Campus location</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--ink)]">
              Studio 204, Ceramic Technology Block
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-sans">
              Government College of Engineering and Ceramic Technology (GCECT)<br />
              73, Abinash Chandra Banerjee Lane, Beliaghata<br />
              Kolkata, West Bengal 700010
            </p>
            <div className="pt-2 border-t border-[var(--line)] text-xs font-mono text-[var(--muted)] space-y-1">
              <p>• 10 minutes from Sealdah Railway Station</p>
              <p>• Phoolbagan Metro Station (Green Line) nearby</p>
              <p>• Adjacent to the historic kiln courtyard</p>
            </div>
          </div>

          {/* Studio Hours */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Open visiting hours</span>
            </div>
            <div className="space-y-2 text-sm text-[var(--muted)] font-sans">
              <div className="flex justify-between border-b border-[var(--line)] pb-1.5">
                <span className="text-[var(--ink)] font-medium">Monday – Friday</span>
                <span className="font-mono text-xs">4:00 PM – 7:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-[var(--line)] pb-1.5">
                <span className="text-[var(--ink)] font-medium">Saturday (Open Wheel)</span>
                <span className="font-mono text-xs">11:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink)] font-medium">Sunday &amp; College Recess</span>
                <span className="font-mono text-xs text-[var(--muted)]">By appointment</span>
              </div>
            </div>
          </div>

          {/* Direct Channels — clickable links */}
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-6 space-y-4">
            <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
              Direct channels
            </span>
            <div className="space-y-3">
              {/* Club Email */}
              <a
                href={`mailto:${CLUB_EMAIL}`}
                className="flex items-center gap-3 text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/20 transition-colors">
                  <Mail className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-mono text-[var(--muted)] block leading-tight">Email</span>
                  <span className="font-mono text-sm font-semibold">{CLUB_EMAIL}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/brushandbond.gcect/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/20 transition-colors">
                  <InstagramIcon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-mono text-[var(--muted)] block leading-tight">Instagram</span>
                  <span className="font-mono text-sm font-semibold">@brushandbond.gcect</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/brush-and-bond"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/20 transition-colors">
                  <LinkedinIcon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-mono text-[var(--muted)] block leading-tight">LinkedIn</span>
                  <span className="font-mono text-sm font-semibold">Brush and Bond</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Embedded Map — Full width below the form */}
      {/* ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="border-b border-[var(--line)] pb-3">
          <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold tracking-wider">
            Find us
          </span>
          <h2 className="section-title text-[var(--ink)]">
            Campus map
          </h2>
        </div>

        <div className="relative w-full rounded-[6px] overflow-hidden border border-[var(--line)] bg-[var(--surface)]" style={{ paddingBottom: '40%', minHeight: '320px' }}>
          <iframe
            title="GCECT Campus Location — Brush and Bond"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.2159286744687!2d88.38500251496082!3d22.564678985179455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027690e5e20e97%3A0xde70ae2ae29bd960!2sGovernment%20College%20of%20Engineering%20and%20Ceramic%20Technology!5e0!3m2!1sen!2sin!4v1697000000000!5m2!1sen!2sin"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0, filter: 'grayscale(0.15) contrast(1.05)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="text-xs font-mono text-[var(--muted)] text-center">
          73, Abinash Chandra Banerjee Lane, Beliaghata, Kolkata 700010 &nbsp;·&nbsp; Near Phoolbagan Metro (Green Line)
        </p>
      </section>
    </div>
    </>
  );
};
