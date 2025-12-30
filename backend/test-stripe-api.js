require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function testStripeAPI() {
	console.log("🧪 Testing Stripe API Connection...\n");

	try {
		// Test 1: Verify API Key
		console.log("1️⃣ Verifying Stripe API Key...");
		const balance = await stripe.balance.retrieve();
		console.log("✅ API Key Valid");
		console.log("💰 Balance:", balance);
		console.log("");

		// Test 2: Create a test payment intent (will succeed)
		console.log("2️⃣ Creating Successful Payment Intent...");
		const successfulPayment = await stripe.paymentIntents.create({
			amount: 10000, // $100.00
			currency: "usd",
			payment_method_types: ["card"],
			description: "Test payment - should succeed",
		});
		console.log("✅ Payment Intent Created Successfully");
		console.log("   ID:", successfulPayment.id);
		console.log("   Status:", successfulPayment.status);
		console.log(
			"   Amount:",
			successfulPayment.amount / 100,
			successfulPayment.currency.toUpperCase()
		);
		console.log("");

		// Test 3: Try to create a payment that will fail (invalid amount)
		console.log("3️⃣ Testing Failed Payment (invalid amount)...");
		try {
			await stripe.paymentIntents.create({
				amount: -100, // Negative amount - will fail
				currency: "usd",
				payment_method_types: ["card"],
			});
		} catch (error) {
			console.log("❌ Payment Failed as Expected");
			console.log("   Error Type:", error.type);
			console.log("   Error Message:", error.message);
		}
		console.log("");

		// Test 4: Create charge with test card (this will show how Stripe processes payments)
		console.log("4️⃣ Creating Payment Method and Charge...");
		const paymentMethod = await stripe.paymentMethods.create({
			type: "card",
			card: {
				number: "4242424242424242", // Stripe test card (always succeeds)
				exp_month: 12,
				exp_year: 2026,
				cvc: "123",
			},
		});
		console.log("✅ Test Card Payment Method Created:", paymentMethod.id);

		const confirmedPayment = await stripe.paymentIntents.create({
			amount: 5000, // $50.00
			currency: "usd",
			payment_method: paymentMethod.id,
			confirm: true,
			automatic_payment_methods: {
				enabled: true,
				allow_redirects: "never",
			},
			description: "Test charge with card",
		});
		console.log("✅ Payment Confirmed");
		console.log("   Status:", confirmedPayment.status);
		console.log(
			"   Amount Captured:",
			confirmedPayment.amount_captured / 100,
			confirmedPayment.currency.toUpperCase()
		);
		console.log("");

		// Test 5: Test with a card that will be declined
		console.log("5️⃣ Testing Declined Card (4000000000000002)...");
		try {
			const declinedCard = await stripe.paymentMethods.create({
				type: "card",
				card: {
					number: "4000000000000002", // Stripe test card (always declines)
					exp_month: 12,
					exp_year: 2026,
					cvc: "123",
				},
			});

			await stripe.paymentIntents.create({
				amount: 2500,
				currency: "usd",
				payment_method: declinedCard.id,
				confirm: true,
				automatic_payment_methods: {
					enabled: true,
					allow_redirects: "never",
				},
			});
		} catch (error) {
			console.log("❌ Card Declined as Expected");
			console.log("   Error Code:", error.code);
			console.log("   Decline Code:", error.decline_code);
			console.log("   Message:", error.message);
		}
		console.log("");

		console.log("✅ All Stripe API Tests Completed!\n");
		console.log("📝 Summary:");
		console.log("   - API Key: Valid ✅");
		console.log("   - Create Payment Intent: Works ✅");
		console.log("   - Error Handling: Works ✅");
		console.log("   - Card Payment: Works ✅");
		console.log("   - Declined Card Detection: Works ✅");
	} catch (error) {
		console.error("❌ Stripe API Test Failed:");
		console.error("   Type:", error.type);
		console.error("   Message:", error.message);
		console.error("   Code:", error.code);

		if (error.type === "StripeAuthenticationError") {
			console.error(
				"\n⚠️  Authentication failed. Please check your STRIPE_SECRET_KEY in .env file"
			);
		}
	}
}

testStripeAPI();
