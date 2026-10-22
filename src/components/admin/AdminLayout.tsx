import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Image,
  Users,
  UserCheck,
  Bell,
  Mail,
  Palette,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
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
  { label: 'Upload / Gallery', icon: Image, path: '/admin/gallery', section: 'gallery' },
  { label: 'Manage Events', icon: Calendar, path: '/admin/events', section: 'events' },
  { label: 'Manage Artists', icon: Palette, path: '/admin/artists', section: 'artists' },
  { label: 'Manage Team', icon: Users, path: '/admin/team', section: 'team' },
  { label: 'Manage Applications', icon: UserCheck, path: '/admin/members', section: 'members' },
  { label: 'Contact Messages', icon: Mail, path: '/admin/messages', section: 'messages' },
  { label: 'Announcements', icon: Bell, path: '/admin/announcements', section: 'announcements' },
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
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 lg:hidden z-40 transition-opacity"
        />
      )}

      {/* Sidebar - Always visible on desktop (lg:translate-x-0), toggled on mobile */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white tracking-wide">
              ADMIN PANEL
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-500 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-900 dark:text-white p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white hidden sm:block">
              GCECT Art Club — Executive Management
            </h2>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-none mt-1">{user?.email || 'admin@brushandbond.local'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden py-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/"
                    className="w-full text-left px-3 py-2 text-xs text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Public Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-white dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};
