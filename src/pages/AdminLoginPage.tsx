import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bb-admin-auth', 'true');
    showSuccess('Access Granted', 'Welcome to the Brush and Bond Curatorial Dashboard.');
    navigate('/admin');
  };

  const handleDemoLogin = () => {
    setEmail('curator@gcect.ac.in');
    setPasscode('GCECT-STUDIO-2024');
    localStorage.setItem('bb-admin-auth', 'true');
    showSuccess('Demo Access Granted', 'Logged in as Curatorial Lead (Executive Access).');
    navigate('/admin');
  };

  return (
    <div className="gallery-container py-16 sm:py-24 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-8 sm:p-10 shadow-sm space-y-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public site</span>
        </Link>

        {/* Brand Lock Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
            Executive Portal (UI Only)
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
            Studio Admin Login
          </h1>
          <p className="text-xs text-[var(--muted)] font-sans">
            Curatorial management for The GCECT Canvas archive, submissions review, and salon planning.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--ink)] font-semibold block">
              Curator Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@gcect.ac.in"
              className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-[var(--ink)] font-semibold">
                Studio Passcode
              </label>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                Default: GCECT-STUDIO-2024
              </span>
            </div>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[var(--paper)] border border-[var(--line)] px-4 py-2.5 rounded-[6px] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            <span>Sign in to dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="pt-4 border-t border-[var(--line)] space-y-3">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full btn-secondary text-xs justify-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Instant Demo Access (1-Click)</span>
          </button>
          <p className="text-[11px] text-center text-[var(--muted)] font-mono">
            Demo credentials are fully simulated client-side.
          </p>
        </div>
      </div>
    </div>
  );
};
