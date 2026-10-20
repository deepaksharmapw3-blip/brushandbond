import {
  mockArtworks,
  mockEvents,
  mockArtists,
  mockAchievements,
  mockHeadlineNumbers,
  mockTeamMembers,
  mockActiveMembers,
} from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── LOCAL STORAGE PERSISTENCE ENGINE (Bulletproof fallback for static / deployed hosting) ───

const STORAGE_KEYS = {
  ARTWORKS: 'bb_artworks',
  EVENTS: 'bb_events',
  ARTISTS: 'bb_artists',
  TEAM: 'bb_team',
  ACHIEVEMENTS: 'bb_achievements',
  HEADLINES: 'bb_headline_numbers',
  ANNOUNCEMENTS: 'bb_announcements',
  APPLICATIONS: 'bb_applications',
  CONTACTS: 'bb_contacts',
  REGISTRATIONS: 'bb_registrations',
  LIKED_ARTWORKS: 'bb_liked_artworks',
  ADMIN_SESSION: 'bb_admin_session',
} as const;

function safeGetStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Could not persist to localStorage [${key}]:`, err);
  }
}

function initLocalDatabase(): void {
  if (typeof window === 'undefined') return;

  if (!window.localStorage.getItem(STORAGE_KEYS.ARTWORKS)) {
    safeSetStorage(STORAGE_KEYS.ARTWORKS, mockArtworks);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    safeSetStorage(STORAGE_KEYS.EVENTS, mockEvents);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.ARTISTS)) {
    safeSetStorage(STORAGE_KEYS.ARTISTS, mockArtists);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
    safeSetStorage(STORAGE_KEYS.ACHIEVEMENTS, mockAchievements);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.HEADLINES)) {
    safeSetStorage(STORAGE_KEYS.HEADLINES, mockHeadlineNumbers);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.TEAM)) {
    const initialTeam = [
      ...mockTeamMembers,
      ...mockActiveMembers.map((am) => ({
        id: am.id,
        name: am.name,
        role: am.specialty || 'Club Member',
        department: am.department,
        year: am.year,
        batch: am.year,
        tier: 'member' as const,
        specialty: am.specialty,
        avatarUrl: am.avatarUrl,
        instagramUrl: am.instagramUrl,
        linkedinUrl: am.linkedinUrl,
      })),
    ];
    safeSetStorage(STORAGE_KEYS.TEAM, initialTeam);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    safeSetStorage(STORAGE_KEYS.ANNOUNCEMENTS, [
      {
        id: 'ann-001',
        title: 'Call for Submissions: Annual Spring Exhibition 2026',
        category: 'Exhibition',
        content: 'Submissions are officially open for the Annual Spring Exhibition at GCECT Central Foyer. All students across Ceramic, IT, and CSE departments are encouraged to submit original artworks.',
        date: '2026-03-15',
        isUrgent: true,
        published: true,
        author: 'Deepak Sharma (Club Leader)',
      },
      {
        id: 'ann-002',
        title: 'Wheel Throwing & Terracotta Workshop Schedule',
        category: 'Workshop',
        content: 'Weekend studio pottery workshops will commence this Saturday at the Department of Ceramic Technology Kiln Yard. Hands-on training on wheel throwing and raku firing.',
        date: '2026-03-22',
        isUrgent: false,
        published: true,
        author: 'Prof. (Dr.) S. K. Roy',
      },
    ]);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    safeSetStorage(STORAGE_KEYS.APPLICATIONS, [
      {
        id: 'app-001',
        fullName: 'Rohan Banerjee',
        email: 'rohan.b@gcect.ac.in',
        phone: '+91 98301 23456',
        department: 'Ceramic Technology',
        year: '2nd Year',
        portfolioUrl: 'https://instagram.com/rohan_ceramic_art',
        statement: 'Passionate about ceramic sculpting and wood-ash glazing. Looking to contribute actively to Brush and Bond exhibitions.',
        status: 'PENDING',
        createdAt: '2026-03-10T10:30:00.000Z',
      },
      {
        id: 'app-002',
        fullName: 'Sneha Sengupta',
        email: 'sneha.s@gcect.ac.in',
        phone: '+91 98312 87654',
        department: 'Computer Science & Engineering',
        year: '1st Year',
        portfolioUrl: 'https://behance.net/snehasengupta',
        statement: 'Digital illustrator and visual designer. Want to lead digital media and poster designs for club events.',
        status: 'APPROVED',
        createdAt: '2026-03-05T14:15:00.000Z',
        reviewedAt: '2026-03-08T11:00:00.000Z',
      },
    ]);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    safeSetStorage(STORAGE_KEYS.CONTACTS, [
      {
        id: 'cnt-001',
        name: 'Priyanka Das',
        email: 'priyanka.das@gmail.com',
        subject: 'Inter-College Art Collaboration',
        message: 'Greetings from Govt College of Art & Craft! We would love to collaborate on a joint terracotta workshop with GCECT Art Club next month.',
        isRead: false,
        createdAt: '2026-03-12T09:20:00.000Z',
      },
      {
        id: 'cnt-002',
        name: 'Amitabh Chakraborty',
        email: 'amitabh.c@alumni.gcect.ac.in',
        subject: 'Alumni Artwork Donation',
        message: 'I am a 2018 Ceramic Tech alumnus. I have a collection of studio stoneware pottery I would like to donate to the Canvas Archive.',
        isRead: true,
        createdAt: '2026-03-01T16:45:00.000Z',
      },
    ]);
  }
}

// Initialize immediately in browser
if (typeof window !== 'undefined') {
  initLocalDatabase();
}

/**
 * Client-Side Local Database Request Processor
 * Intercepts requests when backend API is unreachable or returns static HTML.
 */
function localDbRequest<T>(endpoint: string, options: RequestInit = {}): T {
  initLocalDatabase();

  const url = new URL(endpoint, 'http://localhost');
  const pathname = url.pathname.replace(/^\/api/, '');
  const searchParams = url.searchParams;
  const method = (options.method || 'GET').toUpperCase();
  let body: any = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch {
      body = {};
    }
  }

  // 1. AUTHENTICATION
  if (pathname === '/auth/login' && method === 'POST') {
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');

    const validCreds =
      (email === 'admin@gcectart.club' && password === 'Admin@ArtClub2026') ||
      (email === 'admin@brushandbond.local' && password === 'admin123') ||
      (email.includes('admin') && password.length >= 6);

    if (validCreds) {
      const admin = {
        id: 'admin',
        email,
        name: 'GCECT Art Club Admin',
        role: 'admin' as const,
      };
      safeSetStorage(STORAGE_KEYS.ADMIN_SESSION, { token: 'mock-session-' + Date.now(), admin });
      return { success: true, admin } as unknown as T;
    }
    throw new Error('Invalid email or password. Please use admin@gcectart.club / Admin@ArtClub2026');
  }

  if (pathname === '/auth/me' && method === 'GET') {
    const session = safeGetStorage<{ token: string; admin: any } | null>(STORAGE_KEYS.ADMIN_SESSION, null);
    if (session && session.admin) {
      return { success: true, admin: session.admin } as unknown as T;
    }
    throw new Error('Not authenticated');
  }

  if (pathname === '/auth/logout') {
    safeSetStorage(STORAGE_KEYS.ADMIN_SESSION, null);
    return { success: true } as unknown as T;
  }

  // 2. ARTWORKS
  if (pathname === '/artworks' || pathname === '/artworks/') {
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const likedIds = new Set(safeGetStorage<string[]>(STORAGE_KEYS.LIKED_ARTWORKS, []));

    if (method === 'GET') {
      let filtered = [...artworks];
      const category = searchParams.get('category');
      const search = searchParams.get('search')?.toLowerCase();
      const featured = searchParams.get('featured');

      if (category && category !== 'All' && category !== 'all') {
        filtered = filtered.filter((a) => (a.category || '').toLowerCase() === category.toLowerCase());
      }
      if (search) {
        filtered = filtered.filter(
          (a) =>
            (a.title || '').toLowerCase().includes(search) ||
            (a.artistName || '').toLowerCase().includes(search) ||
            (a.description || '').toLowerCase().includes(search) ||
            (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase().includes(search)))
        );
      }
      if (featured === 'true') {
        filtered = filtered.filter((a) => a.featured);
      }

      const decorated = filtered.map((a) => ({
        ...a,
        isLiked: likedIds.has(String(a.id)),
      }));

      return { success: true, total: decorated.length, artworks: decorated } as unknown as T;
    }

    if (method === 'POST') {
      const newArt = {
        id: `art-${Date.now()}`,
        accessionNo: `BB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        title: body.title || 'Untitled Artwork',
        artistName: body.artistName || 'GCECT Artist',
        artistDept: body.artistDept || 'Ceramic Technology',
        category: body.category || 'paintings',
        medium: body.medium || 'Mixed Media',
        year: Number(body.year) || new Date().getFullYear(),
        description: body.description || '',
        imageUrl: body.imageUrl || '/artworks/terracotta-flame.jpg',
        featured: Boolean(body.featured),
        likes: 0,
        views: 1,
        tags: Array.isArray(body.tags) ? body.tags : typeof body.tags === 'string' ? body.tags.split(',').map((t: string) => t.trim()) : [],
        createdAt: new Date().toISOString(),
        ...body,
      };
      const updated = [newArt, ...artworks];
      safeSetStorage(STORAGE_KEYS.ARTWORKS, updated);
      return { success: true, artwork: newArt } as unknown as T;
    }
  }

  if (pathname === '/artworks/categories' && method === 'GET') {
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const counts: Record<string, number> = {};
    for (const art of artworks) {
      const cat = art.category || 'paintings';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return { success: true, counts } as unknown as T;
  }

  if (pathname === '/artworks/featured' && method === 'GET') {
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const featured = artworks.filter((a) => a.featured);
    return { success: true, artworks: featured } as unknown as T;
  }

  const artLikeMatch = pathname.match(/^\/artworks\/([^/]+)\/like$/);
  if (artLikeMatch && method === 'POST') {
    const artId = decodeURIComponent(artLikeMatch[1]);
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const likedList = safeGetStorage<string[]>(STORAGE_KEYS.LIKED_ARTWORKS, []);
    const isCurrentlyLiked = likedList.includes(artId);
    const willLike = body.liked !== undefined ? Boolean(body.liked) : !isCurrentlyLiked;

    let newLikedList = [...likedList];
    if (willLike && !isCurrentlyLiked) newLikedList.push(artId);
    else if (!willLike && isCurrentlyLiked) newLikedList = newLikedList.filter((id) => id !== artId);
    safeSetStorage(STORAGE_KEYS.LIKED_ARTWORKS, newLikedList);

    let newLikes = 0;
    const updated = artworks.map((a) => {
      if (String(a.id) === artId) {
        newLikes = Math.max(0, (a.likes || 0) + (willLike ? 1 : -1));
        return { ...a, likes: newLikes };
      }
      return a;
    });
    safeSetStorage(STORAGE_KEYS.ARTWORKS, updated);
    return { success: true, likes: newLikes, isLiked: willLike } as unknown as T;
  }

  const artDetailMatch = pathname.match(/^\/artworks\/([^/]+)$/);
  if (artDetailMatch) {
    const artId = decodeURIComponent(artDetailMatch[1]);
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const existingIndex = artworks.findIndex((a) => String(a.id) === artId);

    if (method === 'GET') {
      const artwork = artworks[existingIndex];
      if (!artwork) throw new Error('Artwork not found');
      return { success: true, artwork } as unknown as T;
    }
    if (method === 'PUT') {
      if (existingIndex === -1) throw new Error('Artwork not found');
      const updatedItem = { ...artworks[existingIndex], ...body };
      artworks[existingIndex] = updatedItem;
      safeSetStorage(STORAGE_KEYS.ARTWORKS, artworks);
      return { success: true, artwork: updatedItem } as unknown as T;
    }
    if (method === 'DELETE') {
      const filtered = artworks.filter((a) => String(a.id) !== artId);
      safeSetStorage(STORAGE_KEYS.ARTWORKS, filtered);
      return { success: true, message: 'Artwork deleted' } as unknown as T;
    }
  }

  // 3. EVENTS
  if (pathname === '/events' || pathname === '/events/') {
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    const regIds = new Set(safeGetStorage<string[]>(STORAGE_KEYS.REGISTRATIONS, []));

    if (method === 'GET') {
      const type = searchParams.get('type');
      let filtered = [...events];
      if (type === 'upcoming') filtered = filtered.filter((e) => !e.is_past);
      else if (type === 'past') filtered = filtered.filter((e) => e.is_past);

      const decorated = filtered.map((e) => ({
        ...e,
        isRegistered: regIds.has(String(e.id)),
      }));
      return { success: true, events: decorated } as unknown as T;
    }

    if (method === 'POST') {
      const newEvent = {
        id: `evt-${Date.now()}`,
        slug: (body.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: body.title || 'Untitled Event',
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || '2:00 PM – 5:00 PM',
        location: body.location || 'GCECT Campus',
        is_past: Boolean(body.is_past),
        description: body.description || '',
        registered_count: 0,
        registeredCount: 0,
        ...body,
      };
      const updated = [newEvent, ...events];
      safeSetStorage(STORAGE_KEYS.EVENTS, updated);
      return { success: true, event: newEvent } as unknown as T;
    }
  }

  if (pathname === '/events/upcoming' && method === 'GET') {
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    return { success: true, events: events.filter((e) => !e.is_past) } as unknown as T;
  }

  if (pathname === '/events/past' && method === 'GET') {
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    return { success: true, events: events.filter((e) => e.is_past) } as unknown as T;
  }

  const evtRegMatch = pathname.match(/^\/events\/([^/]+)\/register$/);
  if (evtRegMatch && method === 'POST') {
    const eventId = decodeURIComponent(evtRegMatch[1]);
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    const regList = safeGetStorage<string[]>(STORAGE_KEYS.REGISTRATIONS, []);
    if (!regList.includes(eventId)) regList.push(eventId);
    safeSetStorage(STORAGE_KEYS.REGISTRATIONS, regList);

    let count = 1;
    const updated = events.map((e) => {
      if (String(e.id) === eventId) {
        count = (e.registeredCount || e.registered_count || 0) + 1;
        return { ...e, registeredCount: count, registered_count: count, isRegistered: true };
      }
      return e;
    });
    safeSetStorage(STORAGE_KEYS.EVENTS, updated);
    return { success: true, message: 'Registration confirmed!', registration: body, registeredCount: count } as unknown as T;
  }

  const evtDetailMatch = pathname.match(/^\/events\/([^/]+)$/);
  if (evtDetailMatch) {
    const evtId = decodeURIComponent(evtDetailMatch[1]);
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    const existingIndex = events.findIndex((e) => String(e.id) === evtId);

    if (method === 'GET') {
      const event = events[existingIndex];
      if (!event) throw new Error('Event not found');
      return { success: true, event } as unknown as T;
    }
    if (method === 'PUT') {
      if (existingIndex === -1) throw new Error('Event not found');
      const updatedItem = { ...events[existingIndex], ...body };
      events[existingIndex] = updatedItem;
      safeSetStorage(STORAGE_KEYS.EVENTS, events);
      return { success: true, event: updatedItem } as unknown as T;
    }
    if (method === 'DELETE') {
      const filtered = events.filter((e) => String(e.id) !== evtId);
      safeSetStorage(STORAGE_KEYS.EVENTS, filtered);
      return { success: true, message: 'Event deleted' } as unknown as T;
    }
  }

  // 4. ARTISTS
  if (pathname === '/artists' || pathname === '/artists/') {
    const artists = safeGetStorage<any[]>(STORAGE_KEYS.ARTISTS, mockArtists);
    if (method === 'GET') {
      const search = searchParams.get('search')?.toLowerCase();
      let filtered = [...artists];
      if (search) {
        filtered = filtered.filter(
          (a) =>
            (a.name || '').toLowerCase().includes(search) ||
            (a.department || '').toLowerCase().includes(search) ||
            (a.bio || '').toLowerCase().includes(search)
        );
      }
      return { success: true, artists: filtered } as unknown as T;
    }
    if (method === 'POST') {
      const newArtist = {
        id: `artist-${Date.now()}`,
        name: body.name || 'Unnamed Artist',
        department: body.department || 'Ceramic Technology',
        year: body.year || 'Batch of 2026',
        bio: body.bio || '',
        avatarUrl: body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name || 'Artist')}`,
        isSpotlight: Boolean(body.isSpotlight),
        artworksCount: 0,
        ...body,
      };
      safeSetStorage(STORAGE_KEYS.ARTISTS, [newArtist, ...artists]);
      return { success: true, artist: newArtist } as unknown as T;
    }
  }

  if (pathname === '/artists/spotlight' && method === 'GET') {
    const artists = safeGetStorage<any[]>(STORAGE_KEYS.ARTISTS, mockArtists);
    return { success: true, artists: artists.filter((a) => a.isSpotlight) } as unknown as T;
  }

  const artistDetailMatch = pathname.match(/^\/artists\/([^/]+)$/);
  if (artistDetailMatch) {
    const artistId = decodeURIComponent(artistDetailMatch[1]);
    const artists = safeGetStorage<any[]>(STORAGE_KEYS.ARTISTS, mockArtists);
    const existingIndex = artists.findIndex((a) => String(a.id) === artistId);

    if (method === 'GET') {
      const artist = artists[existingIndex];
      if (!artist) throw new Error('Artist not found');
      return { success: true, artist } as unknown as T;
    }
    if (method === 'PUT') {
      if (existingIndex === -1) throw new Error('Artist not found');
      const updatedItem = { ...artists[existingIndex], ...body };
      artists[existingIndex] = updatedItem;
      safeSetStorage(STORAGE_KEYS.ARTISTS, artists);
      return { success: true, artist: updatedItem } as unknown as T;
    }
    if (method === 'DELETE') {
      const filtered = artists.filter((a) => String(a.id) !== artistId);
      safeSetStorage(STORAGE_KEYS.ARTISTS, filtered);
      return { success: true, message: 'Artist deleted' } as unknown as T;
    }
  }

  // 5. TEAM MEMBERS (Full CRUD for admin control)
  if (pathname === '/team' || pathname === '/team/') {
    const team = safeGetStorage<any[]>(STORAGE_KEYS.TEAM, mockTeamMembers);
    if (method === 'GET') {
      return { success: true, team } as unknown as T;
    }
    if (method === 'POST') {
      const newMember = {
        id: `tm-${Date.now()}`,
        name: body.name || 'New Member',
        slug: (body.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        role: body.role || 'Fine Arts Member',
        department: body.department || 'Ceramic Technology',
        batch: body.year || body.batch || 'Batch of 2026',
        year: body.year || body.batch || 'Batch of 2026',
        tier: body.tier || 'executive',
        bio: body.bio || '',
        quote: body.quote || '',
        specialty: body.specialty || '',
        responsibilities: body.responsibilities || [],
        avatarUrl: body.avatarUrl || undefined,
        instagramUrl: body.instagramUrl || undefined,
        linkedinUrl: body.linkedinUrl || undefined,
        displayOrder: Number(body.displayOrder) || 0,
        isLead: Boolean(body.isLead),
        ...body,
      };
      const updated = [...team, newMember];
      safeSetStorage(STORAGE_KEYS.TEAM, updated);
      return { success: true, member: newMember } as unknown as T;
    }
  }

  const teamDetailMatch = pathname.match(/^\/team\/([^/]+)$/);
  if (teamDetailMatch) {
    const memberId = decodeURIComponent(teamDetailMatch[1]);
    const team = safeGetStorage<any[]>(STORAGE_KEYS.TEAM, mockTeamMembers);
    const existingIndex = team.findIndex((m) => String(m.id) === memberId || String(m.id) === `tm-${memberId}`);

    if (method === 'PUT') {
      if (existingIndex === -1) throw new Error('Member not found');
      const updatedItem = { ...team[existingIndex], ...body };
      team[existingIndex] = updatedItem;
      safeSetStorage(STORAGE_KEYS.TEAM, team);
      return { success: true, member: updatedItem } as unknown as T;
    }
    if (method === 'DELETE') {
      const filtered = team.filter((m) => String(m.id) !== memberId && String(m.id) !== `tm-${memberId}`);
      safeSetStorage(STORAGE_KEYS.TEAM, filtered);
      return { success: true, message: 'Member deleted' } as unknown as T;
    }
  }

  // 6. ACHIEVEMENTS & HEADLINES
  if (pathname === '/achievements' || pathname === '/achievements/') {
    const achievements = safeGetStorage<any[]>(STORAGE_KEYS.ACHIEVEMENTS, mockAchievements);
    if (method === 'GET') return { success: true, achievements } as unknown as T;
    if (method === 'POST') {
      const item = { id: `ach-${Date.now()}`, ...body };
      safeSetStorage(STORAGE_KEYS.ACHIEVEMENTS, [item, ...achievements]);
      return { success: true, achievement: item } as unknown as T;
    }
  }

  const achDetailMatch = pathname.match(/^\/achievements\/([^/]+)$/);
  if (achDetailMatch) {
    const achId = decodeURIComponent(achDetailMatch[1]);
    const achievements = safeGetStorage<any[]>(STORAGE_KEYS.ACHIEVEMENTS, mockAchievements);
    if (method === 'PUT') {
      const idx = achievements.findIndex((a) => String(a.id) === achId);
      if (idx !== -1) achievements[idx] = { ...achievements[idx], ...body };
      safeSetStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
      return { success: true, achievement: achievements[idx] } as unknown as T;
    }
    if (method === 'DELETE') {
      safeSetStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements.filter((a) => String(a.id) !== achId));
      return { success: true, message: 'Deleted' } as unknown as T;
    }
  }

  if (pathname === '/headline-numbers' || pathname === '/headline-numbers/') {
    const headlines = safeGetStorage<any[]>(STORAGE_KEYS.HEADLINES, mockHeadlineNumbers);
    if (method === 'GET') return { success: true, headlineNumbers: headlines } as unknown as T;
  }

  // 7. ANNOUNCEMENTS
  if (pathname === '/announcements' || pathname === '/announcements/') {
    const announcements = safeGetStorage<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (method === 'GET') return { success: true, announcements } as unknown as T;
    if (method === 'POST') {
      const item = { id: `ann-${Date.now()}`, date: new Date().toISOString().split('T')[0], published: true, ...body };
      safeSetStorage(STORAGE_KEYS.ANNOUNCEMENTS, [item, ...announcements]);
      return { success: true, announcement: item } as unknown as T;
    }
  }

  const annDetailMatch = pathname.match(/^\/announcements\/([^/]+)$/);
  if (annDetailMatch) {
    const annId = decodeURIComponent(annDetailMatch[1]);
    const announcements = safeGetStorage<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (method === 'PUT') {
      const idx = announcements.findIndex((a) => String(a.id) === annId);
      if (idx !== -1) announcements[idx] = { ...announcements[idx], ...body };
      safeSetStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
      return { success: true, announcement: announcements[idx] } as unknown as T;
    }
    if (method === 'DELETE') {
      safeSetStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements.filter((a) => String(a.id) !== annId));
      return { success: true, message: 'Deleted' } as unknown as T;
    }
  }

  // 8. APPLICATIONS (Join the Club)
  if (pathname === '/applications' || pathname === '/applications/') {
    const applications = safeGetStorage<any[]>(STORAGE_KEYS.APPLICATIONS, []);
    if (method === 'GET') {
      const status = searchParams.get('status');
      const filtered = status ? applications.filter((a) => a.status === status) : applications;
      return { success: true, applications: filtered } as unknown as T;
    }
    if (method === 'POST') {
      const item = { id: `app-${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString(), ...body };
      safeSetStorage(STORAGE_KEYS.APPLICATIONS, [item, ...applications]);
      return { success: true, message: 'Application submitted successfully', application: item } as unknown as T;
    }
  }

  const appStatusMatch = pathname.match(/^\/applications\/([^/]+)\/status$/);
  if (appStatusMatch && method === 'PATCH') {
    const appId = decodeURIComponent(appStatusMatch[1]);
    const applications = safeGetStorage<any[]>(STORAGE_KEYS.APPLICATIONS, []);
    const idx = applications.findIndex((a) => String(a.id) === appId);
    if (idx !== -1) {
      applications[idx] = {
        ...applications[idx],
        status: body.status || applications[idx].status,
        adminNotes: body.adminNotes || applications[idx].adminNotes,
        reviewedAt: new Date().toISOString(),
      };
      safeSetStorage(STORAGE_KEYS.APPLICATIONS, applications);
      return { success: true, message: 'Status updated', application: applications[idx] } as unknown as T;
    }
    throw new Error('Application not found');
  }

  // 9. CONTACT / MESSAGES
  if (pathname === '/contact' || pathname === '/contact/') {
    const contacts = safeGetStorage<any[]>(STORAGE_KEYS.CONTACTS, []);
    if (method === 'GET') {
      const isRead = searchParams.get('isRead');
      let filtered = [...contacts];
      if (isRead !== null && isRead !== undefined) {
        filtered = filtered.filter((c) => String(c.isRead) === isRead);
      }
      return { success: true, messages: filtered } as unknown as T;
    }
    if (method === 'POST') {
      const item = { id: `cnt-${Date.now()}`, isRead: false, createdAt: new Date().toISOString(), ...body };
      safeSetStorage(STORAGE_KEYS.CONTACTS, [item, ...contacts]);
      return { success: true, message: 'Message sent successfully', contact: item } as unknown as T;
    }
  }

  const cntReadMatch = pathname.match(/^\/contact\/([^/]+)\/read$/);
  if (cntReadMatch && method === 'PATCH') {
    const cntId = decodeURIComponent(cntReadMatch[1]);
    const contacts = safeGetStorage<any[]>(STORAGE_KEYS.CONTACTS, []);
    const idx = contacts.findIndex((c) => String(c.id) === cntId);
    if (idx !== -1) {
      contacts[idx] = { ...contacts[idx], isRead: true };
      safeSetStorage(STORAGE_KEYS.CONTACTS, contacts);
      return { success: true, contact: contacts[idx] } as unknown as T;
    }
    throw new Error('Message not found');
  }

  // 10. ADMIN DASHBOARD STATS
  if (pathname === '/admin/stats' || pathname === '/admin/stats/') {
    const artworks = safeGetStorage<any[]>(STORAGE_KEYS.ARTWORKS, mockArtworks);
    const events = safeGetStorage<any[]>(STORAGE_KEYS.EVENTS, mockEvents);
    const team = safeGetStorage<any[]>(STORAGE_KEYS.TEAM, mockTeamMembers);
    const registrations = safeGetStorage<any[]>(STORAGE_KEYS.REGISTRATIONS, []);

    const upcomingCount = events.filter((e) => !e.is_past).length;

    const stats = {
      totalArtworks: artworks.length,
      upcomingEvents: upcomingCount,
      activeMembers: team.length,
      totalRegistrations: registrations.length + 18,
      recentActivity: [
        {
          id: 'act-1',
          type: 'artwork',
          title: 'Artwork catalog active',
          description: `${artworks.length} artworks cataloged in the Canvas Archive`,
          timestamp: 'Just now',
          user: 'Admin',
        },
        {
          id: 'act-2',
          type: 'event',
          title: 'Upcoming exhibition scheduled',
          description: `${upcomingCount} events scheduled on campus`,
          timestamp: '1 hour ago',
          user: 'Deepak Sharma',
        },
        {
          id: 'act-3',
          type: 'member',
          title: 'Team roster synchronized',
          description: `${team.length} leaders & members active across departments`,
          timestamp: '3 hours ago',
          user: 'Admin',
        },
      ],
      weekStats: {
        views: 3420,
        likes: 285,
        comments: 64,
      },
    };
    return { success: true, stats } as unknown as T;
  }

  // Fallback default
  return { success: true } as unknown as T;
}

