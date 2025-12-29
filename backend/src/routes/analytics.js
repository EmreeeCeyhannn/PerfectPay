const express = require("express");
const router = express.Router();
const PSPAnalyticsController = require("../controllers/PSPAnalyticsController");
const authMiddleware = require("../middleware/auth");

/**
 * PSP Analytics Routes
 * Base: /api/analytics
 */

// Get all PSP analytics
router.get("/", PSPAnalyticsController.getAllAnalytics);

// Get performance metrics (as per documentation)
router.get("/performance", PSPAnalyticsController.getPerformanceMetrics);

// Get specific PSP metrics
router.get("/psp/:pspName", PSPAnalyticsController.getPSPMetrics);

// Get performance comparison
router.get("/comparison", PSPAnalyticsController.getPerformanceComparison);

// Get historical trends
router.get("/trends", PSPAnalyticsController.getHistoricalTrends);

module.exports = router;
