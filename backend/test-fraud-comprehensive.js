// Comprehensive Fraud Detection Test - Establishing History Then Testing
const fraudEngine = require("./src/fraud/FraudDetectionEngine");

console.log("🔒 COMPREHENSIVE FRAUD DETECTION TEST WITH PROPER HISTORY\n");
console.log("=".repeat(70));

// SCENARIO 1: Build trust, then massive fraud attempt
console.log("\n💣 SCENARIO 1: Trusted User Suddenly Goes Rogue");
console.log("-".repeat(70));

const trustedUser = "trusted_user_001";
const baseTime = Date.now();

// Step 1: Establish normal history
console.log("📝 Step 1: Establishing normal user behavior...");
for (let i = 0; i < 5; i++) {
	fraudEngine.recordTransaction(
		trustedUser,
		100,
		"192.168.1.100",
		"trusted_device_chrome",
		baseTime - 86400000 * (i + 1) // Spread over past days
	);
}

// First transaction to establish baseline - from Turkey
const baselineResult = fraudEngine.assessRisk(
	{
		amount: 120,
		currency: "USD",
		userId: trustedUser,
		cardNumber: "4532111111111111",
		ipAddress: "212.58.100.50", // Turkey IP
		deviceId: "trusted_device_chrome",
		timestamp: baseTime - 3600000, // 1 hour ago
		recipientCountry: "TR",
		senderCountry: "TR",
	},
	[
		{ amount: 100, timestamp: baseTime - 86400000 },
		{ amount: 110, timestamp: baseTime - 172800000 },
		{ amount: 95, timestamp: baseTime - 259200000 },
	]
);

console.log(
	`   Baseline Risk Score: ${baselineResult.riskScore}/100 (${baselineResult.riskLevel})`
);

// Step 2: SUDDEN ATTACK - Different location, device, massive amount, rapid fire
console.log("\n🚨 Step 2: FRAUD ATTACK DETECTED!");
console.log("   - Location jump: Turkey → Nigeria");
console.log("   - New unknown device");
console.log("   - Amount: $1,000,000 (1000x normal)");
console.log("   - Rapid fire transactions");

// Simulate rapid fire first
for (let i = 0; i < 12; i++) {
	fraudEngine.recordTransaction(
		trustedUser,
		5000,
		"41.58.0.1", // Nigeria IP
		"hacker_device_firefox",
		baseTime + i * 4000
	);
}

const fraudResult1 = fraudEngine.assessRisk(
	{
		amount: 1000000, // $1 million!
		currency: "USD",
		userId: trustedUser,
		cardNumber: "4532111111111111",
		ipAddress: "41.58.0.1", // Nigeria IP  (completely different from Turkey)
		deviceId: "hacker_device_firefox", // NEW device
		timestamp: baseTime + 50000, // 50 seconds after rapid fire started
		recipientCountry: "NG", // Nigeria
		senderCountry: "KP", // North Korea!
	},
	[
		{ amount: 100, timestamp: baseTime - 86400000 },
		{ amount: 110, timestamp: baseTime - 172800000 },
		{ amount: 95, timestamp: baseTime - 259200000 },
	]
);

console.log(`\n📊 FRAUD ATTEMPT RESULTS:`);
console.log(
	`   Risk Score: ${fraudResult1.riskScore}/100 ${
		fraudResult1.riskScore >= 71 ? "🚨 HIGH RISK!" : ""
	}`
);
console.log(`   Risk Level: ${fraudResult1.riskLevel}`);
console.log(
	`   Action: ${fraudResult1.action} ${
		fraudResult1.action === "DECLINE" ? "✅ BLOCKED!" : "❌ NOT BLOCKED!"
	}`
);
console.log(`\n   Detailed Breakdown:`);
console.log(
	`     🔥 Rapid Transactions: ${fraudResult1.breakdown.rapidTransactions}/40 points`
);
console.log(
	`     💰 Unusual Amount: ${fraudResult1.breakdown.unusualAmount}/25 points`
);
console.log(
	`     🌍 Geolocation: ${fraudResult1.breakdown.geolocation}/30 points`
);
console.log(
	`     📱 Device Mismatch: ${fraudResult1.breakdown.deviceMismatch}/20 points`
);
console.log(
	`     🚩 High Risk Country: ${fraudResult1.breakdown.highRiskCountry}/15 points`
);
console.log(
	`     💳 Card Velocity: ${fraudResult1.breakdown.cardVelocity}/20 points`
);
console.log(
	`     ⏰ Abnormal Time: ${fraudResult1.breakdown.abnormalTime}/10 points`
);
console.log(`\n   Violations (${fraudResult1.violations.length}):`);
fraudResult1.violations.forEach((v) => console.log(`     - ${v}`));

