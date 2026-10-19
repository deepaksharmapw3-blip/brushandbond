# 🎨 GCECT ART CLUB — Backend API

Full-featured RESTful Backend API for **GCECT Art Club** (Government College of Engineering and Ceramic Technology), built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js (v18+)
- PostgreSQL (running on `localhost:5432`)

### 2. Environment Variables (`.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:ArtClub@2026@localhost:5432/artclub_db"
JWT_SECRET="gcect_art_club_super_secret_jwt_key_2026"
ADMIN_DEFAULT_EMAIL="admin@gcectart.club"
ADMIN_DEFAULT_PASSWORD="Admin@ArtClub2026"
NODE_ENV=development
```

### 3. Commands
```bash
# Test database connection directly
npm run test-db

# Push schema changes to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample data (Artworks, Artists, Events, Team, Announcements, Admin)
npm run seed

# Start server in development mode (with nodemon auto-restart)
npm run dev

# Start server in production mode
npm start
```

---

## 🔐 Default Admin Credentials

- **Email**: `admin@gcectart.club`
- **Password**: `Admin@ArtClub2026`
- **Login Endpoint**: `POST /api/auth/login`

---

## 🗺️ API Endpoints Mapping

### 1. 🏠 Home Page
- `GET /api/artworks/featured` — Featured artworks banner
- `GET /api/events/upcoming` — Upcoming club events
- `GET /api/announcements` — Latest announcements (pinned first)
- `GET /api/artists/spotlight` — Featured spotlight artists

### 2. ℹ️ About Us & 👥 Our Team
- `GET /api/team` — List core committee & faculty coordinator (ordered by role hierarchy)

### 3. 🖼️ Gallery
- `GET /api/artworks` — All artworks (supports `?category=sketches|paintings|digital_art|photography`, `?search=`, `?page=`, `?limit=`)
- `GET /api/artworks/categories` — Counts per category:
  - `Sketches`
  - `Paintings`
  - `Digital Art`
  - `Photography`
- `GET /api/artworks/:id` — Artwork details with artist info
- `POST /api/artworks/:id/like` — Like an artwork

### 4. 📅 Events
- `GET /api/events` — All events
- `GET /api/events/upcoming` — Upcoming workshops, exhibitions & drives
- `GET /api/events/past` — Past events recap
- `GET /api/events/:id` — Event details
- `POST /api/events/:id/register` — RSVP / Event registration

### 5. ⭐ Artist Spotlight
- `GET /api/artists` — All club artists
- `GET /api/artists/spotlight` — Spotlight artists with their featured artworks
- `GET /api/artists/:id` — Artist profile with full collection

### 6. 🏆 Achievements
- `GET /api/achievements` — Awards and competition achievements

### 7. 📝 Join the Club (Applications)
- `POST /api/applications` — Student application form (Name, Dept, Roll, Year, Art Interests, Portfolio, Statement)

### 8. 🏛️ Art Around GCECT
- `GET /api/campus-art` — Campus murals, canteen doodle walls, ceramic mosaic installations

### 9. 📬 Contact Us
- `POST /api/contact` — Send inquiry / feedback message

---

## 🛡️ Admin Dashboard (`Authorization: Bearer <token>`)

| Feature | Method | Endpoint | Description |
|---|---|---|---|
| **Overview** | `GET` | `/api/admin/stats` | Summary stats (artworks breakdown, pending apps, upcoming events) |
| **Upload Artwork** | `POST` | `/api/artworks` | Upload artwork file (`multipart/form-data`) or imageUrl |
| **Manage Artwork** | `PUT` | `/api/artworks/:id` | Edit artwork details |
| | `DELETE` | `/api/artworks/:id` | Remove artwork |
| **Manage Events** | `POST` | `/api/events` | Create new event with banner |
| | `PUT` | `/api/events/:id` | Update event info or mark as past |
| | `DELETE` | `/api/events/:id` | Delete event |
| | `GET` | `/api/events/:id/registrations` | View all attendees registered for event |
| **Manage Artists** | `POST` | `/api/artists` | Add artist profile |
| | `PUT` | `/api/artists/:id` | Update artist or toggle spotlight |
| | `DELETE` | `/api/artists/:id` | Delete artist profile |
| **Manage Applications** | `GET` | `/api/applications` | View all join applications (`?status=PENDING|APPROVED|REJECTED`) |
| | `PATCH` | `/api/applications/:id/status` | Approve / Reject application (auto-adds to Members on approval) |
| | `DELETE` | `/api/applications/:id` | Delete application |
| **Publish Announcements** | `POST` | `/api/announcements` | Publish new announcement (pin/unpin) |
| | `PUT` | `/api/announcements/:id` | Edit announcement |
| | `DELETE` | `/api/announcements/:id` | Remove announcement |
| **Inbox** | `GET` | `/api/contact` | Read contact form submissions |
| | `PATCH` | `/api/contact/:id/read` | Mark message as read |
| | `DELETE` | `/api/contact/:id` | Delete message |

---

## 📁 Project Structure

```
artclub/backend/
├── prisma/
│   ├── schema.prisma       # Complete PostgreSQL schema (11 models)
│   └── prisma.config.ts    # Prisma 7 configuration
├── uploads/                # Static uploaded images
├── src/
│   ├── app.js              # Express app setup, CORS, Helmet, static route
│   ├── config/
│   │   └── prisma.js       # PrismaClient singleton with PrismaPg adapter
│   ├── controllers/        # 11 Modular controllers
│   ├── middlewares/        # Auth (JWT), Upload (Multer), Error handlers
│   ├── routes/             # RESTful API route definitions
│   ├── seeds/              # Database seeder with sample data
│   └── tests/              # Verification test suite
├── .env                    # Environment variables
├── index.js                # Server entrypoint
├── package.json            # Scripts & dependencies
└── test_db.js              # Database connection tester
```
