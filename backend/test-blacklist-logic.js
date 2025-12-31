const fraudEngine = require("./src/fraud/FraudDetectionEngine");
const paymentService = require("./src/services/PaymentOrchestrationService");
const AuthService = require("./src/services/AuthService");
const pool = require("./src/config/database");
const bcrypt = require("bcryptjs");

async function testBlacklistLogic() {
	try {
		console.log("🚀 Starting Blacklist Logic Test...");

		const email = "test_blacklist_auto@example.com";
		const password = "password123";
		const hashedPassword = await bcrypt.hash(password, 10);

		// Clean up first
		await pool.query("DELETE FROM blacklist WHERE identifier = $1", [email]);
		await pool.query("DELETE FROM users WHERE email = $1", [email]);

		// Create User
		const userRes = await pool.query(
			"INSERT INTO users (email, password_hash, full_name, phone, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
			[email, hashedPassword, "Test User", "1234567890"]
		);
		const realUserId = userRes.rows[0].id;
		console.log(`✅ Created test user with ID: ${realUserId}`);

		// Trigger Fraud Check multiple times
		console.log("⚡ Triggering rapid transactions...");
		const txData = {
			amount: 100,
			currency: "USD",
			userId: realUserId,
			cardNumber: "4242424242424242",
			ipAddress: "127.0.0.1",
			deviceId: "device_test",
			timestamp: Date.now(),
			recipientCountry: "US",
			senderCountry: "US",
		};

		// 1st transaction
		fraudEngine.recordTransaction(
			realUserId,
			100,
			"127.0.0.1",
			"device_test",
			Date.now()
		);
		// 2nd transaction
		fraudEngine.recordTransaction(
			realUserId,
			100,
			"127.0.0.1",
			"device_test",
			Date.now()
		);
		// 3rd transaction
		fraudEngine.recordTransaction(
			realUserId,
			100,
			"127.0.0.1",
			"device_test",
			Date.now()
		);

		// 4th transaction - Should trigger Auto-Logout
		// Note: checkRapidTransactions checks history length.
		// recordTransaction adds to history.
		// assessRisk calls checkRapidTransactions.

		// We need to make sure assessRisk sees > 3 transactions.
		// recordTransaction adds to history.
		// checkRapidTransactions reads from history.
		// So if we recorded 3, and call assessRisk, it will see 3.
		// Wait, checkRapidTransactions:
		// const recentCount = history.filter(...).length;
		// if (recentCount > 3) ...

		// So we need 4 transactions in history.
		fraudEngine.recordTransaction(
			realUserId,
			100,
			"127.0.0.1",
			"device_test",
			Date.now()
		);

		const fraudCheck = fraudEngine.assessRisk(txData);
		console.log("Fraud Check Result:", {
			score: fraudCheck.riskScore,
			autoLogout: fraudCheck.autoLogout,
			violations: fraudCheck.violations,
		});

		if (fraudCheck.autoLogout) {
			console.log("✅ Auto-logout triggered as expected.");
			// Manually call addToBlacklist as PaymentOrchestrationService would
			await paymentService.addToBlacklist(
				realUserId,
				fraudCheck.violations.join("; ")
			);
		} else {
			console.error("❌ Auto-logout NOT triggered.");
		}

		// Verify Blacklist
		const isBlacklisted = await paymentService.checkBlacklist(realUserId);
		if (isBlacklisted) {
			console.log("✅ User is correctly blacklisted in DB.");
		} else {
			console.error("❌ User is NOT in blacklist DB.");
		}

		// Test Login
		console.log("🔐 Testing Login...");
		try {
			await AuthService.login(email, password);
			console.error("❌ Login succeeded but should have failed!");
		} catch (error) {
			if (error.message.includes("Account suspended")) {
				console.log("✅ Login blocked with correct message: " + error.message);
			} else {
				console.log("⚠️ Login failed with other message: " + error.message);
			}
		}

		// Clean up
		await pool.query("DELETE FROM blacklist WHERE identifier = $1", [email]);
		await pool.query("DELETE FROM users WHERE email = $1", [email]);
		console.log("🧹 Cleanup done.");
	} catch (error) {
		console.error("Test failed:", error);
	} finally {
		pool.end();
	}
}

testBlacklistLogic();
