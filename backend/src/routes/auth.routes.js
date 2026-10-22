const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/me (Protected)
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
