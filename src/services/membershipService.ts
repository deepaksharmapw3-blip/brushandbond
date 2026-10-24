/**
 * Membership Application Service
 * Brush and Bond — GCECT Art Club
 * 
 * Membership application submission through the Supabase public-submission Edge Function.
 */

export type AreaOfInterest =
  | 'Sketching'
  | 'Painting'
  | 'Digital art'
  | 'Photography'
  | 'Calligraphy'
  | 'Doodling'
  | 'Other';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export interface MembershipApplicationData {
  name: string;
  department: string;
  year: AcademicYear | string;
  email: string;
  areaOfInterest: AreaOfInterest | string;
  portfolioUrl?: string;
  reasonToJoin: string; // "Why do you want to join?"
}

export interface StoredMembershipApplication extends MembershipApplicationData {
  id: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface MembershipApplicationResult {
  success: boolean;
  id: string;
  message: string;
  application: StoredMembershipApplication;
}

/**
 * Submits a membership application to the Brush and Bond registry.
 *
 * The Edge Function and database enforce submission validation and rate limits.
 */
export async function submitMembershipApplication(
  data: MembershipApplicationData
): Promise<MembershipApplicationResult> {
  // Basic sanity validation
  if (!data.name?.trim()) {
    throw new Error('Name is required.');
  }
  if (!data.email?.trim() || !data.email.includes('@')) {
    throw new Error('Valid email address is required.');
  }
  if (!data.department?.trim()) {
    throw new Error('Department is required.');
  }
  if (!data.year?.trim()) {
    throw new Error('Year of study is required.');
  }
  if (!data.areaOfInterest?.trim()) {
    throw new Error('Area of interest is required.');
  }
  if (!data.reasonToJoin?.trim() || data.reasonToJoin.trim().length < 10) {
    throw new Error('Please share a sentence or two on why you want to join (at least 10 characters).');
  }

  const { applicationApi } = await import('./api');
  const result = await applicationApi.submit({
    fullName: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    department: data.department.trim(),
    academicYear: data.year,
    artInterests: data.areaOfInterest,
    portfolioUrl: data.portfolioUrl?.trim(),
    whyJoin: data.reasonToJoin.trim(),
  });
  const saved = result.application as {
    fullName: string; department: string; academicYear: string; email: string;
    artInterests: string; portfolioUrl?: string; whyJoin: string; id: string;
    submittedAt: string; status: StoredMembershipApplication['status'];
  };
  const record: StoredMembershipApplication = {
    name: saved.fullName,
    department: saved.department,
    year: saved.academicYear,
    email: saved.email,
    areaOfInterest: saved.artInterests,
    portfolioUrl: saved.portfolioUrl || undefined,
    reasonToJoin: saved.whyJoin,
    id: saved.id,
    submittedAt: saved.submittedAt,
    status: saved.status,
  };

  return {
    success: true,
    id: record.id,
    message: result.message,
    application: record,
  };
}
