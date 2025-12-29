const PaymentServiceProvider = require("./PaymentServiceProvider");

class StripePSP extends PaymentServiceProvider {
	constructor(apiKey) {
		super({
			name: "Stripe",
			apiConfig: { apiKey },
			supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
			commissionRules: {
				USD: { percentage: 2.9, fixed: 0.3 },
				EUR: { percentage: 2.9, fixed: 0.3 },
				default: { percentage: 2.9, fixed: 0.3 },
			},
			priority: 80,
		});
		this.apiKey = apiKey;
		this.avgLatency = 600; // Stripe: Medium speed (600ms average)
	}

	async validateTransaction(transactionData) {
		// Validate card and transaction with Stripe
		const { cardNumber, expiryDate, cvc, amount, currency } = transactionData;

		// Mock validation
		if (!cardNumber || !expiryDate || !cvc) {
			throw new Error("Invalid card details");
		}

		if (!this.supportedCurrencies.includes(currency)) {
			throw new Error(`${currency} not supported by Stripe`);
		}

		return {
			valid: true,
			cardBrand: this.getCardBrand(cardNumber),
			riskLevel: this.assessRisk(transactionData),
		};
	}

	async processPayment(paymentData) {
		const startTime = Date.now();

		try {
			const { amount, currency, cardNumber, description, recipientEmail } =
				paymentData;

			// Simulate Stripe API call
			const isSuccess = Math.random() > 0.02; // 98% success rate
			const latency = Math.random() * 800 + 200; // 200-1000ms

			if (!isSuccess) {
				throw new Error("Stripe: Payment declined");
			}

			this.updateMetrics(latency, true);

			return {
				success: true,
				transactionId: `stripe_${Date.now()}`,
				pspName: "Stripe",
				amount,
				currency,
				description,
				recipientEmail,
				processingTime: latency,
				timestamp: new Date(),
			};
		} catch (error) {
			this.updateMetrics(Date.now() - startTime, false);
			throw error;
		}
	}

	async getExchangeRate(fromCurrency, toCurrency) {
		// Mock exchange rate (real would call Stripe API)
		const rates = {
			"TRY-USD": 0.032,
			"TRY-EUR": 0.03,
			"USD-EUR": 0.92,
			"EUR-USD": 1.09,
		};

		const key = `${fromCurrency}-${toCurrency}`;
		return rates[key] || 1.0;
	}

	getCardBrand(cardNumber) {
		const first = cardNumber.charAt(0);
		if (first === "4") return "Visa";
		if (first === "5") return "Mastercard";
		if (first === "3") return "Amex";
		return "Unknown";
	}

	assessRisk(transactionData) {
		// Risk assessment (0-100)
		let risk = 0;

		const { amount, deviceId, ipLocation, previousTransactions } =
			transactionData;

		if (amount > 5000) risk += 20;
		if (amount > 10000) risk += 30;

		return Math.min(risk, 100);
	}
}

module.exports = StripePSP;
