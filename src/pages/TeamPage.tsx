import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import {
  ArrowRight,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { mockTeamMembers, mockActiveMembers } from '../data/mockData';
import type { TeamMember, ActiveMember } from '../types';
import type { Easing } from 'framer-motion';
import { teamApi } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

// ── Inline SVG brand icons (lucide-react doesn't ship brand icons) ──
const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ── Initials Avatar Fallback ──
const InitialsAvatar: React.FC<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Generate a consistent colour from the name
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const sizeClasses =
    size === 'lg'
      ? 'w-full h-full text-3xl sm:text-4xl'
      : size === 'md'
      ? 'w-20 h-20 text-xl'
      : 'w-10 h-10 sm:w-12 sm:h-12 text-sm';

  return (
    <div
      className={`${sizeClasses} rounded-[4px] flex items-center justify-center font-display font-bold select-none shrink-0`}
      style={{
        backgroundColor: `hsl(${hue}, 45%, 88%)`,
        color: `hsl(${hue}, 55%, 35%)`,
      }}
    >
      {initials}
    </div>
  );
};

// ── Social Link Icons ──
const SocialIcons: React.FC<{
  instagramUrl?: string;
  linkedinUrl?: string;
  size?: number;
}> = ({ instagramUrl, linkedinUrl, size = 16 }) => {
  if (!instagramUrl && !linkedinUrl) return null;
  return (
    <div className="flex items-center gap-2">
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          aria-label="Instagram profile"
        >
          <InstagramIcon size={size} />
        </a>
      )}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          aria-label="LinkedIn profile"
        >
          <LinkedinIcon size={size} />
        </a>
      )}
    </div>
  );
};

