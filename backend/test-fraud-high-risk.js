// Aggressive Fraud Detection Test - Testing HIGH RISK scenarios (71-100)
const fraudEngine = require("./src/fraud/FraudDetectionEngine");

console.log("🚨 TESTING HIGH-RISK FRAUD SCENARIOS (Score 71-100)\n");
console.log("=".repeat(70));

// Test 1: EXTREME Rapid Fire (Should hit 40 points just from this)
console.log("\n🔥 TEST 1: EXTREME Rapid Fire Attack");
console.log("-".repeat(70));

const rapidUser = "hacker_rapid_001";
const startTime = Date.now();

// Simulate 10 transactions in 30 seconds (way over limit)
for (let i = 0; i < 10; i++) {
	fraudEngine.recordTransaction(
		rapidUser,
		500,
		"10.0.0.1",
		"hacker_device",
		startTime + i * 3000
	);
}

const rapidTest = fraudEngine.assessRisk(
	{
		amount: 50000, // Extremely high amount (25 points)
		currency: "USD",
		userId: rapidUser,
		cardNumber: "5555555555554444",
		ipAddress: "999.999.999.999", // Completely different IP
		deviceId: "BRAND_NEW_DEVICE_UNKNOWN", // Unknown device (20 points)
		timestamp: startTime + 35000,
		recipientCountry: "NG", // Nigeria (high risk)
		senderCountry: "CN", // China (high risk pair = 15 points)
	},
	[
		{ amount: 50, timestamp: startTime - 86400000 },
		{ amount: 75, timestamp: startTime - 172800000 },
	]
);

console.log(
	`Risk Score: ${rapidTest.riskScore}/100 ${
		rapidTest.riskScore >= 71 ? "🚨 HIGH RISK" : ""
	}`
);
console.log(`Risk Level: ${rapidTest.riskLevel}`);
console.log(
	`Action: ${rapidTest.action} ${rapidTest.action === "DECLINE" ? "✅" : "❌"}`
);
console.log(`Recommendation: ${rapidTest.recommendation}`);
console.log(`\nBreakdown:`);
console.log(
	`  🔥 Rapid Transactions: ${rapidTest.breakdown.rapidTransactions}/40 points`
);
console.log(
	`  💰 Unusual Amount: ${rapidTest.breakdown.unusualAmount}/25 points`
);
console.log(`  🌍 Geolocation: ${rapidTest.breakdown.geolocation}/30 points`);
console.log(
	`  📱 Device Mismatch: ${rapidTest.breakdown.deviceMismatch}/20 points`
);
console.log(
	`  🚩 High Risk Country: ${rapidTest.breakdown.highRiskCountry}/15 points`
);
console.log(
	`  💳 Card Velocity: ${rapidTest.breakdown.cardVelocity}/20 points`
);
console.log(
	`  ⏰ Abnormal Time: ${rapidTest.breakdown.abnormalTime}/10 points`
);
console.log(`\nViolations Found: ${rapidTest.violations.length}`);
rapidTest.violations.forEach((v) => console.log(`  - ${v}`));

// Test 2: Geolocation + Rapid + Amount
console.log("\n🌍 TEST 2: Impossible Travel + Suspicious Pattern");
console.log("-".repeat(70));

const travelUser = "hacker_travel_002";
const travelTime = Date.now();

// Record some transactions from TR
for (let i = 0; i < 8; i++) {
	fraudEngine.recordTransaction(
		travelUser,
		200,
		"212.58.0.1",
		"device_turkey",
		travelTime + i * 2000
	);
}

// Now suddenly from US with huge amount
const travelTest = fraudEngine.assessRisk(
	{
		amount: 99999, // Massive amount
		currency: "USD",
		userId: travelUser,
		cardNumber: "4111111111111111",
		ipAddress: "8.8.8.8", // US IP (Google DNS)
		deviceId: "device_usa_unknown",
		timestamp: travelTime + 20000, // Only 20 seconds later!
		recipientCountry: "NG",
		senderCountry: "US",
	},
	[
		{ amount: 150, timestamp: travelTime - 86400000 },
		{ amount: 200, timestamp: travelTime - 172800000 },
	]
);

console.log(
	`Risk Score: ${travelTest.riskScore}/100 ${
		travelTest.riskScore >= 71 ? "🚨 HIGH RISK" : ""
	}`
);
console.log(`Risk Level: ${travelTest.riskLevel}`);
console.log(
	`Action: ${travelTest.action} ${
		travelTest.action === "DECLINE" ? "✅" : "❌"
	}`
);
console.log(`\nBreakdown:`);
console.log(
	`  🔥 Rapid Transactions: ${travelTest.breakdown.rapidTransactions}/40 points`
);
console.log(
	`  💰 Unusual Amount: ${travelTest.breakdown.unusualAmount}/25 points`
);
console.log(`  🌍 Geolocation: ${travelTest.breakdown.geolocation}/30 points`);
console.log(
	`  📱 Device Mismatch: ${travelTest.breakdown.deviceMismatch}/20 points`
);
console.log(
	`  🚩 High Risk Country: ${travelTest.breakdown.highRiskCountry}/15 points`
);
console.log(
	`  💳 Card Velocity: ${travelTest.breakdown.cardVelocity}/20 points`
);
console.log(
	`  ⏰ Abnormal Time: ${travelTest.breakdown.abnormalTime}/10 points`
);
console.log(`\nViolations: ${travelTest.violations.length}`);
travelTest.violations.forEach((v) => console.log(`  - ${v}`));

