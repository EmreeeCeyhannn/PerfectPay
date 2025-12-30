const pool = require("./src/config/database");
const bcrypt = require("bcryptjs");

async function createTestUser() {
	try {
		const email = "test@example.com";
		const password = "Test123!";
		const hashedPassword = await bcrypt.hash(password, 10);

		// Check if user exists
		const check = await pool.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);

		if (check.rows.length > 0) {
			console.log("✅ Test user already exists");
			// Update password
			await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
				hashedPassword,
				email,
			]);
			console.log("✅ Password updated to: Test123!");
		} else {
			await pool.query(
				`INSERT INTO users (email, password_hash, full_name, phone, kyc_status) 
				 VALUES ($1, $2, $3, $4, 'approved')`,
				[email, hashedPassword, "Test User", "1234567890"]
			);
			console.log("✅ Test user created");
		}

		const user = await pool.query(
			"SELECT id, email FROM users WHERE email = $1",
			[email]
		);

		console.log(`\n📧 Email: ${email}`);
		console.log(`🔑 Password: ${password}`);
		console.log(`👤 User ID: ${user.rows[0].id}`);

		await pool.end();
		process.exit(0);
	} catch (error) {
		console.error("❌ Setup failed:", error);
		process.exit(1);
	}
}

createTestUser();
