import type {
  CampusArtGroup,
  CampusArtProject,
  CampusArtLandmark,
  CampusArtPhoto,
} from '../types/campusArt';

export const CAMPUS_ART_PHOTOS: Record<string, CampusArtPhoto> = {
  // 2. Creative Walls Photos
  'wall-chalk-stairwell': {
    id: 'photo-wall-02',
    url: '/artworks/campus-art/wall-chalk-stairwell.jpg',
    title: 'Academic Block 2 Stairwell Chalk Sanctuary',
    caption:
      'Massive double-height matte slate wall spanning the central landing. Features collaborative chalk equations, portraits of scientific pioneers, and student poetry.',
    type: 'wide',
    year: 2025,
    photographer: 'Ritaban Roy (IT, Batch of 2026)',
    location: 'Academic Block 2 Stairwell Landing',
  },
  // 3. Festival Decorations Photos
  'festival-clay-pandal': {
    id: 'photo-fest-01',
    url: '/artworks/campus-art/festival-clay-pandal.jpg',
    title: 'Saraswati Puja Earthen Pavilion — Dusk Illumination',
    caption:
      'The award-winning 2025 festival pavilion crafted from 450+ unglazed terracotta earthenware vessels, woven bamboo lattice vaults, and warm tungsten fairy lights.',
    type: 'night',
    year: 2025,
    photographer: 'Subhajit Mukherjee (Ceramics, Batch of 2025)',
    location: 'Main College Quadrangle',
  },
  'festival-diwali-mandala': {
    id: 'photo-fest-02',
    url: '/artworks/campus-art/festival-diwali-mandala.jpg',
    title: 'Diwali Sacred Alpana & Terracotta Diya Mandala',
    caption:
      'Bird’s-eye perspective of the 35-foot concentric circular rice-paste alpana laid out in the historic brick courtyard, illuminated by 500 hand-poured clay oil lamps.',
    type: 'night',
    year: 2024,
    photographer: 'Ritaban Roy (IT, Batch of 2026)',
    location: 'Central Heritage Courtyard',
  },

  // 4. Club Collaborations Photos
  'collab-circuits-clay': {
    id: 'photo-collab-01',
    url: '/artworks/campus-art/collab-circuits-clay.jpg',
    title: 'Terra-Code: Ceramic Tiles × Embedded Micro-Controllers',
    caption:
      'Joint showcase with Geeks United: high-fire turquoise glazed ceramic relief tiles embedded with copper traces and interactive light-pulse nodes.',
    type: 'detail',
    year: 2025,
    photographer: 'Anamika Sen (CSE, Batch of 2026)',
    location: 'Studio 204 Interactive Gallery Alcove',
  },
  'collab-studio-session': {
    id: 'photo-collab-02',
    url: '/artworks/campus-art/collab-studio-session.jpg',
    title: '36-Hour Open Wheel Throwing Marathon',
    caption:
      'Collaborative intensive co-hosted with the Department of Ceramic Technology. Students from all three branches took turns on potter’s wheels to throw 50+ vessels.',
    type: 'team',
    year: 2024,
    photographer: 'Subhajit Mukherjee (Ceramics, Batch of 2025)',
    location: 'Historic Kiln Shed Workshop Area',
  },

  // 5. Student Installations Photos
  'install-centenary-totem': {
    id: 'photo-inst-01',
    url: '/artworks/campus-art/install-centenary-totem.jpg',
    title: 'The Centenary Kiln Totem — High-Fire Stoneware Column',
    caption:
      'Monumental stoneware sculpture fired at Cone 10 with iron-slip reduction glaze. Stands in the glass rotunda as a physical testament to GCECT’s 85-year metallurgical and ceramic heritage.',
    type: 'detail',
    year: 2026,
    photographer: 'Ritaban Roy (IT, Batch of 2026)',
    location: 'Main Administrative Quad Entrance Glass Case',
  },
  'install-terracotta-spiral': {
    id: 'photo-inst-02',
    url: '/artworks/campus-art/install-terracotta-spiral.jpg',
    title: 'The Spiral of Kiln & Fire — Wood-Ash Glazed Vessel',
    caption:
      'Hand-thrown and torque-sculpted using alluvial Gangetic clay with wood-ash and iron oxide glaze. Captures thermal air currents inside industrial tunnel kilns.',
    type: 'detail',
    year: 2024,
    photographer: 'Subhajit Mukherjee (Ceramics, Batch of 2025)',
    location: 'Department of Ceramic Technology Foyer Vitrine',
  },
  'install-kiln-archways': {
    id: 'photo-inst-03',
    url: '/artworks/campus-art/install-kiln-archways.jpg',
    title: 'Historic 1941 Kiln Archways Memorial',
    caption:
      'Restored brick tunnel arches of the institute’s original experimental kiln, converted by student artists into a permanent architectural installation and contemplation space.',
    type: 'wide',
    year: 2024,
    photographer: 'Anamika Sen (CSE, Batch of 2026)',
    location: 'Kiln Shed Outdoor Heritage Yard',
  },
};

