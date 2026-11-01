import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Brush, HeartHandshake, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const AboutPage: React.FC = () => (
  <>
    <SEO
      title="About Brush & Bond"
      description="Meet Brush & Bond, the GCECT art community where creativity connects, inspires, and brings people together."
      canonicalPath="/about"
    />

    <main className="gallery-container py-10 sm:py-16 space-y-16 lg:space-y-20">
      <section className="relative overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 sm:px-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="relative max-w-4xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
            <span>About Brush &amp; Bond · GCECT</span>
          </div>

          <h1 className="page-title text-[var(--ink)] leading-[1.03]">
            Where Creativity Connects.
          </h1>

          <p className="max-w-3xl font-display text-xl font-semibold leading-relaxed text-[var(--ink)] sm:text-2xl">
            Art is not just what we create; it&apos;s the way we connect, express, and inspire.
          </p>

          <p className="max-w-[70ch] text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Born in 2024 at the Government College of Engineering and Ceramic Technology (GCECT), <strong className="text-[var(--ink)]">Brush &amp; Bond</strong> is more than just an art club — it&apos;s a community where imagination finds its canvas and creativity brings people together.
          </p>

          <p className="max-w-[70ch] text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            We believe that every individual has an artist within. Whether it&apos;s a stroke of a brush, a pencil sketch, a digital masterpiece, a handcrafted creation, or a vibrant mural, every form of expression deserves a space to shine.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/join" className="btn-primary">
              <span>Join the club</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/gallery" className="btn-secondary">
              <span>Explore the canvas</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-t border-[var(--line)] pt-10 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:gap-14">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            <Brush className="h-4 w-4" />
            <span>Our Mission</span>
          </div>
          <h2 className="section-title text-[var(--ink)]">What We Do</h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          <p>
            Our mission is to transform ordinary spaces into extraordinary expressions of art, nurture hidden talents, and build a campus culture where creativity knows no boundaries.
          </p>
          <p>
            From organizing drawing competitions, art exhibitions, and creative workshops to bringing life to campus walls through murals, decorations, and artistic installations, we celebrate creativity in every form.
          </p>
          <p>
            We actively contribute to college festivities, cultural celebrations, and creative initiatives while providing students with opportunities to showcase their talents, collaborate, and grow as artists.
          </p>
        </div>
      </section>

      <section className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:gap-14">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              <HeartHandshake className="h-4 w-4" />
              <span>Our Community</span>
            </div>
            <h2 className="section-title text-[var(--ink)]">More Than Art. It&apos;s a Bond.</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            <p>
              At Brush &amp; Bond, we don&apos;t measure creativity by perfection. We celebrate imagination, individuality, collaboration, and the courage to create something unique.
            </p>
            <p>
              We are a space for dreamers, creators, storytellers, and everyone who believes that art has the power to make a difference.
            </p>
            <div className="border-l-2 border-[var(--accent)] pl-5 pt-1">
              <p className="font-display text-lg font-semibold leading-relaxed text-[var(--ink)] sm:text-xl">
                Our vision is simple: To make creativity a living part of campus life and build a community where every idea finds its expression.
              </p>
              <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Brush &amp; Bond — Creativity Connects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-[8px] border border-[var(--line)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            Find your place in the creative community.
          </h2>
          <p className="text-[var(--muted)]">
            Bring an idea, a work in progress, or simply the curiosity to create.
          </p>
        </div>
        <Link to="/join" className="btn-primary shrink-0">
          <span>Join Brush &amp; Bond</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  </>
);
