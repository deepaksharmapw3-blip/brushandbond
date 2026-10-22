const express = require("express");
const router = express.Router();
const campusArtController = require("../controllers/campusArt.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes: Art Around GCECT
router.get("/", campusArtController.getAllCampusArt);
router.get("/:id", campusArtController.getCampusArtById);

// Admin routes
router.post("/", authMiddleware, upload.single("image"), campusArtController.createCampusArt);
router.put("/:id", authMiddleware, upload.single("image"), campusArtController.updateCampusArt);
router.delete("/:id", authMiddleware, campusArtController.deleteCampusArt);

module.exports = router;
