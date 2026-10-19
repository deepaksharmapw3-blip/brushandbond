const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// GET /api/admin/stats (Admin Dashboard overview)
router.get("/stats", authMiddleware, statsController.getDashboardStats);

module.exports = router;
