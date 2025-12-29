const pool = require("./src/config/database");

async function checkSchema() {
	try {
		const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transactions'
        `);
		console.log(
			"Columns in transactions table:",
			res.rows.map((r) => r.column_name)
		);
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

checkSchema();
