import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  History,
  Search,
  X,
  PlusCircle,
  Share2,
  Check,
} from 'lucide-react';
import {
  CAMPUS_ART_GROUPS,
  CAMPUS_ART_PROJECTS,
  ARCHIVE_TIMELINE_ERAS,
} from '../data/campusArtData';
import { CampusArtLightbox } from '../components/campus-art/CampusArtLightbox';
import { CampusArtMap } from '../components/campus-art/CampusArtMap';
import { CampusArtContributionModal } from '../components/campus-art/CampusArtContributionModal';
import { useToast } from '../context/ToastContext';
import { campusArtContributionApi } from '../services/api';
import type {
  CampusArtGroupId,
  CampusArtPhoto,
} from '../types/campusArt';

export const CampusArtPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess } = useToast();

  // Active group filter from URL or state
  const groupParam = searchParams.get('group') as CampusArtGroupId | null;
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const activeGroupFilter = groupParam && CAMPUS_ART_GROUPS.some((g) => g.id === groupParam)
    ? groupParam
    : selectedGroupFilter;

  // Search query & view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'groups' | 'map' | 'timeline'>('groups');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<CampusArtPhoto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [lightboxGroupName, setLightboxGroupName] = useState('');

  // Contribution modal state
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [approvedContributions, setApprovedContributions] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get('contribute') === '1') {
      setContributionModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('contribute');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    campusArtContributionApi.getApproved()
      .then((records) => { if (active) setApprovedContributions(records); })
      .catch((error) => console.warn('Could not load approved campus archive contributions:', error));
    return () => { active = false; };
  }, []);

  // Copied link state
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupFilter(groupId);
    if (groupId === 'all') {
      searchParams.delete('group');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ group: groupId });
    }
  };

  const handleOpenPhotoSet = (photos: CampusArtPhoto[], startIndex = 0, title = '', group = '') => {
    setLightboxPhotos(photos);
    setLightboxIndex(startIndex);
    setLightboxTitle(title);
    setLightboxGroupName(group);
    setLightboxOpen(true);
  };

  const handleShareArchive = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showSuccess('Archive link copied!', 'Direct URL copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filter groups and projects based on selection & search
  const displayedGroups = useMemo(() => {
    return CAMPUS_ART_GROUPS.filter((grp) => {
      if (activeGroupFilter !== 'all' && grp.id !== activeGroupFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchesGroup =
        grp.title.toLowerCase().includes(q) ||
        grp.shortDescription.toLowerCase().includes(q) ||
        grp.historicalSignificance.toLowerCase().includes(q);

      const matchesProjects = grp.projects.some(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.medium.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.leadArtists.some((a) => a.toLowerCase().includes(q))
      );

      return matchesGroup || matchesProjects;
    });
  }, [activeGroupFilter, searchQuery]);

  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* 1. Header & Digital Record Statement */}
      <section className="gallery-container space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--line)] pb-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold tracking-wider uppercase flex-wrap">
              <Compass className="w-4 h-4" />
              <span>GCECT CAMPUS ARCHIVE</span>
              <span>•</span>
              <span>EST. 1941</span>
              <span>•</span>
              <span>A DIGITAL RECORD OF ARTISTIC HISTORY</span>
            </div>

            <h1 className="page-title text-[var(--ink)]">
              Art Around GCECT
            </h1>

            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[68ch] font-sans">
              Art at the Government College of Engineering and Ceramic Technology is not confined to galleries.
              It lives across forty-foot courtyard frescos, student canteen walls, sacred festival pavilions,
              inter-disciplinary code-and-clay collaborations, and monumental kiln totems.
              This archive serves as a permanent, living digital record of our college’s artistic history.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setContributionModalOpen(true)}
              className="btn-primary"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Contribute to record</span>
            </button>

            <button
              type="button"
              onClick={handleShareArchive}
              className="btn-secondary"
              title="Share Archive"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

      </section>

      {/* 3. Sticky Archival Filter & View Mode Bar */}
      <div className="sticky top-20 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-y border-[var(--line)] shadow-xs transition-colors">
        <div className="gallery-container py-3.5 space-y-3">
          {/* Archive collection filters */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              <button
                type="button"
                onClick={() => handleGroupSelect('all')}
                className={`filter-chip ${activeGroupFilter === 'all' ? 'active' : ''}`}
              >
                <span>All records</span>
                <span className="text-[11px] opacity-70 ml-1.5 font-mono">
                  ({CAMPUS_ART_PROJECTS.length})
                </span>
              </button>

              {CAMPUS_ART_GROUPS.map((grp) => {
                const isActive = activeGroupFilter === grp.id;
                const photoCount = grp.projects.flatMap((p) => p.photoSet).length;

                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => handleGroupSelect(grp.id)}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span>{grp.title}</span>
                    <span className="text-[11px] opacity-70 ml-1.5 font-mono">
                      ({photoCount} photos)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Search Bar & View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[var(--line)]/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creative walls, festivals, installations, artists..."
                className="w-full bg-[var(--surface)] border border-[var(--line)] pl-9 pr-8 py-2 text-xs sm:text-sm rounded-[6px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Groups | Campus Map | Timeline */}
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--line)] p-1 rounded-[6px] shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveViewMode('groups')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  activeViewMode === 'groups'
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Groups View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('map')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  activeViewMode === 'map'
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Campus Map</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('timeline')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  activeViewMode === 'timeline'
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Body: Depends on activeViewMode */}
      <section className="gallery-container">
        {/* VIEW MODE 1: GROUPS VIEW */}
        {activeViewMode === 'groups' && (
          <div className="space-y-16">
            {displayedGroups.length > 0 ? (
              displayedGroups.map((group) => {
                const groupPhotos = group.projects.flatMap((p) => p.photoSet);

                return (
                  <div
                    key={group.id}
                    id={group.slug}
                    className="space-y-8 scroll-mt-36 border-b border-[var(--line)] pb-14 last:border-b-0"
                  >
                    {/* Group Header Banner */}
                    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 sm:p-10 shadow-xs space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
                            <span>ARCHIVE COLLECTION</span>
                            <span>•</span>
                            <span>{group.badge}</span>
                          </div>
                          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--ink)]">
                            {group.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoSet(groupPhotos, 0, group.title, group.title)}
                            className="btn-primary"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Inspect complete photo set ({groupPhotos.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 space-y-4">
                          {/* Short Description */}
                          <div className="bg-[var(--paper)] p-4 rounded-[6px] border border-[var(--line)]">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold block mb-1">
                              Archival Summary
                            </span>
                            <p className="text-base sm:text-lg text-[var(--ink)] font-sans leading-relaxed font-medium">
                              {group.shortDescription}
                            </p>
                          </div>

                          {/* Historical Significance */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-semibold">
                              Historical Significance in College History
                            </h4>
                            <p className="text-sm text-[var(--muted)] font-sans leading-relaxed">
                              {group.historicalSignificance}
                            </p>
                          </div>

                          <blockquote className="border-l-3 border-[var(--accent)] pl-4 py-1 text-xs sm:text-sm text-[var(--muted)] italic font-sans">
                            &ldquo;{group.curatorStatement}&rdquo;
                          </blockquote>
                        </div>

                        <div className="lg:col-span-5 space-y-3">
                          <div
                            onClick={() => handleOpenPhotoSet(groupPhotos, 0, group.title, group.title)}
                            className="group relative aspect-[16/10] rounded-[6px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] cursor-pointer shadow-sm"
                          >
                            <img
                              src={group.heroImage}
                              alt={group.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="bg-[var(--surface)] text-[var(--ink)] px-3.5 py-1.5 rounded-full text-xs font-mono font-medium shadow-md border border-[var(--line)] flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                                <span>Browse photo set</span>
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white font-mono truncate">
                              <MapPin className="w-3 h-3 inline mr-1 text-[var(--accent)]" />
                              {group.locationHighlight}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] px-1">
                            <span>{group.projects.length} Documented Works</span>
                            <span>{groupPhotos.length} High-Res Photos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documented Projects in this Group */}
                    <div className="space-y-8 pl-0 sm:pl-4">
                      {group.projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 sm:p-8 space-y-6 shadow-xs"
                        >
                          {/* Project Header */}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
                                <span>{project.accessionNo}</span>
                                <span>•</span>
                                <span>{project.academicSession}</span>
                                <span>•</span>
                                <span className="bg-[var(--paper)] text-[var(--ink)] px-2 py-0.5 rounded border border-[var(--line)]">
                                  {project.status}
                                </span>
                              </div>

                              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                                {project.title}
                              </h3>

                              <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono">
                                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                                <span>{project.location}</span>
                              </div>
                            </div>

                            {/* Artists & Medium */}
                            <div className="text-left md:text-right space-y-1">
                              <span className="text-xs font-mono text-[var(--muted)] block">
                                Lead Artists / Cohort:
                              </span>
                              <span className="text-sm font-semibold text-[var(--ink)] font-sans block">
                                {project.leadArtists.join(', ')}
                              </span>
                              <span className="text-xs font-mono text-[var(--muted)] block">
                                {project.contributingDepartments.join(' • ')}
                              </span>
                            </div>
                          </div>

                          {/* Project Narrative */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <div className="lg:col-span-8 space-y-3">
                              <p className="text-sm sm:text-base text-[var(--ink)] font-sans leading-relaxed">
                                {project.fullNarrative}
                              </p>

                              <div className="pt-2 text-xs font-mono text-[var(--muted)] border-t border-[var(--line)] py-2 flex flex-wrap gap-4 justify-between">
                                <span><strong>Medium:</strong> {project.medium}</span>
                                <span><strong>Dimensions:</strong> {project.dimensions}</span>
                              </div>
                            </div>

                            <div className="lg:col-span-4 bg-[var(--paper)] p-4 rounded-[6px] border border-[var(--line)] space-y-2">
                              <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider block">
                                Curatorial Note
                              </span>
                              <p className="text-xs text-[var(--muted)] font-sans italic leading-relaxed">
                                &ldquo;{project.curatorNote}&rdquo;
                              </p>
                            </div>
                          </div>

                          {/* Dedicated Photo Set for this project */}
                          <div className="space-y-3 border-t border-[var(--line)] pt-5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
                                Photo Set: {project.title} ({project.photoSet.length} archived captures)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenPhotoSet(project.photoSet, 0, project.title, group.title)}
                                className="text-xs font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
                              >
                                <span>Inspect full set</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {project.photoSet.map((photo, pIdx) => (
                                <div
                                  key={photo.id}
                                  onClick={() => handleOpenPhotoSet(project.photoSet, pIdx, project.title, group.title)}
                                  className="group relative aspect-[16/10] rounded-[6px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] cursor-pointer shadow-xs hover:border-[var(--ink)] transition-colors"
                                >
                                  <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-[var(--surface)] text-[var(--ink)] px-3 py-1 rounded-full text-xs font-mono font-medium shadow-md border border-[var(--line)] flex items-center gap-1.5">
                                      <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                                      <span>View Fullscreen</span>
                                    </span>
                                  </div>

                                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-mono uppercase tracking-wider">
                                    {photo.type}
                                  </div>

                                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white font-mono truncate">
                                    {photo.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty state */
              <div className="text-center py-20 border border-dashed border-[var(--line)] rounded-[8px] bg-[var(--surface)] space-y-4 p-8">
                <Sparkles className="w-10 h-10 text-[var(--accent)] mx-auto" />
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  No documented campus artworks match this search.
                </h3>
                <p className="text-sm text-[var(--muted)] max-w-md mx-auto font-sans">
                  Try searching for a different keyword such as "wall", "terracotta", "festival", or "sculpture".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroupFilter('all');
                    setSearchQuery('');
                  }}
                  className="btn-secondary"
                >
                  <span>Reset filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeViewMode === 'groups' && approvedContributions.length > 0 && (
          <section className="mt-16 space-y-6" aria-labelledby="community-archive-title">
            <div className="border-b border-[var(--line)] pb-4">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">Community archive</p>
              <h2 id="community-archive-title" className="mt-1 font-display text-3xl font-bold text-[var(--ink)]">Contributed campus art</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {approvedContributions.map((record) => (
                <article key={record.id} className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                  {record.imageUrl && <img src={record.imageUrl} alt={record.title} loading="lazy" className="w-full max-h-80 object-cover" />}
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-bold text-[var(--ink)]">{record.title}</h3>
                      <span className="shrink-0 font-mono text-xs text-[var(--accent)]">{record.approxYear}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{record.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]">
                      {record.location && <span><MapPin className="mr-1 inline h-3.5 w-3.5" />{record.location}</span>}
                      <span>{record.contributorName}{record.batchYear ? ` · ${record.batchYear}` : ''}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* VIEW MODE 2: INTERACTIVE CAMPUS MAP */}
        {activeViewMode === 'map' && (
          <div className="space-y-8">
            <CampusArtMap
              onOpenPhoto={(url, title) => {
                const photo = Object.values(CAMPUS_ART_PROJECTS.flatMap((p) => p.photoSet)).find(
                  (p) => p.url === url
                );
                if (photo) {
                  handleOpenPhotoSet([photo], 0, title);
                }
              }}
            />
          </div>
        )}

        {/* VIEW MODE 3: ARCHIVAL TIMELINE */}
        {activeViewMode === 'timeline' && (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[8px] p-6 sm:p-10 lg:p-14 space-y-10 shadow-xs">
            <div className="space-y-2 border-b border-[var(--line)] pb-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>EIGHT DECADES OF ARTISTIC HERITAGE</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)]">
                The Historical Evolution of Art at GCECT (1941 - 2026)
              </h3>
              <p className="text-sm sm:text-base text-[var(--muted)] font-sans max-w-[65ch]">
                Chronological record documenting how artistic expression evolved from early Bengal ceramic kiln craftsmanship into contemporary creative projects and digital archives.
              </p>
            </div>

            <div className="relative pl-6 sm:pl-10 border-l-2 border-[var(--line)] space-y-12">
              {ARCHIVE_TIMELINE_ERAS.map((eraItem) => (
                <div key={eraItem.era} className="relative space-y-2">
                  {/* Timeline Dot */}
                  <div
                    className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--surface)]"
                    style={{ backgroundColor: eraItem.accentColor }}
                  />

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]">
                      {eraItem.era}
                    </span>
                    <span
                      className="text-xs font-mono font-semibold uppercase"
                      style={{ color: eraItem.accentColor }}
                    >
                      {eraItem.tag}
                    </span>
                  </div>

                  <h4 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">
                    {eraItem.title}
                  </h4>

                  <p className="text-sm text-[var(--muted)] font-sans leading-relaxed max-w-[65ch]">
                    {eraItem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. Long-Term Digital Record Mission & Contribution Banner */}
      <section className="gallery-container">
        <div className="bg-[var(--accent)] text-[var(--on-accent)] rounded-[8px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest font-semibold opacity-90 block">
              THE LONG-TERM IDEA: A LIVING ARCHIVE
            </span>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Do you have archival photos of past campus art?
            </h3>
            <p className="text-sm sm:text-base opacity-90 font-sans leading-relaxed">
              Whether you are an alumnus who created a festival pavilion in 2012 or a current student documenting a creative project, help us build the definitive digital record of GCECT's artistic history.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => setContributionModalOpen(true)}
              className="px-8 py-4 rounded-full font-sans font-bold text-sm bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--paper)] shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[var(--accent)]" />
              <span>Submit Archival Photos</span>
            </button>

            <Link
              to="/gallery"
              className="px-8 py-4 rounded-full font-sans font-bold text-sm border-2 border-white/60 text-white hover:bg-white/10 transition-transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2"
            >
              <span>Explore Canvas Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Photo Set Lightbox */}
      <CampusArtLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex}
        onSelectIndex={setLightboxIndex}
        projectTitle={lightboxTitle}
        groupName={lightboxGroupName}
      />

      {/* 7. Contribution Modal */}
      <CampusArtContributionModal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
      />
    </div>
  );
};
