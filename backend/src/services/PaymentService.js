const Transaction = require("../models/Transaction");
const StripeProvider = require("../providers/StripeProvider");
const pool = require("../config/database");

class PaymentService {
	constructor() {
		this.providers = {
			stripe: new StripeProvider(),
		};
	}

	async processPayment(userId, paymentData) {
		const {
			amount,
			currency,
			cardToken,
			provider = "stripe",
			description,
		} = paymentData;

		// Validate payment data
		if (!amount || amount <= 0) {
			throw new Error("Invalid amount");
		}

		// Check Blacklist
		const isBlacklisted = await this.checkBlacklist(userId, cardToken);
		if (isBlacklisted) {
			throw new Error("Transaction blocked due to security policies.");
		}

		// Select provider
		const selectedProvider = this.providers[provider];
		if (!selectedProvider) {
			throw new Error("Provider not supported");
		}

		// Process payment
		const paymentResult = await selectedProvider.processPayment({
			amount,
			currency,
			cardToken,
			description,
		});

		// Check for suspicious activity
		const is_suspicious = this.checkSuspicious(amount);

		// Create transaction record
		const transaction = await Transaction.create({
			user_id: userId,
			provider_id: 1, // Stripe ID
			amount,
			currency,
			status: paymentResult.status,
			provider_transaction_id: paymentResult.transactionId,
			is_suspicious,
		});

		return {
			...paymentResult,
			transaction,
		};
	}

	checkSuspicious(amount) {
		// Simple fraud rule: flag amounts over 5000
		return amount > 5000;
	}

	async checkBlacklist(userId, cardToken) {
		// Check if user or card is in blacklist
		// This is a simplified check. In reality, you might check IP, email, etc.
		const result = await pool.query(
			"SELECT * FROM blacklist WHERE identifier = $1 OR identifier = $2",
			[userId.toString(), cardToken]
		);
		return result.rows.length > 0;
	}

	async getTransactionHistory(userId) {
		return await Transaction.findByUserId(userId);
	}

	async getStats() {
		return await Transaction.getStats();
	}
}

module.exports = new PaymentService();
