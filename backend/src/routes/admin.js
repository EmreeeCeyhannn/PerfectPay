const express = require("express");
const AdminController = require("../controllers/AdminController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// In a real app, we would have an 'admin' role check middleware here
router.get("/dashboard", authMiddleware, AdminController.getDashboardStats);
router.get("/users", authMiddleware, AdminController.getUsers);
router.get("/transactions", authMiddleware, AdminController.getTransactions);
router.get(
	"/commission",
	authMiddleware,
	AdminController.getCommissionSettings
);
router.put(
	"/commission",
	authMiddleware,
	AdminController.updateCommissionSettings
);
router.get(
	"/providers",
	authMiddleware,
	AdminController.getProviderPreferences
);
router.put(
	"/providers",
	authMiddleware,
	AdminController.updateProviderPreferences
);

module.exports = router;