export const CAMPUS_ART_PROJECTS: CampusArtProject[] = [
  // Creative Walls
  {
    id: 'wall-02',
    accessionNo: 'GCECT-ARC-WAL-002',
    title: 'The Thought Corridor & Chalk Sanctuary',
    groupId: 'creative-walls',
    groupName: 'Creative walls',
    year: 2025,
    academicSession: '2024-25',
    location: 'Academic Block 2 Central Stairwell Landing',
    campusZone: 'Academic Block',
    medium: 'Matte Slate Blackboard Coating, Multi-grade Chalk & Pastel',
    dimensions: '10m × 3.8m',
    status: 'Active Creative Wall',
    leadArtists: ['Sounak Bannerjee', 'Ananya Ghosh', 'Guest Contributors'],
    contributingDepartments: ['Computer Science & Engineering', 'Ceramic Technology'],
    shortDescription:
      'A double-height slate wall where Fourier transforms and thermodynamics curves dissolve into delicate chalk portraits and Bengali verse.',
    fullNarrative:
      'Originally a drab stairwell connecting the library to the IT computer labs, student artists primed the wall with high-durability chalkboard compound in January 2025. Students and professors use it for chalk equations, portraits, and poetry.',
    curatorNote:
      'Chalk is ephemeral, but through digital photography we log each seasonal evolution into this archive, preserving ideas that would otherwise be wiped clean.',
    historicalEra: 'Living Archive (2025)',
    tags: ['Chalk Wall', 'Stairwell', 'Equations & Art', 'Academic Heritage'],
    heroImage: '/artworks/campus-art/wall-chalk-stairwell.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['wall-chalk-stairwell'],
    ],
  },

  // Festival Decorations
  {
    id: 'fest-01',
    accessionNo: 'GCECT-ARC-FST-001',
    title: 'The Earthen Sanctuary: Saraswati Puja Pavilion',
    groupId: 'festival-decorations',
    groupName: 'Festival decorations',
    year: 2025,
    academicSession: '2024-25',
    location: 'Main College Quadrangle Paved Courtyard',
    campusZone: 'Courtyard',
    medium: 'Handmade Terracotta Pots, Bamboo Lattice, Jute Rope, Warm Filament Bulbs',
    dimensions: '6m × 6m × 5.5m Pavilion Structure',
    status: 'Seasonal Archival Record',
    leadArtists: ['Subhajit Mukherjee', 'Biman Mondal', 'Entire Batch of 2025 & 2026'],
    contributingDepartments: ['Ceramic Technology', 'Computer Science & Engineering', 'Information Technology'],
    shortDescription:
      'A majestic eco-friendly temple pavilion constructed entirely of 450+ unglazed terracotta pots, woven bamboo arches, and golden dusk lighting.',
    fullNarrative:
      'Erected in February 2025 for Saraswati Puja, the patron festival of learning and the arts at GCECT. Rejecting plastic and non-biodegradable foam, the club collaborated with local Kumartuli and Bankura potters to produce custom unglazed earthenware matkas. Over 48 sleepless hours before sunrise, students built a vaulted dome where each clay pot was fitted with warm tungsten diodes, creating an incandescent honeycomb canopy that bathed the idol in sacred terracotta luminescence.',
    curatorNote:
      'This pavilion won collegiate accolades throughout West Bengal for sustainable heritage architecture. After the festival, all 450 pots were donated to the college botanical nursery.',
    historicalEra: 'Living Archive (2025)',
    tags: ['Saraswati Puja', 'Terracotta Pavilion', 'Bamboo Craft', 'Eco Architecture', 'Heritage'],
    heroImage: '/artworks/campus-art/festival-clay-pandal.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['festival-clay-pandal'],
    ],
  },
  {
    id: 'fest-02',
    accessionNo: 'GCECT-ARC-FST-002',
    title: 'Diwali Sacred Alpana & Diya Mandala',
    groupId: 'festival-decorations',
    groupName: 'Festival decorations',
    year: 2024,
    academicSession: '2024-25',
    location: 'Central Heritage Courtyard Pavement',
    campusZone: 'Courtyard',
    medium: 'Aatap Chal (Ground Rice Paste), Marigold Petals, 500 Terracotta Diyas, Mustard Oil',
    dimensions: '11-meter diameter circular mandala',
    status: 'Seasonal Archival Record',
    leadArtists: ['Anamika Sen', 'Priyanka Roy', '30 Student Painters'],
    contributingDepartments: ['Computer Science & Engineering', 'Information Technology', 'Ceramic Technology'],
    shortDescription:
      'A 35-foot concentric circular rice-flour alpana laid out on heritage courtyard brickwork, aglow with five hundred hand-poured clay oil lamps.',
    fullNarrative:
      'On Diwali night in November 2024, the paved brick courtyard of GCECT was transformed into a glowing sacred mandala. Using traditional Bengal alpana techniques passed down through generations, students spent eight hours kneeling on the cobblestones drawing concentric lotus petals, conch shells, and peacock plumes with wet rice paste. At twilight, 500 earthen diyas made in the Ceramic Department kilns were placed along the perimeter and lit simultaneously.',
    curatorNote:
      'Documented from the second-floor library balcony, the photograph captured the precise geometric symmetry connecting Bengal temple art with modern procedural generative patterns.',
    historicalEra: 'Genesis Era (2024)',
    tags: ['Diwali', 'Alpana', 'Sacred Mandala', 'Terracotta Diyas', 'Night Photography'],
    heroImage: '/artworks/campus-art/festival-diwali-mandala.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['festival-diwali-mandala'],
    ],
  },

  // Club Collaborations
  {
    id: 'collab-01',
    accessionNo: 'GCECT-ARC-COL-001',
    title: 'Terra-Code: Ceramic Tiles × Embedded Micro-Controllers',
    groupId: 'club-collaborations',
    groupName: 'Club collaborations',
    year: 2025,
    academicSession: '2024-25',
    location: 'Studio 204 Interactive Gallery Alcove',
    campusZone: 'Courtyard',
    medium: 'High-Fire Glazed Ceramic Relief Tiles, Arduino Nano, Addressable NeoPixel LEDs, Touch Sensors',
    dimensions: '2.4m × 1.2m Modular Wall Array',
    status: 'Permanent Monument',
    leadArtists: ['Brush and Bond Collective', 'Geeks United Coding Society'],
    contributingDepartments: ['Ceramic Technology', 'Computer Science & Engineering'],
    shortDescription:
      'An interactive physical computing installation where tactile touch against artisan ceramic tiles triggers shimmering digital waves of light.',
    fullNarrative:
      'Born from a weekend hackathon between Brush and Bond and the Geeks United programming society in March 2025. Ceramic students hand-cast 32 custom hexagonal stoneware tiles, using copper glazes that provide subtle capacitive conductivity. Computer science students routed custom PCB boards behind the oak backboard. When visitors run their hands along the smooth glazed surfaces, touch sensors calculate proximity and ripple waves of amber and cobalt light across the mosaic.',
    curatorNote:
      'Terra-Code proves that craft and computation are not opposing forces. The ancient tactile earth of ceramics meets the responsive logic of Silicon.',
    historicalEra: 'Living Archive (2025)',
    tags: ['Interactive Art', 'Ceramic & Tech', 'Geeks United Collab', 'Microcontroller', 'Touch Reactive'],
    heroImage: '/artworks/campus-art/collab-circuits-clay.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['collab-circuits-clay'],
      CAMPUS_ART_PHOTOS['collab-studio-session'],
    ],
  },

  // Student Installations
  {
    id: 'inst-01',
    accessionNo: 'GCECT-ARC-INS-001',
    title: 'The Centenary Kiln Totem',
    groupId: 'student-installations',
    groupName: 'Student installations',
    year: 2026,
    academicSession: '2025-26',
    location: 'Main Administrative Quad Entrance Glass Rotunda',
    campusZone: 'Central Foyer',
    medium: 'Vitrified High-Fire Stoneware, Iron-Slip Glaze, Weathered Teak Pedestal',
    dimensions: '1.8m height × 45cm diameter',
    status: 'Permanent Monument',
    leadArtists: ['Subhajit Mukherjee', 'Ceramic Senior Studio Cohort'],
    contributingDepartments: ['Ceramic Technology'],
    shortDescription:
      'A monumental sculptural column celebrating 85 years of ceramic engineering history, fired to 1280°C in the college’s down-draft kiln.',
    fullNarrative:
      'Erected in January 2026 to welcome visitors to the historic Administrative Building, the Centenary Totem is constructed from seven interlocking wheel-thrown stoneware cylinders. Each segment honors a different historical era of GCECT—from its origins as a Bengal ceramic research station in 1941 to its modern engineering triumphs. Coated in iron oxide slip that crystallized into metallic bronze and obsidian tones during an intense 48-hour reduction firing.',
    curatorNote:
      'A tour-de-force of material engineering. The sculpture withstands full thermal shocks and rakes sunlight across its rippling ribbed surfaces throughout the morning.',
    historicalEra: 'Contemporary Era (2026)',
    tags: ['Stoneware', 'Kiln Totem', 'Permanent Sculpture', 'Heritage Memorial'],
    heroImage: '/artworks/campus-art/install-centenary-totem.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['install-centenary-totem'],
      CAMPUS_ART_PHOTOS['install-terracotta-spiral'],
      CAMPUS_ART_PHOTOS['install-kiln-archways'],
    ],
  },
  {
    id: 'inst-02',
    accessionNo: 'GCECT-ARC-INS-002',
    title: 'The Spiral of Kiln & Fire',
    groupId: 'student-installations',
    groupName: 'Student installations',
    year: 2024,
    academicSession: '2023-24',
    location: 'Ceramic Technology Department Foyer Glass Display',
    campusZone: 'Central Foyer',
    medium: 'Indigenous Gangetic Alluvial Terracotta, Wood-Ash Glaze, Cone 6',
    dimensions: '38cm × 22cm × 18cm',
    status: 'Preserved Landmark',
    leadArtists: ['Subhajit Mukherjee'],
    contributingDepartments: ['Ceramic Technology'],
    shortDescription:
      'Sculptural terracotta vessel capturing dynamic thermal convection currents inside industrial kilns.',
    fullNarrative:
      'Hand-thrown and torque-shaped using local alluvial clay gathered from the banks of the Hooghly. Fired in Studio 204 with raw wood-ash gathered from the college kiln shed, creating naturally vitrified olive-green runs over porous orange clay.',
    curatorNote:
      'The inaugural sculpture accessioned into Brush and Bond’s permanent collection (Accession BB-2024-001).',
    historicalEra: 'Genesis Era (2024)',
    tags: ['Terracotta', 'Wood-Ash', 'Vessel', 'Convection'],
    heroImage: '/artworks/campus-art/install-terracotta-spiral.jpg',
    photoSet: [
      CAMPUS_ART_PHOTOS['install-terracotta-spiral'],
    ],
  },
];

