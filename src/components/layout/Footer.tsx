import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const { showSuccess } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setSubscribed(true);
    showSuccess('Subscribed to Studio Dispatches', 'You will receive private previews and salon invitations.');
    setEmailInput('');
  };

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] transition-colors mt-24">
      <div className="gallery-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Identity & manifesto */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />
              <span className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                Brush and Bond
              </span>
            </div>
            <p className="font-display text-xl text-[var(--ink)] font-bold">
              Creativity Connects.
            </p>
            <p className="text-xs font-mono text-[var(--accent)] font-semibold">
              Creativity • Expression • Community
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[65ch]">
              The official art club of GCECT, established in 2024. Fusing 80 years of ceramic engineering craftsmanship with modern canvas, code, and sculpture.
            </p>
            <div className="pt-2 text-xs font-mono text-[var(--muted)] flex flex-col gap-1">
              <span>Instagram: <strong className="text-[var(--accent)] font-semibold">@brushandbond</strong></span>
              <span>Studio 204 • Ceramic Engineering Block • Beliaghata Campus</span>
            </div>
          </div>

          {/* Directory: Explore */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display text-base font-bold text-[var(--ink)]">
              Canvas & Salons
            </h4>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-sans">
              <li>
                <Link to="/gallery" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>The Canvas</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/gallery/paintings" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Paintings</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/gallery/sketches" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Sketches</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/gallery/digital-art" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Digital Art</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Salons & Events</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory: Collective */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display text-base font-bold text-[var(--ink)]">
              Collective
            </h4>
            <ul className="space-y-2 text-sm text-[var(--muted)] font-sans">
              <li>
                <Link to="/about" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>About</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/artists" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Artist Spotlight</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Achievements</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Team</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Join the Club</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--accent)] transition-colors flex items-center justify-between group">
                  <span>Contact</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio dispatches newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display text-base font-bold text-[var(--ink)]">
              Studio Dispatches
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[65ch]">
              Drop your email to get studio open hours, sketch walk invites, and exhibition dates. No spam, ever.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="student@gcect.ac.in"
                  required
                  className="flex-1 bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="btn-primary shrink-0"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-[var(--accent)] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>You're subscribed! See you in the studio.</span>
                </p>
              )}
            </form>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Curator Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--muted)]">
          <div>
            © {new Date().getFullYear()} Brush and Bond. Government College of Engineering and Ceramic Technology.
          </div>
          <div className="flex items-center gap-6">
            <span>Autonomous Institution • NAAC Accredited</span>
            <span className="text-[var(--accent)]">•</span>
            <span>All Artworks Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
