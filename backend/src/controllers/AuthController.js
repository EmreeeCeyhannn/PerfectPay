const AuthService = require("../services/AuthService");
const fraudEngine = require("../fraud/FraudDetectionEngine");

class AuthController {
	static async register(req, res) {
		try {
			const { email, password, full_name, phone } = req.body;

			if (!email || !password || !full_name) {
				return res
					.status(400)
					.json({ error: "Email, password, and full name are required" });
			}

			const result = await AuthService.register({
				email,
				password,
				full_name,
				phone,
			});

			res.status(201).json(result);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async login(req, res) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res
					.status(400)
					.json({ error: "Email and password are required" });
			}

			const result = await AuthService.login(email, password);
			res.status(200).json(result);
		} catch (error) {
			res.status(401).json({ error: error.message });
		}
	}

	static async logout(req, res) {
		try {
			const userId = req.userId; // From auth middleware

			if (userId) {
				// Clear fraud detection history on logout
				fraudEngine.clearUserHistory(userId);
			}

			res.status(200).json({
				message: "Logged out successfully",
				fraudHistoryCleared: true,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = AuthController;
