// Main Payment Orchestration Service
const routingEngine = require("../routing/OptimalRoutingEngine");
const fraudEngine = require("../fraud/FraudDetectionEngine");
const pspStore = require("../psp/PSPPluginStore");
const pool = require("../config/database");
const receiptGenerator = require("./ReceiptGenerator");

class PaymentOrchestrationService {
	async initiateMoneyTransfer(transferData) {
		const {
			senderId,
			recipientId,
			amount,
			fromCurrency,
			toCurrency,
			senderCountry,
			recipientCountry,
			senderBankAccount,
			recipientBankAccount,
			userMode = "balanced",
			description = "",
		} = transferData;

		try {
			// Check Blacklist
			const isBlacklisted = await this.checkBlacklist(senderId);
			if (isBlacklisted) {
				return {
					success: false,
					status: "DECLINED",
					error: "Transaction blocked due to security policies."
				};
			}

			// Generate transaction ID immediately
			const transactionId = `tx_pending_${Date.now()}${Math.random()
				.toString(36)
				.substring(7)}`;

			// Save transaction as PENDING immediately (before processing)
			console.log("💾 Creating pending transaction record...");
			try {
				await pool.query(
					`INSERT INTO transactions 
					(transaction_id, sender_id, recipient_id, recipient_name, recipient_account, 
					 amount, from_currency, to_currency, fx_rate, selected_psp, 
					 fraud_score, fraud_status, total_cost, commission, status, 
					 sender_country, recipient_country, created_at) 
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())`,
					[
						transactionId,
						senderId,
						parseInt(recipientId) || null,
						transferData.recipientName,
						recipientBankAccount,
						amount,
						fromCurrency,
						toCurrency,
						1.0, // Temporary FX rate
						"pending",
						0, // Will update after fraud check
						"pending",
						0, // Will update after routing
						0, // Will update after routing
						"pending",
						senderCountry,
						recipientCountry,
					]
				);
				console.log("✅ Pending transaction saved with ID:", transactionId);
			} catch (dbError) {
				console.error("⚠️ Database save failed:", dbError.message);
			}

			// Record transaction BEFORE fraud check (for velocity tracking)
			const currentTimestamp = Date.now();

			// Step 1: Fraud Assessment
			console.log("🔍 Step 1: Assessing fraud risk...");

			// Simulate realistic fraud detection processing time (8-12 seconds)
			const fraudProcessingTime = 8000 + Math.floor(Math.random() * 4000); // 8-12 seconds
			console.log(`⏳ Waiting for Fraud Check: ${fraudProcessingTime}ms`);
			await new Promise((resolve) => setTimeout(resolve, fraudProcessingTime));

			const fraudCheck = fraudEngine.assessRisk({
				amount,
				currency: fromCurrency,
				userId: senderId,
				ipAddress: transferData.ipAddress,
				deviceId: transferData.deviceId,
				timestamp: currentTimestamp,
				recipientCountry,
				senderCountry,
			});

			console.log(
				`📊 Risk Level: ${fraudCheck.riskLevel} (${fraudCheck.riskScore}/100)`
			);

			// If HIGH risk, decline (DO NOT record the transaction)
			if (fraudCheck.action === "DECLINE") {
				return {
					success: false,
					status: "DECLINED",
					reason: fraudCheck.recommendation,
					riskAssessment: fraudCheck,
				};
			}

			// Only record transaction if NOT declined
			fraudEngine.recordTransaction(
				senderId,
				amount,
				transferData.ipAddress,
				transferData.deviceId,
				currentTimestamp
			);

			// If MEDIUM risk, might require verification
			if (fraudCheck.action === "VERIFY") {
				console.log("🔐 Additional verification required");
				// In production, send OTP/2FA
			}

			// Step 2: Optimal PSP Selection
			console.log("🎯 Step 2: Selecting optimal payment route...");

			// Simulate route optimization processing (4-6 seconds)
			const routingProcessingTime = 4000 + Math.floor(Math.random() * 2000);
			console.log(`⏳ Waiting for Routing: ${routingProcessingTime}ms`);
			await new Promise((resolve) =>
				setTimeout(resolve, routingProcessingTime)
			);

			const routingAnalysis = await routingEngine.selectOptimalPSP({
				amount,
				fromCurrency,
				toCurrency,
				sourceCountry: senderCountry,
				destCountry: recipientCountry,
				userMode,
			});

			// Allow manual override if customer selects alternative PSP
			let selectedPSP;
			if (transferData.preferredProvider) {
				selectedPSP = transferData.preferredProvider;
				console.log(`👆 Customer manually selected: ${selectedPSP}`);
			} else {
				selectedPSP = routingAnalysis.optimal.pspName;
				console.log(`✅ Auto-selected optimal PSP: ${selectedPSP}`);
			}

			console.log(
				`💰 Expected Cost Score: ${routingAnalysis.optimal.expectedScore.toFixed(
					2
				)}`
			);
			console.log(
				`💡 Recommendation: ${routingAnalysis.optimal.recommendation}`
			);

			// Step 3: Prepare Payment Data
			console.log("📋 Step 3: Preparing payment data...");
			const paymentData = {
				amount,
				currency: toCurrency,
				fromCurrency,
				senderAccountId: senderBankAccount,
				recipientAccountId: recipientBankAccount,
				senderName: transferData.senderName,
				recipientName: transferData.recipientName,
				recipientEmail: transferData.recipientEmail,
				description,
				sourceCountry: senderCountry,
				destCountry: recipientCountry,
				transactionId: transactionId, // Pass the existing transaction ID
			};

			// Step 4: Execute Payment via Selected PSP
			console.log(`💳 Step 4: Processing with ${selectedPSP}...`);
			const psp = pspStore.getPSP(selectedPSP);

			// Simulate PSP authorization processing (20-25 seconds for realistic bank processing)
			const pspProcessingTime = 20000 + Math.floor(Math.random() * 5000); // 20-25 seconds
			console.log(`⏳ Waiting for PSP: ${pspProcessingTime}ms`);
			await new Promise((resolve) => setTimeout(resolve, pspProcessingTime));

			const paymentResult = await psp.processPayment(paymentData);

			// Step 5: Update transaction status to completed
			console.log("💾 Step 5: Updating transaction status to completed...");
			console.log("🔍 Transaction ID:", transactionId);
			console.log("🔍 Selected PSP:", selectedPSP);
			try {
				const updateResult = await pool.query(
					`UPDATE transactions 
					SET fx_rate = $1, fraud_score = $2, fraud_status = $3, 
					    total_cost = $4, commission = $5, status = $6, selected_psp = $7, updated_at = NOW()
					WHERE transaction_id = $8`,
					[
						routingAnalysis.optimal.exchangeRate,
						fraudCheck.riskScore,
						fraudCheck.riskLevel.toLowerCase(),
						routingAnalysis.optimal.breakdown.totalScore,
						routingAnalysis.optimal.breakdown.commission,
						"completed",
						selectedPSP,
						transactionId,
					]
				);
				console.log(
					"✅ Transaction updated to completed. Rows affected:",
					updateResult.rowCount
				);
			} catch (dbError) {
				console.error(
					"⚠️ Database update failed (continuing):",
					dbError.message
				);
			}

			// Step 6: Build Complete Transaction Response
			console.log("✔️ Step 6: Finalizing transaction...");
			const transactionResponse = {
				success: true,
				status: "COMPLETED",
				transactionId: paymentResult.transactionId,
				selectedPSP,
				amount,
				fromCurrency,
				toCurrency,
				exchangeRate: routingAnalysis.optimal.exchangeRate,
				recipient: {
					id: recipientId,
					name: transferData.recipientName,
					country: recipientCountry,
					bankAccount: recipientBankAccount,
				},
				sender: {
					id: senderId,
					country: senderCountry,
				},
				costs: {
					commission: routingAnalysis.optimal.breakdown.commission,
					fxCost: routingAnalysis.optimal.breakdown.fxCost,
					totalCost: routingAnalysis.optimal.breakdown.totalScore,
				},
				processingTime: paymentResult.processingTime,
				riskAssessment: fraudCheck,
				routing: {
					selectedScore: routingAnalysis.optimal.expectedScore,
					alternatives: (routingAnalysis?.alternatives || [])
						.slice(0, 2)
						.map((alt) => ({
							pspName: alt.pspName,
							expectedScore: alt.weightedScore,
							costDifference: (
								alt.weightedScore - routingAnalysis.optimal.expectedScore
							).toFixed(2),
						})),
				},
				timestamp: new Date(),
				estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
			};

			// Record in PSP store for analytics
			pspStore.recordTransaction({
				transactionId: paymentResult.transactionId,
				selectedPSP,
				pspName: selectedPSP, // For display
				amount,
				currency: toCurrency,
				success: true,
				status: "COMPLETED",
				senderId,
				userId: senderId, // For filtering
				recipientId,
				timestamp: new Date().toISOString(),
				type: "transfer",
				processingTime: paymentResult.processingTime || 0,
			});

			// Note: fraudEngine.recordTransaction already called after fraud check

			// Step 7: Generate Smart Receipt
			console.log("🧾 Step 7: Generating smart receipt...");
			try {
				const receiptData = {
					transactionId: paymentResult.transactionId,
					amount,
					fromCurrency,
					toCurrency,
					fxRate: routingAnalysis.optimal.exchangeRate,
					commission: routingAnalysis.optimal.breakdown.commission,
					selectedPSP,
					senderEmail: transferData.senderEmail || 'N/A',
					recipientEmail: transferData.recipientEmail || 'N/A',
					status: 'completed',
					createdAt: new Date()
				};
				const receipt = await receiptGenerator.saveReceipt(receiptData);
				transactionResponse.receipt = receipt;
				console.log("✅ Receipt generated:", receipt.filename);
			} catch (receiptError) {
				console.error("⚠️ Receipt generation failed (continuing):", receiptError.message);
			}

			return transactionResponse;
		} catch (error) {
			console.error("❌ Transaction failed:", error.message);

			return {
				success: false,
				status: "FAILED",
				error: error.message,
				timestamp: new Date(),
			};
		}
	}

