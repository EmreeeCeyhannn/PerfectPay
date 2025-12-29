const pool = require("./src/config/database");

async function blacklistUser() {
    try {
        await pool.query("INSERT INTO blacklist (identifier) VALUES ('testadmin@example.com')");
        console.log("User blacklisted");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

blacklistUser();
