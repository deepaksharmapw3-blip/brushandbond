import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import {
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RotateCcw,
  Camera,
  ExternalLink,
  Building,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import {
  submitMembershipApplication,
  type AreaOfInterest,
  type AcademicYear,
  type StoredMembershipApplication,
} from '../services/membershipService';
import { useToast } from '../context/ToastContext';

interface FormValues {
  name: string;
  department: string;
  year: AcademicYear | '';
  email: string;
  areaOfInterest: AreaOfInterest | '';
  portfolioUrl: string;
  reasonToJoin: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

export const JoinPage: React.FC = () => {
  const { showSuccess } = useToast();

  const [form, setForm] = useState<FormValues>({
    name: '',
    department: '',
    year: '',
    email: '',
    areaOfInterest: '',
    portfolioUrl: '',
    reasonToJoin: '',
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<StoredMembershipApplication | null>(null);

  const departments = [
    'Ceramic Technology',
    'Computer Science & Engineering',
    'Information Technology',
    'Other',
  ];

  const years: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const areasOfInterest: AreaOfInterest[] = [
    'Sketching',
    'Painting',
    'Digital art',
    'Photography',
    'Calligraphy',
    'Doodling',
    'Other',
  ];

  // Reasons to join
  const reasons = [
    {
      title: 'Learn from seniors',
      description:
        'Hands-on guidance and weekly peer workshops on wheel pottery, acrylic washes, sumi ink, and digital art. Zero judgment, zero gatekeeping.',
      icon: GraduationCap,
      accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Show your work',
      description:
        'Get featured in our annual Genesis college exhibition and archived permanently in The Canvas online gallery with your own artist profile.',
      icon: Sparkles,
      accentColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Meet creative people',
      description:
        'Connect with like-minded students across Ceramic Tech, CSE, and IT. Join late-night sketch jams, chai runs, and collaborative design projects in Studio 204.',
      icon: Users,
      accentColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  // Photo strip images
  const photoStrip = [
    {
      src: '/artworks/studio-workshop.jpg',
      title: 'Studio 204 throwing wheels',
      caption: 'Weekly clay sessions',
      rotate: '-rotate-2',
    },
    {
      src: '/artworks/terracotta-flame.jpg',
      title: 'Kiln firing & reduction',
      caption: 'Ceramic lab firings',
      rotate: 'rotate-1',
    },
    {
      src: '/artworks/oil-twilight.jpg',
      title: 'Late afternoon acrylic study',
      caption: 'Easel open hours',
      rotate: 'rotate-2',
    },
    {
      src: '/artworks/calligraphy-serenity.jpg',
      title: 'Sumi ink meditation',
      caption: 'Calligraphy & brushwork',
      rotate: '-rotate-1',
    },
  ];

  const validateField = (field: keyof FormValues, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Please enter your full name.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';

      case 'department':
        if (!value.trim()) return 'Please select your department.';
        return '';

      case 'year':
        if (!value.trim()) return 'Please select your year of study (1st to 4th).';
        return '';

      case 'email':
        if (!value.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address (e.g. name@gcect.ac.in).';
        }
        return '';

      case 'areaOfInterest':
        if (!value.trim()) return 'Please select your area of interest.';
        return '';

      case 'portfolioUrl':
        if (value.trim()) {
          const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(value.trim());
          const isHandle = /^@?[\w.-]{3,}$/.test(value.trim());
          if (!isUrl && !isHandle) {
            return 'Please enter a valid web link (e.g. https://instagram.com/myart) or @handle.';
          }
        }
        return '';

      case 'reasonToJoin':
        if (!value.trim()) return 'Please tell us why you want to join.';
        if (value.trim().length < 10) {
          return 'Please write at least 10 characters explaining your interest.';
        }
        return '';

      default:
        return '';
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(form) as Array<keyof FormValues>).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      department: true,
      year: true,
      email: true,
      areaOfInterest: true,
      portfolioUrl: true,
      reasonToJoin: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      // Find the first field with error and scroll to it if needed
      const firstErrorField = document.querySelector('[data-has-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMembershipApplication({
        name: form.name,
        department: form.department,
        year: form.year as AcademicYear,
        email: form.email,
        areaOfInterest: form.areaOfInterest as AreaOfInterest,
        portfolioUrl: form.portfolioUrl || undefined,
        reasonToJoin: form.reasonToJoin,
      });

      if (result.success) {
        setSubmittedApp(result.application);
        showSuccess('Application Submitted', `Welcome ${form.name}! Ref: ${result.id}`);

        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#2F3CFF', '#F59E0B', '#10B981', '#15130F'],
          });
        } catch {
          // ignore if canvas is blocked
        }

        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setErrors((prev) => ({ ...prev, reasonToJoin: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: '',
      department: '',
      year: '',
      email: '',
      areaOfInterest: '',
      portfolioUrl: '',
      reasonToJoin: '',
    });
    setTouched({});
    setErrors({});
    setSubmittedApp(null);
  };

  return (
    <>
      <SEO
        title="Join Brush and Bond"
        description="Apply to become a member of the Brush and Bond art club at GCECT. Share your passion for art, portfolio, and join our creative community."
        canonicalPath="/join"
      />
    <div className="min-h-screen py-10 sm:py-16">
      <div className="gallery-container">
        
        {/* Prominent Welcoming Header */}
        <header className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-[var(--ink)] tracking-wider uppercase">
              Join Brush and Bond • GCECT Art Club
            </span>
          </div>

          <h1 className="page-title text-[var(--ink)] tracking-tight">
            Think you're not an artist? Think again.
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed font-sans">
            You don't have to be an expert to create. You just need the courage to start.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Zero prior experience needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Studio 204 access & free paints
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Open to 1st through 4th year students
            </span>
          </div>
        </header>

        {/* Success Screen vs Interactive Conversion Form */}
        <AnimatePresence mode="wait">
          {submittedApp ? (
            /* SUCCESS SCREEN */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-[var(--surface)] border border-[var(--line)] rounded-xl p-8 sm:p-12 shadow-xl space-y-8"
              id="success-screen"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="section-title text-[var(--ink)] text-3xl sm:text-4xl">
                  {submittedApp.confirmationEmailSent ? 'Application received. Check your email.' : 'Application received.'}
                </h2>

                <p className="text-base text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
                  Welcome to the community, <strong className="text-[var(--ink)]">{submittedApp.name}</strong>. Your membership entry has been filed in the Studio 204 register.
                </p>
              </div>

              {/* Membership Card Ticket */}
              <div className="bg-[var(--paper)] border border-[var(--line)] rounded-lg p-6 sm:p-7 relative overflow-hidden space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] block">
                      Government College of Engineering & Ceramic Technology
                    </span>
                    <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                      Art Club Membership Entry
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[var(--muted)] block">Application Ref</span>
                    <span className="font-mono text-sm font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-sm border border-[var(--accent)]/20">
                      {submittedApp.id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[var(--muted)] block mb-0.5">Applicant</span>
                    <span className="font-semibold text-[var(--ink)]">{submittedApp.name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block mb-0.5">Department</span>
                    <span className="font-semibold text-[var(--ink)]">{submittedApp.department}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block mb-0.5">Year</span>
                    <span className="font-semibold text-[var(--ink)]">{submittedApp.year}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block mb-0.5">Interest</span>
                    <span className="font-semibold text-[var(--accent)]">{submittedApp.areaOfInterest}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)] flex items-center justify-between">
                  <span>Registered email: <strong className="text-[var(--ink)] font-mono">{submittedApp.email}</strong></span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed
                  </span>
                </div>
              </div>

              {/* What happens next section */}
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5 space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--ink)]">
                  What happens next?
                </h4>
                <ol className="space-y-2 text-xs sm:text-sm text-[var(--muted)]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                    <span>{submittedApp.confirmationEmailSent ? 'A receipt with your application reference has been sent to your registered email. The club team will email you after reviewing your application.' : 'Your application is saved. Email confirmation is temporarily unavailable; the club team can still review your application.'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                    <span>Drop into <strong>Studio 204 (Ceramic Block)</strong> on Tuesday at 4:30 PM to meet senior artists and grab your starter paper & brushes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                    <span>Join our upcoming drawing competition or weekend open easel jams!</span>
                  </li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link to="/gallery" className="btn-primary">
                  <span>Explore The Canvas Gallery</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Submit another application</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* CONVERSION LAYOUT: FORM + BESIDE (REASONS & PHOTO STRIP) */
            <div key="conversion-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* LEFT COLUMN: THE APPLICATION FORM */}
              <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 sm:p-10 shadow-sm relative">
                <div className="mb-8 pb-6 border-b border-[var(--line)]">
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] font-display">
                    Membership Application
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-sans">
                    Fill out this quick form. No portfolio required to be part of the club.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Name Field */}
                  <div data-has-error={!!errors.name}>
                    <label
                      htmlFor="join-name"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="join-name"
                      type="text"
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="e.g. Sagnik Sen"
                      className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 transition-all ${
                        errors.name
                          ? 'border-red-500 ring-1 ring-red-500/30'
                          : touched.name && !errors.name
                          ? 'border-emerald-500/60'
                          : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Department & Year (2 Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Department */}
                    <div data-has-error={!!errors.department}>
                      <label
                        htmlFor="join-department"
                        className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                      >
                        Department <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="join-department"
                          value={form.department}
                          onChange={(e) => handleChange('department', e.target.value)}
                          onBlur={() => handleBlur('department')}
                          className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] transition-all ${
                            errors.department
                              ? 'border-red-500 ring-1 ring-red-500/30'
                              : touched.department && !errors.department
                              ? 'border-emerald-500/60'
                              : 'border-[var(--line)] focus:border-[var(--accent)]'
                          }`}
                        >
                          <option value="">Select your department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.department && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.department}</span>
                        </p>
                      )}
                    </div>

                    {/* Year (Select 1st to 4th) */}
                    <div data-has-error={!!errors.year}>
                      <label
                        htmlFor="join-year"
                        className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                      >
                        Year (1st to 4th) <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="join-year"
                        value={form.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        onBlur={() => handleBlur('year')}
                        className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] transition-all ${
                          errors.year
                            ? 'border-red-500 ring-1 ring-red-500/30'
                            : touched.year && !errors.year
                            ? 'border-emerald-500/60'
                            : 'border-[var(--line)] focus:border-[var(--accent)]'
                        }`}
                      >
                        <option value="">Select your year</option>
                        {years.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                      {errors.year && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.year}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div data-has-error={!!errors.email}>
                    <label
                      htmlFor="join-email"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="join-email"
                        type="email"
                        maxLength={254}
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="e.g. yourname@gcect.ac.in or gmail.com"
                        className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 transition-all ${
                          errors.email
                            ? 'border-red-500 ring-1 ring-red-500/30'
                            : touched.email && !errors.email
                            ? 'border-emerald-500/60'
                            : 'border-[var(--line)] focus:border-[var(--accent)]'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Area of interest (Select: Sketching, Painting, Digital art, Photography, Calligraphy, Doodling, Other) */}
                  <div data-has-error={!!errors.areaOfInterest}>
                    <label
                      htmlFor="join-interest"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                    >
                      Area of interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="join-interest"
                      value={form.areaOfInterest}
                      onChange={(e) => handleChange('areaOfInterest', e.target.value)}
                      onBlur={() => handleBlur('areaOfInterest')}
                      className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] transition-all ${
                        errors.areaOfInterest
                          ? 'border-red-500 ring-1 ring-red-500/30'
                          : touched.areaOfInterest && !errors.areaOfInterest
                          ? 'border-emerald-500/60'
                          : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    >
                      <option value="">Select your creative focus</option>
                      {areasOfInterest.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                    {errors.areaOfInterest && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.areaOfInterest}</span>
                      </p>
                    )}
                  </div>

                  {/* Portfolio or Instagram link (optional) */}
                  <div data-has-error={!!errors.portfolioUrl}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="join-portfolio"
                        className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold"
                      >
                        Portfolio or Instagram link
                      </label>
                      <span className="text-[11px] font-mono text-[var(--muted)]">Optional</span>
                    </div>
                    <input
                      id="join-portfolio"
                      type="text"
                      maxLength={2048}
                      value={form.portfolioUrl}
                      onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                      onBlur={() => handleBlur('portfolioUrl')}
                      placeholder="https://instagram.com/yourhandle or art link"
                      className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 transition-all ${
                        errors.portfolioUrl
                          ? 'border-red-500 ring-1 ring-red-500/30'
                          : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {errors.portfolioUrl && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.portfolioUrl}</span>
                      </p>
                    )}
                  </div>

                  {/* Why do you want to join? (textarea) */}
                  <div data-has-error={!!errors.reasonToJoin}>
                    <label
                      htmlFor="join-reason"
                      className="block text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-1.5"
                    >
                      Why do you want to join? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="join-reason"
                      rows={3}
                      maxLength={3000}
                      value={form.reasonToJoin}
                      onChange={(e) => handleChange('reasonToJoin', e.target.value)}
                      onBlur={() => handleBlur('reasonToJoin')}
                      placeholder="Tell us what you'd love to learn, explore, or build with the club..."
                      className={`w-full bg-[var(--paper)] border rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 leading-relaxed transition-all ${
                        errors.reasonToJoin
                          ? 'border-red-500 ring-1 ring-red-500/30'
                          : touched.reasonToJoin && !errors.reasonToJoin
                          ? 'border-emerald-500/60'
                          : 'border-[var(--line)] focus:border-[var(--accent)]'
                      }`}
                    />
                    {errors.reasonToJoin && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.reasonToJoin}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button with Loading State */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`btn-primary w-full py-4 text-base font-semibold shadow-md transition-all ${
                        isSubmitting ? 'opacity-80 cursor-wait' : 'hover:shadow-lg'
                      }`}
                      id="join-submit-button"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Membership Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-[var(--muted)] text-center mt-3 font-mono">
                      No membership fee. Free access to Studio 204 materials.
                    </p>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: BESIDE THE FORM (THREE REASONS + PHOTO STRIP) */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* 1. THREE SHORT REASONS TO JOIN */}
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                    <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                      Why join Brush and Bond?
                    </h3>
                    <span className="text-[11px] font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
                      Club Perks
                    </span>
                  </div>

                  <div className="space-y-4">
                    {reasons.map((reason, idx) => {
                      const Icon = reason.icon;
                      return (
                        <div
                          key={reason.title}
                          className="flex items-start gap-3.5 p-3 rounded-lg bg-[var(--paper)]/60 border border-[var(--line)]/60 transition-all hover:bg-[var(--paper)] hover:border-[var(--line)]"
                        >
                          <div className={`p-2.5 rounded-md shrink-0 border ${reason.accentColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-display font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                              <span>{reason.title}</span>
                              <span className="text-[10px] font-mono text-[var(--muted)]">#0{idx + 1}</span>
                            </h4>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                              {reason.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PHOTO STRIP: REAL CLUB MOMENTS */}
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] block">
                        Visual Archive
                      </span>
                      <h3 className="font-display text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[var(--accent)]" />
                        Life inside Studio 204
                      </h3>
                    </div>
                    <Link
                      to="/gallery"
                      className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Gallery</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <p className="text-xs text-[var(--muted)]">
                    Sneak peek into our pottery wheels, studio sessions, and open studios.
                  </p>

                  {/* Photo Strip Horizontal Scroll / Filmstrip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {photoStrip.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-[var(--paper)] border border-[var(--line)] rounded-lg p-2 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="aspect-square overflow-hidden rounded-md bg-[var(--line)]">
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="pt-2">
                          <p className="font-display text-[11px] font-bold text-[var(--ink)] truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--muted)] truncate">
                            {item.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Studio 204 location badge */}
                  <div className="p-3 rounded-lg bg-[var(--paper)] border border-[var(--line)] flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                    <span className="flex items-center gap-1.5 text-[var(--ink)] font-medium">
                      <Building className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Studio 204, Ceramic Block
                    </span>
                    <span className="flex items-center gap-1 text-[var(--muted)]">
                      <Calendar className="w-3.5 h-3.5" />
                      Tuesdays 4:30 PM
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </>
  );
};
