import type {
  CampusArtGroup,
  CampusArtProject,
  CampusArtLandmark,
  CampusArtPhoto,
} from '../types/campusArt';

// Public Campus Art entries are added through original community submissions
// and appear after administrator approval. No sample photos or descriptions.
export const CAMPUS_ART_PHOTOS: Record<string, CampusArtPhoto> = {};
export const CAMPUS_ART_PROJECTS: CampusArtProject[] = [];
export const CAMPUS_ART_GROUPS: CampusArtGroup[] = [];
export const CAMPUS_ART_LANDMARKS: CampusArtLandmark[] = [];
export const ARCHIVE_TIMELINE_ERAS: Array<{
  era: string;
  title: string;
  description: string;
  tag: string;
  accentColor: string;
}> = [];
