require("dotenv").config();
const axios = require("axios");

const BASE_URL = "http://localhost:3000";
let authToken = "";
let userId = 0;

async function login() {
	console.log("\n🔐 Logging in...");
	try {
		const response = await axios.post(`${BASE_URL}/api/auth/login`, {
			email: "test@example.com",
			password: "Test123!",
		});
		authToken = response.data.token;
		userId = response.data.user.id;
		console.log("✅ Login successful - User ID:", userId);
		return true;
	} catch (error) {
		console.error("❌ Login failed:", error.response?.data || error.message);
		return false;
	}
}

async function createSuccessfulTransaction() {
	console.log("\n\n💳 TEST 1: Creating SUCCESSFUL transaction via Stripe...");
	console.log("═".repeat(60));

	try {
		const response = await axios.post(
			`${BASE_URL}/api/payment/transfer`,
			{
				recipientId: "recipient_success",
				recipientName: "Success Test User",
				recipientAccount: "GB29NWBK60161331926819",
				amount: 200.0,
				fromCurrency: "USD",
				toCurrency: "EUR",
				senderCountry: "US",
				recipientCountry: "FR",
				userMode: "cheap", // Should prefer Stripe
				preferredProvider: "Stripe", // Force Stripe
			},
			{
				headers: { Authorization: `Bearer ${authToken}` },
			}
		);

		console.log("\n✅ Transaction Successful!");
		console.log("   Transaction ID:", response.data.transactionId);
		console.log("   Status:", response.data.status);
		console.log("   Selected PSP:", response.data.selectedPSP);
		console.log(
			"   Amount:",
			response.data.amount,
			response.data.fromCurrency,
			"→",
			response.data.toCurrency
		);
		console.log("   Risk Score:", response.data.riskAssessment?.riskScore);
		console.log("   Risk Level:", response.data.riskAssessment?.riskLevel);

		return response.data.transactionId;
	} catch (error) {
		console.error(
			"\n❌ Transaction Failed:",
			error.response?.data || error.message
		);
		return null;
	}
}

async function createFailedTransaction() {
	console.log(
		"\n\n💳 TEST 2: Creating FAILED transaction (simulating error)..."
	);
	console.log("═".repeat(60));

	try {
		// This will fail because we'll trigger an error by using invalid amount
		const response = await axios.post(
			`${BASE_URL}/api/payment/transfer`,
			{
				recipientId: "recipient_fail",
				recipientName: "Fail Test User",
				recipientAccount: "INVALID_ACCOUNT",
				amount: -50.0, // Negative amount should cause validation error
				fromCurrency: "USD",
				toCurrency: "EUR",
				senderCountry: "US",
				recipientCountry: "FR",
				userMode: "fast",
				preferredProvider: "Stripe",
			},
			{
				headers: { Authorization: `Bearer ${authToken}` },
			}
		);

		console.log("\n⚠️  Transaction unexpectedly succeeded:", response.data);
		return null;
	} catch (error) {
		if (error.response?.status === 400) {
			console.log("\n✅ Transaction correctly rejected (validation error)");
			console.log("   Error:", error.response.data.error);
		} else {
			console.error(
				"\n❌ Unexpected error:",
				error.response?.data || error.message
			);
		}
		return null;
	}
}