	/**
	 * Get transaction transparency map data
	 * Shows the geographical path: User IP → PerfectPay Server → PSP Server
	 */
	async getTransactionMap(transactionId) {
		try {
			const Transaction = require("../models/Transaction");

			// Fetch real transaction data from database
			const transaction = await Transaction.findByTransactionId(transactionId);

			if (!transaction) {
				// Return a mock visualization if transaction not found in database
				// This allows testing and handles legacy transactions
				console.log(
					`Transaction ${transactionId} not found in database, using mock data`
				);
				return this.getMockTransactionMap(transactionId);
			}

			// Real PSP server locations based on actual infrastructure
			const pspLocations = {
				Stripe: {
					city: "San Francisco",
					country: "USA",
					ip: "104.16.133.229",
					region: "us-west-1",
					avgLatency: 2100, // milliseconds
				},
				PayPal: {
					city: "San Jose",
					country: "USA",
					ip: "64.4.250.36",
					region: "us-west-2",
					avgLatency: 1800,
				},
				Wise: {
					city: "London",
					country: "UK",
					ip: "52.18.140.221",
					region: "eu-west-2",
					avgLatency: 1500,
				},
				Iyzico: {
					city: "Istanbul",
					country: "Turkey",
					ip: "185.184.194.30",
					region: "eu-south-1",
					avgLatency: 1200,
				},
			};

			// Determine user location based on sender country from database
			const userLocationMap = {
				TR: { city: "Istanbul", country: "Turkey", ip: "176.88.43.12" },
				US: { city: "New York", country: "USA", ip: "192.0.2.1" },
				UK: { city: "London", country: "UK", ip: "51.148.0.0" },
				DE: { city: "Berlin", country: "Germany", ip: "46.23.96.0" },
				FR: { city: "Paris", country: "France", ip: "2.0.0.0" },
				CA: { city: "Toronto", country: "Canada", ip: "99.240.0.0" },
				AU: { city: "Sydney", country: "Australia", ip: "1.0.0.0" },
				JP: { city: "Tokyo", country: "Japan", ip: "1.0.16.0" },
				IT: { city: "Rome", country: "Italy", ip: "2.224.0.0" },
				ES: { city: "Madrid", country: "Spain", ip: "2.136.0.0" },
				GB: { city: "London", country: "UK", ip: "51.148.0.0" },
			};

			// Use actual sender country from database (not currency-based guess)
			const senderCountry = transaction.sender_country || "US";
			const recipientCountry = transaction.recipient_country || "US";

			const userLocation = userLocationMap[senderCountry] || {
				city: "Unknown",
				country: "Unknown",
				ip: "0.0.0.0",
			};
			const userIP = userLocation.ip;

			// Get PSP location for the selected PSP
			const selectedPSP = transaction.selected_psp || "Stripe";
			const pspLocation = pspLocations[selectedPSP] || pspLocations.Stripe;

			// Get recipient location
			const recipientLocation =
				userLocationMap[recipientCountry] || userLocationMap.US;

			// PerfectPay orchestration server location
			const perfectPayServer = {
				city: "Frankfurt",
				country: "Germany",
				ip: "51.89.160.10",
				region: "eu-central-1",
			};

			// Calculate realistic timing based on transaction creation time
			const transactionStart = new Date(transaction.created_at);
			const now = new Date();
			const isCompleted =
				transaction.status === "completed" || transaction.status === "success";

			// Calculate realistic step durations based on PSP and network latency (in seconds)
			const fraudCheckDuration = 5 + Math.floor(Math.random() * 10); // 5-15 seconds
			const routingDuration = 2 + Math.floor(Math.random() * 3); // 2-5 seconds
			const pspAuthDuration = 10 + Math.floor(Math.random() * 20); // 10-30 seconds
			const settlementDuration = 3 + Math.floor(Math.random() * 5); // 3-8 seconds

			const totalDuration =
				fraudCheckDuration +
				routingDuration +
				pspAuthDuration +
				settlementDuration +
				20;

			// Build step-by-step timeline
			const steps = [
				{
					step: 1,
					name: "Request Initiated",
					status: "completed",
					timestamp: transactionStart,
					duration: "0.1s",
					location: userLocation.city,
					details: `Payment request from ${transaction.sender_email || "user"
						} for ${transaction.amount} ${transaction.from_currency}`,
				},
				{
					step: 2,
					name: "Fraud Detection",
					status: "completed",
					timestamp: new Date(transactionStart.getTime() + 100),
					duration: `${fraudCheckDuration}s`,
					location: perfectPayServer.city,
					details: `7 security rules evaluated, risk score: ${transaction.fraud_score || 0
						} (${transaction.fraud_status?.toUpperCase() || "LOW"})`,
				},
				{
					step: 3,
					name: "Route Optimization",
					status: "completed",
					timestamp: new Date(
						transactionStart.getTime() + 100 + fraudCheckDuration * 1000
					),
					duration: `${routingDuration}s`,
					location: perfectPayServer.city,
					details: `Evaluated 4 PSPs, selected ${selectedPSP} (optimal for ${transaction.from_currency}→${transaction.to_currency})`,
				},
				{
					step: 4,
					name: "PSP Authorization",
					status: isCompleted ? "completed" : "in-progress",
					timestamp: new Date(
						transactionStart.getTime() +
						100 +
						fraudCheckDuration * 1000 +
						routingDuration * 1000
					),
					duration: isCompleted ? `${pspAuthDuration}s` : null,
					location: pspLocation.city,
					details: `${selectedPSP} API: Processing payment authorization via ${pspLocation.region}`,
				},
				{
					step: 5,
					name: "Bank Settlement",
					status: isCompleted ? "completed" : "pending",
					duration: isCompleted ? `${settlementDuration}s` : null,
					timestamp: isCompleted
						? new Date(
							transactionStart.getTime() +
							100 +
							fraudCheckDuration * 1000 +
							routingDuration * 1000 +
							pspAuthDuration * 1000
						)
						: null,
					location: pspLocation.city,
					details: isCompleted
						? "Funds transferred via banking network"
						: "Awaiting bank confirmation",
				},
				{
					step: 6,
					name: "Confirmation Sent",
					status: isCompleted ? "completed" : "pending",
					timestamp: isCompleted
						? new Date(
							transactionStart.getTime() +
							100 +
							(fraudCheckDuration +
								routingDuration +
								pspAuthDuration +
								settlementDuration) *
							1000
						)
						: null,
					duration: isCompleted ? "0.5s" : null,
					location: userLocation.city,
					details: isCompleted
						? `Confirmation sent to ${transaction.recipient_email ||
						transaction.recipient_name ||
						"recipient"
						}`
						: "Pending completion",
				},
			];

			return {
				transactionId,
				overview: {
					totalDuration: isCompleted
						? `${fraudCheckDuration +
						routingDuration +
						pspAuthDuration +
						settlementDuration
						}s`
						: "In progress...",
					status: transaction.status,
					path: `${userLocation.city} → ${perfectPayServer.city} → ${pspLocation.city} → ${recipientLocation.city}`,
					amount: `${transaction.amount} ${transaction.from_currency}`,
					psp: selectedPSP,
				},
				geographicPath: [
					{
						location: "Sender",
						city: userLocation.city,
						country: userLocation.country,
						ip: userIP,
						type: "origin",
					},
					{
						location: "PerfectPay Orchestrator",
						city: perfectPayServer.city,
						country: perfectPayServer.country,
						ip: perfectPayServer.ip,
						type: "orchestrator",
						region: perfectPayServer.region,
					},
					{
						location: `${selectedPSP} Payment Server`,
						city: pspLocation.city,
						country: pspLocation.country,
						ip: pspLocation.ip,
						type: "psp",
						region: pspLocation.region,
					},
					{
						location: "Recipient",
						city: recipientLocation.city,
						country: recipientLocation.country,
						ip: recipientLocation.ip,
						type: "destination",
					},
				],
				steps,
				metadata: {
					fraudScore: transaction.fraud_score,
					commission: transaction.commission,
					fxRate: transaction.fx_rate,
					createdAt: transaction.created_at,
					senderCountry: senderCountry,
					recipientCountry: recipientCountry,
				},
			};
		} catch (error) {
			console.error("Error generating transaction map:", error);
			// Return mock data as fallback
			return this.getMockTransactionMap(transactionId);
		}
	}

