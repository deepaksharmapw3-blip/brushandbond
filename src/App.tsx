import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { GalleryProvider } from './context/GalleryContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ArtworkLightbox } from './components/gallery/ArtworkLightbox';
import { ScrollToTop } from './components/common/ScrollToTop';

import { lazy, Suspense } from 'react';
import { HomePage } from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const GalleryRouteHandler = lazy(() => import('./pages/GalleryRouteHandler').then(m => ({ default: m.GalleryRouteHandler })));
const CampusArtPage = lazy(() => import('./pages/CampusArtPage').then(m => ({ default: m.CampusArtPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage').then(m => ({ default: m.ArtistDetailPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const JoinPage = lazy(() => import('./pages/JoinPage').then(m => ({ default: m.JoinPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin" />
    <span className="text-xs font-mono text-[var(--muted)]">Accessioning gallery...</span>
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <GalleryProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Home */}
                    <Route path="/" element={<HomePage />} />

                    {/* About */}
                    <Route path="/about" element={<AboutPage />} />

                    {/* Gallery & Campus Art routes */}
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/gallery/campus-art" element={<CampusArtPage />} />
                    <Route path="/gallery/:param" element={<GalleryRouteHandler />} />
                    {/* Backward-compatible alias for /canvas */}
                    <Route path="/canvas" element={<Navigate to="/gallery" replace />} />
                    <Route path="/canvas/campus-art" element={<CampusArtPage />} />
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
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* Friendly 404 Catch-All */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <ArtworkLightbox />
            </div>
          </Router>
        </GalleryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
