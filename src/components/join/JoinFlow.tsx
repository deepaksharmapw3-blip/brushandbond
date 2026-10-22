import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Sparkles, Layers, Palette, Flame, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MembershipPayload } from '../../types';
import { useGallery } from '../../context/GalleryContext';
import { useToast } from '../../context/ToastContext';

export const JoinFlow: React.FC = () => {
  const { submitMembership } = useGallery();
  const { showSuccess, showWarning } = useToast();

  const [form, setForm] = useState<MembershipPayload>({
    fullName: '',
    email: '',
    rollNumber: '',
    department: 'Ceramic Technology',
    yearOfStudy: '1st Year',
    primaryWing: 'Fine Arts & Canvas',
    experienceSummary: '',
    portfolioUrl: '',
    motivation: '',
  });

  const [submittedCandidateId, setSubmittedCandidateId] = useState<string | null>(null);

  const wings: Array<{
    name: MembershipPayload['primaryWing'];
    icon: typeof Palette;
    desc: string;
  }> = [
    {
      name: 'Fine Arts & Canvas',
      icon: Palette,
      desc: 'Oil on linen, watercolor washes, graphite, charcoal and mixed media.',
    },
    {
      name: 'Ceramic & Terracotta',
      icon: Flame,
      desc: 'Wheel throwing, Raku kiln reduction, slip casting and glaze chemistry.',
    },
    {
      name: 'Digital & Illustration',
      icon: Terminal,
      desc: 'Concept art, 3D sculpting in Blender, poster design and generative coding.',
    },
    {
      name: 'Curatorial & Documentation',
      icon: Layers,
      desc: 'The Canvas archive cataloging, exhibition design and critical essays.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitMembership(form);
      if (!res.success) return;
      setSubmittedCandidateId(res.applicantId);
      showSuccess('Portfolio Application Submitted', `Your candidate reference ${res.applicantId} has been filed for Studio 204 intake.`);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#2F3CFF', '#15130F', '#F5F1EA'],
        });
      } catch {
        // fallback
      }
    } catch (error) {
      showWarning('Application not submitted', error instanceof Error ? error.message : 'Could not save your application. Please try again.');
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="gallery-container">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <h2 className="section-title text-[var(--ink)]">
            Join the club
          </h2>
          <p className="text-xs font-mono text-[var(--muted)]">
            Creativity • Expression • Community
          </p>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-[65ch] mx-auto">
            Pick a wing that interests you, tell us what you'd like to make, and come down to Studio 204. No experience required.
          </p>
        </div>

        {submittedCandidateId ? (
          /* Confirmation State with Membership Card Preview */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-8 sm:p-10 text-center space-y-8 shadow-lg"
          >
            <div className="inline-flex p-3 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="h3-title text-[var(--ink)]">
                Application received
              </h3>
              <p className="text-base text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                Welcome, {form.fullName}! We meet every Tuesday at 4:30 PM in Studio 204. Drop in to meet everyone and pick up your locker key.
              </p>
            </div>

            {/* Candidate studio identification badge */}
            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-6 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div>
                  <span className="text-[10px] font-mono text-[var(--muted)] block">
                    Brush and Bond
                  </span>
                  <span className="font-display text-lg font-bold text-[var(--ink)]">
                    Member card
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                  {submittedCandidateId}
                </span>
              </div>

              <div className="py-4 grid grid-cols-2 gap-3 text-xs font-mono text-[var(--ink)]">
                <div>
                  <span className="text-[var(--muted)] block">Applicant</span>
                  <span className="font-medium">{form.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Department</span>
                  <span className="font-medium">{form.department}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Primary Wing</span>
                  <span className="font-medium text-[var(--accent)]">{form.primaryWing}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Status</span>
                  <span className="font-medium">Portfolio under review</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] text-[11px] font-mono text-[var(--muted)]">
                Next Studio Gathering: Tuesday 5:15 PM • Ceramic Block Studio 204
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubmittedCandidateId(null)}
                className="btn-primary"
              >
                Submit another application
              </button>
            </div>
          </motion.div>
        ) : (
          /* Application Form + Live Preview Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Wing selection cards */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-3">
                    Select your artistic wing *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wings.map((w) => {
                      const Icon = w.icon;
                      const isSelected = form.primaryWing === w.name;
                      return (
                        <div
                          key={w.name}
                          onClick={() => setForm({ ...form, primaryWing: w.name })}
                          className={`p-4 border rounded-[6px] cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]'
                              : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                            <span className="font-display text-sm font-semibold text-[var(--ink)]">
                              {w.name}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--muted)] leading-normal">
                            {w.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Identity fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Sagnik Sen"
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                      Official GCECT email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="sagnik.sen@gcect.ac.in"
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                      Department *
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value as MembershipPayload['department'] })
                      }
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option value="Ceramic Technology">Ceramic Technology</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                      Year *
                    </label>
                    <select
                      value={form.yearOfStudy}
                      onChange={(e) =>
                        setForm({ ...form, yearOfStudy: e.target.value as MembershipPayload['yearOfStudy'] })
                      }
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                      Roll number *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.rollNumber}
                      onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                      placeholder="e.g. 10400124018"
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>

                {/* Portfolio & Practice */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Portfolio / Drive link / Instagram handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.portfolioUrl}
                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                    placeholder="https://instagram.com/myart or Google Drive link"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Describe your artistic background or what you want to explore *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.experienceSummary}
                    onChange={(e) => setForm({ ...form, experienceSummary: e.target.value })}
                    placeholder="e.g. I work primarily with ballpoint pens and watercolours, but I want to learn ceramic wheel throwing and contribute to campus exhibition curation..."
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    What does "Creativity Connects" mean to you? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    placeholder="A brief sentence on why you want to join Brush and Bond..."
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-base"
                  >
                    <span>Join the club</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-[var(--muted)] text-center mt-3 font-mono">
                    Applications reviewed weekly. Everyone is welcome.
                  </p>
                </div>
              </form>
            </div>

            {/* Live Studio Dossier Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 relative">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time member preview</span>
                </div>

                <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[6px] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-[var(--line)] pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--muted)] block">
                        Brush and Bond
                      </span>
                      <h4 className="font-display text-xl font-bold text-[var(--ink)]">
                        {form.fullName || 'Candidate Name'}
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-0.5 rounded-full">
                      Batch of 2026
                    </span>
                  </div>

                  <div className="text-xs font-mono space-y-2 text-[var(--muted)]">
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span className="text-[var(--ink)] font-medium">
                        {form.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wing:</span>
                      <span className="text-[var(--accent)] font-medium">
                        {form.primaryWing}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year:</span>
                      <span className="text-[var(--ink)]">
                        {form.yearOfStudy}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--line)]">
                    <p className="text-xs italic text-[var(--ink)]/80 line-clamp-3">
                      &ldquo;{form.motivation || 'Creativity connects our analytical thinking with human touch.'}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
                  <p className="font-semibold text-[var(--ink)] mb-1">
                    What happens next?
                  </p>
                  <p>
                    1. You'll receive a confirmation dispatch.
                  </p>
                  <p>
                    2. Come down to Studio 204 during Tuesday open hours to meet the core team and collect your studio locker key.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