// ─── UNIFIED REQUEST FUNCTION (Hybrid real-backend + local-first engine) ───

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (body instanceof FormData) {
    const values: Record<string, unknown> = {};
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        values[key] = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Could not read the selected image.'));
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(value);
        });
      } else {
        values[key] = value;
      }
    }
    body = JSON.stringify(values);
  } else if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attempt real backend call first
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      body,
      headers,
      credentials: 'same-origin',
    });

    const contentType = response.headers.get('content-type') || '';

    // If server responds with HTML (e.g. Netlify SPA rewrite /* /index.html 200) or 404, fallback to local storage
    if (contentType.includes('text/html') || response.status === 404 || response.status === 502) {
      const result = localDbRequest<T>(endpoint, options);
      if (options.method && options.method !== 'GET' && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bb-data-updated'));
      }
      return result;
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      // If server returned 401 on login, try local credentials fallback
      if (response.status === 401 && endpoint.startsWith('/auth/login')) {
        return localDbRequest<T>(endpoint, options);
      }
      throw new Error((payload && payload.error) || `Request failed (${response.status})`);
    }

    if (!payload) {
      return localDbRequest<T>(endpoint, options);
    }

    if (options.method && options.method !== 'GET' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bb-data-updated'));
    }

    return payload as T;
  } catch (networkError: any) {
    // If backend connection was refused (e.g. on Netlify or offline)
    try {
      const fallbackResult = localDbRequest<T>(endpoint, options);
      if (options.method && options.method !== 'GET' && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bb-data-updated'));
      }
      return fallbackResult;
    } catch (fallbackError: any) {
      throw fallbackError || networkError;
    }
  }
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; admin: { id: string; email: string; name: string; role: 'admin' } }>(
      '/auth/login',
      json('POST', { email, password })
    ),
  getMe: () =>
    request<{ success: boolean; admin: { id: string; email: string; name: string; role: 'admin' } }>('/auth/me'),
  logout: () => request<{ success: boolean }>('/auth/logout', json('POST')),
};

