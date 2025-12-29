const PaymentServiceProvider = require("./PaymentServiceProvider");

class IyzicoPSP extends PaymentServiceProvider {
	constructor(apiKey) {
		super({
			name: "İyzico",
			apiConfig: { apiKey },
			supportedCurrencies: ["TRY", "USD", "EUR"],
			commissionRules: {
				TRY: { percentage: 2.45, fixed: 0.25 },
				USD: { percentage: 2.9, fixed: 0.3 },
				EUR: { percentage: 2.9, fixed: 0.3 },
				default: { percentage: 2.9, fixed: 0.3 },
			},
			priority: 90, // Highest priority for TRY transactions
		});
		this.apiKey = apiKey;
		this.avgLatency = 350; // İyzico: Fast (local Turkish optimization)
	}

	async validateTransaction(transactionData) {
		const { cardNumber, amount, currency } = transactionData;

		if (!cardNumber) {
			throw new Error("Card number required");
		}

		if (!this.supportedCurrencies.includes(currency)) {
			throw new Error(`${currency} not supported by İyzico`);
		}

		return {
			valid: true,
			cardBrand: this.getCardBrand(cardNumber),
			isLocalCard: this.isLocalCard(cardNumber),
			riskLevel: this.assessRisk(transactionData),
		};
	}

	async processPayment(paymentData) {
		const startTime = Date.now();

		try {
			const { amount, currency, cardNumber, recipientId, description } =
				paymentData;

			// İyzico: Optimized for Turkish market
			const isSuccess = Math.random() > 0.03; // 97% success rate
			const latency = Math.random() * 400 + 150; // 150-550ms (local optimization)

			if (!isSuccess) {
				throw new Error("İyzico: Payment failed");
			}

			this.updateMetrics(latency, true);

			return {
				success: true,
				transactionId: `iyzico_${Date.now()}`,
				pspName: "İyzico",
				amount,
				currency,
				recipientId,
				description,
				processingTime: latency,
				timestamp: new Date(),
				note: "Optimized for Turkish market",
			};
		} catch (error) {
			this.updateMetrics(Date.now() - startTime, false);
			throw error;
		}
	}

	async getExchangeRate(fromCurrency, toCurrency) {
		// İyzico rates (good for TRY conversions)
		const rates = {
			"TRY-USD": 0.0323,
			"TRY-EUR": 0.0301,
			"USD-TRY": 30.9,
			"EUR-TRY": 33.2,
		};

		const key = `${fromCurrency}-${toCurrency}`;
		return rates[key] || 1.0;
	}

	getCardBrand(cardNumber) {
		const first = cardNumber.charAt(0);
		if (first === "4") return "Visa";
		if (first === "5") return "Mastercard";
		if (first === "9") return "Troy";
		return "Other";
	}

	isLocalCard(cardNumber) {
		// In real system, check BIN database
		// Mock: cards starting with 9 are usually local Turkish cards
		return cardNumber.charAt(0) === "9";
	}

	assessRisk(transactionData) {
		let risk = 0;

		const { amount, isLocalCard } = transactionData;

		// Local cards have lower risk
		if (!isLocalCard) risk += 15;
		if (amount > 5000) risk += 10;
		if (amount > 10000) risk += 20;

		return Math.min(risk, 100);
	}
}

module.exports = IyzicoPSP;
