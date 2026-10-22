import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Artwork,
  Artist,
  MediumCategory,
  EventItem,
  RegistrationPayload,
  MembershipPayload,
  AchievementItem,
  HeadlineNumber,
} from '../types';
import { useToast } from './ToastContext';

interface GalleryContextType {
  artworks: Artwork[];
  artists: Artist[];
  events: EventItem[];
  achievements: AchievementItem[];
  headlineNumbers: HeadlineNumber[];
  sharedDataError: string | null;
  isLoadingSharedData: boolean;
  retrySharedData: () => void;
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
  toggleLike: (artworkId: string) => Promise<void>;
  setSelectedMedium: (medium: MediumCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'featured' | 'recent' | 'likes') => void;
  registerForEvent: (payload: RegistrationPayload) => Promise<{ success: boolean; passCode: string }>;
  submitMembership: (payload: MembershipPayload) => Promise<{ success: boolean; applicantId: string }>;
  addAchievement: (achievement: Omit<AchievementItem, 'id'>) => Promise<void>;
  updateAchievement: (id: string, updated: Partial<AchievementItem>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  updateHeadlineNumber: (id: string, updated: Partial<HeadlineNumber>) => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccess, showInfo, showWarning } = useToast();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(() => new Set());

  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(() => new Set());

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [headlineNumbers, setHeadlineNumbers] = useState<HeadlineNumber[]>([]);
  const [sharedDataError, setSharedDataError] = useState<string | null>(null);
  const [isLoadingSharedData, setIsLoadingSharedData] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);

  const [activeArtworkModal, setActiveArtworkModal] = useState<Artwork | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<MediumCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'recent' | 'likes'>('featured');

  useEffect(() => {
    let active = true;
    const loadSharedData = async () => {
      if (active) setIsLoadingSharedData(true);
      try {
        const { artworkApi, eventApi, artistApi, achievementApi, headlineNumberApi } = await import('../services/api');
        const results = await Promise.allSettled([
          artworkApi.getAll({ limit: 500 }), eventApi.getAll(), artistApi.getAll(), achievementApi.getAll(), headlineNumberApi.getAll(),
        ]);
        if (!active) return;
        const [artworkResult, eventResult, artistResult, achievementResult, headlineResult] = results;
        const failedSections: string[] = [];

        if (artworkResult.status === 'fulfilled') {
          const loadedArtworks = artworkResult.value.artworks || [];
          setArtworks(loadedArtworks.map((art) => ({
            ...art,
            category: art.category || 'campus-art',
            artistDept: art.artistDept || 'GCECT',
            tags: Array.isArray(art.tags) ? art.tags : [],
            medium: art.medium || 'Mixed Media',
          })));
          setLikedArtworkIds(new Set(loadedArtworks.filter((art) => art.isLiked).map((art) => String(art.id))));
        } else {
          console.error('Could not load GCECT Canvas artworks:', artworkResult.reason);
          failedSections.push('Canvas artworks');
        }

        if (eventResult.status === 'fulfilled') {
          setEvents(eventResult.value.events || []);
          setRegisteredEventIds(new Set((eventResult.value.events || []).filter((event) => event.isRegistered).map((event) => String(event.id))));
        } else {
          console.error('Could not load events:', eventResult.reason);
          failedSections.push('events');
        }

        if (artistResult.status === 'fulfilled') setArtists(artistResult.value.artists || []);
        else {
          console.error('Could not load artist profiles:', artistResult.reason);
          failedSections.push('artist profiles');
        }

        if (achievementResult.status === 'fulfilled') setAchievements(achievementResult.value.achievements || []);
        else {
          console.error('Could not load achievements:', achievementResult.reason);
          failedSections.push('achievements');
        }

        if (headlineResult.status === 'fulfilled') setHeadlineNumbers(headlineResult.value.headlineNumbers || []);
        else {
          console.error('Could not load headline metrics:', headlineResult.reason);
          failedSections.push('site metrics');
        }

        setSharedDataError(failedSections.length
          ? `Some live content could not be loaded (${failedSections.join(', ')}). Retry to try again.`
          : null);
      } catch (error) {
        console.error('Could not initialize the shared gallery data:', error);
        if (active) setSharedDataError('Live site content is temporarily unavailable. Please retry in a moment.');
      } finally {
        if (active) setIsLoadingSharedData(false);
      }
    };
    void loadSharedData();
    window.addEventListener('bb-data-updated', loadSharedData);
    return () => {
      active = false;
      window.removeEventListener('bb-data-updated', loadSharedData);
    };
  }, [loadVersion]);

  const retrySharedData = () => setLoadVersion((version) => version + 1);

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

  const toggleLike = async (artworkId: string) => {
    const isLiked = likedArtworkIds.has(artworkId);
    try {
      const { artworkApi } = await import('../services/api');
      const result = await artworkApi.like(artworkId, !isLiked);
      setArtworks((prev) => prev.map((art) => art.id === artworkId ? { ...art, likes: result.likes } : art));
      setLikedArtworkIds((prev) => {
        const next = new Set(prev);
        if (result.isLiked) next.add(artworkId);
        else next.delete(artworkId);
        return next;
      });
      if (result.isLiked) showSuccess('Appreciated! Saved to your studio bookmarks');
      else showInfo('Removed from your curated favorites');
    } catch (error) {
      showWarning('Could not update your appreciation', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const registerForEvent = async (payload: RegistrationPayload) => {
    const { eventApi } = await import('../services/api');
    const { registration, registeredCount } = await eventApi.register(payload.eventId, {
        applicant_name: payload.name,
        name: payload.name,
        applicant_email: payload.email,
        email: payload.email,
        applicant_phone: payload.phone,
        phone: payload.phone,
        department: payload.department,
        yearOfStudy: payload.yearOfStudy,
        rollNumber: payload.rollNumber,
      });

    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === payload.eventId
          ? { ...evt, registeredCount }
          : evt
      )
    );

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.add(payload.eventId);
      return next;
    });

    return { success: true, passCode: registration.passCode };
  };

  const submitMembership = async (payload: MembershipPayload) => {
    const { applicationApi } = await import('../services/api');
    const result = await applicationApi.submit({
        fullName: payload.fullName,
        email: payload.email,
        department: payload.department,
        rollNumber: payload.rollNumber,
        academicYear: payload.yearOfStudy,
        artInterests: payload.primaryWing,
        portfolioUrl: payload.portfolioUrl,
        whyJoin: payload.motivation || payload.experienceSummary || 'Passionate about Art at GCECT',
      });
    return { success: true, applicantId: result.application.id };
  };

  const addAchievement = async (data: Omit<AchievementItem, 'id'>) => {
    try {
      const { achievementApi } = await import('../services/api');
      const { achievement } = await achievementApi.create(data);
      setAchievements((prev) => [achievement, ...prev]);
      showSuccess('Achievement Added', `"${achievement.title}" has been recorded in honors.`);
    } catch (error) {
      showWarning('Could not save achievement', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const updateAchievement = async (id: string, updated: Partial<AchievementItem>) => {
    try {
      const { achievementApi } = await import('../services/api');
      const { achievement } = await achievementApi.update(id, updated);
      setAchievements((prev) => prev.map((item) => item.id === id ? achievement : item));
      showSuccess('Milestone Updated', 'Achievement details updated successfully.');
    } catch (error) {
      showWarning('Could not update achievement', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      const { achievementApi } = await import('../services/api');
      await achievementApi.delete(id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      showInfo('Achievement Removed', 'Item removed from campus honors archive.');
    } catch (error) {
      showWarning('Could not remove achievement', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const updateHeadlineNumber = async (id: string, updated: Partial<HeadlineNumber>) => {
    try {
      const { headlineNumberApi } = await import('../services/api');
      const { headlineNumber } = await headlineNumberApi.update(id, updated);
      setHeadlineNumbers((prev) => prev.map((item) => item.id === id ? headlineNumber : item));
      showSuccess('Headline Metric Updated', 'Metric updated on honors scoreboard.');
    } catch (error) {
      showWarning('Could not update the metric', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <GalleryContext.Provider
      value={{
        artworks,
        artists,
        events,
        achievements,
        headlineNumbers,
        sharedDataError,
        isLoadingSharedData,
        retrySharedData,
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

// oxlint-disable-next-line react/only-export-components -- Keep the gallery provider and its hook as one context API.
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
