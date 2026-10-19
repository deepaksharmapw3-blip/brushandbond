import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Scroll detection for hairline border that appears only after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Main navigation links specified: Gallery, Events, Artists, About, Team
  const navLinks = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Events', path: '/events' },
    { label: 'Artists', path: '/artists' },
    { label: 'About', path: '/about' },
    { label: 'Team', path: '/team' },
  ];

  const isRouteActive = (path: string) => {
    if (path === '/gallery') {
      return (
        location.pathname === '/gallery' ||
        location.pathname.startsWith('/gallery/') ||
        location.pathname.startsWith('/canvas')
      );
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-[var(--paper)] transition-all duration-200 ${
          isScrolled
            ? 'border-b border-[var(--line)] shadow-xs'
            : 'border-b border-transparent'
        }`}
      >
        <div className="gallery-container h-20 flex items-center justify-between">
          {/* Left: Wordmark "Brush and Bond" */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Brush and Bond Homepage"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block transition-transform duration-300 group-hover:scale-125" />
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Brush and Bond
            </span>
          </Link>

          {/* Center or Right: Gallery, Events, Artists, About, Team, Join (small primary button), Theme Toggle */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-7 text-sm font-medium" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isRouteActive(link.path);
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
                    <span>{link.label}</span>
                    {active && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 pl-2 border-l border-[var(--line)]">
              {/* Join as small primary button */}
              <Button
                to="/join"
                variant="primary"
                size="sm"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Join
              </Button>

              {/* Theme toggle */}
              <ThemeToggle size="md" />
            </div>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle size="md" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center border border-[var(--line)] text-[var(--ink)] rounded-full hover:border-[var(--ink)] transition-colors focus:outline-none"
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: Full-screen sheet menu with large type links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between p-6 sm:p-10 lg:hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Top Bar: Wordmark and Close Button */}
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-5 shrink-0">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Brush and Bond
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center border border-[var(--line)] text-[var(--ink)] rounded-full hover:border-[var(--ink)] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Large Type Links with Staggered Entrance */}
            <div className="py-8 sm:py-12 space-y-4 my-auto">
              <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block mb-2">
                Navigation
              </span>

              <nav className="flex flex-col space-y-3">
                {navLinks.map((link, idx) => {
                  const active = isRouteActive(link.path);
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center justify-between py-1 transition-colors ${
                          active
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--ink)] hover:text-[var(--accent)]'
                        }`}
                      >
                        <span>{link.label}</span>
                        {active && (
                          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase">
                            Current
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Controls: Join Button, Tagline & Details */}
            <div className="pt-6 border-t border-[var(--line)] space-y-5 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <Button
                  to="/join"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Join the club
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                <span>Creativity • Expression • Community</span>
                <span>Studio 204 • GCECT</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
