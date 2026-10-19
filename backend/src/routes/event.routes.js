const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/upcoming", eventController.getUpcomingEvents);
router.get("/past", eventController.getPastEvents);
router.get("/:id", eventController.getEventById);
router.post("/:id/register", eventController.registerForEvent);

// Admin Dashboard routes: Manage Events
router.post("/", authMiddleware, upload.single("banner"), eventController.createEvent);
router.put("/:id", authMiddleware, upload.single("banner"), eventController.updateEvent);
router.delete("/:id", authMiddleware, eventController.deleteEvent);
router.get("/:id/registrations", authMiddleware, eventController.getEventRegistrations);

module.exports = router;
