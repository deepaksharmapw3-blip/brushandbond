const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth.routes");
const artworkRoutes = require("./routes/artwork.routes");
const eventRoutes = require("./routes/event.routes");
const artistRoutes = require("./routes/artist.routes");
const applicationRoutes = require("./routes/application.routes");
const achievementRoutes = require("./routes/achievement.routes");
const teamRoutes = require("./routes/team.routes");
const campusArtRoutes = require("./routes/campusArt.routes");
const announcementRoutes = require("./routes/announcement.routes");
const contactRoutes = require("./routes/contact.routes");
const statsRoutes = require("./routes/stats.routes");

// Import error middleware
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check & API Overview
app.get("/", (req, res) => {
  res.json({
    name: "GCECT ART CLUB Backend API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      auth: "/api/auth",
      artworks: "/api/artworks",
      events: "/api/events",
      artists: "/api/artists",
      applications: "/api/applications",
      achievements: "/api/achievements",
      team: "/api/team",
      campusArt: "/api/campus-art",
      announcements: "/api/announcements",
      contact: "/api/contact",
      adminStats: "/api/admin/stats",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/campus-art", campusArtRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", statsRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
