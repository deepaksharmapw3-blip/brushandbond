import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Star,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminToast, ConfirmDialog, AdminEmptyState, AdminBadge } from '../components/admin/AdminUtils';
import { teamApi } from '../services/api';

type TierFilter = 'all' | 'faculty' | 'executive' | 'lead' | 'member';

const toResponsibilities = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export const AdminTeamPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [tier, setTier] = useState<'faculty' | 'executive' | 'lead' | 'member'>('executive');
  const [department, setDepartment] = useState('Ceramic Technology');
  const [year, setYear] = useState('Batch of 2026');
  const [bio, setBio] = useState('');
  const [quote, setQuote] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isLead, setIsLead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await teamApi.getAll();
      if (res.success && Array.isArray(res.team)) {
        setMembers(res.team);
      }
    } catch (err: any) {
      console.warn('Failed to load team members:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- This starts an async read; state changes follow the API response.
    fetchTeam();
  }, []);

  const resetForm = () => {
    setName('');
    setRole('');
    setTier('executive');
    setDepartment('Ceramic Technology');
    setYear('Batch of 2026');
    setBio('');
    setQuote('');
    setSpecialty('');
    setResponsibilities('');
    setAvatarUrl('');
    setInstagramUrl('');
    setLinkedinUrl('');
    setDisplayOrder(0);
    setIsLead(false);
    setSelectedMember(null);
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setName(member.name || '');
    setRole(member.role || '');
    setTier(member.tier || 'executive');
    setDepartment(member.department || 'Ceramic Technology');
    setYear(member.year || '');
    setBio(member.bio || '');
    setQuote(member.quote || '');
    setSpecialty(member.specialty || '');
    setResponsibilities(toResponsibilities(member.responsibilities).join(', '));
    setAvatarUrl(member.avatarUrl || '');
    setInstagramUrl(member.instagramUrl || '');
    setLinkedinUrl(member.linkedinUrl || '');
    setDisplayOrder(member.displayOrder || 0);
    setIsLead(Boolean(member.isLead));
    setIsEditOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Full name is required', type: 'error' });
      return;
    }
    if (!role.trim()) {
      setToast({ message: 'Role/Title is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        tier,
        department: department.trim(),
        year: year.trim(),
        bio: bio.trim() || undefined,
        quote: quote.trim() || undefined,
        specialty: specialty.trim() || undefined,
        responsibilities: toResponsibilities(responsibilities),
        avatarUrl: avatarUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isLead,
      };

      if (isEditOpen && selectedMember) {
        await teamApi.update(selectedMember.id, payload);
        setToast({ message: `Updated ${name} successfully!`, type: 'success' });
        setIsEditOpen(false);
      } else {
        await teamApi.create(payload);
        setToast({ message: `Added ${name} to the team!`, type: 'success' });
        setIsAddOpen(false);
      }

      resetForm();
      fetchTeam();
    } catch (err: any) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      await teamApi.delete(selectedMember.id);
      setToast({ message: `${selectedMember.name} removed from team`, type: 'success' });
      setIsDeleteOpen(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to remove member', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesTier =
      tierFilter === 'all'
        ? true
        : (member.tier || 'executive').toLowerCase() === tierFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (member.name || '').toLowerCase().includes(q) ||
      (member.role || '').toLowerCase().includes(q) ||
      (member.department || '').toLowerCase().includes(q) ||
      (member.year || '').toLowerCase().includes(q);
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (t?: string) => {
    switch ((t || 'executive').toLowerCase()) {
      case 'faculty':
        return <AdminBadge variant="info">Faculty Patron</AdminBadge>;
      case 'executive':
        return <AdminBadge variant="success">Executive Committee</AdminBadge>;
      case 'lead':
        return <AdminBadge variant="warning">Wing Lead</AdminBadge>;
      case 'member':
        return <AdminBadge variant="info">Active Member</AdminBadge>;
      default:
        return <AdminBadge variant="info">{t || 'Member'}</AdminBadge>;
    }
  };

  return (
    <ProtectedAdminRoute>
      <SEO title="Manage Team - Admin Dashboard" />
      <AdminLayout activeSection="team">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[var(--accent)]" />
                <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Manage Team &amp; Leaders
                </h1>
              </div>
              <p className="text-xs font-mono text-[var(--muted)] mt-1">
                Add, update, or remove faculty advisors, club executives, domain leads, and active student members.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg font-mono text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-lg border border-[var(--line)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name, role, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
              />
            </div>

            {/* Tier Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'faculty', label: 'Faculty' },
                  { id: 'executive', label: 'Executives' },
                  { id: 'lead', label: 'Leads' },
                  { id: 'member', label: 'Active Members' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTierFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                    tierFilter === tab.id
                      ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)]'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-70">
                    (
                    {tab.id === 'all'
                      ? members.length
                      : members.filter(
                          (m) => (m.tier || 'executive').toLowerCase() === tab.id
                        ).length}
                    )
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Members List */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] border-t-[var(--accent)] animate-spin" />
              <p className="text-xs font-mono text-[var(--muted)]">Loading team directory...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title="No Team Members Found"
              description={
                searchQuery
                  ? 'No members match your search criteria. Try a different query.'
                  : 'Start building the team page by adding faculty patrons, executives, or domain leads.'
              }
              actionLabel="Add First Member"
              onAction={() => {
                resetForm();
                setIsAddOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5 flex flex-col justify-between hover:border-[var(--accent)]/50 transition-colors shadow-xs group"
                >
                  <div>
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-[var(--paper)] border border-[var(--line)] shrink-0 flex items-center justify-center">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  member.name
                                )}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold font-display text-lg text-[var(--accent)] bg-[var(--paper)]">
                              {member.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[var(--ink)] truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs font-mono text-[var(--accent)] font-semibold truncate">
                            {member.role}
                          </p>
                          <p className="text-[11px] font-mono text-[var(--muted)] truncate">
                            {member.department} {member.year ? `• ${member.year}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getTierBadge(member.tier)}
                        {member.isLead && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-500" /> Core Lead
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quote */}
                    {member.quote && (
                      <p className="text-xs text-[var(--ink)] italic border-l-2 border-[var(--accent)] pl-2.5 my-2.5 line-clamp-2">
                        &ldquo;{member.quote}&rdquo;
                      </p>
                    )}

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2 mb-2 font-sans">
                        {member.bio}
                      </p>
                    )}

                    {/* Specialty or Responsibilities */}
                    {member.specialty && (
                      <div className="text-[11px] font-mono text-[var(--accent)] mb-2">
                        <span className="text-[var(--muted)]">Specialty: </span>
                        {member.specialty}
                      </div>
                    )}

                    {toResponsibilities(member.responsibilities).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {toResponsibilities(member.responsibilities)
                          .slice(0, 3)
                          .map((r: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]"
                            >
                              ✓ {r}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Socials & Actions */}
                  <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      {member.instagramUrl && (
                        <a
                          href={member.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent)] transition-colors"
                          title="Instagram"
                        >
                          IG
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent)] transition-colors"
                          title="LinkedIn"
                        >
                          IN
                        </a>
                      )}
                      <span className="text-[10px] text-[var(--muted)] opacity-60">
                        Order #{member.displayOrder || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Member Modal */}
        <AnimatePresence>
          {(isAddOpen || isEditOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5 my-8"
              >
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--ink)]">
                        {isEditOpen ? `Edit ${name || 'Member'}` : 'Add New Team Member'}
                      </h2>
                      <p className="text-xs font-mono text-[var(--muted)]">
                        Enter profile details, tier classification, and responsibilities.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddOpen(false);
                      setIsEditOpen(false);
                      resetForm();
                    }}
                    className="p-1.5 rounded-lg hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveMember} className="space-y-4">
                  {/* Row 1: Name & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Deepak Sharma or Prof. S. K. Roy"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Role / Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Club President, Creative Head, Faculty Mentor"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Tier & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Team Tier / Section *
                      </label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      >
                        <option value="faculty">Faculty Mentor / Chief Patron</option>
                        <option value="executive">Executive Committee (Leadership)</option>
                        <option value="lead">Wing Lead / Domain Coordinator</option>
                        <option value="member">Active Community Member</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      >
                        <option value="Ceramic Technology">Ceramic Technology</option>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Faculty / Administration">Faculty / Administration</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Year/Batch & Display Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Year / Batch / Tag
                      </label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g. Batch of 2026, 3rd Year, Faculty Advisor"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Display Order (lower numbers appear first)
                      </label>
                      <input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  {/* Row 4: Avatar URL */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://... or leave empty for automatic initials badge"
                      className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                    />
                  </div>

                  {/* Row 5: Quote & Specialty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Personal Quote / Philosophy
                      </label>
                      <input
                        type="text"
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        placeholder="e.g. Art and engineering are languages of the same yearning..."
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Art Specialty (for members / leads)
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="e.g. Charcoal portraiture, Raku firing, Watercolor"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  {/* Row 6: Responsibilities (comma-separated) */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                      Key Responsibilities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      placeholder="Overall club strategy, Pottery workshops, Inter-college liaisons"
                      className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                    />
                  </div>

                  {/* Row 7: Bio */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                      Biography / Background
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief description of the member's work, craft, and stewardship in the art club..."
                      className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                    />
                  </div>

                  {/* Row 8: Social Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[var(--ink)] mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 text-xs font-mono bg-[var(--paper)] border border-[var(--line)] rounded-md focus:border-[var(--accent)] focus:outline-none text-[var(--ink)]"
                      />
                    </div>
                  </div>

                  {/* Checkbox: Core Lead */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isLeadCheck"
                      checked={isLead}
                      onChange={(e) => setIsLead(e.target.checked)}
                      className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="isLeadCheck" className="text-xs font-mono text-[var(--ink)] select-none">
                      Mark as Core Leader / Lead Coordinator (Highlighted badge)
                    </label>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddOpen(false);
                        setIsEditOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 rounded-md text-xs font-mono border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-md text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : isEditOpen
                        ? 'Update Member'
                        : 'Add to Team'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          title="Remove Team Member"
          description={`Are you sure you want to remove ${selectedMember?.name} from the team roster? This action cannot be undone.`}
          confirmText="Remove Member"
          cancelText="Keep Member"
          isDangerous={true}
          isLoading={isSubmitting}
          onConfirm={handleDeleteMember}
          onCancel={() => {
            setIsDeleteOpen(false);
            setSelectedMember(null);
          }}
        />

        {/* Toast Notification */}
        {toast && (
          <AdminToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};
