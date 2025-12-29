const pool = require("./src/config/database");

pool
	.query(
		`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'transactions' 
  ORDER BY ordinal_position
`
	)
	.then((result) => {
		console.log("✅ Transactions Table Columns:");
		result.rows.forEach((col) => {
			console.log(`  - ${col.column_name}: ${col.data_type}`);
		});

		// Check for pending transactions
		return pool.query(
			`SELECT COUNT(*) as pending_count FROM transactions WHERE status = 'pending'`
		);
	})
	.then((result) => {
		console.log(`\n📊 Pending Transactions: ${result.rows[0].pending_count}`);
		return pool.query(
			`SELECT COUNT(*) as completed_count FROM transactions WHERE status = 'completed'`
		);
	})
	.then((result) => {
		console.log(`📊 Completed Transactions: ${result.rows[0].completed_count}`);
		pool.end();
	})
	.catch((err) => {
		console.error("❌ Error:", err.message);
		pool.end();
	});
