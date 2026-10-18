import React, { useState } from 'react';
import { Mail, MapPin, Clock, Camera, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Ceramic Technology',
    subject: 'General Studio Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess(
      'Message dispatched to Studio 204',
      'A curatorial coordinator will respond to your email within 24 to 48 hours.'
    );
  };

  return (
    <div className="gallery-container py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>STUDIO CORRESPONDENCE</span>
        </div>
        <h1 className="page-title text-[var(--ink)]">
          Contact
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          Have questions about the studio, want to acquire student artwork, or plan a cross-campus collaboration? Reach out below or drop by Studio 204.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Form */}
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
                Your message has been received by our student coordinators. We will reply to <strong className="text-[var(--ink)]">{formData.email}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    department: 'Ceramic Technology',
                    subject: 'General Studio Inquiry',
                    message: '',
                  });
                }}
                className="btn-secondary text-xs"
              >
                Send another dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Subhajit Roy"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gcect.ac.in"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Affiliation / Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Ceramic Technology">Ceramic Technology</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Faculty / Staff">Faculty / Staff Member</option>
                    <option value="Alumni">GCECT Alumni</option>
                    <option value="External Visitor">Visitor / Other College</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="General Studio Inquiry">General Studio Inquiry</option>
                    <option value="Artwork Acquisition & Purchase">Artwork Acquisition & Purchase</option>
                    <option value="Workshop & Event Proposal">Workshop & Event Proposal</option>
                    <option value="Inter-College Collaboration">Inter-College Collaboration</option>
                    <option value="Press & Media Inquiry">Press & Media Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you'd like to explore, build, or ask..."
                  className="w-full bg-[var(--paper)] border border-[var(--line)] p-4 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] resize-y"
                />
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto">
                <span>Send message to Studio 204</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Studio Directory & Directions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location Box */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
              <MapPin className="w-4 h-4" />
              <span>PHYSICAL SANCTUARY</span>
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
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
              <Clock className="w-4 h-4" />
              <span>OPEN VISITING HOURS</span>
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
                <span className="text-[var(--ink)] font-medium">Sunday & College Recess</span>
                <span className="font-mono text-xs text-[var(--muted)]">By appointment</span>
              </div>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-6 space-y-3">
            <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase">
              Direct Channels
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-[var(--ink)]">
                <Camera className="w-4 h-4 text-[var(--accent)]" />
                <span>Instagram: <strong className="font-mono">@brushandbond</strong></span>
              </div>
              <div className="flex items-center gap-3 text-[var(--ink)]">
                <Mail className="w-4 h-4 text-[var(--accent)]" />
                <span>Email: <strong className="font-mono">brushandbond@gcect.ac.in</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
