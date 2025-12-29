// PSP Plugin System - Abstract Base Class
class PaymentServiceProvider {
	constructor(config) {
		this.name = config.name;
		this.apiConfig = config.apiConfig;
		this.supportedCurrencies = config.supportedCurrencies || [];
		this.commissionRules = config.commissionRules || {};
		this.priority = config.priority || 50;
		this.isActive = config.isActive || true;
		this.avgLatency = 0;
		this.successRate = 100;
	}

	async validateTransaction(transactionData) {
		throw new Error("validateTransaction() must be implemented");
	}

	async processPayment(paymentData) {
		throw new Error("processPayment() must be implemented");
	}

	async getExchangeRate(fromCurrency, toCurrency) {
		throw new Error("getExchangeRate() must be implemented");
	}

	getCommission(amount, currency, sourceCountry, destCountry) {
		// Default commission calculation
		const rule =
			this.commissionRules[currency] || this.commissionRules.default || {};
		const percentage = rule.percentage || 2.9;
		const fixed = rule.fixed || 0.3;
		return (amount * percentage) / 100 + fixed;
	}

	calculateCostScore(
		amount,
		fromCurrency,
		toCurrency,
		sourceCountry,
		destCountry,
		exchangeRate
	) {
		// Score formula: PSP Fees + FX Costs + Latency + Risk Penalty
		const commission = this.getCommission(
			amount,
			fromCurrency,
			sourceCountry,
			destCountry
		);

		// FX Cost (if currencies differ)
		let fxCost = 0;
		if (fromCurrency !== toCurrency) {
			const fxMarkup = this.getFXMarkup(fromCurrency, toCurrency);
			fxCost = (amount * exchangeRate * fxMarkup) / 100;
		}

		// Latency penalty (milliseconds converted to cost)
		const latencyPenalty = this.avgLatency / 100;

		// Risk adjustment based on success rate
		const riskPenalty = (100 - this.successRate) * 2;

		const totalScore = commission + fxCost + latencyPenalty + riskPenalty;

		return {
			pspName: this.name,
			commission,
			fxCost,
			latencyPenalty,
			riskPenalty,
			totalScore,
			successRate: this.successRate,
			avgLatency: this.avgLatency,
		};
	}

	getFXMarkup(fromCurrency, toCurrency) {
		// Default FX markup percentages
		const fxMarkups = {
			"TRY-USD": 2.5,
			"TRY-EUR": 2.5,
			"USD-EUR": 1.5,
			"EUR-USD": 1.5,
			default: 2.0,
		};

		const key = `${fromCurrency}-${toCurrency}`;
		return fxMarkups[key] || fxMarkups.default;
	}

	updateMetrics(latency, success) {
		// Update average latency
		this.avgLatency = (this.avgLatency + latency) / 2;

		// Update success rate (exponential moving average)
		const weight = 0.7;
		this.successRate =
			this.successRate * weight + (success ? 100 : 0) * (1 - weight);
	}
}

module.exports = PaymentServiceProvider;