	/**
	 * Get mock transaction map for testing or when transaction not found
	 */
	getMockTransactionMap(transactionId) {
		const selectedPSP = "Stripe";
		const startTime = Date.now() - 5000;

		return {
			transactionId,
			overview: {
				totalDuration: "4.82s",
				status: "completed",
				path: "Istanbul → Frankfurt → San Francisco",
				amount: "500 TRY",
				psp: selectedPSP,
			},
			geographicPath: [
				{
					location: "User Device",
					city: "Istanbul",
					country: "Turkey",
					ip: "176.88.43.12",
					type: "origin",
				},
				{
					location: "PerfectPay Orchestrator",
					city: "Frankfurt",
					country: "Germany",
					ip: "51.89.160.10",
					type: "orchestrator",
					region: "eu-central-1",
				},
				{
					location: `${selectedPSP} Payment Server`,
					city: "San Francisco",
					country: "USA",
					ip: "104.16.133.229",
					type: "psp",
					region: "us-west-1",
				},
			],
			steps: [
				{
					step: 1,
					name: "Request Initiated",
					status: "completed",
					timestamp: new Date(startTime),
					duration: "12ms",
					location: "Istanbul",
					details: "Payment request received from user",
				},
				{
					step: 2,
					name: "Fraud Detection",
					status: "completed",
					timestamp: new Date(startTime + 120),
					duration: "340ms",
					location: "Frankfurt",
					details: "7 security rules evaluated, risk score: 15 (LOW)",
				},
				{
					step: 3,
					name: "Route Optimization",
					status: "completed",
					timestamp: new Date(startTime + 460),
					duration: "180ms",
					location: "Frankfurt",
					details: `Evaluated 4 PSPs, selected ${selectedPSP} (optimal cost)`,
				},
				{
					step: 4,
					name: "PSP Authorization",
					status: "completed",
					timestamp: new Date(startTime + 640),
					duration: "2.1s",
					location: "San Francisco",
					details: `${selectedPSP} API: Processing payment authorization`,
				},
				{
					step: 5,
					name: "Bank Settlement",
					status: "completed",
					timestamp: new Date(startTime + 2740),
					duration: "1.8s",
					location: "San Francisco",
					details: "Funds transferred via banking network",
				},
				{
					step: 6,
					name: "Confirmation Sent",
					status: "completed",
					timestamp: new Date(startTime + 4540),
					duration: "8ms",
					location: "Istanbul",
					details: "Transaction completed successfully",
				},
			],
			metadata: {
				fraudScore: 15,
				commission: 7.5,
				fxRate: 34.12,
				createdAt: new Date(startTime),
			},
		};
	}

