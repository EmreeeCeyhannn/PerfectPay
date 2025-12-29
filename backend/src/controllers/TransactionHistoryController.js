const pspStore = require("../psp/PSPPluginStore");

class TransactionHistoryController {
	/**
	 * Get all transactions for user
	 */
	static async getAllTransactions(req, res) {
		try {
			const userId = req.userId;
			const limit = parseInt(req.query.limit) || 100;
			const offset = parseInt(req.query.offset) || 0;

			// Get transaction history from database
			const pool = require("../config/database");
			const result = await pool.query(
				`SELECT * FROM transactions 
				 WHERE sender_id = $1 OR recipient_id = $1 
				 ORDER BY created_at DESC 
				 LIMIT $2 OFFSET $3`,
				[userId, limit, offset]
			);

			const userTransactions = result.rows.map((tx) => ({
				id: tx.transaction_id,
				date: tx.created_at,
				amount: tx.amount,
				currency: tx.from_currency,
				toCurrency: tx.to_currency,
				status: tx.status?.toUpperCase() || "PENDING",
				provider: tx.selected_psp || "Pending",
				type: "transfer",
				recipientId: tx.recipient_id,
				recipientName: tx.recipient_name,
				fraudScore: tx.fraud_score,
				senderCountry: tx.sender_country,
				recipientCountry: tx.recipient_country,
			}));

			res.status(200).json({
				userId,
				transactions: userTransactions,
				count: userTransactions.length,
				limit,
				offset,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get transaction by ID
	 */
	static async getTransactionById(req, res) {
		try {
			const { transactionId } = req.params;
			const userId = req.userId;

			// In production: SELECT * FROM transactions WHERE id = $1 AND sender_id = $2
			const mockTransaction = {
				id: transactionId,
				type: "transfer",
				amount: 100,
				currency: "USD",
				psp: "Wise",
				status: "COMPLETED",
				createdAt: new Date().toISOString(),
				details: {
					sender: "test1@example.com",
					recipient: "test2@example.com",
					exchangeRate: 0.79,
					costs: {
						commission: 1.5,
						fxCost: 1.58,
						total: 3.08,
					},
				},
			};

			res.status(200).json(mockTransaction);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Filter transactions by type
	 */
	static async getTransactionsByType(req, res) {
		try {
			const userId = req.userId;
			const { type } = req.params; // "transfer" or "card_payment"

			// In production: SELECT * FROM transaction_history WHERE user_id = $1 AND transaction_type = $2
			const mockTransactions = [
				{
					id: 1,
					type: type,
					amount: 100,
					psp: "Wise",
					status: "COMPLETED",
					createdAt: new Date().toISOString(),
				},
			];

			res.status(200).json({
				userId,
				transactionType: type,
				transactions: mockTransactions,
				count: mockTransactions.length,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Get transaction statistics
	 */
	static async getStatistics(req, res) {
		try {
			const userId = req.userId;

			// In production: Aggregate queries on transaction_history
			const stats = {
				totalTransactions: 5,
				totalVolume: 450,
				averageAmount: 90,
				completedCount: 5,
				failedCount: 0,
				pendingCount: 0,
				topPSP: "Wise",
				topCurrency: "USD",
			};

			res.status(200).json({
				userId,
				statistics: stats,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = TransactionHistoryController;
