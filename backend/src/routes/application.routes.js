const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Public route: Join the Club submission
router.post("/", applicationController.submitApplication);

// Admin Dashboard routes: Manage Applications
router.get("/", authMiddleware, applicationController.getAllApplications);
router.get("/:id", authMiddleware, applicationController.getApplicationById);
router.patch("/:id/status", authMiddleware, applicationController.updateApplicationStatus);
router.delete("/:id", authMiddleware, applicationController.deleteApplication);

module.exports = router;
