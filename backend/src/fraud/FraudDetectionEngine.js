// Rule-Based Fraud Detection System (0-100 Risk Score)

class FraudDetectionEngine {
	constructor() {
		this.userTransactionHistory = new Map(); // timestamps
		this.userAmountHistory = new Map(); // amounts for last 3 comparison
		this.ipLocationHistory = new Map();
		this.deviceHistory = new Map();
		this.thresholds = {
			LOW: 30,
			MEDIUM: 70,
			HIGH: 100,
		};
	}

	/**
	 * Comprehensive risk assessment
	 * Returns score 0-100 and action
	 */
	assessRisk(transactionData, userHistory = []) {
		let riskScore = 0;
		const violations = [];
		let autoLogout = false;

		const {
			amount,
			currency,
			userId,
			cardNumber,
			ipAddress,
			deviceId,
			timestamp,
			recipientCountry,
			senderCountry,
		} = transactionData;

		// Get user's transaction history from memory
		const userAmountHistory = this.userAmountHistory.has(userId)
			? this.userAmountHistory.get(userId).map((a) => ({ amount: a }))
			: [];

		// Rule 1: Rapid Transaction Detection (0-40 points)
		const rapidCheck = this.checkRapidTransactions(userId, timestamp);
		riskScore += rapidCheck.score;
		if (rapidCheck.violated) violations.push(rapidCheck.reason);
		if (rapidCheck.autoLogout) autoLogout = true;

		// Rule 2: Unusual Amount (0-25 points)
		const amountCheck = this.checkUnusualAmount(
			userId,
			amount,
			userAmountHistory
		);
		riskScore += amountCheck.score;
		if (amountCheck.violated) violations.push(amountCheck.reason);
		if (amountCheck.autoLogout) autoLogout = true;

		// Rule 3: Geolocation Anomaly (0-30 points)
		const geoCheck = this.checkGeolocationAnomaly(
			userId,
			ipAddress,
			senderCountry,
			timestamp
		);
		riskScore += geoCheck.score;
		if (geoCheck.violated) violations.push(geoCheck.reason);

		// Rule 4: Device Mismatch (0-20 points)
		const deviceCheck = this.checkDeviceMismatch(userId, deviceId, ipAddress);
		riskScore += deviceCheck.score;
		if (deviceCheck.violated) violations.push(deviceCheck.reason);

		// Rule 5: High-Risk Country Pair (0-15 points)
		const countryCheck = this.checkHighRiskCountries(
			senderCountry,
			recipientCountry
		);
		riskScore += countryCheck.score;
		if (countryCheck.violated) violations.push(countryCheck.reason);

		// Rule 6: Card Velocity (0-20 points)
		const cardCheck = this.checkCardVelocity(cardNumber, timestamp);
		riskScore += cardCheck.score;
		if (cardCheck.violated) violations.push(cardCheck.reason);

		// Rule 7: Time-of-Day Anomaly (0-10 points)
		const timeCheck = this.checkAbnormalTime(userId, timestamp);
		riskScore += timeCheck.score;
		if (timeCheck.violated) violations.push(timeCheck.reason);

		// Cap the score at 100
		riskScore = Math.min(riskScore, 100);

		// Determine action based on score
		const action = this.determineAction(riskScore);

		return {
			riskScore,
			riskLevel: this.getRiskLevel(riskScore),
			action,
			violations,
			autoLogout,
			breakdown: {
				rapidTransactions: rapidCheck.score,
				unusualAmount: amountCheck.score,
				geolocation: geoCheck.score,
				deviceMismatch: deviceCheck.score,
				highRiskCountry: countryCheck.score,
				cardVelocity: cardCheck.score,
				abnormalTime: timeCheck.score,
			},
			recommendation: this.getRecommendation(riskScore, action),
		};
	}

