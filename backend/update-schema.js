const pool = require("./src/config/database");
const fs = require("fs");
const path = require("path");

async function updateSchema() {
	try {
		console.log("🔄 Starting database schema update...");

		// Drop old transactions table if exists
		console.log("📦 Dropping old transactions table...");
		await pool.query("DROP TABLE IF EXISTS transactions CASCADE");

		// Create new transactions table with correct schema
		console.log("✨ Creating new transactions table...");
		await pool.query(`
            CREATE TABLE transactions (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(255) UNIQUE NOT NULL,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                recipient_id INTEGER REFERENCES users(id),
                recipient_name VARCHAR(255),
                recipient_account VARCHAR(255),
                amount DECIMAL(15, 2) NOT NULL,
                from_currency VARCHAR(3) NOT NULL,
                to_currency VARCHAR(3) NOT NULL,
                fx_rate DECIMAL(20, 10),
                selected_psp VARCHAR(100) NOT NULL,
                fraud_score INTEGER DEFAULT 0,
                fraud_status VARCHAR(50) DEFAULT 'low_risk',
                total_cost DECIMAL(15, 2),
                commission DECIMAL(15, 2),
                status VARCHAR(50) DEFAULT 'pending',
                error_message TEXT,
                sender_country VARCHAR(2),
                recipient_country VARCHAR(2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

		console.log("✅ Schema updated successfully!");
		console.log("📊 New schema includes:");
		console.log("   - sender_id (replaces user_id)");
		console.log("   - transaction_id (unique identifier)");
		console.log("   - sender_country & recipient_country");
		console.log("   - All fraud and PSP tracking columns");

		process.exit(0);
	} catch (error) {
		console.error("❌ Schema update failed:", error.message);
		process.exit(1);
	}
}

updateSchema();
