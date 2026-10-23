export type CampusArtGroupId =
  | 'creative-walls'
  | 'festival-decorations'
  | 'club-collaborations'
  | 'student-installations';

export type PhotoType = 'wide' | 'detail' | 'progress' | 'night' | 'team';

export interface CampusArtPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  type: PhotoType;
  year: number;
  photographer: string;
  location: string;
}

export type CampusArtProjectStatus =
  | 'Permanent Monument'
  | 'Active Creative Wall'
  | 'Seasonal Archival Record'
  | 'Preserved Landmark'
  | 'Rotational Showcase';

export interface CampusArtProject {
  id: string;
  accessionNo: string;
  title: string;
  groupId: CampusArtGroupId;
  groupName: string;
  year: number;
  academicSession: string;
  location: string;
  campusZone: 'Courtyard' | 'Academic Block' | 'Canteen' | 'Kiln Shed' | 'Central Foyer' | 'Amphitheatre';
  medium: string;
  dimensions: string;
  status: CampusArtProjectStatus;
  leadArtists: string[];
  contributingDepartments: string[];
  shortDescription: string;
  fullNarrative: string;
  curatorNote: string;
  historicalEra: string;
  tags: string[];
  heroImage: string;
  photoSet: CampusArtPhoto[];
}

export interface CampusArtGroup {
  id: CampusArtGroupId;
  slug: string;
  title: string;
  badge: string;
  shortDescription: string;
  longDescription: string;
  historicalSignificance: string;
  heroImage: string;
  locationHighlight: string;
  projectCount: number;
  photoCount: number;
  projects: CampusArtProject[];
  curatorStatement: string;
}

export interface CampusArtContribution {
  id: string;
  contributorName: string;
  email: string;
  batchYear: string;
  department: string;
  artGroup: CampusArtGroupId;
  title: string;
  approxYear: string;
  location: string;
  description: string;
  imageUrl?: string;
  submittedAt: string;
}

export interface CampusArtLandmark {
  id: string;
  name: string;
  zone: string;
  building: string;
  description: string;
  projectCount: number;
  topProjectId: string;
  topProjectTitle: string;
  heroImage: string;
}
