const pool = require("../config/database");

class Transaction {
	static async create(transactionData) {
		const {
			user_id,
			provider_id,
			amount,
			currency,
			status,
			provider_transaction_id,
			is_suspicious,
		} = transactionData;

		const result = await pool.query(
			`INSERT INTO transactions 
       (user_id, provider_id, amount, currency, status, provider_transaction_id, is_suspicious, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
			[
				user_id,
				provider_id,
				amount,
				currency,
				status,
				provider_transaction_id,
				is_suspicious || false,
			]
		);

		return result.rows[0];
	}

	static async findById(id) {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE id = $1",
			[id]
		);
		return result.rows[0];
	}

	static async findByUserId(userId, limit = 20, offset = 0) {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
			[userId, limit, offset]
		);
		return result.rows;
	}

	static async update(id, updateData) {
		const { status, is_suspicious } = updateData;
		const result = await pool.query(
			"UPDATE transactions SET status = COALESCE($2, status), is_suspicious = COALESCE($3, is_suspicious) WHERE id = $1 RETURNING *",
			[id, status, is_suspicious]
		);
		return result.rows[0];
	}

	static async getStats() {
		const result = await pool.query(
			`SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions
       FROM transactions`
		);
		return result.rows[0];
	}

	static async findByTransactionId(transactionId) {
		const result = await pool.query(
			`SELECT t.*, 
			        u1.email as sender_email
			 FROM transactions t
			 LEFT JOIN users u1 ON t.user_id = u1.id
			 WHERE t.provider_transaction_id = $1`,
			[transactionId]
		);
		return result.rows[0];
	}
}

module.exports = Transaction;
