const PaymentOrchestrationService = require("../services/PaymentOrchestrationService");

class CardPaymentController {
	/**
	 * Process Card Payment
	 */
	static async processPayment(req, res) {
		try {
			const userId = req.userId;
			const {
				amount,
				currency,
				cardToken,
				description = "",
				selectedPSP = "Stripe",
			} = req.body;

			// Validation
			if (!amount || !currency || !cardToken) {
				return res.status(400).json({
					error: "Missing required fields: amount, currency, cardToken",
				});
			}

			if (amount <= 0) {
				return res.status(400).json({ error: "Amount must be greater than 0" });
			}

			// Process through orchestration service with fraud detection
			const result = await PaymentOrchestrationService.processCardPayment({
				userId,
				amount,
				currency,
				cardToken,
				description,
				selectedPSP,
				ipAddress: req.ip,
				deviceId: req.headers["user-agent"],
			});

			if (result.success) {
				res.status(200).json(result);
			} else if (result.status === "DECLINED") {
				res.status(403).json(result);
			} else {
				res.status(400).json(result);
			}
		} catch (error) {
			console.error("Card payment error:", error);
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get card payment history for user
	 */
	static async getCardPaymentHistory(req, res) {
		try {
			const userId = req.userId;
			const limit = req.query.limit || 50;

			// In production, query from database
			// SELECT * FROM card_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2
			const mockHistory = [
				{
					id: 1,
					amount: 50,
					currency: "USD",
					psp: "Stripe",
					status: "COMPLETED",
					createdAt: new Date().toISOString(),
				},
			];

			res.status(200).json({
				userId,
				history: mockHistory,
				count: mockHistory.length,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * List saved payment methods for user
	 */
	static async getPaymentMethods(req, res) {
		try {
			const userId = req.userId;

			// In production: SELECT * FROM payment_methods WHERE user_id = $1
			const mockMethods = [
				{
					id: 1,
					lastFour: "4242",
					brand: "Visa",
					expiryMonth: 12,
					expiryYear: 2025,
				},
				{
					id: 2,
					lastFour: "5555",
					brand: "Mastercard",
					expiryMonth: 6,
					expiryYear: 2024,
				},
			];

			res.status(200).json({
				userId,
				paymentMethods: mockMethods,
				count: mockMethods.length,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = CardPaymentController;
