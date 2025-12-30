const PaymentOrchestrationService = require("../services/PaymentOrchestrationService");
const pspStore = require("../psp/PSPPluginStore");
const multiCardOptimizer = require("../services/MultiCardOptimizer");

class PaymentController {
	/**
	 * Create Payment - Main endpoint as per documentation
	 * POST /api/payments
	 */
	static async createPayment(req, res) {
		try {
			const userId = req.userId;
			const {
				amount,
				currency,
				source_currency,
				card_id,
				preference = "balanced", // cheap, fast, balanced
				location_country,
			} = req.body;

			// Validation
			if (!amount || !currency) {
				return res.status(400).json({
					error: "Missing required fields: amount, currency",
				});
			}

			if (amount <= 0) {
				return res.status(400).json({ error: "Amount must be greater than 0" });
			}

			// Process payment through orchestration service
			const result = await PaymentOrchestrationService.initiateMoneyTransfer({
				senderId: userId,
				recipientId: req.body.recipient_id || "recipient_default",
				recipientName: req.body.recipient_name || "Recipient",
				recipientEmail: req.body.recipient_email || "",
				amount,
				fromCurrency: source_currency || currency,
				toCurrency: currency,
				senderCountry: location_country || "TR",
				recipientCountry: req.body.recipient_country || "US",
				senderBankAccount: req.body.sender_account || "default",
				recipientBankAccount: req.body.recipient_account || "default",
				userMode: preference, // Map preference to userMode
				description: req.body.description || "",
				ipAddress: req.ip,
				deviceId: req.headers["user-agent"],
			});

			if (result.success) {
				// Format response as per documentation
				const response = {
					transaction_id: result.transactionId,
					status: result.status.toLowerCase(),
					routed_via: result.selectedPSP,
					optimization_details: {
						selected_mode: preference,
						savings: result.routing?.alternatives?.[0]?.costDifference
							? `${result.routing.alternatives[0].costDifference} ${currency}`
							: "0.00 USD",
						fx_rate_applied: result.exchangeRate || 1.0,
					},
					fraud_score: result.riskAssessment?.riskScore || 0,
				};
				res.status(200).json(response);
			} else if (result.status === "DECLINED") {
				res.status(403).json(result);
			} else {
				res.status(400).json(result);
			}
		} catch (error) {
			console.error("Payment creation error:", error);
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * P2P Money Transfer with Optimal Routing
	 */
	static async initiateMoneyTransfer(req, res) {
		try {
			const userId = req.userId;
			const {
				recipientId,
				recipientName,
				recipientEmail,
				amount,
				fromCurrency,
				toCurrency,
				senderCountry,
				recipientCountry,
				senderBankAccount,
				recipientBankAccount,
				userMode = "balanced",
				description = "",
				preferredProvider, // Manual PSP selection
				cardToken, // Card token for payment
			} = req.body;
			console.log("💳 PaymentController - Received cardToken:", cardToken);
			// Validation
			if (!recipientId || !amount || !fromCurrency || !toCurrency) {
				return res.status(400).json({
					error:
						"Missing required fields: recipientId, amount, fromCurrency, toCurrency",
				});
			}

			if (amount <= 0) {
				return res.status(400).json({ error: "Amount must be greater than 0" });
			}

			// Process transfer through orchestration service
			const result = await PaymentOrchestrationService.initiateMoneyTransfer({
				senderId: userId,
				recipientId,
				recipientName,
				recipientEmail,
				amount,
				fromCurrency,
				toCurrency,
				senderCountry,
				recipientCountry,
				senderBankAccount,
				recipientBankAccount,
				userMode,
				description,
				ipAddress: req.ip,
				deviceId: req.headers["user-agent"],
				preferredProvider, // Pass manual selection to service
				cardToken, // Pass card token for Stripe
			});

			if (result.success) {
				res.status(200).json(result);
			} else if (result.status === "DECLINED") {
				res.status(403).json(result);
			} else {
				res.status(400).json(result);
			}
		} catch (error) {
			console.error("Transfer error:", error);
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get transaction smart receipt with cost breakdown
	 */
	static async getSmartReceipt(req, res) {
		try {
			const { transactionId } = req.params;

			// In production, fetch from database
			const transactionData = {
				transactionId,
				selectedPSP: "Wise",
				amount: 1000,
				toCurrency: "USD",
				costs: {
					commission: 15,
					fxCost: 5,
					totalCost: 20,
				},
				routing: {
					alternatives: [{ pspName: "Stripe", costDifference: "10" }],
				},
			};

			const receipt =
				PaymentOrchestrationService.getSmartReceipt(transactionData);
			res.status(200).json(receipt);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get transaction transparency map
	 */
	static async getTransactionMap(req, res) {
		try {
			const { transactionId } = req.params;
			const map = await PaymentOrchestrationService.getTransactionMap(
				transactionId
			);
			res.status(200).json(map);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get PSP Performance Analytics
	 */
	static async getPSPAnalytics(req, res) {
		try {
			const analytics = PaymentOrchestrationService.getPSPAnalytics();
			res.status(200).json(analytics);
		} catch (error) {
			console.error("Analytics error:", error);
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * List all available PSPs
	 */
	static async listAvailablePSPs(req, res) {
		try {
			const psps = pspStore.getPSPList();
			res.status(200).json({
				available: psps,
				totalCount: psps.length,
				timestamp: new Date(),
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get system health check
	 */
	static async healthCheck(req, res) {
		try {
			const health = PaymentOrchestrationService.healthCheck();
			res.status(200).json(health);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get transaction history
	 */
	static async getTransactionHistory(req, res) {
		try {
			const userId = req.userId;
			const limit = req.query.limit || 50;

			// In production, query from database
			const history = pspStore.getTransactionHistory(limit);
			res.status(200).json({
				transactions: history,
				count: history.length,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Estimate optimal route and costs (without processing)
	 */
	static async estimateOptimalRoute(req, res) {
		try {
			const {
				amount,
				fromCurrency,
				toCurrency,
				senderCountry,
				recipientCountry,
				userMode = "balanced",
			} = req.body;

			if (!amount || !fromCurrency || !toCurrency) {
				return res.status(400).json({
					error: "Missing: amount, fromCurrency, toCurrency",
				});
			}

			const routingEngine = require("../routing/OptimalRoutingEngine");
			const analysis = await routingEngine.selectOptimalPSP({
				amount,
				fromCurrency,
				toCurrency,
				sourceCountry: senderCountry || "TR",
				destCountry: recipientCountry || "US",
				userMode,
			});

			res.status(200).json({
				estimatedRoute: analysis.optimal,
				alternatives: analysis.alternatives,
				analysis: analysis.analysis,
			});
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	/**
	 * Process Card Payment
	 */
	static async processCardPayment(req, res) {
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
	 * Analyze Multi-Card Payment Options
	 * POST /api/payments/multi-card/analyze
	 */
	static async analyzeMultiCard(req, res) {
		try {
			const { amount, currency, cards } = req.body;

			if (!amount || !currency) {
				return res.status(400).json({
					error: "Missing required fields: amount, currency",
				});
			}

			// If cards not provided, use mock cards for demo
			const availableCards = cards || [
				{
					id: 1,
					last4: "4242",
					type: "visa",
					balance: 300,
					isActive: true,
					fixedFee: 0.3,
				},
				{
					id: 2,
					last4: "5555",
					type: "mastercard",
					balance: 250,
					isActive: true,
					fixedFee: 0.3,
				},
				{
					id: 3,
					last4: "3782",
					type: "amex",
					balance: 500,
					isActive: true,
					fixedFee: 0.3,
				},
			];

			const analysis = multiCardOptimizer.analyzeMultiCardOption(
				{ amount, currency },
				availableCards
			);

			res.status(200).json({
				success: true,
				analysis,
			});
		} catch (error) {
			console.error("Multi-card analysis error:", error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = PaymentController;
