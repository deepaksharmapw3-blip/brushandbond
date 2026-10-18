import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Palette, Calendar, Users, Trophy, Mail, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const quickLinks = [
    { label: 'The GCECT Canvas', path: '/gallery', icon: <Palette className="w-4 h-4 text-[var(--accent)]" /> },
    { label: 'Events and Salons', path: '/events', icon: <Calendar className="w-4 h-4 text-[var(--accent)]" /> },
    { label: 'Student Artists', path: '/artists', icon: <Users className="w-4 h-4 text-[var(--accent)]" /> },
    { label: 'Club Achievements', path: '/achievements', icon: <Trophy className="w-4 h-4 text-[var(--accent)]" /> },
    { label: 'About the Club', path: '/about', icon: <Sparkles className="w-4 h-4 text-[var(--accent)]" /> },
    { label: 'Studio Contact', path: '/contact', icon: <Mail className="w-4 h-4 text-[var(--accent)]" /> },
  ];

  return (
    <div className="gallery-container py-20 sm:py-28 text-center space-y-8">
      <div className="inline-flex p-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono text-[var(--accent)] tracking-wider block font-semibold uppercase">
          404 — Friendly Page Not Found
        </span>
        <h1 className="page-title text-[var(--ink)]">
          A blank canvas where a masterpiece was expected
        </h1>
        <p className="text-base text-[var(--muted)] max-w-lg mx-auto leading-relaxed font-sans">
          The link you followed may be broken or the piece has been moved in our campus archives. Here are helpful pathways across Brush and Bond:
        </p>
      </div>

      {/* Directory Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
        {quickLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[6px] hover:border-[var(--ink)] transition-colors space-y-1 group"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="font-display font-bold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                {item.label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--muted)] block">
              {item.path}
            </span>
          </Link>
        ))}
      </div>

      <div className="pt-4 flex justify-center gap-4">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link to="/gallery" className="btn-secondary">
          <span>Explore The Canvas</span>
        </Link>
      </div>
    </div>
  );
};