// ── Year filter tabs ──
type YearFilter = 'All' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export const TeamPage: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [teamList, setTeamList] = useState<TeamMember[]>(mockTeamMembers);
  const [activeList, setActiveList] = useState<ActiveMember[]>(mockActiveMembers);

  useEffect(() => {
    const fetchLiveTeam = async () => {
      try {
        const res = await teamApi.getAll();
        if (res.success && Array.isArray(res.team) && res.team.length > 0) {
          const liveMembers: TeamMember[] = [];
          const liveActives: ActiveMember[] = [];

          res.team.forEach((m: any) => {
            const tier = (m.tier || 'executive').toLowerCase();
            if (tier === 'member') {
              liveActives.push({
                id: `am-${m.id}`,
                name: m.name,
                department: m.department || 'Ceramic Technology',
                year: (m.year as any) || '1st Year',
                specialty: m.specialty || m.role || 'Fine Arts',
                avatarUrl: m.avatarUrl || undefined,
                instagramUrl: m.instagramUrl || undefined,
                linkedinUrl: m.linkedinUrl || undefined,
              });
            } else {
              const respArray = Array.isArray(m.responsibilities)
                ? m.responsibilities.map((s: unknown) => String(s).trim()).filter(Boolean)
                : typeof m.responsibilities === 'string'
                  ? m.responsibilities.split(',').map((s: string) => s.trim()).filter(Boolean)
                  : [];
              liveMembers.push({
                id: `tm-${m.id}`,
                name: m.name,
                slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                role: m.role,
                department: m.department || 'GCECT',
                batch: m.year || (tier === 'faculty' ? 'Faculty Advisor' : 'Batch of 2026'),
                tier: (tier === 'faculty' || tier === 'lead') ? tier : 'executive',
                bio: m.bio || '',
                quote: m.quote || undefined,
                avatarUrl: m.avatarUrl || undefined,
                instagramUrl: m.instagramUrl || undefined,
                linkedinUrl: m.linkedinUrl || undefined,
                responsibilities: respArray,
              });
            }
          });

          if (liveMembers.length > 0) setTeamList(liveMembers);
          if (liveActives.length > 0) setActiveList(liveActives);
        }
      } catch (e) {
        console.warn('Using default team data:', e);
      }
    };

    fetchLiveTeam();
  }, []);

  const faculty = teamList.filter((m) => m.tier === 'faculty');
  const executives = teamList.filter((m) => m.tier === 'executive');
  const leads = teamList.filter((m) => m.tier === 'lead');

  const [yearFilter, setYearFilter] = useState<YearFilter>('All');
  const yearOptions: YearFilter[] = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  const filteredMembers: ActiveMember[] = useMemo(() => {
    if (yearFilter === 'All') return activeList;
    return activeList.filter((m) => m.year === yearFilter);
  }, [yearFilter, activeList]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06 },
    },
  };

  const easeOut: Easing = [0, 0, 0.2, 1];
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  };

  return (
    <>
      <SEO
        title="Team"
        description="Meet the leadership and executive team behind Brush and Bond. Learn about the students and faculty driving the art club's mission at GCECT."
        canonicalPath="/team"
      />
    <div className="gallery-container py-10 sm:py-16 space-y-20">

      {/* Admin Mode Shortcut Banner */}
      {isAuthenticated && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--surface)] border border-[var(--accent)]/50 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin Mode: You have full access to manage and update the team roster.</span>
          </div>
          <Link
            to="/admin/team"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90 transition-opacity shrink-0"
          >
            <span>Manage Team (Admin)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* Page Header */}
      {/* ────────────────────────────────────────────────── */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Studio 204 stewardship</span>
        </div>
        <h1 className="page-title text-[var(--ink)]">
          Meet the team
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed max-w-[65ch] font-sans">
          The students and faculty mentors who keep Studio 204 alive — curating gallery walls, coordinating weekly sketch crawls, managing kiln schedules, and welcoming new members.
        </p>
      </header>

      {/* ────────────────────────────────────────────────── */}
      {/* Faculty Patron — full-width highlight */}
      {/* ────────────────────────────────────────────────── */}
      {faculty.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
              Faculty Mentorship
            </span>
            <h2 className="section-title text-[var(--ink)]">
              Chief patron &amp; advisor
            </h2>
          </div>

          {faculty.map((member) => (
            <div
              key={member.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-3 aspect-square rounded-[4px] overflow-hidden border border-[var(--line)] bg-[var(--paper)]">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <InitialsAvatar name={member.name} size="lg" />
                )}
              </div>
              <div className="md:col-span-9 space-y-4">
                <div>
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold block">
                    {member.role}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono text-[var(--muted)]">
                    {member.department} • {member.batch}
                  </p>
                </div>

                {member.quote && (
                  <blockquote className="font-display text-lg text-[var(--ink)] border-l-2 border-[var(--accent)] pl-4 py-1 italic">
                    &ldquo;{member.quote}&rdquo;
                  </blockquote>
                )}

                <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
                  {member.bio}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {member.responsibilities.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-3 py-1 bg-[var(--paper)] border border-[var(--line)] rounded-full text-[var(--ink)]"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* Executive Team Grid — LARGER CARDS */}
      {/* ────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="border-b border-[var(--line)] pb-3">
          <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
            Executive Committee
          </span>
          <h2 className="section-title text-[var(--ink)]">
            Club leadership
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {executives.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              className="group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-5 sm:p-6 flex flex-col justify-between space-y-5 hover:border-[var(--ink)]/40 hover:shadow-md transition-all duration-300"
            >
              {/* Top: Avatar + Name */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-[4px] overflow-hidden border border-[var(--line)] shrink-0 bg-[var(--paper)]">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <InitialsAvatar name={member.name} size="md" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-[var(--accent)] font-semibold block leading-tight uppercase tracking-wider">
                      {member.role}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] leading-tight mt-0.5">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
                      {member.department} • {member.batch}
                    </p>
                  </div>
                </div>

                {member.quote && (
                  <blockquote className="text-sm text-[var(--ink)] border-l-2 border-[var(--accent)] pl-3.5 italic leading-snug font-display">
                    &ldquo;{member.quote}&rdquo;
                  </blockquote>
                )}

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-sans">
                  {member.bio}
                </p>

                {/* Responsibility chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {member.responsibilities.map((r, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2.5 py-1 bg-[var(--paper)] border border-[var(--line)] rounded-full text-[var(--ink)]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Socials + Portfolio link */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SocialIcons
                    instagramUrl={member.instagramUrl}
                    linkedinUrl={member.linkedinUrl}
                    size={16}
                  />
                  {member.handle && !member.instagramUrl && !member.linkedinUrl && (
                    <span className="text-xs font-mono text-[var(--muted)]">{member.handle}</span>
                  )}
                </div>
                <Link
                  to={`/artists/${member.slug}`}
                  className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────── */}
      {/* Domain / Wing Leads */}
      {/* ────────────────────────────────────────────────── */}
      {leads.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
              Wing Coordinators
            </span>
            <h2 className="section-title text-[var(--ink)]">
              Domain &amp; studio leads
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {leads.map((member) => (
              <div
                key={member.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-4 sm:p-6 flex flex-col justify-between space-y-4 hover:border-[var(--ink)]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-[4px] overflow-hidden border border-[var(--line)] shrink-0 bg-[var(--paper)]">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <InitialsAvatar name={member.name} size="md" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-[var(--accent)] font-semibold block leading-tight">
                        {member.role}
                      </span>
                      <h4 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">
                        {member.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[var(--muted)]">
                        {member.department}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed font-sans hidden sm:block">
                    {member.bio}
                  </p>

                  <div className="pt-1 hidden sm:block">
                    <div className="flex flex-wrap gap-1">
                      {member.responsibilities.map((r, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 bg-[var(--paper)] border border-[var(--line)] rounded-full text-[var(--muted)]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                  <SocialIcons
                    instagramUrl={member.instagramUrl}
                    linkedinUrl={member.linkedinUrl}
                    size={14}
                  />
                  <Link
                    to={`/artists/${member.slug}`}
                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 ml-auto"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* Active Members — smaller grid, filterable by year */}
      {/* ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="border-b border-[var(--line)] pb-3">
          <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
            Community
          </span>
          <h2 className="section-title text-[var(--ink)]">
            Active members
          </h2>
          <p className="text-sm text-[var(--muted)] mt-2 font-sans">
            {activeList.length} students across Ceramic Tech, CSE, and IT who shape Studio 204 every week.
          </p>
        </div>

        {/* Year filter chips */}
        <div className="flex flex-wrap gap-2">
          {yearOptions.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setYearFilter(yr)}
              className={`filter-chip text-xs ${
                yearFilter === yr ? 'active' : ''
              }`}
            >
              {yr}
              {yr !== 'All' && (
                <span className="ml-1.5 font-mono text-[11px] opacity-70">
                  ({activeList.filter((m) => m.year === yr).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Member grid — 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <motion.div
          key={yearFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              className="group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-3 sm:p-4 flex items-start gap-3 hover:border-[var(--ink)]/30 transition-colors"
            >
              {/* Initials badge */}
              <InitialsAvatar name={member.name} size="sm" />

              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm font-bold text-[var(--ink)] truncate leading-tight">
                  {member.name}
                </h4>
                <p className="text-[11px] font-mono text-[var(--accent)] leading-snug truncate">
                  {member.specialty}
                </p>
                <p className="text-[10px] font-mono text-[var(--muted)] mt-0.5 truncate">
                  {member.department.replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Ceramic Technology', 'CT')} • {member.year}
                </p>

                {/* Social links */}
                {member.instagramUrl && (
                  <a
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--muted)] hover:text-[var(--accent)] mt-1 transition-colors"
                  >
                    <InstagramIcon size={12} />
                    <span className="hidden sm:inline">Instagram</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--muted)] font-mono">
              No active members in {yearFilter} yet.
            </p>
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────── */}
      {/* Recruitment CTA Banner */}
      {/* ────────────────────────────────────────────────── */}
      <div className="border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12 rounded-[6px] text-center space-y-4">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
          Want to lead a wing in the upcoming semester?
        </h3>
        <p className="text-sm text-[var(--muted)] max-w-lg mx-auto font-sans">
          Junior coordinators and wing assistants are recruited every semester. Whether you love photography, pottery logistics, or website code, we'd love to work with you.
        </p>
        <div className="pt-2">
          <Link to="/join" className="btn-primary inline-flex">
            <span>Apply for club membership</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};
