const fs = require("fs");
const path = require("path");
const pool = require("./src/config/database");

async function initDb() {
	try {
		const schemaPath = path.join(__dirname, "../database/schema.sql");
		const schemaSql = fs.readFileSync(schemaPath, "utf8");

		console.log("Dropping tables...");
		await pool.query(`
            DROP TABLE IF EXISTS audit_logs CASCADE;
            DROP TABLE IF EXISTS commission_settings CASCADE;
            DROP TABLE IF EXISTS blacklist CASCADE;
            DROP TABLE IF EXISTS transactions CASCADE;
            DROP TABLE IF EXISTS cards CASCADE;
            DROP TABLE IF EXISTS payment_providers CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

		console.log("Executing schema...");
		await pool.query(schemaSql);
		console.log("Schema executed successfully.");
		process.exit(0);
	} catch (error) {
		console.error("Failed to init DB:", error);
		process.exit(1);
	}
}

initDb();