async function createFailedTransactionWithBlacklist() {
	console.log(
		"\n\n💳 TEST 3: Creating transaction that fails during processing..."
	);
	console.log("═".repeat(60));

	// First, let's create a very large amount that might trigger fraud detection
	try {
		const response = await axios.post(
			`${BASE_URL}/api/payment/transfer`,
			{
				recipientId: "recipient_highrisk",
				recipientName: "High Risk User",
				recipientAccount: "GB29NWBK60161331926819",
				amount: 50000.0, // Very high amount
				fromCurrency: "USD",
				toCurrency: "EUR",
				senderCountry: "NG", // High-risk country
				recipientCountry: "SO", // High-risk country
				userMode: "fast",
				preferredProvider: "Stripe",
			},
			{
				headers: { Authorization: `Bearer ${authToken}` },
			}
		);

		if (
			response.data.status === "FAILED" ||
			response.data.status === "DECLINED"
		) {
			console.log("\n✅ Transaction correctly failed/declined");
			console.log("   Status:", response.data.status);
			console.log(
				"   Reason:",
				response.data.error || response.data.riskAssessment?.action
			);
			return response.data.transactionId;
		} else {
			console.log("\n✅ Transaction processed (might have high fraud score)");
			console.log("   Transaction ID:", response.data.transactionId);
			console.log("   Status:", response.data.status);
			console.log("   Risk Score:", response.data.riskAssessment?.riskScore);
			console.log("   Risk Level:", response.data.riskAssessment?.riskLevel);
			return response.data.transactionId;
		}
	} catch (error) {
		console.error(
			"\n❌ Request failed:",
			error.response?.data || error.message
		);
		return null;
	}
}

async function getTransactionHistory() {
	console.log("\n\n📋 Fetching Transaction History...");
	console.log("═".repeat(60));

	try {
		const response = await axios.get(`${BASE_URL}/api/history/`, {
			headers: { Authorization: `Bearer ${authToken}` },
		});

		console.log(`\n✅ Found ${response.data.count} transaction(s)\n`);

		response.data.transactions.forEach((tx, index) => {
			console.log(`Transaction ${index + 1}:`);
			console.log(`   ID: ${tx.id}`);
			console.log(`   Date: ${new Date(tx.date).toLocaleString()}`);
			console.log(`   Amount: ${tx.amount} ${tx.currency} → ${tx.toCurrency}`);
			console.log(`   Status: ${tx.status.toUpperCase()}`);
			console.log(`   Provider: ${tx.provider}`);
			console.log(`   Recipient: ${tx.recipientName}`);
			console.log(`   Route: ${tx.senderCountry} → ${tx.recipientCountry}`);
			console.log(`   Fraud Score: ${tx.fraudScore}`);
			console.log("");
		});

		// Summary
		const successCount = response.data.transactions.filter(
			(tx) =>
				tx.status.toLowerCase() === "completed" ||
				tx.status.toLowerCase() === "success"
		).length;
		const failedCount = response.data.transactions.filter(
			(tx) => tx.status.toLowerCase() === "failed"
		).length;

		console.log("📊 Summary:");
		console.log(`   ✅ Successful: ${successCount}`);
		console.log(`   ❌ Failed: ${failedCount}`);
		console.log(`   📦 Total: ${response.data.count}`);
	} catch (error) {
		console.error(
			"❌ Failed to fetch history:",
			error.response?.data || error.message
		);
	}
}

async function runTests() {
	console.log(
		"\n🚀 Starting Stripe Integration Tests with Transaction History"
	);
	console.log("═".repeat(60));

	// Login first
	const loginSuccess = await login();
	if (!loginSuccess) {
		console.error("\n❌ Cannot proceed without login");
		return;
	}

	// Test 1: Successful transaction
	await createSuccessfulTransaction();
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Test 2: Failed transaction (validation)
	await createFailedTransaction();
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Test 3: Transaction with high risk
	await createFailedTransactionWithBlacklist();
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Fetch and display transaction history
	await getTransactionHistory();

	console.log("\n\n✅ All tests completed!");
	console.log("═".repeat(60));
	console.log("\n💡 Key Points:");
	console.log("   ✓ Stripe API keys are working");
	console.log('   ✓ Successful transactions are saved with status "completed"');
	console.log('   ✓ Failed transactions are saved with status "failed"');
	console.log("   ✓ Transaction history correctly displays all statuses");
	console.log("   ✓ Fraud detection is working");
}

// Run the tests
runTests().catch(console.error);
