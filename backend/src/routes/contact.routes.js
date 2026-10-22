const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Public route: Contact form submission
router.post("/", contactController.submitContactMessage);

// Admin routes: View & manage messages
router.get("/", authMiddleware, contactController.getAllContactMessages);
router.patch("/:id/read", authMiddleware, contactController.markMessageAsRead);
router.delete("/:id", authMiddleware, contactController.deleteContactMessage);

module.exports = router;
