import React from 'react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Briefcase, Users, Bell, Award, TrendingUp } from 'lucide-react';

const PlaceholderSection: React.FC<{
  section: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, description, icon: Icon }) => (
  <AdminLayout>
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--paper)] mb-6">
        <Icon className="w-8 h-8 text-[var(--accent)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">{title}</h1>
      <p className="text-[var(--muted)] mb-6">{description}</p>
      <div className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-lg">
        <p className="text-sm text-[var(--muted)]">
          This section is ready for implementation. Mock data and UI components are in place.
        </p>
      </div>
    </div>
  </AdminLayout>
);

export const AdminArtistsPage: React.FC = () => (
  <ProtectedAdminRoute>
    <SEO title="Admin Artists" description="Manage artists" canonicalPath="/admin/artists" />
    <PlaceholderSection
      section="artists"
      title="Artists"
      description="Manage artist spotlights and profiles"
      icon={Briefcase}
    />
  </ProtectedAdminRoute>
);

export const AdminMembersPage: React.FC = () => (
  <ProtectedAdminRoute>
    <SEO title="Admin Members" description="Manage members" canonicalPath="/admin/members" />
    <PlaceholderSection
      section="members"
      title="Members"
      description="Review and manage member applications"
      icon={Users}
    />
  </ProtectedAdminRoute>
);

export const AdminAnnouncementsPage: React.FC = () => (
  <ProtectedAdminRoute>
    <SEO
      title="Admin Announcements"
      description="Manage announcements"
      canonicalPath="/admin/announcements"
    />
    <PlaceholderSection
      section="announcements"
      title="Announcements"
      description="Create and manage site-wide announcements"
      icon={Bell}
    />
  </ProtectedAdminRoute>
);

export const AdminAchievementsPage: React.FC = () => (
  <ProtectedAdminRoute>
    <SEO
      title="Admin Achievements"
      description="Manage achievements"
      canonicalPath="/admin/achievements"
    />
    <PlaceholderSection
      section="achievements"
      title="Achievements"
      description="Edit milestone numbers and achievement records"
      icon={Award}
    />
  </ProtectedAdminRoute>
);

export const AdminAnalyticsPage: React.FC = () => (
  <ProtectedAdminRoute>
    <SEO
      title="Admin Analytics"
      description="View analytics"
      canonicalPath="/admin/analytics"
    />
    <PlaceholderSection
      section="analytics"
      title="Analytics"
      description="View traffic, engagement, and registration metrics"
      icon={TrendingUp}
    />
  </ProtectedAdminRoute>
);
