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

  const handleAutofill = (autofillEmail: string, autofillPass: string) => {
    setEmail(autofillEmail);
    setPassword(autofillPass);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 text-white mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Studio Admin</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Brush and Bond Executive Portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Autofill Credentials */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center font-medium">FIXED ADMIN CREDENTIALS (CLICK TO AUTOFILL)</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAutofill('admin@gcectart.club', 'Admin@ArtClub2026')}
                className="w-full text-left p-3 bg-white dark:bg-slate-800 border-2 border-blue-500/40 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 dark:text-white">GCECT Art Club Admin</p>
                  <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Fixed</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">admin@gcectart.club • Admin@ArtClub2026</p>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('admin@brushandbond.local', 'admin123')}
                className="w-full text-left p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm cursor-pointer"
              >
                <p className="font-medium text-slate-900 dark:text-white">Demo Admin Account</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs">admin@brushandbond.local • admin123</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
