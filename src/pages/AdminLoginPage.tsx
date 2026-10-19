import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Mail, LogIn } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAdminAuth();

  const [email, setEmail] = useState('admin@gcectart.club');
  const [password, setPassword] = useState('Admin@ArtClub2026');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsSubmitting(true);

    try {
      await login(demoEmail, demoPassword);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin mx-auto" />
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Admin Login"
        description="Brush and Bond admin panel login"
        canonicalPath="/admin/login"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--paper)] to-[var(--surface)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Studio Admin</h1>
            <p className="text-sm text-[var(--muted)] mt-2">Brush and Bond Executive Portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[var(--muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--accent)] text-[var(--on-accent)] py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="border-t border-[var(--line)] pt-6">
            <p className="text-xs text-[var(--muted)] mb-3 text-center font-medium">GCECT ART CLUB ADMIN</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@gcectart.club', 'Admin@ArtClub2026')}
                disabled={isSubmitting}
                className="w-full text-left p-3 bg-[var(--surface)] border border-[var(--line)] rounded-lg hover:border-[var(--accent)] transition-colors disabled:opacity-50 text-sm"
              >
                <p className="font-medium text-[var(--ink)]">GCECT Art Club Admin</p>
                <p className="text-[var(--muted)] text-xs">admin@gcectart.club (Click to autofill & sign in)</p>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-[var(--muted)] text-center mt-6">
            This is a development login interface. Real authentication will use Supabase Auth.
          </p>
        </motion.div>
      </div>
    </>
  );
};
