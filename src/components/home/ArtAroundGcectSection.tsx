import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, PlusCircle } from 'lucide-react';

export const ArtAroundGcectSection: React.FC = () => (
  <section className="gallery-container">
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12 lg:p-16">
      <div className="mx-auto max-w-3xl space-y-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Compass className="h-4 w-4" />
          <span>GCECT CAMPUS ART ARCHIVE</span>
        </div>
        <h2 className="section-title text-[var(--ink)]">Art around GCECT</h2>
        <p className="mx-auto max-w-[65ch] text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Explore the campus art record and help preserve the stories behind it. Public submissions are reviewed by the club before they appear in the archive.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/gallery/campus-art" className="btn-primary inline-flex">
            <span>Explore the archive</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/gallery/campus-art?contribute=1" className="btn-secondary inline-flex">
            <PlusCircle className="h-4 w-4" />
            <span>Contribute a record</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);
