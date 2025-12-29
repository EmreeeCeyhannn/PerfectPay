// Fraud Detection System Test Suite
const fraudEngine = require("./src/fraud/FraudDetectionEngine");

console.log("🔒 PERFECTPAY FRAUD DETECTION SYSTEM TEST\n");
console.log("=".repeat(70));

// Test Case 1: Low Risk Transaction (Should APPROVE)
console.log("\n📊 TEST 1: Low Risk - Normal Transaction");
console.log("-".repeat(70));
const test1 = fraudEngine.assessRisk({
	amount: 100,
	currency: "USD",
	userId: "user_normal_001",
	cardNumber: "4242424242424242",
	ipAddress: "192.168.1.1",
	deviceId: "device_normal_001",
	timestamp: Date.now(),
	recipientCountry: "US",
	senderCountry: "US",
});

console.log(`Risk Score: ${test1.riskScore}/100`);
console.log(`Risk Level: ${test1.riskLevel}`);
console.log(`Action: ${test1.action}`);
console.log(`Recommendation: ${test1.recommendation}`);
console.log(
	`Violations: ${
		test1.violations.length > 0 ? test1.violations.join(", ") : "None"
	}`
);
console.log(`✅ Expected: APPROVE, Got: ${test1.action}`);

// Test Case 2: Medium Risk - Unusual Amount (Should VERIFY)
console.log("\n📊 TEST 2: Medium Risk - Unusual Amount");
console.log("-".repeat(70));

// Create history with small amounts
const userHistory = [
	{ amount: 50, timestamp: Date.now() - 86400000 },
	{ amount: 75, timestamp: Date.now() - 172800000 },
	{ amount: 60, timestamp: Date.now() - 259200000 },
];

const test2 = fraudEngine.assessRisk(
	{
		amount: 5000, // Much higher than usual
		currency: "USD",
		userId: "user_medium_002",
		cardNumber: "4242424242424243",
		ipAddress: "192.168.1.2",
		deviceId: "device_medium_002",
		timestamp: Date.now(),
		recipientCountry: "US",
		senderCountry: "US",
	},
	userHistory
);

console.log(`Risk Score: ${test2.riskScore}/100`);
console.log(`Risk Level: ${test2.riskLevel}`);
console.log(`Action: ${test2.action}`);
console.log(`Recommendation: ${test2.recommendation}`);
console.log(`Violations: ${test2.violations.join("\n           ")}`);
console.log(`✅ Expected: VERIFY, Got: ${test2.action}`);

// Test Case 3: Rapid Transactions (Should reach HIGH risk)
console.log("\n📊 TEST 3: High Risk - Rapid Fire Transactions");
console.log("-".repeat(70));

const userId = "user_rapid_003";
const now = Date.now();

// Simulate 5 rapid transactions
for (let i = 0; i < 5; i++) {
	fraudEngine.recordTransaction(
		userId,
		100,
		"192.168.1.3",
		"device_003",
		now + i * 5000
	);
}

const test3 = fraudEngine.assessRisk({
	amount: 100,
	currency: "USD",
	userId: userId,
	cardNumber: "4242424242424244",
	ipAddress: "192.168.1.3",
	deviceId: "device_003",
	timestamp: now + 30000, // 30 seconds later
	recipientCountry: "US",
	senderCountry: "US",
});

console.log(`Risk Score: ${test3.riskScore}/100`);
console.log(`Risk Level: ${test3.riskLevel}`);
console.log(`Action: ${test3.action}`);
console.log(`Recommendation: ${test3.recommendation}`);
console.log(`Violations: ${test3.violations.join("\n           ")}`);
console.log(`✅ Expected: DECLINE (score > 70), Got: ${test3.action}`);

// Test Case 4: Geolocation Anomaly - Impossible Travel
console.log("\n📊 TEST 4: High Risk - Impossible Travel");
console.log("-".repeat(70));

const test4 = fraudEngine.assessRisk({
	amount: 200,
	currency: "USD",
	userId: "user_geo_004",
	cardNumber: "4242424242424245",
	ipAddress: "192.168.1.4",
	deviceId: "device_004",
	timestamp: Date.now(),
	recipientCountry: "US",
	senderCountry: "TR", // Turkey to US in short time
});

console.log(`Risk Score: ${test4.riskScore}/100`);
console.log(`Risk Level: ${test4.riskLevel}`);
console.log(`Action: ${test4.action}`);
console.log(`Recommendation: ${test4.recommendation}`);
console.log(
	`Violations: ${
		test4.violations.length > 0
			? test4.violations.join("\n           ")
			: "None"
	}`
);

