const User = require("../models/User");
const pool = require("../config/database");

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

	static async getCards(req, res) {
		try {
			const userId = req.userId;

			// Return mock cards for demo (including Stripe test cards)
			const mockCards = [
				{
					id: 1,
					card_token: "4000000000000002", // Stripe declined card
					last_four: "0002",
					card_brand: "VISA",
					is_primary: true,
					created_at: new Date(),
				},
				{
					id: 2,
					card_token: "5555555555554444", // Valid test card
					last_four: "4444",
					card_brand: "MASTERCARD",
					is_primary: false,
					created_at: new Date(),
				},
				{
					id: 3,
					card_token: "4242424242424242", // Stripe success card
					last_four: "4242",
					card_brand: "VISA",
					is_primary: false,
					created_at: new Date(),
				},
			];

			res.status(200).json({ cards: mockCards });
		} catch (error) {
			console.error("Get cards error:", error);
			res.status(500).json({ error: error.message });
		}
	}

	static async addCard(req, res) {
		try {
			const userId = req.userId;
			const { cardNumber, lastFour, cardBrand, isPrimary } = req.body;

			if (!cardNumber || !lastFour || !cardBrand) {
				return res.status(400).json({
					error: "Card number, last four, and card brand are required",
				});
			}

			// If setting as primary, unset other primary cards
			if (isPrimary) {
				await pool.query(
					"UPDATE cards SET is_primary = false WHERE user_id = $1",
					[userId]
				);
			}

			// Check if card already exists
			const existingCard = await pool.query(
				"SELECT id FROM cards WHERE user_id = $1 AND last_four = $2 AND card_brand = $3",
				[userId, lastFour, cardBrand]
			);

			if (existingCard.rows.length > 0) {
				return res.status(400).json({ error: "This card is already added" });
			}

			// Generate a card token (in production, this would come from payment provider)
			const cardToken = `tok_${cardBrand}_${lastFour}_${Date.now()}`;

			const result = await pool.query(
				`INSERT INTO cards (user_id, card_token, last_four, card_brand, is_primary, created_at)
				 VALUES ($1, $2, $3, $4, $5, NOW())
				 RETURNING id, card_token, last_four, card_brand, is_primary, created_at`,
				[userId, cardToken, lastFour, cardBrand, isPrimary || false]
			);

			res.status(201).json({
				message: "Card added successfully",
				card: result.rows[0],
			});
		} catch (error) {
			console.error("Add card error:", error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = UserController;
