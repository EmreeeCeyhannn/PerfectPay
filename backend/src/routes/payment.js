const express = require("express");
const PaymentController = require("../controllers/PaymentController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create Payment - Main orchestration endpoint (as per documentation)
router.post("/", authMiddleware, PaymentController.createPayment);

// P2P Money Transfer with Optimal Routing (requires authentication for fraud detection)
router.post(
	"/transfer",
	authMiddleware,
	PaymentController.initiateMoneyTransfer
);

// Smart Receipt - Cost breakdown (legacy route)
router.get("/receipt/:transactionId", PaymentController.getSmartReceipt);

// Smart Receipt - Cost breakdown (as per documentation)
router.get("/:id/receipt", PaymentController.getSmartReceipt);

// Transaction Transparency Map
router.get("/map/:transactionId", PaymentController.getTransactionMap);

// Available PSPs List
router.get("/psps", PaymentController.listAvailablePSPs);

// System Health Check
router.get("/health", PaymentController.healthCheck);

// Estimate optimal route without processing
router.post("/estimate-route", PaymentController.estimateOptimalRoute);

// Multi-Card Payment Analysis
router.post("/multi-card/analyze", authMiddleware, PaymentController.analyzeMultiCard);

module.exports = router;
