const pool = require("../config/database");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

class AdminController {
	static async getDashboardStats(req, res) {
		try {
			const transactionStats = await Transaction.getStats();
			const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
			const activeProviders = await pool.query(
				"SELECT COUNT(*) as count FROM payment_providers WHERE is_active = true"
			);

			res.json({
				totalTransactions: parseInt(transactionStats.total_transactions),
				totalVolume: parseFloat(transactionStats.total_amount || 0),
				successfulTransactions: parseInt(
					transactionStats.successful_transactions
				),
				totalUsers: parseInt(userCount.rows[0].count),
				activeProviders: parseInt(activeProviders.rows[0].count),
			});
		} catch (error) {
			console.error("Dashboard stats error:", error);
			res.status(500).json({ error: "Failed to fetch dashboard stats" });
		}
	}

	static async getUsers(req, res) {
		try {
			const result = await pool.query(
				"SELECT id, email, full_name, phone, kyc_status, created_at FROM users ORDER BY created_at DESC"
			);
			res.json(result.rows);
		} catch (error) {
			console.error("Get users error:", error);
			res.status(500).json({ error: "Failed to fetch users" });
		}
	}

	static async getTransactions(req, res) {
		try {
			const result = await pool.query(`
                SELECT t.*, u.email as user_email, p.name as provider_name 
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                JOIN payment_providers p ON t.provider_id = p.id
                ORDER BY t.created_at DESC
                LIMIT 100
            `);
			res.json(result.rows);
		} catch (error) {
			console.error("Get transactions error:", error);
			res.status(500).json({ error: "Failed to fetch transactions" });
		}
	}

	static async getCommissionSettings(req, res) {
		try {
			const result = await pool.query(`
                SELECT cs.*, p.name as provider_name 
                FROM commission_settings cs
                JOIN payment_providers p ON cs.provider_id = p.id
            `);
			res.json(result.rows);
		} catch (error) {
			console.error("Get commission settings error:", error);
			res.status(500).json({ error: "Failed to fetch commission settings" });
		}
	}

	static async updateCommissionSettings(req, res) {
		const { id, commission_rate, min_amount, max_amount } = req.body;
		try {
			const result = await pool.query(
				`UPDATE commission_settings 
                 SET commission_rate = $1, min_amount = $2, max_amount = $3, updated_at = NOW() 
                 WHERE id = $4 RETURNING *`,
				[commission_rate, min_amount, max_amount, id]
			);
			res.json(result.rows[0]);
		} catch (error) {
			console.error("Update commission settings error:", error);
			res.status(500).json({ error: "Failed to update commission settings" });
		}
	}

	static async getProviderPreferences(req, res) {
		try {
			const result = await pool.query(
				"SELECT * FROM payment_providers ORDER BY id"
			);
			res.json(result.rows);
		} catch (error) {
			console.error("Get provider preferences error:", error);
			res.status(500).json({ error: "Failed to fetch provider preferences" });
		}
	}

	static async updateProviderPreferences(req, res) {
		const { id, is_active } = req.body;
		try {
			const result = await pool.query(
				"UPDATE payment_providers SET is_active = $1 WHERE id = $2 RETURNING *",
				[is_active, id]
			);
			res.json(result.rows[0]);
		} catch (error) {
			console.error("Update provider preferences error:", error);
			res.status(500).json({ error: "Failed to update provider preferences" });
		}
	}

	static async getBlacklist(req, res) {
		try {
			const result = await pool.query(
				"SELECT * FROM blacklist ORDER BY created_at DESC"
			);
			res.json(result.rows);
		} catch (error) {
			console.error("Get blacklist error:", error);
			res.status(500).json({ error: "Failed to fetch blacklist" });
		}
	}

	static async removeFromBlacklist(req, res) {
		const { id } = req.params;
		try {
			await pool.query("DELETE FROM blacklist WHERE id = $1", [id]);
			res.json({ message: "Removed from blacklist" });
		} catch (error) {
			console.error("Remove from blacklist error:", error);
			res.status(500).json({ error: "Failed to remove from blacklist" });
		}
	}

	static async addToBlacklist(req, res) {
		const { email, reason } = req.body;
		try {
			await pool.query(
				"INSERT INTO blacklist (identifier, reason) VALUES ($1, $2) ON CONFLICT (identifier) DO NOTHING",
				[email, reason || "Manual suspension by admin"]
			);
			res.json({ message: "User added to blacklist" });
		} catch (error) {
			console.error("Add to blacklist error:", error);
			res.status(500).json({ error: "Failed to add to blacklist" });
		}
	}
}

module.exports = AdminController;
