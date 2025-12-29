const pool = require("./src/config/database");
const bcrypt = require("bcryptjs");

async function setup() {
	try {
		const email = "testadmin@example.com";
		const password = "password123";
		const hashedPassword = await bcrypt.hash(password, 10);

		// Check if user exists
		const check = await pool.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);

		if (check.rows.length > 0) {
			console.log("Test user already exists");
			// Update password just in case
			await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
				hashedPassword,
				email,
			]);
		} else {
			await pool.query(
				"INSERT INTO users (email, password_hash, full_name, phone, kyc_status) VALUES ($1, $2, $3, $4, 'approved')",
				[email, hashedPassword, "Test Admin", "1234567890"]
			);
			console.log("Test user created");
		}

		// Ensure some transactions exist for the dashboard
		const user = await pool.query("SELECT id FROM users WHERE email = $1", [
			email,
		]);
		const userId = user.rows[0].id;

		await pool.query(
			"INSERT INTO transactions (user_id, provider_id, amount, currency, status) VALUES ($1, 1, 100.00, 'USD', 'success')",
			[userId]
		);
		await pool.query(
			"INSERT INTO transactions (user_id, provider_id, amount, currency, status) VALUES ($1, 1, 250.50, 'EUR', 'pending')",
			[userId]
		);

		console.log("Test data seeded");
		process.exit(0);
	} catch (error) {
		console.error("Setup failed:", error);
		process.exit(1);
	}
}

setup();
