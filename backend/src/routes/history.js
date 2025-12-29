const express = require("express");
const router = express.Router();
const TransactionHistoryController = require("../controllers/TransactionHistoryController");
const authMiddleware = require("../middleware/auth");

/**
 * Transaction History Routes
 * Base: /api/history
 */

// Get all transactions (requires authentication for user filtering)
router.get(
	"/",
	authMiddleware,
	TransactionHistoryController.getAllTransactions
);

// Get transaction by ID (requires authentication)
router.get(
	"/:transactionId",
	authMiddleware,
	TransactionHistoryController.getTransactionById
);

// Get transactions by type (transfer or card_payment)
router.get(
	"/type/:type",
	authMiddleware,
	TransactionHistoryController.getTransactionsByType
);

// Get transaction statistics
router.get(
	"/stats/overview",
	authMiddleware,
	TransactionHistoryController.getStatistics
);

module.exports = router;
