import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const mainNavLinks = [
    { label: 'Canvas', path: '/gallery' },
    { label: 'Events', path: '/events' },
    { label: 'Artists', path: '/artists' },
    { label: 'About', path: '/about' },
    { label: 'Achievements', path: '/achievements' },
    { label: 'Team', path: '/team' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/gallery') {
      return location.pathname === '/gallery' || location.pathname.startsWith('/gallery/') || location.pathname === '/canvas';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--paper)]/90 border-b border-[var(--line)] transition-colors">
      <div className="gallery-container h-20 flex items-center justify-between">
        {/* Brand identity */}
        <Link
          to="/"
          className="group flex flex-col focus:outline-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block transition-transform group-hover:scale-125" />
            <span className="font-display text-2xl sm:text-3xl tracking-tight text-[var(--ink)] font-bold">
              Brush and Bond
            </span>
          </div>
          <span className="text-[12px] font-sans text-[var(--muted)] pl-5 -mt-0.5">
            Creativity • Expression • Community
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {mainNavLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 relative font-sans ${
                  active
                    ? 'text-[var(--accent)] font-semibold'
                    : 'text-[var(--ink)]/80 hover:text-[var(--accent)]'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action group */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Admin shortcut */}
          <Link
            to="/admin/login"
            className="hidden xl:inline-flex items-center gap-1 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] px-2.5 py-1.5 border border-[var(--line)] rounded-full transition-colors"
            title="Curator Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Admin</span>
          </Link>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors rounded-full"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--accent)]" /> : <Moon className="w-4 h-4 text-[var(--ink)]" />}
          </button>

          {/* Primary CTA pill */}
          <Link
            to="/join"
            className="hidden sm:inline-flex btn-primary"
          >
            <span>Join the club</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-[var(--line)] text-[var(--ink)] rounded-full"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--line)] bg-[var(--surface)] px-6 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <p className="text-xs font-mono text-[var(--accent)]">
            Creativity • Expression • Community
          </p>
          <div className="flex flex-col space-y-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-display py-1 flex items-center justify-between ${
                  isActive(link.path)
                    ? 'text-[var(--accent)] font-semibold'
                    : 'text-[var(--ink)]'
                }`}
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>
            ))}

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono text-[var(--muted)] py-2 flex items-center justify-between border-t border-[var(--line)] mt-2"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                <span>Admin Curator Login</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>

          <div className="pt-4 border-t border-[var(--line)]">
            <Link
              to="/join"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-primary justify-center"
            >
              <span>Join the club</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
