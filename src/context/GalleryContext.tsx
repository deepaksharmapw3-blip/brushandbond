import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Artwork,
  MediumCategory,
  EventItem,
  RegistrationPayload,
  MembershipPayload,
  AchievementItem,
  HeadlineNumber,
} from '../types';
import {
  mockArtworks as initialArtworks,
  mockEvents as initialEvents,
  mockAchievements as initialAchievements,
  mockHeadlineNumbers as initialHeadlineNumbers,
} from '../data/mockData';
import { useToast } from './ToastContext';

interface GalleryContextType {
  artworks: Artwork[];
  events: EventItem[];
  achievements: AchievementItem[];
  headlineNumbers: HeadlineNumber[];
  likedArtworkIds: Set<string>;
  registeredEventIds: Set<string>;
  activeArtworkModal: Artwork | null;
  selectedMedium: MediumCategory;
  searchQuery: string;
  sortBy: 'featured' | 'recent' | 'likes';
  openArtworkModal: (artwork: Artwork) => void;
  closeArtworkModal: () => void;
  nextArtwork: () => void;
  prevArtwork: () => void;
  toggleLike: (artworkId: string) => void;
  setSelectedMedium: (medium: MediumCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'featured' | 'recent' | 'likes') => void;
  registerForEvent: (payload: RegistrationPayload) => { success: boolean; passCode: string };
  submitMembership: (payload: MembershipPayload) => { success: boolean; applicantId: string };
  addAchievement: (achievement: Omit<AchievementItem, 'id'>) => void;
  updateAchievement: (id: string, updated: Partial<AchievementItem>) => void;
  deleteAchievement: (id: string) => void;
  updateHeadlineNumber: (id: string, updated: Partial<HeadlineNumber>) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccess, showInfo } = useToast();
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    const sanitize = (list: Artwork[]) =>
      list.map((a) => ({
        ...a,
        category: a.category || 'campus-art',
        artistDept: a.artistDept || 'GCECT',
        tags: Array.isArray(a.tags) ? a.tags : [],
        medium: a.medium || 'Mixed Media',
      }));

    const saved = localStorage.getItem('bb-artworks');
    if (!saved) return sanitize(initialArtworks);
    try {
      const parsed: Artwork[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((a) => a.id));
      const missingInitial = initialArtworks.filter((a) => !existingIds.has(a.id));
      const merged = missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
      return sanitize(merged);
    } catch {
      return sanitize(initialArtworks);
    }
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('bb-events');
    if (!saved) return initialEvents;
    try {
      const parsed: EventItem[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((e) => e.id));
      const missingInitial = initialEvents.filter((e) => !existingIds.has(e.id));
      return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
    } catch {
      return initialEvents;
    }
  });

  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('bb-liked-art');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('bb-registered-events');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    const saved = localStorage.getItem('bb-achievements');
    if (!saved) return initialAchievements;
    try {
      const parsed: AchievementItem[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((a) => a.id));
      const missingInitial = initialAchievements.filter((a) => !existingIds.has(a.id));
      return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
    } catch {
      return initialAchievements;
    }
  });

  const [headlineNumbers, setHeadlineNumbers] = useState<HeadlineNumber[]>(() => {
    const saved = localStorage.getItem('bb-headline-numbers');
    if (!saved) return initialHeadlineNumbers;
    try {
      return JSON.parse(saved);
    } catch {
      return initialHeadlineNumbers;
    }
  });

  const [activeArtworkModal, setActiveArtworkModal] = useState<Artwork | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<MediumCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'recent' | 'likes'>('featured');

  useEffect(() => {
    localStorage.setItem('bb-artworks', JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem('bb-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('bb-achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('bb-headline-numbers', JSON.stringify(headlineNumbers));
  }, [headlineNumbers]);

  useEffect(() => {
    localStorage.setItem('bb-liked-art', JSON.stringify(Array.from(likedArtworkIds)));
  }, [likedArtworkIds]);

  useEffect(() => {
    localStorage.setItem('bb-registered-events', JSON.stringify(Array.from(registeredEventIds)));
  }, [registeredEventIds]);

  const openArtworkModal = (artwork: Artwork) => {
    setActiveArtworkModal(artwork);
  };

  const closeArtworkModal = () => {
    setActiveArtworkModal(null);
  };

  const nextArtwork = () => {
    if (!activeArtworkModal || artworks.length === 0) return;
    const currentIndex = artworks.findIndex((a) => a.id === activeArtworkModal.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % artworks.length;
    setActiveArtworkModal(artworks[nextIndex]);
  };

  const prevArtwork = () => {
    if (!activeArtworkModal || artworks.length === 0) return;
    const currentIndex = artworks.findIndex((a) => a.id === activeArtworkModal.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + artworks.length) % artworks.length;
    setActiveArtworkModal(artworks[prevIndex]);
  };

  const toggleLike = (artworkId: string) => {
    const isLiked = likedArtworkIds.has(artworkId);
    const nextLikes = new Set(likedArtworkIds);

    if (isLiked) {
      nextLikes.delete(artworkId);
      setArtworks((prev) =>
        prev.map((art) => (art.id === artworkId ? { ...art, likes: Math.max(0, art.likes - 1) } : art))
      );
      showInfo('Removed from your curated favorites');
    } else {
      nextLikes.add(artworkId);
      setArtworks((prev) =>
        prev.map((art) => (art.id === artworkId ? { ...art, likes: art.likes + 1 } : art))
      );
      showSuccess('Appreciated! Saved to your studio bookmarks');
      // Sync like to backend
      import('../services/api').then(({ artworkApi }) => {
        const numId = parseInt(artworkId, 10);
        if (!isNaN(numId)) {
          artworkApi.like(numId).catch(() => {});
        }
      });
    }

    setLikedArtworkIds(nextLikes);
  };

  const registerForEvent = (payload: RegistrationPayload) => {
    const passCode = `GCECT-ART-${Math.floor(1000 + Math.random() * 9000)}`;

    // Sync registration to backend
    import('../services/api').then(({ eventApi }) => {
      const numId = parseInt(payload.eventId, 10) || 1;
      eventApi.register(numId, {
        applicant_name: payload.name,
        applicant_email: payload.email,
        applicant_phone: payload.phone,
        department: payload.department,
      }).catch(() => {});
    });

    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === payload.eventId
          ? { ...evt, registeredCount: evt.registeredCount + 1 }
          : evt
      )
    );

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.add(payload.eventId);
      return next;
    });

    return { success: true, passCode };
  };

  const submitMembership = (payload: MembershipPayload) => {
    const applicantId = `BB-APP-${Date.now().toString().slice(-4)}`;

    // Sync application to backend
    import('../services/api').then(({ applicationApi }) => {
      applicationApi.submit({
        fullName: payload.fullName,
        email: payload.email,
        phone: '9876543210',
        department: payload.department,
        rollNumber: payload.rollNumber || `ROLL-${Date.now().toString().slice(-4)}`,
        academicYear: payload.yearOfStudy,
        artInterests: payload.primaryWing,
        portfolioUrl: payload.portfolioUrl,
        whyJoin: payload.motivation || payload.experienceSummary || 'Passionate about Art at GCECT',
      }).catch(() => {});
    });

    const savedApps = localStorage.getItem('bb-applicants');
    const apps = savedApps ? JSON.parse(savedApps) : [];
    apps.push({ ...payload, applicantId, submittedAt: new Date().toISOString() });
    localStorage.setItem('bb-applicants', JSON.stringify(apps));

    return { success: true, applicantId };
  };

  const addAchievement = (data: Omit<AchievementItem, 'id'>) => {
    const newId = `ach-${Date.now().toString().slice(-4)}`;
    const newAchievement: AchievementItem = {
      ...data,
      id: newId,
    };
    setAchievements((prev) => [newAchievement, ...prev]);
    showSuccess('Achievement Added', `"${newAchievement.title}" has been recorded in honors.`);
  };

  const updateAchievement = (id: string, updated: Partial<AchievementItem>) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    showSuccess('Milestone Updated', 'Achievement details updated successfully.');
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    showInfo('Achievement Removed', 'Item removed from campus honors archive.');
  };

  const updateHeadlineNumber = (id: string, updated: Partial<HeadlineNumber>) => {
    setHeadlineNumbers((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
    );
    showSuccess('Headline Metric Updated', 'Metric updated on honors scoreboard.');
  };

  return (
    <GalleryContext.Provider
      value={{
        artworks,
        events,
        achievements,
        headlineNumbers,
        likedArtworkIds,
        registeredEventIds,
        activeArtworkModal,
        selectedMedium,
        searchQuery,
        sortBy,
        openArtworkModal,
        closeArtworkModal,
        nextArtwork,
        prevArtwork,
        toggleLike,
        setSelectedMedium,
        setSearchQuery,
        setSortBy,
        registerForEvent,
        submitMembership,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        updateHeadlineNumber,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