export const CAMPUS_ART_GROUPS: CampusArtGroup[] = [
  {
    id: 'creative-walls',
    slug: 'creative-walls',
    title: 'Creative walls',
    badge: 'Expressive Corridors',
    shortDescription:
      'Expressive indoor feature walls and chalk thought-galleries capturing student ideas and campus life.',
    longDescription:
      'Inside classrooms and stairwells, creative walls offer an evolving canvas for student expression. On the slate wall, mathematical formulas meet sketches, poetry, and student ideas.',
    historicalSignificance:
      'Creative walls bridge academic rigor with spontaneous artistic play. By systematically documenting each iteration through high-resolution photography, our digital archive ensures ephemeral chalk and doodle art is preserved for future generations.',
    heroImage: '/artworks/campus-art/wall-chalk-stairwell.jpg',
    locationHighlight: 'Academic Block 2 Stairwell',
    projectCount: 1,
    photoCount: 1,
    projects: CAMPUS_ART_PROJECTS.filter((p) => p.groupId === 'creative-walls'),
    curatorStatement:
      'A chalkboard is wiped clean, but the creative spirit that generated it lives forever in this digital archive.',
  },
  {
    id: 'festival-decorations',
    slug: 'festival-decorations',
    title: 'Festival decorations',
    badge: 'Seasonal Spectacles',
    shortDescription:
      'Transcendent temporary pavilions, bamboo arches, sacred alpana mandalas, and terracotta illuminations erected for annual Saraswati Puja and Diwali festivals.',
    longDescription:
      'Every winter and autumn, the GCECT campus transforms into a realm of light and organic architecture. Honoring Bengal’s rich folk legacy, students erect architectural pavilions from raw clay pots, handwoven bamboo, jute rope, and mustard oil diyas. From 35-foot rice-paste courtyard alpanas to luminous evening pavilions, these ephemeral works showcase student design at its most ambitious.',
    historicalSignificance:
      'Festival art at GCECT is unique in all of Kolkata: because of our Ceramic Technology heritage, our students handcraft their own terracotta vessels and diyas rather than purchasing synthetic factory materials. These structures celebrate technical craft as a sacred offering.',
    heroImage: '/artworks/campus-art/festival-clay-pandal.jpg',
    locationHighlight: 'Main Campus Quadrangle & Heritage Brick Courtyard',
    projectCount: 2,
    photoCount: 2,
    projects: CAMPUS_ART_PROJECTS.filter((p) => p.groupId === 'festival-decorations'),
    curatorStatement:
      'Though dismantled when the festivities conclude, their architectural ingenuity is permanently enshrined in this digital record.',
  },
  {
    id: 'club-collaborations',
    slug: 'club-collaborations',
    title: 'Club collaborations',
    badge: 'Inter-Disciplinary Art',
    shortDescription:
      'Inter-disciplinary initiatives bridging Brush & Bond with technical societies, coding clubs, music circles, and green initiatives across GCECT.',
    longDescription:
      'Creativity flourishes at the intersections. Brush and Bond actively collaborates with Geeks United (coding society), the Rotaract Club, the Nature Club, and the campus music band. These partnerships yield hybrid works: interactive ceramic walls that respond to physical touch with LED pulses, 36-hour cross-departmental pottery marathons, and live stage canvases painted alongside musical performances.',
    historicalSignificance:
      'These collaborative projects dismantle academic silos. When computer science coders and ceramic material engineers work elbow-to-elbow, the outcome is uniquely GCECT: art powered by engineering.',
    heroImage: '/artworks/campus-art/collab-circuits-clay.jpg',
    locationHighlight: 'Studio 204 Tech-Art Wing & Kiln Shed Workshop',
    projectCount: 1,
    photoCount: 2,
    projects: CAMPUS_ART_PROJECTS.filter((p) => p.groupId === 'club-collaborations'),
    curatorStatement:
      'Creativity Connects. We do not work in isolation; our greatest works happen when algorithms and wet clay collide.',
  },
  {
    id: 'student-installations',
    slug: 'student-installations',
    title: 'Student installations',
    badge: 'Permanent Sculptures',
    shortDescription:
      'Three-dimensional ceramic sculptures, kinetic metal assemblies, architectural kiln totems, and site-specific material investigations permanently housed in campus foyers and courtyards.',
    longDescription:
      'From the towering Centenary Kiln Totem in the administrative rotunda to delicate raku-fired vessels in departmental vitrines and the historic 1941 kiln archway memorial, permanent student installations anchor the tangible heritage of our engineering college.',
    historicalSignificance:
      'As India’s premier institute for ceramic engineering, our student installations showcase vitrified stonewares, wood-ash glazes, and refractory metallurgy that will endure for centuries. They serve as daily inspirations to incoming engineering freshmen.',
    heroImage: '/artworks/campus-art/install-centenary-totem.jpg',
    locationHighlight: 'Administrative Rotunda, Ceramic Tech Foyer & Kiln Shed',
    projectCount: 2,
    photoCount: 3,
    projects: CAMPUS_ART_PROJECTS.filter((p) => p.groupId === 'student-installations'),
    curatorStatement:
      'Earth, fire, and human design vitrified into permanent monuments of student craftsmanship.',
  },
];

