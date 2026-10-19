const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", artistController.getAllArtists);
router.get("/spotlight", artistController.getSpotlightArtists);
router.get("/:id", artistController.getArtistById);

// Admin Dashboard routes: Manage Artists
router.post("/", authMiddleware, upload.single("avatar"), artistController.createArtist);
router.put("/:id", authMiddleware, upload.single("avatar"), artistController.updateArtist);
router.delete("/:id", authMiddleware, artistController.deleteArtist);

module.exports = router;
