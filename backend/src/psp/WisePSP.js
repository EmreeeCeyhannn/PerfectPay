const PaymentServiceProvider = require("./PaymentServiceProvider");

class WisePSP extends PaymentServiceProvider {
	constructor(apiKey) {
		super({
			name: "Wise",
			apiConfig: { apiKey },
			supportedCurrencies: [
				"USD",
				"EUR",
				"GBP",
				"AUD",
				"CAD",
				"JPY",
				"CHF",
				"SEK",
				"NZD",
				"TRY",
			],
			commissionRules: {
				USD: { percentage: 1.5, fixed: 0.5 },
				EUR: { percentage: 1.5, fixed: 0.5 },
				GBP: { percentage: 1.5, fixed: 0.5 },
				TRY: { percentage: 1.2, fixed: 0.3 },
				default: { percentage: 1.5, fixed: 0.5 },
			},
			priority: 85, // High priority for FX transfers
		});
		this.apiKey = apiKey;
		this.avgLatency = 300; // Wise: Fastest for international transfers
	}

	async validateTransaction(transactionData) {
		const { iban, bankAccount, amount, currency } = transactionData;

		if (!iban && !bankAccount) {
			throw new Error("IBAN or bank account required for Wise");
		}

		if (!this.supportedCurrencies.includes(currency)) {
			throw new Error(`${currency} not supported by Wise`);
		}

		return {
			valid: true,
			accountType: iban ? "IBAN" : "Bank Account",
			riskLevel: "low",
		};
	}

	async processPayment(paymentData) {
		const startTime = Date.now();

		try {
			const {
				amount,
				currency,
				fromCurrency,
				toCurrency,
				recipientBankAccount,
				recipientName,
				description,
			} = paymentData;

			// Wise is excellent for FX transfers
			const isSuccess = Math.random() > 0.01; // 99% success rate
			const latency = Math.random() * 1000 + 300; // 300-1300ms (international)

			if (!isSuccess) {
				throw new Error("Wise: Transfer failed");
			}

			this.updateMetrics(latency, true);

			return {
				success: true,
				transactionId: `wise_${Date.now()}`,
				pspName: "Wise",
				amount,
				currency,
				fromCurrency,
				toCurrency,
				recipientBankAccount,
				recipientName,
				description,
				processingTime: latency,
				timestamp: new Date(),
				note: "Ideal for international FX transfers",
			};
		} catch (error) {
			this.updateMetrics(Date.now() - startTime, false);
			throw error;
		}
	}

	async getExchangeRate(fromCurrency, toCurrency) {
		// Wise has excellent real-time rates (mock here)
		const rates = {
			"TRY-USD": 0.0325, // Better than Stripe usually
			"TRY-EUR": 0.0302,
			"USD-EUR": 0.92,
			"EUR-USD": 1.09,
			"GBP-USD": 1.27,
			"USD-GBP": 0.79,
		};

		const key = `${fromCurrency}-${toCurrency}`;
		return rates[key] || 1.0;
	}
}

module.exports = WisePSP;