export const CAMPUS_ART_LANDMARKS: CampusArtLandmark[] = [
  {
    id: 'zone-stairwell',
    name: 'Academic Block 2 Stairwell Landing',
    zone: 'Academic Block 2',
    building: 'Central Stairwell (Floors 1-2)',
    description: 'The double-height "Chalk Sanctuary" where mathematical equations, Bengali poetry, and chalk portraits merge.',
    projectCount: 1,
    topProjectId: 'wall-02',
    topProjectTitle: 'The Thought Corridor & Chalk Sanctuary',
    heroImage: '/artworks/campus-art/wall-chalk-stairwell.jpg',
  },
  {
    id: 'zone-rotunda',
    name: 'Admin Building Glass Rotunda & Foyer',
    zone: 'Administrative Block',
    building: 'Main Entrance Foyer',
    description: 'Houses the monumental "Centenary Kiln Totem" and heritage ceramic vitrines welcoming dignitaries and campus guests.',
    projectCount: 2,
    topProjectId: 'inst-01',
    topProjectTitle: 'The Centenary Kiln Totem',
    heroImage: '/artworks/campus-art/install-centenary-totem.jpg',
  },
  {
    id: 'zone-kiln',
    name: 'Historic 1941 Kiln Shed & Yard',
    zone: 'Department of Ceramic Technology',
    building: 'Kiln Research Wing',
    description: 'The birthplace of ceramic engineering in eastern India. Features restored 1941 brick tunnel arches and open throwing wheels.',
    projectCount: 2,
    topProjectId: 'collab-01',
    topProjectTitle: '36-Hour Open Wheel Throwing Marathon',
    heroImage: '/artworks/campus-art/install-kiln-archways.jpg',
  },
];

