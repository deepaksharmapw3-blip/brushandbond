import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Image,
  Users,
  UserCheck,
  Bell,
  TrendingUp,
  Palette,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', section: 'dashboard' },
  { label: 'Events', icon: Calendar, path: '/admin/events', section: 'events' },
  { label: 'Gallery', icon: Image, path: '/admin/gallery', section: 'gallery' },
  { label: 'Artists', icon: Palette, path: '/admin/artists', section: 'artists' },
  { label: 'Members', icon: Users, path: '/admin/members', section: 'members' },
  { label: 'Announcements', icon: Bell, path: '/admin/announcements', section: 'announcements' },
  { label: 'Achievements', icon: UserCheck, path: '/admin/achievements', section: 'achievements' },
  { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics', section: 'analytics' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-[var(--paper)]">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 lg:hidden z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col z-50 lg:relative lg:translate-x-0"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--line)]">
          <h1 className="font-display font-bold text-sm text-[var(--ink)]">Studio</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.section}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[var(--line)] p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-20 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-[var(--ink)]"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* User Menu */}
          <div className="ml-auto relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--paper)] transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full bg-[var(--line)]"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[var(--ink)]">{user?.name}</p>
                <p className="text-xs text-[var(--muted)]">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[var(--line)]">
                    <p className="text-xs text-[var(--muted)]">Signed in as</p>
                    <p className="text-sm font-medium text-[var(--ink)]">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
