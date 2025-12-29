// PSP Plugin Store - Manages all available PSP integrations
const StripePSP = require("./StripePSP");
const WisePSP = require("./WisePSP");
const PayPalPSP = require("./PayPalPSP");
const IyzicoPSP = require("./IyzicoPSP");

class PSPPluginStore {
	constructor() {
		this.plugins = {};
		this.transactionHistory = [];
		this.performanceMetrics = {};
		this.initializeDefaultPSPs();
	}

	initializeDefaultPSPs() {
		// Initialize all available PSPs
		this.registerPSP(
			new StripePSP(process.env.STRIPE_API_KEY || "sk_test_stripe")
		);
		this.registerPSP(new WisePSP(process.env.WISE_API_KEY || "test_wise_key"));
		this.registerPSP(
			new PayPalPSP(process.env.PAYPAL_API_KEY || "test_paypal_key")
		);
		this.registerPSP(
			new IyzicoPSP(process.env.IYZICO_API_KEY || "test_iyzico_key")
		);
	}

	registerPSP(pspInstance) {
		this.plugins[pspInstance.name] = pspInstance;
		this.performanceMetrics[pspInstance.name] = {
			totalTransactions: 0,
			successfulTransactions: 0,
			failedTransactions: 0,
			totalVolume: 0,
			avgLatency: 0,
			successRate: 100,
		};
	}

	getPSP(name) {
		return this.plugins[name];
	}

	getAllActivePSPs() {
		return Object.values(this.plugins).filter((psp) => psp.isActive);
	}

	getPSPList() {
		return Object.values(this.plugins).map((psp) => ({
			name: psp.name,
			supportedCurrencies: psp.supportedCurrencies,
			priority: psp.priority,
			isActive: psp.isActive,
			avgLatency: psp.avgLatency,
			successRate: psp.successRate,
		}));
	}

	updatePSPStatus(pspName, isActive) {
		const psp = this.getPSP(pspName);
		if (psp) {
			psp.isActive = isActive;
			return { success: true };
		}
		return { success: false, error: "PSP not found" };
	}

	recordTransaction(transactionData) {
		this.transactionHistory.push({
			...transactionData,
			recordedAt: new Date(),
		});

		// Update metrics
		const pspName = transactionData.selectedPSP;
		if (this.performanceMetrics[pspName]) {
			this.performanceMetrics[pspName].totalTransactions++;
			this.performanceMetrics[pspName].totalVolume += transactionData.amount;

			if (transactionData.success) {
				this.performanceMetrics[pspName].successfulTransactions++;
			} else {
				this.performanceMetrics[pspName].failedTransactions++;
			}

			const successRate = (
				(this.performanceMetrics[pspName].successfulTransactions /
					this.performanceMetrics[pspName].totalTransactions) *
				100
			).toFixed(2);
			this.performanceMetrics[pspName].successRate = successRate;
		}
	}

	getPerformanceMetrics() {
		return this.performanceMetrics;
	}

	getTransactionHistory(limit = 50) {
		return this.transactionHistory.slice(-limit).reverse();
	}

	enablePSPMode(mode = "balanced") {
		// Mode: 'cheap' (lowest cost), 'fast' (lowest latency), 'balanced'
		this.currentMode = mode;
	}

	getCurrentMode() {
		return this.currentMode || "balanced";
	}
}

// Singleton instance
const pspStore = new PSPPluginStore();

module.exports = pspStore;