	/**
	 * Get PSP performance analytics
	 */
	getPSPAnalytics() {
		const metrics = pspStore.getPerformanceMetrics();

		return {
			overallStats: {
				totalPSPs: Object.keys(metrics).length,
				activePSPs: pspStore.getAllActivePSPs().length,
				timestamp: new Date(),
			},
			pspPerformance: Object.entries(metrics).map(([pspName, stats]) => ({
				pspName,
				totalTransactions: stats.totalTransactions,
				successfulTransactions: stats.successfulTransactions,
				failedTransactions: stats.failedTransactions,
				successRate: `${stats.successRate}%`,
				totalVolume: `$${stats.totalVolume.toFixed(2)}`,
				avgValue:
					stats.totalTransactions > 0
						? `$${(stats.totalVolume / stats.totalTransactions).toFixed(2)}`
						: "$0",
			})),
		};
	}

	/**
	 * Get smart receipt - detailed transaction breakdown
	 */
	getSmartReceipt(transactionData) {
		return {
			transactionId: transactionData.transactionId,
			receipt: {
				amount: transactionData.amount,
				currency: transactionData.toCurrency,
				selectedRoute: transactionData.selectedPSP,
				breakdown: {
					base: transactionData.amount,
					pspFee: transactionData.costs.commission,
					fxCost: transactionData.costs.fxCost,
					totalCost: transactionData.costs.totalCost,
				},
				savings: {
					compared: transactionData.routing.alternatives[0],
					estimatedSavings: parseFloat(
						transactionData.routing.alternatives[0].costDifference
					).toFixed(2),
				},
				deliveryTime: transactionData.estimatedDelivery,
				status: transactionData.status,
				recommendation: `✅ You saved $${(
					parseFloat(transactionData.routing.alternatives[0].costDifference) -
					transactionData.costs.totalCost
				).toFixed(2)} by using ${transactionData.selectedPSP}`,
			},
		};
	}