// SCENARIO 2: Fresh account with suspicious pattern
console.log(
	"\n\n💀 SCENARIO 2: New Account with Immediate Suspicious Activity"
);
console.log("-".repeat(70));

const suspiciousUser = "new_hacker_002";
const suspTime = Date.now();

// No history - immediate attack
for (let i = 0; i < 15; i++) {
	fraudEngine.recordTransaction(
		suspiciousUser,
		1000,
		`10.0.${Math.floor(i / 5)}.${i}`, // Changing IPs
		`device_${i}`,
		suspTime + i * 2000
	);
}

const fraudResult2 = fraudEngine.assessRisk(
	{
		amount: 500000,
		currency: "USD",
		userId: suspiciousUser,
		cardNumber: "5105105105105100",
		ipAddress: "0.0.0.0",
		deviceId: "random_new_device",
		timestamp: suspTime + 32000,
		recipientCountry: "IR", // Iran
		senderCountry: "SY", // Syria
	},
	[{ amount: 50, timestamp: suspTime - 3600000 }]
); // Tiny history

console.log(`\n📊 NEW ACCOUNT FRAUD RESULTS:`);
console.log(
	`   Risk Score: ${fraudResult2.riskScore}/100 ${
		fraudResult2.riskScore >= 71 ? "🚨 HIGH RISK!" : ""
	}`
);
console.log(`   Risk Level: ${fraudResult2.riskLevel}`);
console.log(
	`   Action: ${fraudResult2.action} ${
		fraudResult2.action === "DECLINE" ? "✅ BLOCKED!" : "❌ NOT BLOCKED!"
	}`
);
console.log(`\n   Detailed Breakdown:`);
console.log(
	`     🔥 Rapid Transactions: ${fraudResult2.breakdown.rapidTransactions}/40`
);
console.log(
	`     💰 Unusual Amount: ${fraudResult2.breakdown.unusualAmount}/25`
);
console.log(`     🌍 Geolocation: ${fraudResult2.breakdown.geolocation}/30`);
console.log(
	`     📱 Device Mismatch: ${fraudResult2.breakdown.deviceMismatch}/20`
);
console.log(
	`     🚩 High Risk Country: ${fraudResult2.breakdown.highRiskCountry}/15`
);
console.log(`     💳 Card Velocity: ${fraudResult2.breakdown.cardVelocity}/20`);
console.log(`     ⏰ Abnormal Time: ${fraudResult2.breakdown.abnormalTime}/10`);

// SCENARIO 3: Test at 3 AM (abnormal time)
console.log("\n\n🌙 SCENARIO 3: Late Night Suspicious Transaction (3 AM)");
console.log("-".repeat(70));

const nightUser = "night_user_003";
const nightTime = new Date();
nightTime.setHours(3, 0, 0, 0); // 3 AM
const nightTimestamp = nightTime.getTime();

// Build history during day
for (let i = 0; i < 10; i++) {
	fraudEngine.recordTransaction(
		nightUser,
		200,
		"192.168.1.50",
		"normal_device",
		nightTimestamp - 86400000 + i * 3600000 // Spread during previous day
	);
}

// Attack at 3 AM
for (let i = 0; i < 8; i++) {
	fraudEngine.recordTransaction(
		nightUser,
		2000,
		"103.10.10.10",
		"night_device",
		nightTimestamp + i * 5000
	);
}

