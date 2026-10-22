const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Public route: announcements
router.get("/", announcementController.getAllAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);

// Admin Dashboard route: Publish Announcements
router.post("/", authMiddleware, announcementController.createAnnouncement);
router.put("/:id", authMiddleware, announcementController.updateAnnouncement);
router.delete("/:id", authMiddleware, announcementController.deleteAnnouncement);

module.exports = router;
