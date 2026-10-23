import React from 'react';
import { ExternalLink, Instagram } from 'lucide-react';

interface InstagramStripProps {
  handle?: string;
}

export const InstagramStrip: React.FC<InstagramStripProps> = ({
  handle = '@brushandbond.gcect',
}) => {
  return (
    <section className="gallery-container space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--line)] pb-4 gap-4">
        <div>
          <h2 className="section-title text-[var(--ink)]">
            Follow our creative journey
          </h2>
          <p className="text-xs font-mono text-[var(--muted)] mt-1">
            Follow the club’s latest updates and artwork on Instagram.
          </p>
        </div>

        <a
          href="https://www.instagram.com/brushandbond.gcect/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1.5 font-semibold"
        >
          <span>{handle} on Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="rounded-[6px] border border-[var(--line)] bg-[var(--surface)] px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="w-12 h-12 shrink-0 rounded-full border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
            <Instagram className="w-5 h-5" />
          </span>
          <p className="text-sm text-[var(--muted)] font-sans max-w-xl">
            Visit the official profile to see the club’s current posts.
          </p>
        </div>
        <a
          href="https://www.instagram.com/brushandbond.gcect/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary shrink-0"
        >
          <span>Open Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
