export type GalleryCategory =
  | 'sketches'
  | 'paintings'
  | 'digital-art'
  | 'photography'
  | 'calligraphy'
  | 'doodles'
  | 'campus-art';

export type MediumCategory =
  | 'All'
  | 'Terracotta & Ceramic'
  | 'Oil on Canvas'
  | 'Digital & Concept'
  | 'Charcoal & Graphite'
  | 'Watercolour & Gouache'
  | 'Architectural Photography'
  | 'Sumi Ink Calligraphy'
  | 'Micron Pen Doodle'
  | 'Outdoor Wall Mural';

export interface Artwork {
  id: string;
  accessionNo: string;
  title: string;
  artistId: string;
  artistName: string;
  artistDept: string;
  year: number;
  category: GalleryCategory;
  medium: string;
  dimensions: string;
  description: string;
  curatorNote: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  likes: number;
  views: number;
  physicalLocation: string;
  createdAt: string;
  eventTitle?: string;
  eventSlug?: string;
  artistSlug?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  category: 'Exhibition' | 'Workshop' | 'Plein Air' | 'Live Critique' | 'Open Studio' | 'Drawing Competition' | 'Painting Competition' | 'Live Sketching' | 'Creative Challenge' | 'Inter-Club Collaboration';
  status: 'upcoming' | 'open' | 'concluded';
  registrationOpen: boolean;
  capacity: number;
  registeredCount: number;
  description: string;
  curator: string;
  materialsProvided: string[];
  guidelines: string[];
  imageUrl: string;
  galleryImages?: string[];
  participantArtworkIds?: string[];
  winners?: { place: string; name: string; department: string; artworkTitle?: string }[];
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  batch: string;
  department: string;
  role: string;
  bio: string;
  statement: string;
  specialties: string[];
  avatarUrl: string;
  joinedYear: number;
  handle: string;
}

export interface Milestone {
  year: string;
  dateLabel: string;
  title: string;
  description: string;
  significance: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  award?: string;
  event: string;
  date: string;
  year: string;
  category: 'Exhibition' | 'Award' | 'Installation' | 'Media' | 'Milestone';
  badge: string;
  description: string;
  organizer: string;
  significance?: string;
  imageUrl?: string;
  metrics?: string;
}

export interface HeadlineNumber {
  id: string;
  value: string;
  label: string;
  description: string;
  accent?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  department: string;
  batch: string;
  tier: 'faculty' | 'executive' | 'lead';
  bio: string;
  quote?: string;
  avatarUrl?: string;
  handle?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  responsibilities: string[];
}

export interface ActiveMember {
  id: string;
  name: string;
  department: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  specialty: string;
  avatarUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface AdminSubmission {
  id: string;
  studentName: string;
  department: string;
  yearOfStudy: string;
  title: string;
  category: GalleryCategory;
  medium: string;
  dimensions: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'revision' | 'rejected';
  imageUrl: string;
  statement: string;
}

export interface RegistrationPayload {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  yearOfStudy: string;
  rollNumber: string;
  experienceLevel: 'Beginner' | 'Practicing Artist' | 'Advanced' | 'Curious Engineer';
  notes?: string;
}

export interface MembershipPayload {
  fullName: string;
  email: string;
  rollNumber: string;
  department: 'Ceramic Technology' | 'Computer Science & Engineering' | 'Information Technology';
  yearOfStudy: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  primaryWing: 'Fine Arts & Canvas' | 'Ceramic & Terracotta' | 'Digital & Illustration' | 'Curatorial & Documentation';
  experienceSummary: string;
  portfolioUrl?: string;
  motivation: string;
}

