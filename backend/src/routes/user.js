const express = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/profile", authMiddleware, UserController.getProfile);
router.put("/profile", authMiddleware, UserController.updateProfile);
router.post("/kyc", authMiddleware, UserController.submitKYC);
router.get("/cards", authMiddleware, UserController.getCards);
router.post("/cards", authMiddleware, UserController.addCard);

module.exports = router;