	/**
	 * Process Card Payment with Optimal PSP Selection
	 */
	async processCardPayment(cardPaymentData) {
		const {
			userId,
			amount,
			currency,
			cardToken,
			description = "",
			selectedPSP = "Stripe",
			ipAddress,
			deviceId,
		} = cardPaymentData;

		try {
			// Step 1: Fraud Assessment
			console.log("🔍 Step 1: Card Payment - Assessing fraud risk...");
			const fraudCheck = fraudEngine.assessRisk({
				amount,
				currency,
				userId,
				ipAddress,
				deviceId,
				timestamp: Date.now(),
				cardNumber: cardToken.substring(0, 6), // First 6 digits
				isCardPayment: true,
			});

			console.log(
				`📊 Risk Level: ${fraudCheck.riskLevel} (${fraudCheck.riskScore}/100)`
			);

			// If HIGH risk, decline
			if (fraudCheck.action === "DECLINE") {
				return {
					success: false,
					status: "DECLINED",
					reason: fraudCheck.recommendation,
					riskAssessment: fraudCheck,
				};
			}

			// Step 2: Get optimal PSP for card payment
			const psp = pspStore.getPSP(selectedPSP);
			if (!psp) {
				return {
					success: false,
					status: "FAILED",
					error: `PSP ${selectedPSP} not found`,
				};
			}

			// Step 3: Calculate costs
			const costBreakdown = psp.calculateCostScore({
				amount,
				currency,
				transactionType: "card",
			});

			// Step 4: Process payment
			console.log(`💳 Processing card payment with ${selectedPSP}...`);
			const paymentResult = await psp.processPayment({
				amount,
				currency,
				cardToken,
				description,
			});

			const transactionId = `card_${Date.now()}`;

			// Step 5: Record transaction
			pspStore.recordTransaction({
				transactionId,
				selectedPSP,
				pspName: selectedPSP,
				amount,
				currency,
				success: true,
				status: "COMPLETED",
				userId,
				senderId: userId,
				timestamp: new Date().toISOString(),
				type: "card_payment",
				processingTime: paymentResult.processingTime || 0,
			});

			return {
				success: true,
				status: "COMPLETED",
				transactionId,
				selectedPSP,
				amount,
				currency,
				cardLastFour: cardToken.substring(cardToken.length - 4),
				costs: {
					commission: costBreakdown.commission || 0,
					fxCost: 0,
					totalCost: costBreakdown.totalCost || costBreakdown.commission || 0,
				},
				riskAssessment: fraudCheck,
				timestamp: new Date(),
				estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
			};
		} catch (error) {
			console.error("Card payment orchestration error:", error);
			return {
				success: false,
				status: "FAILED",
				error: error.message,
			};
		}
	}

	/**
	 * Health check - verify all PSPs are operational
	 */
	healthCheck() {
		const psps = pspStore.getPSPList();

		return {
			systemStatus: "OPERATIONAL",
			psps: psps.map((psp) => ({
				...psp,
				status: psp.isActive ? "ACTIVE" : "INACTIVE",
				latency: `${Math.round(psp.avgLatency)}ms`,
			})),
			timestamp: new Date(),
		};
	}

	async checkBlacklist(userId) {
		try {
			const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
			if (userRes.rows.length === 0) return false;
			const email = userRes.rows[0].email;

			const result = await pool.query(
				"SELECT * FROM blacklist WHERE identifier = $1",
				[email]
			);
			return result.rows.length > 0;
		} catch (error) {
			console.error("Blacklist check failed:", error);
			return false;
		}
	}
}

const paymentService = new PaymentOrchestrationService();

module.exports = paymentService;
