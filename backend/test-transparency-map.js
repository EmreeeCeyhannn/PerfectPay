// Test script for Transaction Transparency Map
const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testTransparencyMap() {
	console.log("🧪 Testing Real-Time Transaction Transparency Map\n");

	try {
		// Step 1: Login to get auth token
		console.log("1️⃣  Logging in...");
		const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		const userId = loginResponse.data.user.id;
		console.log(`✅ Logged in as: ${loginResponse.data.user.email}\n`);

		// Step 2: Create a test payment to get a transaction ID
		console.log("2️⃣  Creating test payment...");
		const paymentResponse = await axios.post(
			`${BASE_URL}/payment/transfer`,
			{
				recipientId: 2,
				recipientName: "Jane Smith",
				recipientEmail: "jane@example.com",
				amount: 500,
				fromCurrency: "TRY",
				toCurrency: "USD",
				senderCountry: "TR",
				recipientCountry: "US",
				userMode: "balanced",
				description: "Test payment for transparency map",
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (!paymentResponse.data.success) {
			console.error("❌ Payment failed:", paymentResponse.data);
			return;
		}

		const transactionId = paymentResponse.data.transactionId;
		console.log(`✅ Payment created: ${transactionId}`);
		console.log(`   Selected PSP: ${paymentResponse.data.selectedPSP}`);
		console.log(`   Status: ${paymentResponse.data.status}\n`);

		// Step 3: Fetch Transaction Transparency Map
		console.log("3️⃣  Fetching transaction transparency map...");
		const mapResponse = await axios.get(
			`${BASE_URL}/payment/map/${transactionId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		const map = mapResponse.data;

		// Debug: log the actual response
		console.log("\n🔍 DEBUG - API Response:", JSON.stringify(map, null, 2));

		console.log("\n📍 TRANSACTION TRANSPARENCY MAP");
		console.log("=".repeat(60));

		// Display Overview
		console.log("\n📊 Overview:");
		console.log(`   Transaction ID: ${map.transactionId}`);
		if (map.overview) {
			console.log(
				`   Status: ${map.overview.status?.toUpperCase() || "UNKNOWN"}`
			);
			console.log(`   Total Duration: ${map.overview.totalDuration}`);
			console.log(`   Amount: ${map.overview.amount}`);
			console.log(`   PSP: ${map.overview.psp}`);
			console.log(`   Path: ${map.overview.path}`);
		} else {
			console.log("   ⚠️ No overview data available");
		}

		// Display Geographic Route
		console.log("\n🌍 Geographic Route:");
		if (map.geographicPath && map.geographicPath.length > 0) {
			map.geographicPath.forEach((node, index) => {
				console.log(`   ${index + 1}. ${node.location}`);
				console.log(`      📍 Location: ${node.city}, ${node.country}`);
				console.log(`      🌐 IP: ${node.ip}`);
				console.log(`      🏷️  Type: ${node.type}`);
				if (node.region) {
					console.log(`      🗺️  Region: ${node.region}`);
				}
				if (index < map.geographicPath.length - 1) {
					console.log("      ⬇️");
				}
			});
		} else {
			console.log("   ⚠️ No geographic path data available");
		}

		// Display Timeline Steps
		console.log("\n⏱️  Transaction Timeline:");
		map.steps.forEach((step) => {
			const statusIcon =
				step.status === "completed"
					? "✅"
					: step.status === "in-progress"
					? "⏳"
					: "⌛";
			console.log(`   ${step.step}. ${step.name} ${statusIcon}`);
			console.log(`      Status: ${step.status}`);
			if (step.duration) {
				console.log(`      Duration: ${step.duration}`);
			}
			if (step.location) {
				console.log(`      Location: ${step.location}`);
			}
			if (step.details) {
				console.log(`      Details: ${step.details}`);
			}
			if (step.timestamp) {
				console.log(`      Time: ${new Date(step.timestamp).toLocaleString()}`);
			}
			console.log("");
		});

		// Display Metadata
		if (map.metadata) {
			console.log("📋 Transaction Metadata:");
			console.log(`   Fraud Score: ${map.metadata.fraudScore}`);
			console.log(`   Commission: ${map.metadata.commission}`);
			console.log(`   FX Rate: ${map.metadata.fxRate}`);
			console.log(
				`   Created: ${new Date(map.metadata.createdAt).toLocaleString()}`
			);
		}

		console.log("\n" + "=".repeat(60));
		console.log("✅ Test completed successfully!");
		console.log("\n💡 You can now view this in the frontend at:");
		console.log(`   http://localhost:5173 (after selecting a transaction)`);
	} catch (error) {
		console.error("\n❌ Error:", error.response?.data || error.message);
		if (error.response?.status === 404) {
			console.log("\n💡 Tip: Make sure you have transactions in the database.");
			console.log(
				"   Run: cd database && psql -U postgres -d perfectpay -f complete-setup.sql"
			);
		}
	}
}

// Run the test
testTransparencyMap();
