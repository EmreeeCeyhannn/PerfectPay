const User = require("../models/User");

class UserController {
	static async getProfile(req, res) {
		try {
			const userId = req.userId;
			const user = await User.findById(userId);

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			res.status(200).json(user);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateProfile(req, res) {
		try {
			const userId = req.userId;
			const { full_name, phone, kyc_status } = req.body;

			const updated = await User.update(userId, {
				full_name,
				phone,
				kyc_status,
			});

			res.status(200).json(updated);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async submitKYC(req, res) {
		try {
			const userId = req.userId;
			// In a real app, we would process documents here.
			// For now, we just update the status to 'approved' for demo.
			const updated = await User.update(userId, { kyc_status: "approved" });
			res
				.status(200)
				.json({ message: "KYC submitted successfully", user: updated });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = UserController;