export const ARCHIVE_TIMELINE_ERAS = [
  {
    era: '1941 - 1980s',
    title: 'The Bengal Ceramic Kiln Foundations',
    description:
      'GCECT begins as the Bengal Ceramic Institute. Early master craftsmen and student engineers install foundational refractory kilns, terracotta decorative friezes, and architectural tile experiments.',
    tag: 'Historical Heritage',
    accentColor: '#B87333',
  },
  {
    era: '1990s - 2023',
    title: 'Festival Architecture & Traditional Alpana',
    description:
      'The emergence of student-led Saraswati Puja pavilions and sacred courtyard floor alpanas. Hand-poured earthen diyas and bamboo architecture become an unbroken college tradition.',
    tag: 'Folk Tradition',
    accentColor: '#D97706',
  },
  {
    era: '2024',
    title: 'Brush & Bond Begins',
    description:
      'Brush and Bond is founded, bringing students together to share their artwork and build a creative community.',
    tag: 'Club Genesis',
    accentColor: '#2F3CFF',
  },
  {
    era: '2025',
    title: 'Creative Walls, Tech-Art & Interactive Installations',
    description:
      'The archive expands with student artwork, the Stairwell Chalk Sanctuary, and "Terra-Code" ceramic touch installations.',
    tag: 'Expansion',
    accentColor: '#10B981',
  },
  {
    era: '2026 & Beyond',
    title: 'The Living Digital Archive & Permanent Sculptures',
    description:
      'Installation of the Centenary Kiln Totem and the launch of the permanent Digital Record of College Artistic History, inviting past and present students to preserve campus heritage.',
    tag: 'Living Future',
    accentColor: '#8B5CF6',
  },
];