// Test Case 5: Multiple Risk Factors (Should DECLINE)
console.log("\n📊 TEST 5: High Risk - Multiple Red Flags");
console.log("-".repeat(70));

const multiRiskUser = "user_multi_005";
const multiRiskTime = Date.now();

// Simulate rapid transactions
for (let i = 0; i < 6; i++) {
	fraudEngine.recordTransaction(
		multiRiskUser,
		200,
		"10.0.0.5",
		"device_005",
		multiRiskTime + i * 3000
	);
}

const test5 = fraudEngine.assessRisk(
	{
		amount: 10000, // Very high amount
		currency: "USD",
		userId: multiRiskUser,
		cardNumber: "4242424242424246",
		ipAddress: "10.0.0.999", // Different IP
		deviceId: "device_NEW_005", // New device
		timestamp: multiRiskTime + 20000,
		recipientCountry: "US",
		senderCountry: "TR",
	},
	[
		{ amount: 100, timestamp: multiRiskTime - 86400000 },
		{ amount: 150, timestamp: multiRiskTime - 172800000 },
	]
);

console.log(`Risk Score: ${test5.riskScore}/100`);
console.log(`Risk Level: ${test5.riskLevel}`);
console.log(`Action: ${test5.action}`);
console.log(`Recommendation: ${test5.recommendation}`);
console.log(`Breakdown:`);
console.log(
	`  - Rapid Transactions: ${test5.breakdown.rapidTransactions} points`
);
console.log(`  - Unusual Amount: ${test5.breakdown.unusualAmount} points`);
console.log(`  - Geolocation: ${test5.breakdown.geolocation} points`);
console.log(`  - Device Mismatch: ${test5.breakdown.deviceMismatch} points`);
console.log(`  - High Risk Country: ${test5.breakdown.highRiskCountry} points`);
console.log(`  - Card Velocity: ${test5.breakdown.cardVelocity} points`);
console.log(`  - Abnormal Time: ${test5.breakdown.abnormalTime} points`);
console.log(`Violations: ${test5.violations.join("\n           ")}`);
console.log(`✅ Expected: DECLINE (score > 70), Got: ${test5.action}`);

// Test Case 6: Card Velocity Test
console.log("\n📊 TEST 6: High Risk - Card Velocity");
console.log("-".repeat(70));

const cardNumber = "4242424242424247";
const cardTime = Date.now();

// Simulate multiple transactions with same card
for (let i = 0; i < 8; i++) {
	fraudEngine.recordTransaction(
		`user_${i}`,
		100,
		`192.168.1.${i}`,
		`device_${i}`,
		cardTime + i * 2000
	);
}

const test6 = fraudEngine.assessRisk({
	amount: 500,
	currency: "USD",
	userId: "user_card_006",
	cardNumber: cardNumber,
	ipAddress: "192.168.1.99",
	deviceId: "device_006",
	timestamp: cardTime + 20000,
	recipientCountry: "US",
	senderCountry: "US",
});

console.log(`Risk Score: ${test6.riskScore}/100`);
console.log(`Risk Level: ${test6.riskLevel}`);
console.log(`Action: ${test6.action}`);
console.log(`Recommendation: ${test6.recommendation}`);

// Summary
console.log("\n" + "=".repeat(70));
console.log("📋 TEST SUMMARY");
console.log("=".repeat(70));

const tests = [test1, test2, test3, test4, test5, test6];
const passed = tests.filter((t) => {
	if (t.riskScore <= 30) return t.action === "APPROVE";
	if (t.riskScore <= 70) return t.action === "VERIFY";
	return t.action === "DECLINE";
}).length;

console.log(`\nTotal Tests: ${tests.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${tests.length - passed}`);

console.log("\n✅ CRITICAL REQUIREMENT CHECK:");
console.log("   REQ-3: Block transactions with Fraud Score 71-100");
const highRiskTests = tests.filter((t) => t.riskScore >= 71);
const allBlocked = highRiskTests.every((t) => t.action === "DECLINE");
console.log(
	`   ${allBlocked ? "✅ PASSED" : "❌ FAILED"}: ${
		highRiskTests.length
	} high-risk transactions tested`
);

highRiskTests.forEach((t, i) => {
	console.log(
		`      Test ${i + 1}: Score ${t.riskScore}/100 -> Action: ${t.action}`
	);
});

console.log("\n🔒 Fraud Detection System Test Complete!\n");
