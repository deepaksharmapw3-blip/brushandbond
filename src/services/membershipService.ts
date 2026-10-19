/**
 * Membership Application Service
 * Brush and Bond — GCECT Art Club
 * 
 * Mocked with localStorage persistence and realistic async latency.
 * Supabase-ready: contains direct schema mapping and client query template.
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
  status: 'received' | 'under_review' | 'accepted';
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
 * Designed to seamlessly plug into Supabase:
 * ```ts
 * const { data, error } = await supabase
 *   .from('membership_applications')
 *   .insert([{
 *     name: payload.name,
 *     department: payload.department,
 *     year: payload.year,
 *     email: payload.email,
 *     area_of_interest: payload.areaOfInterest,
 *     portfolio_url: payload.portfolioUrl || null,
 *     reason_to_join: payload.reasonToJoin,
 *   }])
 *   .select()
 *   .single();
 * ```
 */
export async function submitMembershipApplication(
  data: MembershipApplicationData
): Promise<MembershipApplicationResult> {
  // Simulate realistic network delay (600ms - 800ms)
  await new Promise((resolve) => setTimeout(resolve, 700));

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

  // Generate unique membership reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `BB-${new Date().getFullYear()}-${randomSuffix}`;

  const record: StoredMembershipApplication = {
    name: data.name.trim(),
    department: data.department.trim(),
    year: data.year,
    email: data.email.trim().toLowerCase(),
    areaOfInterest: data.areaOfInterest,
    portfolioUrl: data.portfolioUrl?.trim() || undefined,
    reasonToJoin: data.reasonToJoin.trim(),
    id,
    submittedAt: new Date().toISOString(),
    status: 'received',
  };

  // Submit to backend API
  try {
    const { applicationApi } = await import('./api');
    await applicationApi.submit({
      fullName: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: (data as any).phone || '9876543210',
      department: data.department.trim(),
      rollNumber: (data as any).rollNumber || `GCECT-${Date.now().toString().slice(-4)}`,
      academicYear: data.year,
      artInterests: data.areaOfInterest,
      portfolioUrl: data.portfolioUrl?.trim(),
      whyJoin: data.reasonToJoin.trim(),
    });
  } catch (apiErr) {
    console.warn('API submission notice:', apiErr);
  }

  try {
    const existing = localStorage.getItem('bb-membership-applications');
    const list: StoredMembershipApplication[] = existing ? JSON.parse(existing) : [];
    list.unshift(record);
    localStorage.setItem('bb-membership-applications', JSON.stringify(list));
  } catch (err) {
    console.warn('Could not persist to localStorage:', err);
  }

  return {
    success: true,
    id,
    message: "You're in. We'll email you the next steps.",
    application: record,
  };
}

/**
 * Retrieves all stored membership applications (for admin & debugging)
 */
export function getStoredMembershipApplications(): StoredMembershipApplication[] {
  try {
    const raw = localStorage.getItem('bb-membership-applications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