	/**
	 * Rule 1: Check for rapid transactions (multiple in short time)
	 * AUTO-LOGOUT if >3 transactions within 300 seconds
	 */
	checkRapidTransactions(userId, currentTimestamp) {
		if (!this.userTransactionHistory.has(userId)) {
			this.userTransactionHistory.set(userId, []);
			return { score: 0, violated: false };
		}

		const history = this.userTransactionHistory.get(userId);
		const recentCount = history.filter(
			(t) => currentTimestamp - t < 300000 // Within last 5 minutes
		).length;

		// AUTO-LOGOUT: More than 3 transactions in 300 seconds
		if (recentCount > 3) {
			return {
				score: 100,
				violated: true,
				reason: `🚨 ACCOUNT SUSPENDED: ${recentCount} transactions in 30 seconds! Auto-logout triggered.`,
				autoLogout: true,
			};
		}

		if (recentCount === 3) {
			return {
				score: 35,
				violated: true,
				reason: `⚠️ WARNING: 3 transactions in 30 seconds detected - next one will trigger auto-logout`,
			};
		}

		if (recentCount === 2) {
			return {
				score: 20,
				violated: true,
				reason: `⚡ Rapid transactions detected (2 in 30 seconds)`,
			};
		}

		if (recentCount === 1) {
			return {
				score: 10,
				violated: true,
				reason: `⚠️ Multiple transactions in short time`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 2: Check for unusual transaction amount
	 * AUTO-LOGOUT if current amount > average of last 3 transactions
	 */
	checkUnusualAmount(userId, amount, userHistory = []) {
		if (userHistory.length === 0) {
			return { score: 0, violated: false };
		}

		// Get last 3 transactions for comparison
		const last3 = userHistory.slice(-3);
		if (last3.length >= 3) {
			const last3Amounts = last3.map((t) => t.amount);
			const avgLast3 =
				last3Amounts.reduce((a, b) => a + b, 0) / last3Amounts.length;

			// AUTO-LOGOUT: Current amount greater than average of last 3
			if (amount > avgLast3 * 3) {
				return {
					score: 100,
					violated: true,
					reason: `🚨 SUSPICIOUS AMOUNT: Current ${amount} > avg of last 3 (${avgLast3.toFixed(
						2
					)}). Account suspended.`,
					autoLogout: true,
				};
			}
		}

		// Check against all history for other anomalies
		const amounts = userHistory.map((t) => t.amount);
		const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
		const maxAmount = Math.max(...amounts);

		// Calculate deviation from overall average
		const deviation = amount / avgAmount;

		if (deviation > 5) {
			return {
				score: 25,
				violated: true,
				reason: `💰 Amount is 5x+ usual (avg: ${avgAmount.toFixed(
					2
				)}, current: ${amount})`,
			};
		}

		if (deviation > 3) {
			return {
				score: 15,
				violated: true,
				reason: `⚠️ Amount is 3x+ usual average`,
			};
		}

		if (amount > maxAmount * 1.5) {
			return {
				score: 8,
				violated: false,
				reason: `📊 Slightly above max previous amount`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 3: Check for geolocation anomalies
	 */
	checkGeolocationAnomaly(userId, currentIP, currentCountry, timestamp) {
		if (!this.ipLocationHistory.has(userId)) {
			this.ipLocationHistory.set(userId, [
				{ country: currentCountry, timestamp, ip: currentIP },
			]);
			return { score: 0, violated: false };
		}

		const history = this.ipLocationHistory.get(userId);
		const lastEntry = history[history.length - 1];

		if (!lastEntry) {
			this.ipLocationHistory
				.get(userId)
				.push({ country: currentCountry, timestamp, ip: currentIP });
			return { score: 0, violated: false };
		}

		const timeDiff = timestamp - lastEntry.timestamp; // milliseconds
		const distanceKm = this.calculateDistance(
			lastEntry.country,
			currentCountry
		);

		// Update history
		this.ipLocationHistory
			.get(userId)
			.push({ country: currentCountry, timestamp, ip: currentIP });
		if (this.ipLocationHistory.get(userId).length > 50) {
			this.ipLocationHistory.get(userId).shift();
		}

		// Impossible travel check: Can't travel faster than ~900 km/hour
		const maxPossibleDistance = (timeDiff / 3600000) * 900; // Convert ms to hours, then to km

		if (distanceKm > maxPossibleDistance && distanceKm > 1000) {
			return {
				score: 30,
				violated: true,
				reason: `✈️ Impossible travel: ${distanceKm}km in ${(
					timeDiff / 60000
				).toFixed(0)} minutes`,
			};
		}

		if (lastEntry.country !== currentCountry && distanceKm > 5000) {
			return {
				score: 15,
				violated: true,
				reason: `🌍 Large geographic change: ${lastEntry.country} → ${currentCountry}`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 4: Check for device mismatches
	 */
	checkDeviceMismatch(userId, deviceId, ipAddress) {
		if (!this.deviceHistory.has(userId)) {
			this.deviceHistory.set(userId, [{ deviceId, ipAddress }]);
			return { score: 0, violated: false };
		}

		const history = this.deviceHistory.get(userId);
		const isKnownDevice = history.some((d) => d.deviceId === deviceId);
		const isKnownIP = history.some((d) => d.ipAddress === ipAddress);

		if (!isKnownDevice && !isKnownIP) {
			return {
				score: 20,
				violated: true,
				reason: `📱 Unknown device and IP combination`,
			};
		}

		if (!isKnownDevice && isKnownIP) {
			return {
				score: 10,
				violated: true,
				reason: `📱 New device from known IP`,
			};
		}

		if (isKnownDevice && !isKnownIP) {
			return {
				score: 8,
				violated: true,
				reason: `🌐 Known device from new location`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 5: Check for high-risk country pairs
	 */
	checkHighRiskCountries(senderCountry, recipientCountry) {
		const highRiskPairs = [
			["KP", "US"], // North Korea to US
			["IR", "US"], // Iran to US
			["SY", "US"], // Syria to US
		];

		const isHighRisk = highRiskPairs.some(
			(pair) =>
				(pair[0] === senderCountry && pair[1] === recipientCountry) ||
				(pair[1] === senderCountry && pair[0] === recipientCountry)
		);

		if (isHighRisk) {
			return {
				score: 15,
				violated: true,
				reason: `⚠️ High-risk country pair: ${senderCountry} → ${recipientCountry}`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 6: Check card velocity (multiple cards in short time)
	 */
	checkCardVelocity(cardNumber, timestamp) {
		if (!cardNumber) return { score: 0, violated: false };

		const cardKey = cardNumber.slice(-4); // Use last 4 digits for privacy

		// Simulate check - in production would query database
		const recentCardUses = Math.random() < 0.1 ? 1 : 0;

		if (recentCardUses > 3) {
			return {
				score: 20,
				violated: true,
				reason: `💳 Multiple card attempts with different cards`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Rule 7: Check for abnormal transaction time
	 */
	checkAbnormalTime(userId, timestamp) {
		const hour = new Date(timestamp).getHours();

		// Transactions between 2-5 AM are unusual
		if (hour >= 2 && hour <= 5) {
			return {
				score: 10,
				violated: true,
				reason: `🌙 Transaction at unusual time: ${hour}:00`,
			};
		}

		return { score: 0, violated: false };
	}

	/**
	 * Determine action based on risk score
	 */
	determineAction(riskScore) {
		if (riskScore <= 30) {
			return "APPROVE";
		} else if (riskScore <= 70) {
			return "VERIFY"; // Request additional verification
		} else {
			return "DECLINE"; // Block transaction
		}
	}

	/**
	 * Get human-readable risk level
	 */
	getRiskLevel(score) {
		if (score <= 30) return "LOW";
		if (score <= 70) return "MEDIUM";
		return "HIGH";
	}

	/**
	 * Get recommendation message
	 */
	getRecommendation(riskScore, action) {
		const messages = {
			APPROVE: "✅ Transaction looks legitimate. Proceeding...",
			VERIFY: "🔐 Please verify your identity (2FA/OTP)",
			DECLINE:
				"❌ Transaction blocked for security reasons. Please contact support.",
		};

		return messages[action];
	}

	/**
	 * Simple distance calculator (using country as proxy)
	 */
	calculateDistance(country1, country2) {
		// In production, use actual geolocation data
		// This is a mock calculation
		if (country1 === country2) return 0;

		const distances = {
			"TR-US": 9500,
			"TR-EU": 2000,
			"US-EU": 6500,
			default: 5000,
		};

		const key = `${country1}-${country2}`;
		return distances[key] || distances.default;
	}

	recordTransaction(userId, amount, ipAddress, deviceId, timestamp) {
		// Record timestamp for velocity checks
		if (!this.userTransactionHistory.has(userId)) {
			this.userTransactionHistory.set(userId, []);
		}
		this.userTransactionHistory.get(userId).push(timestamp);

		// Keep only last 100 transaction timestamps
		if (this.userTransactionHistory.get(userId).length > 100) {
			this.userTransactionHistory.get(userId).shift();
		}

		// Record amount for last 3 transaction comparison
		if (!this.userAmountHistory.has(userId)) {
			this.userAmountHistory.set(userId, []);
		}
		this.userAmountHistory.get(userId).push(amount);

		// Keep only last 100 transaction amounts
		if (this.userAmountHistory.get(userId).length > 100) {
			this.userAmountHistory.get(userId).shift();
		}
	}

	/**
	 * Clear user's fraud detection history (called on logout)
	 */
	clearUserHistory(userId) {
		if (this.userTransactionHistory.has(userId)) {
			this.userTransactionHistory.delete(userId);
		}
		if (this.userAmountHistory.has(userId)) {
			this.userAmountHistory.delete(userId);
		}
		if (this.ipLocationHistory.has(userId)) {
			this.ipLocationHistory.delete(userId);
		}
		if (this.deviceHistory.has(userId)) {
			this.deviceHistory.delete(userId);
		}
		console.log(`🔄 Fraud detection history cleared for user: ${userId}`);
	}
}

const fraudEngine = new FraudDetectionEngine();

module.exports = fraudEngine;
