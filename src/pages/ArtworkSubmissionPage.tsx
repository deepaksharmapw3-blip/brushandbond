import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { campusArtContributionApi } from '../services/api';

const CATEGORIES = [
  ['sketches', 'Sketches'],
  ['paintings', 'Paintings'],
  ['digital-art', 'Digital art'],
  ['photography', 'Photography'],
  ['calligraphy', 'Calligraphy'],
  ['doodles', 'Doodles'],
] as const;

const fieldClass = 'w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none';

export const ArtworkSubmissionPage: React.FC = () => {
  const [form, setForm] = useState({
    contributorName: '', email: '', department: '', batchYear: '', title: '',
    year: String(new Date().getFullYear()), category: 'paintings', medium: '', description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!imageFile) {
      setError('Please choose an image of your artwork.');
      return;
    }
    if (imageFile.size > 1_048_576) {
      setError('The image must be 1 MB or smaller.');
      return;
    }

    setIsSubmitting(true);
    try {
      await campusArtContributionApi.submitArtwork(form, imageFile);
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit your artwork. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Submit Artwork" description="Submit your artwork to the Brush and Bond Gallery for admin review." canonicalPath="/submit-artwork" />
      <div className="gallery-container max-w-3xl py-10 sm:py-16">
        <Link to="/gallery" className="mb-7 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]">
          <ArrowLeft className="h-4 w-4" /> Back to Gallery
        </Link>
        <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm sm:p-9">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h1 className="mt-4 font-display text-3xl font-bold text-[var(--ink)]">Artwork sent for review</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
                Thank you for sharing “{form.title}”. It will stay private until an admin approves it. Approved artwork will appear in the Gallery.
              </p>
              <Link to="/gallery" className="btn-primary mt-7">Return to Gallery</Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--accent)]">THE GCECT CANVAS</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink)] sm:text-4xl">Submit your artwork</h1>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Share an original work for the Gallery. An admin will review your submission before it is published.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Your name *
                    <input className={fieldClass} required minLength={2} maxLength={100} value={form.contributorName} onChange={(e) => update('contributorName', e.target.value)} />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Email
                    <input className={fieldClass} type="email" maxLength={254} value={form.email} onChange={(e) => update('email', e.target.value)} />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Department *
                    <input className={fieldClass} required minLength={2} maxLength={120} value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="e.g. Ceramic Technology" />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Batch / graduation year
                    <input className={fieldClass} maxLength={40} value={form.batchYear} onChange={(e) => update('batchYear', e.target.value)} placeholder="e.g. 2025" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Artwork title *
                    <input className={fieldClass} required minLength={2} maxLength={180} value={form.title} onChange={(e) => update('title', e.target.value)} />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Year created *
                    <input className={fieldClass} type="number" required min="1900" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => update('year', e.target.value)} />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Category *
                    <select className={fieldClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                      {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-[var(--muted)]">Medium *
                    <input className={fieldClass} required minLength={2} maxLength={120} value={form.medium} onChange={(e) => update('medium', e.target.value)} placeholder="e.g. Watercolour on paper" />
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs font-medium text-[var(--muted)]">About the artwork *
                  <textarea className={`${fieldClass} resize-y`} required minLength={10} maxLength={3000} rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about the idea, process, or materials." />
                </label>

                <label className="block space-y-1.5 text-xs font-medium text-[var(--muted)]">Artwork image *
                  <span className="flex items-center gap-2 rounded-md border border-dashed border-[var(--line)] bg-[var(--paper)] px-3.5 py-3 text-sm text-[var(--ink)]">
                    <ImagePlus className="h-4 w-4 text-[var(--accent)]" />
                    <input className="min-w-0 flex-1 text-xs" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => setImageFile(e.currentTarget.files?.[0] ?? null)} />
                  </span>
                  <span className="block text-xs">JPEG, PNG, or WebP; up to 1 MB. {imageFile ? `Selected: ${imageFile.name}` : ''}</span>
                </label>

                {error && <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send for review <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
};
