const express = require("express");
const router = express.Router();
const artworkController = require("../controllers/artwork.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", artworkController.getAllArtworks);
router.get("/categories", artworkController.getCategoryCounts);
router.get("/featured", artworkController.getFeaturedArtworks);
router.get("/:id", artworkController.getArtworkById);
router.post("/:id/like", artworkController.likeArtwork);

// Admin Dashboard routes: Upload / Manage Artwork
router.post("/", authMiddleware, upload.single("image"), artworkController.createArtwork);
router.put("/:id", authMiddleware, upload.single("image"), artworkController.updateArtwork);
router.delete("/:id", authMiddleware, artworkController.deleteArtwork);

module.exports = router;
