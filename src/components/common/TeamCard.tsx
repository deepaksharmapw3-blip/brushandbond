import React from 'react';
import { InstagramIcon, LinkedinIcon } from './Icons';
import type { TeamMember } from '../../types';

export interface TeamCardProps {
  member: TeamMember;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  member,
  className = '',
}) => {
  return (
    <div
      className={`group bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 hover:border-[var(--ink)] transition-all duration-300 flex flex-col justify-between shadow-xs space-y-5 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[var(--paper)] border border-[var(--line)] shrink-0">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-[var(--accent)]">
              {member.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
            {member.role}
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] truncate">
            {member.name}
          </h3>
          <p className="text-xs font-mono text-[var(--muted)]">
            {member.department} • {member.batch}
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs sm:text-sm text-[var(--muted)] font-sans leading-relaxed">
          {member.bio}
        </p>

        {member.responsibilities && member.responsibilities.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[var(--line)]/60">
            <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider block">
              Core Focus:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {member.responsibilities.map((resp) => (
                <span
                  key={resp}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
                >
                  {resp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-[var(--line)]/60 text-[var(--muted)]">
          {member.instagramUrl && (
            <a
              href={member.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:text-[var(--accent)] transition-colors"
              aria-label={`${member.name} on Instagram`}
            >
              <InstagramIcon size={16} />
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:text-[var(--accent)] transition-colors"
              aria-label={`${member.name} on LinkedIn`}
            >
              <LinkedinIcon size={16} />
            </a>
          )}
          {member.handle && (
            <span className="text-xs font-mono text-[var(--muted)] ml-auto">
              @{member.handle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
