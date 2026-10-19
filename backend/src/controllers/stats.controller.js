const prisma = require("../config/prisma");

// GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalArtworks,
      sketchesCount,
      paintingsCount,
      digitalArtCount,
      photographyCount,
      totalArtists,
      spotlightArtists,
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalMembers,
      totalAchievements,
      totalCampusArt,
      totalAnnouncements,
      unreadMessages,
      recentApplications,
      recentArtworks,
    ] = await Promise.all([
      prisma.artwork.count(),
      prisma.artwork.count({ where: { category: "SKETCHES" } }),
      prisma.artwork.count({ where: { category: "PAINTINGS" } }),
      prisma.artwork.count({ where: { category: "DIGITAL_ART" } }),
      prisma.artwork.count({ where: { category: "PHOTOGRAPHY" } }),
      prisma.artist.count(),
      prisma.artist.count({ where: { isSpotlight: true } }),
      prisma.events.count(),
      prisma.events.count({
        where: {
          OR: [{ is_past: false }, { event_date: { gte: now } }],
        },
      }),
      prisma.events.count({
        where: {
          OR: [{ is_past: true }, { event_date: { lt: now } }],
        },
      }),
      prisma.clubApplication.count(),
      prisma.clubApplication.count({ where: { status: "PENDING" } }),
      prisma.clubApplication.count({ where: { status: "APPROVED" } }),
      prisma.clubApplication.count({ where: { status: "REJECTED" } }),
      prisma.members.count(),
      prisma.achievement.count(),
      prisma.campusArt.count(),
      prisma.announcement.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.clubApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.artwork.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          artist: { select: { name: true, department: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        artworks: {
          total: totalArtworks,
          sketches: sketchesCount,
          paintings: paintingsCount,
          digitalArt: digitalArtCount,
          photography: photographyCount,
        },
        artists: {
          total: totalArtists,
          spotlight: spotlightArtists,
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        members: totalMembers,
        achievements: totalAchievements,
        campusArt: totalCampusArt,
        announcements: totalAnnouncements,
        unreadMessages,
        recentApplications,
        recentArtworks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
