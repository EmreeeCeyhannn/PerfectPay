// Simple test for transparency map - just check if it returns proper structure
const axios = require("axios");

async function testMap() {
	try {
		console.log("Testing transparency map endpoint...\n");

		// Use a mock transaction ID - the service should handle it gracefully
		const testTransactionId = "test_tx_123";

		const response = await axios.get(
			`http://localhost:3000/api/payment/map/${testTransactionId}`
		);

		console.log("✅ Response received!\n");
		console.log(JSON.stringify(response.data, null, 2));

		// Check structure
		if (
			response.data.overview &&
			response.data.geographicPath &&
			response.data.steps
		) {
			console.log("\n✅ All required fields present!");
			console.log(`   - Overview: ${response.data.overview.path}`);
			console.log(
				`   - Geographic nodes: ${response.data.geographicPath.length}`
			);
			console.log(`   - Timeline steps: ${response.data.steps.length}`);
		} else {
			console.log("\n⚠️  Missing required fields");
		}
	} catch (error) {
		if (error.response) {
			console.error("❌ API Error:", error.response.status);
			console.error("   Message:", error.response.data);
		} else if (error.request) {
			console.error("❌ Network Error: No response received");
			console.error("   Is the backend running on port 3000?");
		} else {
			console.error("❌ Error:", error.message);
		}
		console.error("\nFull error:", error);
	}
}

testMap();
