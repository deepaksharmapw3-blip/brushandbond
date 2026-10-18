import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { GalleryProvider } from './context/GalleryContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ArtworkLightbox } from './components/gallery/ArtworkLightbox';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { GalleryRouteHandler } from './pages/GalleryRouteHandler';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { TeamPage } from './pages/TeamPage';
import { JoinPage } from './pages/JoinPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
                <Routes>
                  {/* Home */}
                  <Route path="/" element={<HomePage />} />

                  {/* About */}
                  <Route path="/about" element={<AboutPage />} />

                  {/* Gallery routes */}
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/gallery/:param" element={<GalleryRouteHandler />} />
                  {/* Backward-compatible alias for /canvas */}
                  <Route path="/canvas" element={<Navigate to="/gallery" replace />} />
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
