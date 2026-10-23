import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles, Clock, Compass } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const AboutPage: React.FC = () => {
  const missionItems = [
    {
      title: 'Make things',
      description:
        'Whether on an electric potter’s wheel, a stretched linen canvas, or a digital illustration tablet, we turn idle margin sketches and engineering blueprints into tactile reality. We provide the tools, the space, the clay, and the encouragement.',
    },
    {
      title: 'Share them',
      description:
        'Art belongs in the open air, not hidden inside sketchbooks or hard drives. We exhibit work across campus gallery corridors, curate annual salons, and accession every student creation into The GCECT Canvas permanent archive for future batches.',
    },
    {
      title: 'Grow together',
      description:
        'No prior fine-arts training is ever required. Through weekly sketch walks, live technique workshops, collaborative projects, and honest peer critiques, engineers become confident, expressive visual storytellers.',
    },
  ];

  const timelineItems = [
    {
      period: 'Early 2024',
      stage: 'Founded in 2024',
      title: 'The First Courtyard Gathering',
      description:
        'A cohort of 12 students across Ceramic Technology and Computer Science gathered beneath the historic banyan tree of GCECT, drafting the founding charter with one guiding maxim: Creativity Connects.',
    },
    {
      period: 'Late 2024',
      stage: 'First Event',
      title: 'The Inaugural Open Wheel Intensive',
      description:
        'Students occupied Studio 204 for 36 continuous hours of wheel-throwing, slip casting, and carbon pencil drafting. Over 60 first-time potters pulled pieces from the kilns.',
    },
    {
      period: 'Early 2025',
      stage: 'First Exhibition',
      title: 'Genesis: The Campus Art Salon',
      description:
        'Transformed the Main Auditorium Gallery Foyer into a museum-grade exhibition featuring 35 inaugural student works spanning oil impasto, architectural sketches, and terracotta stoneware.',
    },
    {
      period: 'Late 2025',
      stage: 'First Collaboration',
      title: 'Eastern Region Inter-College Conclave',
      description:
        'Partnered with sister engineering colleges and the Academy of Fine Arts Kolkata for a live cross-disciplinary pottery and canvas symposium, winning top honors in fine arts.',
    },
    {
      period: 'Today (2026)',
      stage: 'Today',
      title: 'A Living Sanctuary & Digital Archive',
      description:
        'Over 140 active student creators, weekly open studio access in Studio 204, and a permanent, accessible digital archive documenting the artistic legacy of GCECT.',
    },
  ];

  const collagePhotos = [
    {
      src: '/artworks/studio-workshop.jpg',
      alt: 'Students throwing clay on pottery wheels in Studio 204',
      caption: 'Studio 204 open wheel session',
      className: 'md:col-span-8 md:row-span-2 aspect-[16/10]',
    },
    {
      src: '/artworks/kiln-archways.jpg',
      alt: 'Late evening campus architectural sketch crawl',
      caption: 'Architectural sketch crawl',
      className: 'md:col-span-4 aspect-square',
    },
    {
      src: '/artworks/terracotta-flame.jpg',
      alt: 'High-fire ceramic glazing and sculpture',
      caption: 'Kiln yard glaze reduction',
      className: 'md:col-span-6 aspect-[4/3]',
    },
    {
      src: '/artworks/campus-arch-photo.jpg',
      alt: 'Monochrome photographic study of 1941 brick arches',
      caption: '1941 heritage brick arches',
      className: 'md:col-span-6 aspect-[4/3]',
    },
  ];

  return (
    <>
      <SEO
        title="About Brush and Bond"
        description="Learn about Brush and Bond, GCECT's official art club. Discover our mission, history, and the creative community of students and faculty united by a passion for artistic expression."
        canonicalPath="/about"
      />
    <div className="gallery-container py-10 sm:py-16 space-y-20 lg:space-y-24">
      {/* 1. Page Header & Intro Paragraph */}
      <section className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>About Brush and Bond • GCECT</span>
        </div>

        {/* Page Title per specification */}
        <h1 className="page-title text-[var(--ink)] leading-[1.05]">
          We believe every student has a story waiting to be expressed.
        </h1>

        {/* Intro Paragraph per specification */}
        <p className="text-xl sm:text-2xl text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
          Brush and Bond is a creative community where students come together to explore art, experiment with new forms of expression and celebrate creativity across campus. Founded in 2024.
        </p>

        <div className="pt-2 flex flex-wrap gap-4">
          <Link to="/join" className="btn-primary">
            <span>Join the club</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/gallery" className="btn-secondary">
            <span>Explore the canvas</span>
          </Link>
        </div>
      </section>

      {/* 2. Mission Block (3 short statements: Make things, Share them, Grow together) */}
      <section className="space-y-8 pt-8 border-t border-[var(--line)]">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
            Our Core Ethos
          </span>
          <h2 className="section-title text-[var(--ink)]">
            How we practice art together
          </h2>
        </div>

        {/* 3 Short Statements - Not numbered per spec */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {missionItems.map((item) => (
            <div
              key={item.title}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-8 space-y-4 hover:border-[var(--ink)] transition-colors"
            >
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                  Directive
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                {item.title}
              </h3>

              <p className="text-sm text-[var(--muted)] leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Timeline of the Club's History */}
      <section className="space-y-10 pt-8 border-t border-[var(--line)]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Sequence of Origin</span>
          </div>
          <h2 className="section-title text-[var(--ink)]">
            Timeline of the club's journey
          </h2>
          <p className="text-sm text-[var(--muted)] font-sans">
            From an informal sketchbook circle behind the ceramic kilns to an autonomous campus institution.
          </p>
        </div>

        {/* Sequential Timeline List */}
        <div className="relative border-l-2 border-[var(--line)] ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-10">
          {timelineItems.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--paper)] bg-[var(--accent)] transition-transform group-hover:scale-125" />

              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-6 sm:p-8 space-y-3 hover:border-[var(--ink)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
                    {item.stage}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {item.period}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  {item.title}
                </h3>

                <p className="text-sm text-[var(--muted)] leading-relaxed font-sans max-w-[65ch]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Image Collage of Club Activities (Uneven Grid of 5 Photos) */}
      <section className="space-y-8 pt-8 border-t border-[var(--line)]">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
            Visual Chronicle
          </span>
          <h2 className="section-title text-[var(--ink)]">
            Inside Studio 204 and across campus
          </h2>
          <p className="text-sm text-[var(--muted)] font-sans">
            Glimpses of weekly pottery wheel sessions and plein-air sketch crawls.
          </p>
        </div>

        {/* Uneven Collage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {collagePhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`group relative rounded-[6px] overflow-hidden bg-[var(--paper)] border border-[var(--line)] shadow-sm ${photo.className}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                <span className="text-xs font-mono text-white">
                  {photo.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA to Join */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-8 sm:p-16 text-center space-y-6">
        <h2 className="font-display font-black text-3xl sm:text-5xl text-[var(--ink)] max-w-2xl mx-auto tracking-tight">
          Ready to join our creative circle?
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed font-sans">
          Studio 204 is open weekly to all GCECT students across Ceramic Technology, CSE, and IT. No prior portfolio or experience needed.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link to="/join" className="btn-primary">
            <span>Join the club</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link to="/contact" className="btn-secondary">
            <span>Drop by Studio 204</span>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};
