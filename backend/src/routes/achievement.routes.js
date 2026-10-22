const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievement.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", achievementController.getAllAchievements);
router.get("/:id", achievementController.getAchievementById);

// Admin routes
router.post("/", authMiddleware, upload.single("image"), achievementController.createAchievement);
router.put("/:id", authMiddleware, upload.single("image"), achievementController.updateAchievement);
router.delete("/:id", authMiddleware, achievementController.deleteAchievement);

module.exports = router;