const fraudResult3 = fraudEngine.assessRisk(
	{
		amount: 100000,
		currency: "USD",
		userId: nightUser,
		cardNumber: "378282246310005",
		ipAddress: "103.10.10.10",
		deviceId: "night_device",
		timestamp: nightTimestamp + 42000,
		recipientCountry: "NG",
		senderCountry: "US",
	},
	[
		{ amount: 200, timestamp: nightTimestamp - 86400000 },
		{ amount: 180, timestamp: nightTimestamp - 172800000 },
	]
);

console.log(`\n📊 NIGHT ATTACK RESULTS:`);
console.log(`   Time: 3:00 AM (Abnormal)`);
console.log(
	`   Risk Score: ${fraudResult3.riskScore}/100 ${
		fraudResult3.riskScore >= 71 ? "🚨 HIGH RISK!" : ""
	}`
);
console.log(`   Risk Level: ${fraudResult3.riskLevel}`);
console.log(
	`   Action: ${fraudResult3.action} ${
		fraudResult3.action === "DECLINE" ? "✅ BLOCKED!" : "❌ NOT BLOCKED!"
	}`
);
console.log(`\n   Detailed Breakdown:`);
console.log(
	`     🔥 Rapid: ${fraudResult3.breakdown.rapidTransactions} | 💰 Amount: ${fraudResult3.breakdown.unusualAmount} | 🌍 Geo: ${fraudResult3.breakdown.geolocation}`
);
console.log(
	`     📱 Device: ${fraudResult3.breakdown.deviceMismatch} | 🚩 Country: ${fraudResult3.breakdown.highRiskCountry} | ⏰ Time: ${fraudResult3.breakdown.abnormalTime}`
);

// FINAL SUMMARY
console.log("\n\n" + "=".repeat(70));
console.log("📋 COMPREHENSIVE TEST SUMMARY");
console.log("=".repeat(70));

const allResults = [fraudResult1, fraudResult2, fraudResult3];
const highRiskCount = allResults.filter((r) => r.riskScore >= 71).length;
const blockedCount = allResults.filter(
	(r) => r.riskScore >= 71 && r.action === "DECLINE"
).length;

console.log(`\n🎯 Overall Statistics:`);
console.log(`   Total Fraud Scenarios Tested: ${allResults.length}`);
console.log(`   Scenarios Reaching HIGH RISK (≥71): ${highRiskCount}`);
console.log(`   HIGH RISK Scenarios Properly Blocked: ${blockedCount}`);
console.log(
	`   Blocking Success Rate: ${
		highRiskCount > 0
			? ((blockedCount / highRiskCount) * 100).toFixed(1) + "%"
			: "N/A"
	}`
);

console.log(`\n📊 Individual Results:`);
allResults.forEach((result, i) => {
	const status =
		result.riskScore >= 71
			? result.action === "DECLINE"
				? "✅ HIGH RISK - BLOCKED"
				: "❌ HIGH RISK - NOT BLOCKED"
			: `ℹ️  ${result.riskLevel} RISK - ${result.action}`;
	console.log(
		`   Scenario ${i + 1}: Score ${result.riskScore}/100 -> ${status}`
	);
});

console.log(`\n🔐 REQ-3 COMPLIANCE CHECK:`);
console.log(`   Requirement: "Block transactions with Fraud Score 71-100"`);
if (highRiskCount === 0) {
	console.log(`   ⚠️  WARNING: No tests reached 71-100 threshold`);
	console.log(
		`   💡 Highest Score: ${Math.max(
			...allResults.map((r) => r.riskScore)
		)}/100`
	);
} else if (blockedCount === highRiskCount) {
	console.log(
		`   ✅ PASSED: All ${highRiskCount} high-risk transactions blocked`
	);
} else {
	console.log(
		`   ❌ FAILED: ${
			highRiskCount - blockedCount
		}/${highRiskCount} high-risk transactions NOT blocked`
	);
}

console.log("\n🔒 Fraud Detection Test Complete!\n");
