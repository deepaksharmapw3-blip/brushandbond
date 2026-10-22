const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public route: Our Team
router.get("/", teamController.getTeamMembers);

// Admin routes
router.post("/", authMiddleware, upload.single("avatar"), teamController.createTeamMember);
router.put("/:id", authMiddleware, upload.single("avatar"), teamController.updateTeamMember);
router.delete("/:id", authMiddleware, teamController.deleteTeamMember);

module.exports = router;
