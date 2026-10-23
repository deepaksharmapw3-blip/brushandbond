import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { CampusArtContribution } from '../../types/campusArt';
import { campusArtContributionApi } from '../../services/api';

interface CampusArtContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contribution: CampusArtContribution) => void;
}

export const CampusArtContributionModal: React.FC<CampusArtContributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showWarning } = useToast();

  const [formData, setFormData] = useState({
    contributorName: '',
    email: '',
    batchYear: '',
    department: 'Ceramic Technology',
    title: '',
    approxYear: '2024',
    location: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleClose = () => {
    setImageFile(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contributorName.trim() || !formData.title.trim() || !formData.description.trim()) {
      showWarning('Required fields missing', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await campusArtContributionApi.submit({
        contributorName: formData.contributorName,
        email: formData.email,
        batchYear: formData.batchYear,
        department: formData.department,
        title: formData.title,
        approxYear: formData.approxYear,
        location: formData.location,
        description: formData.description,
      }, imageFile);
      const imageUrl = saved.imageUrl ?? '';
      const newContribution: CampusArtContribution = {
        id: saved.id,
        contributorName: formData.contributorName,
        email: formData.email,
        batchYear: formData.batchYear,
        department: formData.department,
        title: formData.title,
        approxYear: formData.approxYear,
        location: formData.location || 'GCECT Campus',
        description: formData.description,
        imageUrl: imageUrl || undefined,
        submittedAt: saved.created_at,
        status: 'pending',
      };

      setIsSubmitting(false);
      setSubmitted(true);
      showSuccess('Contribution submitted', 'An admin will review it before it appears in the public archive.');
      if (onSuccess) onSuccess(newContribution);
    } catch (error) {
      showWarning('Submission failed', error instanceof Error ? error.message : 'Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setImageFile(null);
    setFormData({
      contributorName: '',
      email: '',
      batchYear: '',
      department: 'Ceramic Technology',
      title: '',
      approxYear: '2024',
      location: '',
      description: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[8px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>EXPAND THE DIGITAL ARCHIVE</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                Contribute Campus Art Record
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] font-sans">
                Share a record of GCECT campus art. Contributions are reviewed by an admin before they appear in the archive.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                Record Submitted to Archive
              </h3>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto font-sans leading-relaxed">
                Thank you! &ldquo;{formData.title}&rdquo; is saved as a pending submission. It will appear publicly after an admin reviews it.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-primary"
                >
                  <span>Close & View Archive</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Contributor Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contributorName}
                    onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
                    placeholder="e.g. Sagnik Sen"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Email / Contact
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@alumni.gcect.ac.in"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                  >
                    <option value="Ceramic Technology">Ceramic Technology</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Alumni / Faculty">Alumni / Faculty</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Batch / Graduation Year
                  </label>
                  <input
                    type="text"
                    value={formData.batchYear}
                    onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                    placeholder="e.g. Batch of 2022"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Artwork Details */}
              <div className="border-t border-[var(--line)] pt-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-[var(--muted)]">
                      Year / Approximate Era *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.approxYear}
                      onChange={(e) => setFormData({ ...formData, approxYear: e.target.value })}
                      placeholder="e.g. 2023 or 2018"
                      className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Project / Artwork Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Saraswati Puja Earthen Dome (2023)"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Specific Campus Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Quadrangle Courtyard or Canteen Back Wall"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] px-3.5 py-2 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    Description & Historical Story *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe how this piece was created, materials used, participating student cohort, and why it is significant to GCECT history..."
                    className="w-full bg-[var(--paper)] border border-[var(--line)] p-3 text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="campus-art-photo" className="block text-xs font-mono text-[var(--muted)]">Artwork photo (optional)</label>
                  <input
                    id="campus-art-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setImageFile(event.currentTarget.files?.[0] ?? null)}
                    className="w-full rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-sm text-[var(--ink)] file:mr-3 file:rounded file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--on-accent)]"
                  />
                  <p className="text-xs text-[var(--muted)]">Choose a JPEG, PNG, or WebP image up to 1 MB. No Drive link or image URL needed.</p>
                  {imageFile && <p className="text-xs text-[var(--accent)]">Selected: {imageFile.name}</p>}
                </div>
              </div>

              {/* Informative Note */}
              <div className="flex items-start gap-2 p-3 bg-[var(--paper)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--muted)] font-sans">
                <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>
                    Your record and photo stay out of the public archive until an admin approves them. Admins control approval and deletion.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2.5 text-xs font-semibold"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit to Digital Record</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
