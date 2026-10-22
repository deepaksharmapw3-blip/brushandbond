require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function seed() {
  console.log("Seeding GCECT Art Club database...");

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase();
  const rawPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!adminEmail || !rawPassword || rawPassword.length < 16) {
    throw new Error("Set ADMIN_DEFAULT_EMAIL and an ADMIN_DEFAULT_PASSWORD of at least 16 characters before seeding.");
  }
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      name: "GCECT Art Club Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin user seeded: ${admin.email}`);

  // 2. Seed Artists
  const artistData = [
    {
      name: "Sagnik Mukherjee",
      department: "Ceramic Technology",
      year: "4th Year",
      bio: "Passionate ceramic sculptor and watercolor enthusiast. Love experimenting with clay and pastel tones.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      instagram: "https://instagram.com/sagnik_art",
      isSpotlight: true,
    },
    {
      name: "Ananya Banerjee",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      bio: "Digital concept artist and 2D animator. Creating fantasy landscapes and sci-fi illustrations.",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
      instagram: "https://instagram.com/ananya_creates",
      isSpotlight: true,
    },
    {
      name: "Sourav Paul",
      department: "Information Technology",
      year: "2nd Year",
      bio: "Street photographer and monochrome sketch artist exploring shadows and campus life.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      instagram: "https://instagram.com/sourav_clicks",
      isSpotlight: false,
    },
    {
      name: "Roshni Sen",
      department: "Ceramic Technology",
      year: "3rd Year",
      bio: "Pottery designer and acrylic painter blending traditional Indian folk art with modern pottery.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      instagram: "https://instagram.com/roshni_brush",
      isSpotlight: true,
    },
  ];

  const createdArtists = [];
  for (const item of artistData) {
    let artist = await prisma.artist.findFirst({ where: { name: item.name } });
    if (!artist) {
      artist = await prisma.artist.create({ data: item });
    }
    createdArtists.push(artist);
  }
  console.log(`Artists seeded: ${createdArtists.length}`);

  // 3. Seed Artworks across 4 categories: Sketches, Paintings, Digital Art, Photography
  const artworkData = [
    // Sketches
    {
      title: "Charcoal Silhouette of Heritage Kiln",
      category: "SKETCHES",
      description: "Charcoal rendering of GCECT's historic ceramic kiln on textured ivory sheet.",
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800",
      tags: "charcoal, sketch, heritage, gcect",
      featured: true,
      likes: 42,
      artistId: createdArtists[0].id,
    },
    {
      title: "Expressive Graphite Portrait",
      category: "SKETCHES",
      description: "Hyper-realistic graphite pencil study focusing on emotional depth and lighting.",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
      tags: "pencil, portrait, realism",
      featured: false,
      likes: 29,
      artistId: createdArtists[2].id,
    },
    // Paintings
    {
      title: "Golden Hour Over Beliaghata Lake",
      category: "PAINTINGS",
      description: "Oil and acrylic on canvas capturing the reflection of evening sky near campus.",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800",
      tags: "acrylic, oil, sunset, nature",
      featured: true,
      likes: 58,
      artistId: createdArtists[3].id,
    },
    {
      title: "Vibrant Ceramic Glaze Harmony",
      category: "PAINTINGS",
      description: "Abstract color-play inspired by high-temperature ceramic glazes and crystallization.",
      imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800",
      tags: "abstract, glaze, modern",
      featured: false,
      likes: 34,
      artistId: createdArtists[0].id,
    },
    // Digital Art
    {
      title: "Cyberpunk Kolkata 2088",
      category: "DIGITAL_ART",
      description: "Futuristic digital matte painting fusing neon tram lines with historic architecture.",
      imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
      tags: "cyberpunk, sci-fi, digital, neon",
      featured: true,
      likes: 77,
      artistId: createdArtists[1].id,
    },
    {
      title: "Ethereal Dreamscape",
      category: "DIGITAL_ART",
      description: "Vector illustration exploring serenity, starry constellations, and surrealism.",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      tags: "vector, dream, surreal",
      featured: false,
      likes: 45,
      artistId: createdArtists[1].id,
    },
    // Photography
    {
      title: "Monochrome Shadows of Academic Corridor",
      category: "PHOTOGRAPHY",
      description: "Black and white architectural capture of GCECT main building symmetry at noon.",
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
      tags: "monochrome, architecture, campus",
      featured: true,
      likes: 63,
      artistId: createdArtists[2].id,
    },
    {
      title: "Molten Glow in Ceramic Kiln",
      category: "PHOTOGRAPHY",
      description: "High-contrast documentary capture of firing ceramics reaching 1200°C.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
      tags: "fire, kiln, ceramic, industrial",
      featured: false,
      likes: 51,
      artistId: createdArtists[0].id,
    },
  ];

  for (const art of artworkData) {
    const existing = await prisma.artwork.findFirst({ where: { title: art.title } });
    if (!existing) {
      await prisma.artwork.create({ data: art });
    }
  }
  console.log("Artworks seeded across all 4 categories!");

  // 4. Update / Seed Events
  const eventsCount = await prisma.events.count();
  if (eventsCount <= 3) {
    await prisma.events.createMany({
      data: [
        {
          event_name: "Annual GCECT Art Carnival 2026",
          event_date: new Date("2026-11-20T10:00:00Z"),
          event_time: "10:00 AM - 5:00 PM",
          venue: "Main Auditorium & Quadrangle",
          description: "A day-long festival featuring live painting, ceramic modeling, digital art showcases, and guest workshops.",
          banner_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
          category: "Carnival",
          is_past: false,
          max_capacity: 250,
        },
        {
          event_name: "Street Wall Mural Painting Drive",
          event_date: new Date("2026-12-05T09:00:00Z"),
          event_time: "9:00 AM - 3:00 PM",
          venue: "GCECT Campus Boundary Walls",
          description: "Collaborative campus beautification project focusing on environmental awareness and science & art harmony.",
          banner_url: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800",
          category: "Outdoor",
          is_past: false,
          max_capacity: 60,
        },
        {
          event_name: "Clay & Pottery Basics Workshop",
          event_date: new Date("2026-09-15T14:00:00Z"),
          event_time: "2:00 PM - 5:00 PM",
          venue: "Ceramic Department Studio",
          description: "Hands-on pottery workshop teaching wheel throwing, hand building, and terracotta shaping.",
          banner_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
          category: "Workshop",
          is_past: true,
          max_capacity: 40,
        },
      ],
    });
    console.log("Events updated with upcoming & past events!");
  }

  // 5. Seed Achievements
  const achievementData = [
    {
      title: "1st Prize at State Inter-College Fine Arts Fest",
      recipientName: "Sagnik Mukherjee",
      competitionName: "Kolkata Youth Kala Utsav",
      awardTitle: "Champion Trophy",
      description: "Won gold in live sculpture and clay modeling competing against 30+ colleges.",
      awardDate: new Date("2026-08-10"),
      imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600",
    },
    {
      title: "Best Digital Illustration Winner",
      recipientName: "Ananya Banerjee",
      competitionName: "Bengal Tech Art Conclave",
      awardTitle: "Excellence in Digital Media",
      description: "Recognized for creative storytelling depicting folklore through modern vector illustration.",
      awardDate: new Date("2026-07-22"),
      imageUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=600",
    },
  ];

  for (const ach of achievementData) {
    const existing = await prisma.achievement.findFirst({ where: { title: ach.title } });
    if (!existing) {
      await prisma.achievement.create({ data: ach });
    }
  }
  console.log("Achievements seeded!");

  // 6. Seed Our Team
  const teamData = [
    {
      name: "Prof. (Dr.) S. K. Roy",
      role: "Faculty Mentor & Chief Patron",
      department: "Ceramic Technology",
      year: "Faculty Advisor",
      tier: "faculty",
      bio: "Professor and material scientist with three decades of research into refractory silicates. Prof. Roy serves as the chief champion and institutional sponsor of Brush and Bond.",
      quote: "Art and engineering are merely two languages describing the same yearning to reshape raw nature into human meaning.",
      responsibilities: "Institutional advisory, Kiln yard safety protocols, Studio resource grants",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      displayOrder: 1,
      isLead: true,
    },
    {
      name: "Deepak Sharma",
      role: "President / Club Leader",
      department: "Ceramic Technology",
      year: "Batch of 2026",
      tier: "executive",
      bio: "Co-founder and driving force behind Brush and Bond. Deepak leads studio operations, coordinates exhibitions, and mentors new recruits across all three departments.",
      quote: "The studio is a sanctuary where you learn that mistakes in clay can be fired into enduring beauty.",
      responsibilities: "Overall club strategy, Pottery workshops, Inter-college liaisons",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      instagramUrl: "https://instagram.com/deepak_brushandbond",
      linkedinUrl: "https://linkedin.com/in/deepak-sharma-gcect",
      displayOrder: 2,
      isLead: true,
    },
    {
      name: "Anamika Sen",
      role: "Vice President",
      department: "Computer Science & Engineering",
      year: "Batch of 2026",
      tier: "executive",
      bio: "Leads artwork acquisition, exhibition staging, and curation for The GCECT Canvas archive. Practicing oil painter and design enthusiast.",
      quote: "We curate with an open door: if you made it with heart on this campus, it deserves a spotlight.",
      responsibilities: "Archive curation, Exhibition design, Artist onboarding",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
      instagramUrl: "https://instagram.com/anamika.oilstudios",
      linkedinUrl: "https://linkedin.com/in/anamika-sen",
      displayOrder: 3,
      isLead: true,
    },
    {
      name: "Subhajit Mukherjee",
      role: "Creative Head",
      department: "Ceramic Technology",
      year: "Batch of 2025",
      tier: "executive",
      bio: "Spearheads workshop themes, concept art direction, and collaborative campus mural projects. Specialist in wood-ash high firing and wheel-thrown stoneware.",
      quote: "Creativity is not a talent — it is a practice. Show up at the wheel and the clay will teach you.",
      responsibilities: "Workshop curation, Creative direction, Mural projects",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      instagramUrl: "https://instagram.com/subhajit_clayworks",
      displayOrder: 4,
      isLead: true,
    },
    {
      name: "Rohan Bhattacharya",
      role: "Design Head",
      department: "Information Technology",
      year: "Batch of 2025",
      tier: "executive",
      bio: "Creator of the digital design system, poster artwork, and lead concept illustrator. Blends full-stack React development with 3D generative art.",
      quote: "Design is not cosmetic dressing; it is the clarity with which our community talks to each other.",
      responsibilities: "Web engineering, Poster design, Digital masterclasses",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      instagramUrl: "https://instagram.com/rohan_renders",
      linkedinUrl: "https://linkedin.com/in/rohan-bhattacharya",
      displayOrder: 5,
      isLead: true,
    },
    {
      name: "Tirthankar Ghosh",
      role: "Media & Photography Head",
      department: "Information Technology",
      year: "Batch of 2026",
      tier: "executive",
      bio: "High-res artwork digitizer, event photographer, and custodian of the physical slide and print archives. Captures every exhibition and campus moment.",
      quote: "Preserving the art is as critical as making it, so the next batch remembers what we built here.",
      responsibilities: "Artwork photography, Event coverage, Instagram visual feed",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
      instagramUrl: "https://instagram.com/tirthankar_clicks",
      displayOrder: 6,
      isLead: false,
    },
    {
      name: "Ritika Paul",
      role: "Event Coordinator",
      department: "Ceramic Technology",
      year: "Batch of 2027",
      tier: "executive",
      bio: "Plans and executes all club events — from Genesis exhibitions and drawing competitions to inter-college collaborations and open studio nights.",
      quote: "A great event is 80% invisible logistics and 20% pure magic on stage.",
      responsibilities: "Event planning, Venue logistics, Registration management",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      instagramUrl: "https://instagram.com/ritika.events",
      displayOrder: 7,
      isLead: false,
    },
    {
      name: "Sneha Majumdar",
      role: "Social Media Head",
      department: "Computer Science & Engineering",
      year: "Batch of 2026",
      tier: "executive",
      bio: "Manages the club's Instagram, campus newsletter, and member engagement campaigns. Watercolorist and plein-air painter.",
      quote: "Nobody ever walks into our studio as a stranger; we put a brush in your hand before asking your semester.",
      responsibilities: "Instagram content, Studio dispatches newsletter, Community engagement",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      instagramUrl: "https://instagram.com/sneha.washes",
      linkedinUrl: "https://linkedin.com/in/sneha-majumdar",
      displayOrder: 8,
      isLead: false,
    },
    {
      name: "Debargha Roy",
      role: "Sketching & Plein-Air Coordinator",
      department: "Ceramic Technology",
      year: "Batch of 2027",
      tier: "lead",
      bio: "Organizer of campus sketch crawls, charcoal intensives, and printmaking tutorials. Captures historic Kolkata architecture.",
      quote: "Drawing is seeing. A sketch walk changes how you look at every window lintel and brick joint.",
      responsibilities: "Weekly sketch walks, Charcoal & ink supplies, Campus field trips",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      instagramUrl: "https://instagram.com/debargha_lines",
      displayOrder: 9,
      isLead: true,
    },
    {
      name: "Poulami Das",
      role: "Studio Logistics & Kiln Inventory Manager",
      department: "Ceramic Technology",
      year: "Batch of 2027",
      tier: "lead",
      bio: "Oversees clay slip batches, glaze inventory, kiln firing schedules, and studio supply requisitions.",
      quote: "Good art needs sharp logistics. A clean wheel and dry wood are the unsung heroes of pottery.",
      responsibilities: "Kiln firing slots, Material inventory, Studio safety",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      displayOrder: 10,
      isLead: true,
    },
    // Community members
    {
      name: "Sayantika Bose",
      role: "Active Member",
      department: "Information Technology",
      year: "1st Year",
      tier: "member",
      specialty: "Carbon pencil sketching",
      instagramUrl: "https://instagram.com/sayantika.art",
      displayOrder: 20,
    },
    {
      name: "Aritra Saha",
      role: "Active Member",
      department: "Ceramic Technology",
      year: "1st Year",
      tier: "member",
      specialty: "Wheel throwing",
      displayOrder: 21,
    },
    {
      name: "Aparna Mukherjee",
      role: "Active Member",
      department: "Ceramic Technology",
      year: "2nd Year",
      tier: "member",
      specialty: "Raku firing & glazes",
      instagramUrl: "https://instagram.com/aparna.canvas",
      displayOrder: 22,
    },
    {
      name: "Priya Mukherjee",
      role: "Active Member",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      tier: "member",
      specialty: "Acrylic on canvas",
      instagramUrl: "https://instagram.com/priya.pigments",
      displayOrder: 23,
    },
  ];

  for (const t of teamData) {
    const existing = await prisma.teamMember.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.teamMember.create({ data: t });
    } else {
      await prisma.teamMember.update({
        where: { id: existing.id },
        data: t,
      });
    }
  }
  console.log("Team members seeded & updated!");

  // 7. Seed Art Around GCECT (Campus murals / art)
  const campusArtData = [
    {
      title: "The Ceramic Renaissance Wall",
      location: "Main Building Ground Floor Corridor",
      description: "A 40-foot collaborative fresco celebrating the craft of ceramic engineering, pottery wheel origins, and modern nano-materials.",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
      artistCredits: "GCECT Art Club Core Team & Volunteers",
      dateCompleted: "March 2025",
    },
    {
      title: "Chai & Conversations Graffiti",
      location: "College Canteen Outer Brick Wall",
      description: "Vibrant pop-art doodle dedicated to Kolkata tea stalls, adda sessions, and engineering humor.",
      imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800",
      artistCredits: "Batch of 2026 Artists",
      dateCompleted: "August 2025",
    },
    {
      title: "Harmony in Clay (Ceramic Mosaic)",
      location: "Workshop Entry Gate",
      description: "Intricate mosaic created using discarded ceramic tiles, glazed pottery fragments, and terracotta.",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
      artistCredits: "Ceramic Technology Students",
      dateCompleted: "January 2026",
    },
  ];

  for (const c of campusArtData) {
    const existing = await prisma.campusArt.findFirst({ where: { title: c.title } });
    if (!existing) {
      await prisma.campusArt.create({ data: c });
    }
  }
  console.log("Campus Art seeded!");

  // 8. Seed Announcements
  const announcementsData = [
    {
      title: "Call for Entries: Annual Art Carnival 2026",
      content: "Submissions are now open for Sketches, Paintings, Digital Art, and Photography for our upcoming Annual Art Exhibition! Submit your entries via the club portal or contact the coordinators.",
      category: "Exhibition",
      isPinned: true,
      author: "Art Club Committee",
    },
    {
      title: "Weekly Charcoal & Shading Workshop This Saturday",
      content: "Join us in Room 204 at 3:00 PM this Saturday for an intensive live shading practice with charcoal sticks and blending stumps. Materials will be provided.",
      category: "Workshop",
      isPinned: false,
      author: "Sagnik Mukherjee",
    },
  ];

  for (const a of announcementsData) {
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.announcement.create({ data: a });
    }
  }
  console.log("Announcements seeded!");

  // 9. Seed Sample Club Applications
  const applicationsData = [
    {
      fullName: "Debojyoti Mondal",
      email: "debojyoti@example.com",
      phone: "9831234567",
      department: "Computer Science & Engineering",
      rollNumber: "CSE/24/042",
      academicYear: "2nd Year",
      artInterests: "Digital Art, Sketches",
      portfolioUrl: "https://drive.google.com/drive/folders/sample-art",
      whyJoin: "I have been doing digital concept art for 3 years and want to contribute to college fest designs and art exhibitions.",
      status: "PENDING",
    },
    {
      fullName: "Tanushree Das",
      email: "tanushree@example.com",
      phone: "9831234568",
      department: "Information Technology",
      rollNumber: "IT/25/019",
      academicYear: "1st Year",
      artInterests: "Paintings, Photography",
      portfolioUrl: "https://instagram.com/tanushree_paints",
      whyJoin: "Eager to learn from seniors, participate in wall murals, and help manage club photography.",
      status: "APPROVED",
      adminNotes: "Excellent portfolio and enthusiasm. Approved as active member.",
      reviewedAt: new Date(),
    },
  ];

  for (const app of applicationsData) {
    const existing = await prisma.clubApplication.findFirst({ where: { email: app.email } });
    if (!existing) {
      await prisma.clubApplication.create({ data: app });
    }
  }
  console.log("Sample applications seeded!");

  console.log("All GCECT Art Club seed data successfully created!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
