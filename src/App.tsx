import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { GalleryProvider } from './context/GalleryContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { useGallery } from './context/GalleryContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ArtworkLightbox } from './components/gallery/ArtworkLightbox';
import { ScrollToTop } from './components/common/ScrollToTop';
import { CampusArtPage } from './pages/CampusArtPage';

import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { HomePage } from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const GalleryRouteHandler = lazy(() => import('./pages/GalleryRouteHandler').then(m => ({ default: m.GalleryRouteHandler })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage').then(m => ({ default: m.ArtistDetailPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const JoinPage = lazy(() => import('./pages/JoinPage').then(m => ({ default: m.JoinPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// Real Admin Pages with full backend capabilities
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage').then(m => ({ default: m.AdminEventsPage })));
const AdminGalleryPage = lazy(() => import('./pages/AdminGalleryPage').then(m => ({ default: m.AdminGalleryPage })));
const AdminArtistsPage = lazy(() => import('./pages/AdminArtistsPage').then(m => ({ default: m.AdminArtistsPage })));
const AdminMembersPage = lazy(() => import('./pages/AdminApplicationsPage').then(m => ({ default: m.AdminApplicationsPage })));
const AdminTeamPage = lazy(() => import('./pages/AdminTeamPage').then(m => ({ default: m.AdminTeamPage })));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage').then(m => ({ default: m.AdminMessagesPage })));
const AdminAnnouncementsPage = lazy(() => import('./pages/AdminAnnouncementsPage').then(m => ({ default: m.AdminAnnouncementsPage })));
const AdminAchievementsPage = lazy(() => import('./pages/AdminAchievementsPage').then(m => ({ default: m.AdminAchievementsPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin" />
    <span className="text-xs font-mono text-[var(--muted)]">Accessioning gallery...</span>
  </div>
);

class CampusArchiveErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Campus art archive failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="gallery-container py-24 text-center" role="alert">
          <h1 className="font-display text-3xl font-bold text-[var(--ink)]">
            The campus archive could not load
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Please try again. If the problem continues, return to the gallery and reopen the archive.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-primary" onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
            <a className="btn-secondary" href="/gallery">Return to gallery</a>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showPublicDataStatus = !location.pathname.startsWith('/admin');
  const { sharedDataError, isLoadingSharedData, retrySharedData } = useGallery();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] transition-colors duration-200">
      {/* Skip-to-main-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-[var(--on-accent)] focus:rounded-md focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Hide public Navbar & Footer on Admin pages to avoid double headers and give AdminLayout full canvas */}
      {!isAdminRoute && <Navbar />}

      {showPublicDataStatus && (sharedDataError || isLoadingSharedData) && (
        <div
          role={sharedDataError ? 'alert' : 'status'}
          aria-live="polite"
          className={`px-4 py-3 text-center text-sm ${sharedDataError ? 'bg-amber-50 text-amber-950 border-b border-amber-200' : 'bg-[var(--surface)] text-[var(--muted)] border-b border-[var(--line)]'}`}
        >
          {sharedDataError || 'Loading live site content…'}
          {sharedDataError && (
            <button
              type="button"
              onClick={retrySharedData}
              className="ml-3 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* About */}
            <Route path="/about" element={<AboutPage />} />

            {/* Gallery & Campus Art routes */}
            <Route path="/gallery" element={<GalleryPage />} />
            <Route
              path="/gallery/campus-art"
              element={<CampusArchiveErrorBoundary key={location.pathname}><CampusArtPage /></CampusArchiveErrorBoundary>}
            />
            <Route path="/gallery/:param" element={<GalleryRouteHandler />} />
            {/* Backward-compatible alias for /canvas */}
            <Route path="/canvas" element={<Navigate to="/gallery" replace />} />
            <Route
              path="/canvas/campus-art"
              element={<CampusArchiveErrorBoundary key={location.pathname}><CampusArtPage /></CampusArchiveErrorBoundary>}
            />
            <Route path="/canvas/:param" element={<GalleryRouteHandler />} />

            {/* Events routes */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />

            {/* Artists routes */}
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/artists/:slug" element={<ArtistDetailPage />} />

            {/* Achievements */}
            <Route path="/achievements" element={<AchievementsPage />} />

            {/* Team */}
            <Route path="/team" element={<TeamPage />} />

            {/* Join */}
            <Route path="/join" element={<JoinPage />} />

            {/* Contact */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="artists" element={<AdminArtistsPage />} />
              <Route path="team" element={<AdminTeamPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="achievements" element={<AdminAchievementsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>

            {/* Friendly 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
      <ArtworkLightbox />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <GalleryProvider>
          <AdminAuthProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </AdminAuthProvider>
        </GalleryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
