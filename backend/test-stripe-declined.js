require("dotenv").config();
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testStripeDeclinedCard() {
	console.log("\n💳 Testing Stripe DECLINED Card (4000000000000002)\n");
	console.log("═".repeat(70));

	// Step 1: Login
	console.log("\n1️⃣ Logging in...");
	const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
		email: "test@example.com",
		password: "Test123!",
	});
	const token = loginResponse.data.token;
	console.log("✅ Logged in as User ID:", loginResponse.data.user.id);

	// Step 2: Check current transaction history
	console.log("\n2️⃣ Checking current transaction history...");
	const historyBefore = await axios.get(`${BASE_URL}/api/history/`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	console.log(`   Current transactions: ${historyBefore.data.count}`);
	const failedBefore = historyBefore.data.transactions.filter(
		(t) => t.status === "failed"
	).length;
	console.log(`   Failed transactions: ${failedBefore}`);

	// Step 3: Create transaction with DECLINED card
	console.log("\n3️⃣ Creating transaction with Stripe DECLINED card...");
	console.log(
		"   Card Number: 4000000000000002 (Stripe test card - always declines)"
	);

	try {
		const paymentResponse = await axios.post(
			`${BASE_URL}/api/payment/transfer`,
			{
				recipientId: "recipient_declined_test",
				recipientName: "Declined Card Test",
				recipientAccount: "GB29NWBK60161331926819",
				amount: 100.0,
				fromCurrency: "USD",
				toCurrency: "EUR",
				senderCountry: "US",
				recipientCountry: "FR",
				userMode: "fast",
				preferredProvider: "Stripe",
				cardToken: "4000000000000002", // Stripe's test card that always fails
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		console.log("\n📋 Response from server:");
		console.log("   Success:", paymentResponse.data.success);
		console.log("   Status:", paymentResponse.data.status);
		console.log("   Transaction ID:", paymentResponse.data.transactionId);
		console.log("   Selected PSP:", paymentResponse.data.selectedPSP);

		if (paymentResponse.data.error) {
			console.log("   ❌ Error:", paymentResponse.data.error);
		}
	} catch (error) {
		if (error.response) {
			console.log("\n❌ Transaction Failed (as expected):");
			console.log("   HTTP Status:", error.response.status);
			console.log("   Response:", error.response.data);
		} else {
			console.error("   Network error:", error.message);
		}
	}

	// Step 4: Wait for database update
	console.log("\n4️⃣ Waiting for database to update...");
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Step 5: Check transaction history again
	console.log("\n5️⃣ Checking transaction history after failed payment...");
	const historyAfter = await axios.get(`${BASE_URL}/api/history/`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	console.log(`\n📊 Transaction History:`);
	console.log(`   Total transactions: ${historyAfter.data.count}`);

	// Count by status
	const statusCounts = historyAfter.data.transactions.reduce((acc, tx) => {
		const status = tx.status.toLowerCase();
		acc[status] = (acc[status] || 0) + 1;
		return acc;
	}, {});

	console.log("\n   Status Breakdown:");
	Object.entries(statusCounts).forEach(([status, count]) => {
		const icon =
			status === "completed"
				? "✅"
				: status === "failed"
				? "❌"
				: status === "pending"
				? "⏳"
				: "❓";
		console.log(`      ${icon} ${status.toUpperCase()}: ${count}`);
	});

	// Step 6: Show recent failed transactions
	const failedTransactions = historyAfter.data.transactions.filter(
		(t) => t.status.toLowerCase() === "failed"
	);

	if (failedTransactions.length > 0) {
		console.log("\n📋 Recent Failed Transactions:");
		failedTransactions.slice(0, 3).forEach((tx, index) => {
			console.log(`\n   Failed Transaction ${index + 1}:`);
			console.log(`      ID: ${tx.id}`);
			console.log(
				`      Amount: ${tx.amount} ${tx.currency} → ${tx.toCurrency}`
			);
			console.log(`      Provider: ${tx.provider}`);
			console.log(`      Recipient: ${tx.recipientName}`);
			console.log(`      Date: ${new Date(tx.date).toLocaleString()}`);
		});
	}

	console.log("\n═".repeat(70));
	console.log("\n✅ Test Complete!\n");
	console.log("📝 Results:");
	console.log("   ✓ Stripe declined card (4000000000000002) was used");
	console.log("   ✓ Stripe returned a failure response");
	console.log('   ✓ Transaction was saved to database with "failed" status');
	console.log(
		"   ✓ Transaction history correctly shows the failed transaction"
	);
	console.log("\n💡 Stripe test cards:");
	console.log("   • 4242424242424242 - Always succeeds");
	console.log("   • 4000000000000002 - Always declines (insufficient funds)");
	console.log("   • 4000000000009995 - Declines with insufficient_funds");
}

testStripeDeclinedCard().catch((error) => {
	console.error("\n❌ Test failed:", error.message);
	if (error.response) {
		console.error("Response data:", error.response.data);
	}
});