// Test 3: Perfect Storm - All Red Flags
console.log("\n💀 TEST 3: MAXIMUM FRAUD SCORE - All Red Flags Combined");
console.log("-".repeat(70));

const maxUser = "hacker_max_003";
const maxTime = Date.now();
const maxCard = "3782822463100005"; // AMEX

// Rapid fire from multiple IPs
for (let i = 0; i < 15; i++) {
	fraudEngine.recordTransaction(
		maxUser,
		1000,
		`10.0.${i}.1`,
		`device_${i}`,
		maxTime + i * 1000
	);
}

// Card velocity
for (let i = 0; i < 12; i++) {
	fraudEngine.recordTransaction(
		`random_user_${i}`,
		500,
		`192.168.${i}.1`,
		`device_${i}`,
		maxTime + i * 1500
	);
}

const maxTest = fraudEngine.assessRisk(
	{
		amount: 999999, // Nearly 1 million
		currency: "USD",
		userId: maxUser,
		cardNumber: maxCard,
		ipAddress: "0.0.0.0", // Suspicious IP
		deviceId: "HACKER_DEVICE_UNKNOWN_NEW",
		timestamp: maxTime + 18000, // 18 seconds after last
		recipientCountry: "KP", // North Korea (highest risk)
		senderCountry: "IR", // Iran (high risk pair)
	},
	[
		{ amount: 25, timestamp: maxTime - 86400000 },
		{ amount: 30, timestamp: maxTime - 172800000 },
		{ amount: 28, timestamp: maxTime - 259200000 },
	]
);

console.log(
	`Risk Score: ${maxTest.riskScore}/100 ${
		maxTest.riskScore >= 71 ? "🚨 HIGH RISK" : ""
	}`
);
console.log(`Risk Level: ${maxTest.riskLevel}`);
console.log(
	`Action: ${maxTest.action} ${
		maxTest.action === "DECLINE" ? "✅ BLOCKED!" : "❌ NOT BLOCKED!"
	}`
);
console.log(`\n⚠️  DETAILED BREAKDOWN:`);
console.log(
	`  🔥 Rapid Transactions: ${maxTest.breakdown.rapidTransactions}/40 points`
);
console.log(
	`  💰 Unusual Amount: ${maxTest.breakdown.unusualAmount}/25 points`
);
console.log(`  🌍 Geolocation: ${maxTest.breakdown.geolocation}/30 points`);
console.log(
	`  📱 Device Mismatch: ${maxTest.breakdown.deviceMismatch}/20 points`
);
console.log(
	`  🚩 High Risk Country: ${maxTest.breakdown.highRiskCountry}/15 points`
);
console.log(`  💳 Card Velocity: ${maxTest.breakdown.cardVelocity}/20 points`);
console.log(`  ⏰ Abnormal Time: ${maxTest.breakdown.abnormalTime}/10 points`);
console.log(`\n🚨 Violations Detected: ${maxTest.violations.length}`);
maxTest.violations.forEach((v) => console.log(`  - ${v}`));

// Final Summary
console.log("\n" + "=".repeat(70));
console.log("🎯 HIGH-RISK BLOCKING TEST RESULTS");
console.log("=".repeat(70));

const allTests = [rapidTest, travelTest, maxTest];
const highRiskTests = allTests.filter((t) => t.riskScore >= 71);
const properlyBlocked = highRiskTests.filter((t) => t.action === "DECLINE");

console.log(`\n📊 Statistics:`);
console.log(`   Total Tests Run: ${allTests.length}`);
console.log(`   Tests with Score ≥ 71: ${highRiskTests.length}`);
console.log(`   Properly Blocked (DECLINE): ${properlyBlocked.length}`);
console.log(
	`   Failed to Block: ${highRiskTests.length - properlyBlocked.length}`
);

console.log(`\n🎯 Individual Test Results:`);
allTests.forEach((test, i) => {
	const symbol =
		test.riskScore >= 71 && test.action === "DECLINE"
			? "✅"
			: test.riskScore >= 71 && test.action !== "DECLINE"
			? "❌"
			: "ℹ️";
	console.log(
		`   ${symbol} Test ${i + 1}: Score ${test.riskScore}/100 -> ${test.action}`
	);
});

console.log(`\n🔐 REQUIREMENT REQ-3 VALIDATION:`);
console.log(`   "The system must block transactions with Fraud Score 71-100"`);

if (highRiskTests.length === 0) {
	console.log(
		`   ⚠️  WARNING: No tests reached score 71-100. Need more aggressive scenarios.`
	);
} else if (properlyBlocked.length === highRiskTests.length) {
	console.log(
		`   ✅ PASSED: All ${highRiskTests.length} high-risk transactions were blocked`
	);
} else {
	console.log(
		`   ❌ FAILED: ${highRiskTests.length - properlyBlocked.length}/${
			highRiskTests.length
		} high-risk transactions were NOT blocked`
	);
}

console.log("\n🔒 High-Risk Fraud Test Complete!\n");
