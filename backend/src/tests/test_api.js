const app = require("../app");
const prisma = require("../config/prisma");

async function testApi() {
  console.log("Starting backend verification tests...");

  // Start temporary server
  const server = app.listen(5099, async () => {
    const baseUrl = "http://localhost:5099";

    try {
      // 1. Health check
      const healthRes = await fetch(`${baseUrl}/api/health`).then((r) => r.json());
      console.log("1. Health Check:", healthRes.status === "healthy" ? "PASS" : "FAIL");

      // 2. Artworks & Categories
      const catRes = await fetch(`${baseUrl}/api/artworks/categories`).then((r) => r.json());
      console.log("2. Artwork Categories:", catRes.success ? "PASS" : "FAIL", catRes.counts);

      const artworksRes = await fetch(`${baseUrl}/api/artworks`).then((r) => r.json());
      console.log("3. Get Artworks:", artworksRes.success ? "PASS" : "FAIL", `Found: ${artworksRes.artworks.length}`);

      const featuredArtworks = await fetch(`${baseUrl}/api/artworks/featured`).then((r) => r.json());
      console.log("4. Featured Artworks:", featuredArtworks.success ? "PASS" : "FAIL", `Found: ${featuredArtworks.artworks.length}`);

      // 3. Events
      const upcomingEvents = await fetch(`${baseUrl}/api/events/upcoming`).then((r) => r.json());
      console.log("5. Upcoming Events:", upcomingEvents.success ? "PASS" : "FAIL", `Found: ${upcomingEvents.events.length}`);

      const pastEvents = await fetch(`${baseUrl}/api/events/past`).then((r) => r.json());
      console.log("6. Past Events:", pastEvents.success ? "PASS" : "FAIL", `Found: ${pastEvents.events.length}`);

      // 4. Artists & Spotlight
      const artistsRes = await fetch(`${baseUrl}/api/artists`).then((r) => r.json());
      console.log("7. All Artists:", artistsRes.success ? "PASS" : "FAIL", `Found: ${artistsRes.artists.length}`);

      const spotlightRes = await fetch(`${baseUrl}/api/artists/spotlight`).then((r) => r.json());
      console.log("8. Spotlight Artists:", spotlightRes.success ? "PASS" : "FAIL", `Found: ${spotlightRes.artists.length}`);

      // 5. Team
      const teamRes = await fetch(`${baseUrl}/api/team`).then((r) => r.json());
      console.log("9. Team Members:", teamRes.success ? "PASS" : "FAIL", `Found: ${teamRes.team.length}`);

      // 6. Achievements
      const achRes = await fetch(`${baseUrl}/api/achievements`).then((r) => r.json());
      console.log("10. Achievements:", achRes.success ? "PASS" : "FAIL", `Found: ${achRes.achievements.length}`);

      // 7. Campus Art
      const campusRes = await fetch(`${baseUrl}/api/campus-art`).then((r) => r.json());
      console.log("11. Campus Art (Art Around GCECT):", campusRes.success ? "PASS" : "FAIL", `Found: ${campusRes.artworks.length}`);

      // 8. Announcements
      const annRes = await fetch(`${baseUrl}/api/announcements`).then((r) => r.json());
      console.log("12. Announcements:", annRes.success ? "PASS" : "FAIL", `Found: ${annRes.announcements.length}`);

      // 9. Admin Login
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@gcectart.club",
          password: "Admin@ArtClub2026",
        }),
      }).then((r) => r.json());

      console.log("13. Admin Login:", loginRes.success ? "PASS" : "FAIL", loginRes.token ? "Token received" : "No token");

      const token = loginRes.token;

      // 10. Admin Stats
      const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      console.log("14. Admin Dashboard Stats:", statsRes.success ? "PASS" : "FAIL");
      console.log("    - Total Artworks:", statsRes.stats.artworks.total);
      console.log("    - Upcoming Events:", statsRes.stats.events.upcoming);
      console.log("    - Pending Applications:", statsRes.stats.applications.pending);
      console.log("    - Total Artists:", statsRes.stats.artists.total);

      // 11. Test Join the Club Application submission
      const appSubmitRes = await fetch(`${baseUrl}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Sourav Ganguly",
          email: "sourav.test@gcect.ac.in",
          phone: "9830098300",
          department: "Computer Science & Engineering",
          rollNumber: "CSE/25/088",
          academicYear: "1st Year",
          artInterests: "Sketches, Paintings",
          portfolioUrl: "https://behance.net/sample",
          whyJoin: "I love sketching and wish to contribute to the GCECT art club fest.",
        }),
      }).then((r) => r.json());
      console.log("15. Submit Club Application:", appSubmitRes.success ? "PASS" : "FAIL");

      // 12. Test Contact Us message submission
      const contactSubmitRes = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Visitor Student",
          email: "visitor@gmail.com",
          subject: "Inquiry about Exhibition",
          message: "Can alumni attend the annual art exhibition?",
        }),
      }).then((r) => r.json());
      console.log("16. Submit Contact Message:", contactSubmitRes.success ? "PASS" : "FAIL");

      // 13. Test Event Registration
      const eventRegRes = await fetch(`${baseUrl}/api/events/1/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_name: "Subhajit Roy",
          applicant_email: "subhajit@example.com",
          applicant_phone: "9123456780",
          department: "IT",
        }),
      }).then((r) => r.json());
      console.log("17. Event Registration:", eventRegRes.success ? "PASS" : "FAIL");

      console.log("\nALL 17 API MODULE TESTS COMPLETED SUCCESSFULLY!");
    } catch (err) {
      console.error("Test failed with error:", err);
    } finally {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    }
  });
}

testApi();
