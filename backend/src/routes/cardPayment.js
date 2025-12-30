const express = require("express");
const router = express.Router();
const CardPaymentController = require("../controllers/CardPaymentController");
const authMiddleware = require("../middleware/auth");

/**
 * Card Payment Routes
 * Base: /api/card
 */

// Process a card payment (protected)
router.post("/process", authMiddleware, CardPaymentController.processPayment);

// // Get user's card payment history
// router.get("/history", CardPaymentController.getCardPaymentHistory);

// Get user's saved payment methods
router.get("/methods", CardPaymentController.getPaymentMethods);

module.exports = router;
