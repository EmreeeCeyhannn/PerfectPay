const pool = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
	static async create(userData) {
		const { email, password, full_name, phone } = userData;
		const hashedPassword = await bcrypt.hash(password, 10);

		const result = await pool.query(
			"INSERT INTO users (email, password_hash, full_name, phone, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, full_name",
			[email, hashedPassword, full_name, phone]
		);

		return result.rows[0];
	}

	static async findByEmail(email) {
		const result = await pool.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);
		return result.rows[0];
	}

	static async findById(id) {
		const result = await pool.query(
			"SELECT id, email, full_name, phone, kyc_status, created_at FROM users WHERE id = $1",
			[id]
		);
		return result.rows[0];
	}

	static async update(id, userData) {
		const { full_name, phone, kyc_status } = userData;
		const result = await pool.query(
			"UPDATE users SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), kyc_status = COALESCE($4, kyc_status) WHERE id = $1 RETURNING id, email, full_name, phone, kyc_status",
			[id, full_name, phone, kyc_status]
		);
		return result.rows[0];
	}

	static async verifyPassword(password, hashedPassword) {
		return await bcrypt.compare(password, hashedPassword);
	}
}

module.exports = User;
