import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { CLUB_EMAIL } from '../../lib/contact';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)] transition-colors mt-20 sm:mt-28">
      <div className="gallery-container py-14 sm:py-18">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Identity: Wordmark & Short Tagline */}
          <div className="md:col-span-5 space-y-3.5">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block transition-transform duration-300 group-hover:scale-125" />
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                Brush and Bond
              </span>
            </Link>

            <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[42ch]">
              Creativity • Expression • Community. The official art club of the Government College of Engineering and Ceramic Technology, fusing technical craftsmanship with modern visual expression.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <a
                href="https://www.instagram.com/brushandbond.gcect/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                aria-label="Instagram @brushandbond.gcect"
              >
                <InstagramIcon size={14} />
                <span>@brushandbond.gcect</span>
              </a>

              <span className="text-[var(--line)]">•</span>

              <a
                href={`mailto:${CLUB_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                aria-label="Email Brush and Bond"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{CLUB_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Three Link Columns: Explore, Club, Connect */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Explore */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-semibold">
                Explore
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--muted)] font-sans">
                <li>
                  <Link to="/gallery" className="hover:text-[var(--accent)] transition-colors block">
                    The Canvas
                  </Link>
                </li>
                <li>
                  <Link to="/gallery/campus-art" className="hover:text-[var(--accent)] transition-colors block">
                    Campus Art Archive
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-[var(--accent)] transition-colors block">
                    Events & Salons
                  </Link>
                </li>
                <li>
                  <Link to="/artists" className="hover:text-[var(--accent)] transition-colors block">
                    Artist Spotlight
                  </Link>
                </li>
                <li>
                  <Link to="/achievements" className="hover:text-[var(--accent)] transition-colors block">
                    Achievements
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Club */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-semibold">
                Club
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--muted)] font-sans">
                <li>
                  <Link to="/about" className="hover:text-[var(--accent)] transition-colors block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="hover:text-[var(--accent)] transition-colors block">
                    Team & Leads
                  </Link>
                </li>
                <li>
                  <Link to="/join" className="hover:text-[var(--accent)] transition-colors block">
                    Join the Club
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[var(--accent)] transition-colors block">
                    Contact & Visits
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-[var(--accent)] transition-colors text-xs font-mono text-[var(--muted)]">
                    Curator Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Connect */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-semibold">
                Connect
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--muted)] font-sans">
                <li>
                  <a
                    href="https://www.instagram.com/brushandbond.gcect/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Instagram</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CLUB_EMAIL}`}
                    className="hover:text-[var(--accent)] transition-colors block truncate"
                  >
                    Email
                  </a>
                </li>
                <li className="pt-1 text-xs font-mono text-[var(--muted)] flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>Studio 204, GCECT, Kolkata 700010</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quiet and Minimal Bottom Bar */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-[var(--line)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--muted)]">
          <div>
            © Brush and Bond, est. 2024.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Government College of Engineering and Ceramic Technology</span>
            <span className="text-[var(--accent)]">•</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
