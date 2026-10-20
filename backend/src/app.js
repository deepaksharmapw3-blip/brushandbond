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

// This legacy app is not started by the supported project scripts.
// Cross-origin access is denied unless an exact origin is configured.
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb", parameterLimit: 100 }));

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
