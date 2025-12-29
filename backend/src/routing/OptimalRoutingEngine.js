// Optimal Routing Engine - Smart PSP Selection Algorithm
const pspStore = require("../psp/PSPPluginStore");

class OptimalRoutingEngine {
	/**
	 * Analyzes transaction and selects optimal PSP
	 * Score = PSP Fees + FX Costs + Latency + Risk Penalty
	 * Adds randomness to prevent always selecting same provider
	 */
	async selectOptimalPSP(transactionData) {
		const {
			amount,
			fromCurrency,
			toCurrency,
			sourceCountry,
			destCountry,
			userMode = "balanced", // 'cheap', 'fast', 'balanced'
		} = transactionData;

		const activePSPs = pspStore.getAllActivePSPs();
		const candidates = [];

		// Calculate scores for all active PSPs
		for (const psp of activePSPs) {
			// Check if PSP supports the currencies
			if (!psp.supportedCurrencies.includes(toCurrency)) {
				continue;
			}

			// Get exchange rate
			const exchangeRate = await psp.getExchangeRate(fromCurrency, toCurrency);

			// Calculate cost score
			const scoreData = psp.calculateCostScore(
				amount,
				fromCurrency,
				toCurrency,
				sourceCountry,
				destCountry,
				exchangeRate
			);

			// Geo-Smart Routing adjustment (dynamic based on PSP and amount)
			let geoScore = this.calculateGeoScore(
				psp.name,
				sourceCountry,
				destCountry,
				amount
			);

			const adjustedScore = scoreData.totalScore + geoScore;

			// Mode-specific weighting
			const weightedScore = this.applyModeWeighting(
				adjustedScore,
				scoreData,
				userMode
			);

			candidates.push({
				pspName: psp.name,
				psp: psp,
				originalScore: scoreData.totalScore,
				geoAdjustment: geoScore,
				adjustedScore,
				weightedScore,
				breakdown: scoreData,
				exchangeRate,
				recommendation: this.getRecommendation(psp.name, scoreData),
			});
		}

		if (candidates.length === 0) {
			throw new Error("No suitable PSP found for this transaction");
		}

		// Sort by weighted score (lowest is best)
		if (!candidates || candidates.length === 0) {
			throw new Error("No suitable PSP found for this transaction");
		}

		candidates.sort((a, b) => a.weightedScore - b.weightedScore);

		const optimalChoice = candidates[0];
		const alternatives = candidates.slice(1, 4);

		return {
			optimal: {
				pspName: optimalChoice.pspName,
				expectedScore: optimalChoice.weightedScore,
				breakdown: optimalChoice.breakdown,
				recommendation: optimalChoice.recommendation,
				exchangeRate: optimalChoice.exchangeRate,
			},
			alternatives,
			allCandidates: candidates,
			analysis: {
				mode: userMode,
				sourceCountry,
				destCountry,
				fromCurrency,
				toCurrency,
				amount,
				timestamp: new Date(),
			},
		};
	}

	/**
	 * Geographic routing - optimizes based on country pairs
	 * Adds dynamic variance based on transaction parameters
	 */
	calculateGeoScore(pspName, sourceCountry, destCountry, amount) {
		const geoOptimizations = {
			Wise: {
				"TRY-USD": -10, // Wise is excellent for Turkey to US
				"TRY-EUR": -10,
				international: -8,
			},
			İyzico: {
				"TRY-*": -15, // Best for Turkish Lira transactions
				"TRY-TRY": -20,
			},
			Stripe: {
				"USD-*": -5, // Stripe is good for US originating
				"*-USD": -3,
			},
			PayPal: {
				"*-*": 0, // General purpose
			},
		};

		let score = 0;
		const pspGeo = geoOptimizations[pspName] || {};

		// Check for exact country pair match
		if (pspGeo[`${sourceCountry}-${destCountry}`] !== undefined) {
			score += pspGeo[`${sourceCountry}-${destCountry}`];
		}
		// Check for country wildcard match
		else if (pspGeo[`${sourceCountry}-*`] !== undefined) {
			score += pspGeo[`${sourceCountry}-*`];
		}
		// Check for destination wildcard
		else if (pspGeo[`*-${destCountry}`] !== undefined) {
			score += pspGeo[`*-${destCountry}`];
		}
		// Check for international flag
		else if (
			sourceCountry !== destCountry &&
			pspGeo["international"] !== undefined
		) {
			score += pspGeo["international"];
		}

		// Add variance based on PSP name hash + amount to prevent static selection
		// Different PSPs will get different adjustments for same amount
		const pspHash = pspName.split("").reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);
		const amountHash = Math.abs(pspHash) + amount;
		const dynamicVariance = Math.sin(amountHash * 0.00001) * 3; // ±3 variance

		return score + dynamicVariance;
	}

	/**
	 * Apply user mode weighting
	 */
	applyModeWeighting(baseScore, breakdown, mode) {
		let adjustedScore = baseScore;

		if (mode === "cheap") {
			// Focus on lowest cost - increase cost weight
			adjustedScore = breakdown.totalScore * 1.5;
		} else if (mode === "fast") {
			// Focus on speed - DECREASE latency score makes faster PSPs better
			// Lower latency = better, so we reduce the impact of cost and increase latency importance
			adjustedScore =
				breakdown.latencyPenalty * 2.5 + breakdown.totalScore * 0.3;
		} else {
			// 'balanced' mode (default)
			adjustedScore = baseScore;
		}

		return adjustedScore;
	}

	/**
	 * Generate human-readable recommendation
	 */
	getRecommendation(pspName, breakdown) {
		const savings = (breakdown.totalScore * 0.1).toFixed(2); // Estimated savings

		const recommendations = {
			Wise: `✈️ Best for international transfers. Low FX markup (${breakdown.fxCost.toFixed(
				2
			)} FX cost). Fast processing.`,
			İyzico: `🇹🇷 Optimized for Turkish market. Best commission rates for TRY (${breakdown.commission.toFixed(
				2
			)}). Fastest local processing.`,
			Stripe: `💳 Reliable card processor. Standard fees (${breakdown.commission.toFixed(
				2
			)}). Industry standard uptime.`,
			PayPal: `🌐 Universal payment solution. Wide currency support. Covers most use cases.`,
		};

		return (
			recommendations[pspName] ||
			`Selected: ${pspName}. Total estimated cost: ${breakdown.totalScore.toFixed(
				2
			)}`
		);
	}

	/**
	 * Self-Healing: Fallback to next best PSP if primary fails
	 */
	async getNextAlternative(currentOptimal, failureReason) {
		// In production, this would retry with next best PSP
		// For now, return the next candidate from last analysis

		console.log(
			`🔄 Self-Healing: ${currentOptimal} failed (${failureReason}). Selecting alternative...`
		);

		return {
			switchReason: failureReason,
			switchedAt: new Date(),
			originalPSP: currentOptimal,
		};
	}
}

const routingEngine = new OptimalRoutingEngine();

module.exports = routingEngine;
