const pool = require("./src/config/database");

async function testDatabase() {
	try {
		console.log("🔍 Testing database schema and transaction history...\n");

		// Test 1: Check if transactions table exists with correct schema
		console.log("📋 Test 1: Checking transactions table schema...");
		const schemaResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'transactions'
            ORDER BY ordinal_position
        `);

		console.log("✅ Transactions table columns:");
		schemaResult.rows.forEach((row) => {
			console.log(`   - ${row.column_name}: ${row.data_type}`);
		});

		// Test 2: Insert a test transaction
		console.log("\n📝 Test 2: Inserting test transaction...");
		const transactionId = `test_${Date.now()}`;
		await pool.query(
			`
            INSERT INTO transactions 
            (transaction_id, sender_id, recipient_id, recipient_name, recipient_account, 
             amount, from_currency, to_currency, fx_rate, selected_psp, 
             fraud_score, fraud_status, total_cost, commission, status, 
             sender_country, recipient_country) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `,
			[
				transactionId,
				2, // User ID from your database
				null,
				"Test Recipient",
				"TEST123456",
				100.0,
				"USD",
				"EUR",
				0.85,
				"Stripe",
				15,
				"low_risk",
				3.5,
				2.5,
				"completed",
				"US",
				"DE",
			]
		);
		console.log(`✅ Test transaction inserted: ${transactionId}`);

		// Test 3: Query transactions for user
		console.log("\n📊 Test 3: Querying transactions for user_id = 2...");
		const result = await pool.query(
			`
            SELECT transaction_id, sender_id, amount, from_currency, to_currency, 
                   selected_psp, status, sender_country, recipient_country, created_at
            FROM transactions 
            WHERE sender_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        `,
			[2]
		);

		console.log(`✅ Found ${result.rows.length} transaction(s):`);
		result.rows.forEach((tx) => {
			console.log(
				`   - ${tx.transaction_id}: ${tx.amount} ${tx.from_currency} → ${tx.to_currency} (${tx.selected_psp}) [${tx.status}]`
			);
		});

		// Test 4: Clean up test transaction
		console.log("\n🧹 Test 4: Cleaning up test data...");
		await pool.query("DELETE FROM transactions WHERE transaction_id = $1", [
			transactionId,
		]);
		console.log("✅ Test data cleaned up");

		console.log("\n✅ All tests passed! Database schema is correctly updated.");
		console.log(
			"📌 The transactions table now uses sender_id and location columns."
		);

		process.exit(0);
	} catch (error) {
		console.error("\n❌ Test failed:", error.message);
		console.error("Stack:", error.stack);
		process.exit(1);
	}
}

testDatabase();
