import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { TeamMemberAvatar } from '../components/common/TeamMemberAvatar';
import { teamApi } from '../services/api';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const TeamMemberProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [member, setMember] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void teamApi.getAll().then((result) => {
      const match = result.team?.find((item: any) =>
        slugify(item.slug || '') === slug || slugify(item.name || '') === slug || String(item.id) === slug
      );
      if (active) setMember(match ?? null);
    }).catch(() => {
      if (active) setLoadFailed(true);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  if (isLoading) {
    return <main className="min-h-[60vh] flex items-center justify-center text-sm font-mono text-[var(--muted)]">Loading team profile…</main>;
  }

  if (loadFailed || !member) {
    return (
      <main className="min-h-[60vh] max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Team profile not found</h1>
        <p className="mt-3 text-[var(--muted)]">This profile may have been removed or is temporarily unavailable.</p>
        <Link to="/team" className="inline-flex items-center gap-2 mt-6 text-[var(--accent)]"><ArrowLeft className="w-4 h-4" /> Back to the team</Link>
      </main>
    );
  }

  const responsibilities: string[] = Array.isArray(member.responsibilities)
    ? member.responsibilities.map(String).filter(Boolean)
    : typeof member.responsibilities === 'string'
      ? member.responsibilities.split(',').map((value: string) => value.trim()).filter(Boolean)
      : [];

  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-12 sm:py-20">
      <SEO title={`${member.name} — Brush and Bond Team`} description={member.bio || `${member.name}, ${member.role || 'team member'} at Brush and Bond.`} canonicalPath={`/team/${slug}`} />
      <article className="max-w-5xl mx-auto bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-[minmax(240px,0.8fr)_1.2fr]">
          <TeamMemberAvatar name={member.name} avatarUrl={member.avatarUrl} className="w-full aspect-square md:aspect-auto md:min-h-[520px] rounded-none text-5xl" />
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col">
            <Link to="/team" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)]"><ArrowLeft className="w-4 h-4" /> All team members</Link>
            <p className="mt-10 text-xs font-mono uppercase tracking-widest text-[var(--accent)]">{member.tier || 'Team'}</p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-bold text-[var(--ink)]">{member.name}</h1>
            <p className="mt-3 text-base font-mono text-[var(--muted)]">{member.role}{member.department ? ` · ${member.department}` : ''}{member.year ? ` · ${member.year}` : ''}</p>
            {member.quote && <blockquote className="mt-8 border-l-2 border-[var(--accent)] pl-4 italic text-lg text-[var(--ink)]">“{member.quote}”</blockquote>}
            {member.bio && <p className="mt-8 leading-relaxed text-[var(--muted)]">{member.bio}</p>}
            {member.specialty && <p className="mt-6 text-sm text-[var(--ink)]"><span className="font-semibold">Art specialty: </span>{member.specialty}</p>}
            {responsibilities.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{responsibilities.map((item, index) => <span key={`${item}-${index}`} className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs text-[var(--muted)]">{item}</span>)}</div>}
            <div className="mt-auto pt-10 flex gap-4">
              {member.instagramUrl && <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-[var(--muted)] hover:text-[var(--accent)]">Instagram ↗</a>}
              {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-[var(--muted)] hover:text-[var(--accent)]">LinkedIn ↗</a>}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};
