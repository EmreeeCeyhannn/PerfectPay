// Quick migration script to add columns
const pool = require("./src/config/database");

async function migrate() {
	try {
		console.log("Running migration...");

		// Add sender_country and recipient_country columns
		await pool.query(`
			ALTER TABLE transactions 
			ADD COLUMN IF NOT EXISTS sender_country VARCHAR(2),
			ADD COLUMN IF NOT EXISTS recipient_country VARCHAR(2);
		`);

		console.log("✅ Migration completed successfully!");
		console.log(
			"Added sender_country and recipient_country columns to transactions table"
		);

		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		process.exit(1);
	}
}

migrate();
