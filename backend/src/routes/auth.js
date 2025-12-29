const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);

module.exports = router;