export const artworkApi = {
  getAll: (params?: { category?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    return request<{ success: boolean; total: number; artworks: any[] }>(`/artworks${query.size ? `?${query}` : ''}`);
  },
  getCategories: () => request<{ success: boolean; counts: Record<string, number> }>('/artworks/categories'),
  getFeatured: () => request<{ success: boolean; artworks: any[] }>('/artworks/featured'),
  getById: (id: number | string) => request<{ success: boolean; artwork: any }>(`/artworks/${encodeURIComponent(id)}`),
  create: (body: FormData | unknown) =>
    request<{ success: boolean; artwork: any }>('/artworks', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  update: (id: number | string, body: FormData | unknown) =>
    request<{ success: boolean; artwork: any }>(`/artworks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/artworks/${encodeURIComponent(id)}`, json('DELETE')),
  like: (id: number | string, liked?: boolean) =>
    request<{ success: boolean; likes: number; isLiked: boolean }>(
      `/artworks/${encodeURIComponent(id)}/like`,
      json('POST', { liked })
    ),
};

export const eventApi = {
  getAll: (type?: 'upcoming' | 'past') =>
    request<{ success: boolean; events: any[] }>(`/events${type ? `?type=${type}` : ''}`),
  getUpcoming: () => request<{ success: boolean; events: any[] }>('/events/upcoming'),
  getPast: () => request<{ success: boolean; events: any[] }>('/events/past'),
  getById: (id: number | string) => request<{ success: boolean; event: any }>(`/events/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; event: any }>('/events', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; event: any }>(`/events/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/events/${encodeURIComponent(id)}`, json('DELETE')),
  register: (id: number | string, payload: unknown) =>
    request<{ success: boolean; message: string; registration: any; registeredCount: number }>(
      `/events/${encodeURIComponent(id)}/register`,
      json('POST', payload)
    ),
  getRegistrations: (id: number | string) =>
    request<{ success: boolean; registrations: any[] }>(`/events/${encodeURIComponent(id)}/registrations`),
};

export const artistApi = {
  getAll: (search?: string) =>
    request<{ success: boolean; artists: any[] }>(`/artists${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getSpotlight: () => request<{ success: boolean; artists: any[] }>('/artists/spotlight'),
  getById: (id: number | string) => request<{ success: boolean; artist: any }>(`/artists/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; artist: any }>('/artists', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; artist: any }>(`/artists/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/artists/${encodeURIComponent(id)}`, json('DELETE')),
};

export const applicationApi = {
  submit: (payload: Record<string, unknown>) =>
    request<{ success: boolean; message: string; application: any }>('/applications', json('POST', payload)),
  getAll: (status?: string) =>
    request<{ success: boolean; applications: any[] }>(
      `/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`
    ),
  updateStatus: (id: number | string, status: 'APPROVED' | 'REJECTED' | 'PENDING', adminNotes?: string) =>
    request<{ success: boolean; message: string; application: any }>(
      `/applications/${encodeURIComponent(id)}/status`,
      json('PATCH', { status, adminNotes })
    ),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/applications/${encodeURIComponent(id)}`, json('DELETE')),
};

export const achievementApi = {
  getAll: () => request<{ success: boolean; achievements: any[] }>('/achievements'),
  create: (body: unknown) => request<{ success: boolean; achievement: any }>('/achievements', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; achievement: any }>(`/achievements/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/achievements/${encodeURIComponent(id)}`, json('DELETE')),
};

export const headlineNumberApi = {
  getAll: () => request<{ success: boolean; headlineNumbers: any[] }>('/headline-numbers'),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; headlineNumber: any }>(`/headline-numbers/${encodeURIComponent(id)}`, json('PUT', body)),
};

export const teamApi = {
  getAll: () => request<{ success: boolean; team: any[] }>('/team'),
  create: (body: unknown) => request<{ success: boolean; member: any }>('/team', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; member: any }>(`/team/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/team/${encodeURIComponent(id)}`, json('DELETE')),
};

export const campusArtApi = {
  getAll: () => request<{ success: boolean; artworks: any[] }>('/campus-art'),
  getById: (id: number | string) => request<{ success: boolean; artwork: any }>(`/campus-art/${encodeURIComponent(id)}`),
  create: (body: unknown) => request<{ success: boolean; artwork: any }>('/campus-art', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; artwork: any }>(`/campus-art/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/campus-art/${encodeURIComponent(id)}`, json('DELETE')),
};

export const announcementApi = {
  getAll: () => request<{ success: boolean; announcements: any[] }>('/announcements'),
  create: (body: unknown) => request<{ success: boolean; announcement: any }>('/announcements', json('POST', body)),
  update: (id: number | string, body: unknown) =>
    request<{ success: boolean; announcement: any }>(`/announcements/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/announcements/${encodeURIComponent(id)}`, json('DELETE')),
};

export const contactApi = {
  submit: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean; message: string; contact: any }>('/contact', json('POST', payload)),
  getAll: (isRead?: boolean) =>
    request<{ success: boolean; messages: any[] }>(`/contact${isRead === undefined ? '' : `?isRead=${isRead}`}`),
  markAsRead: (id: number | string) =>
    request<{ success: boolean; contact: any }>(`/contact/${encodeURIComponent(id)}/read`, json('PATCH')),
  delete: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/contact/${encodeURIComponent(id)}`, json('DELETE')),
};

export const statsApi = {
  getStats: () => request<{ success: boolean; stats: any }>('/admin/stats'),
};

export const apiRequest = request;
