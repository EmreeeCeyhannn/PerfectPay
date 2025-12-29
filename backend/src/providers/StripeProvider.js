const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PaymentProvider = require("./PaymentProvider");

class StripeProvider extends PaymentProvider {
	constructor() {
		super();
		this.name = "stripe";
	}

	async processPayment(paymentData) {
		try {
			this.validatePaymentData(paymentData);

			const { amount, currency, cardToken, description } = paymentData;

			const charge = await stripe.charges.create({
				amount: Math.round(amount * 100), // Convert to cents
				currency: currency.toLowerCase(),
				source: cardToken,
				description: description || "Payment via PerfectPay",
			});

			return {
				success: true,
				transactionId: charge.id,
				status: charge.status === "succeeded" ? "success" : "failed",
				amount: charge.amount / 100,
				currency: charge.currency.toUpperCase(),
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				status: "failed",
			};
		}
	}

	async refundPayment(transactionId) {
		try {
			const refund = await stripe.refunds.create({
				charge: transactionId,
			});

			return {
				success: true,
				refundId: refund.id,
				status: refund.status,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
			};
		}
	}

	async getStatus(transactionId) {
		try {
			const charge = await stripe.charges.retrieve(transactionId);
			return {
				status: charge.status === "succeeded" ? "success" : charge.status,
				amount: charge.amount / 100,
			};
		} catch (error) {
			return { status: "error", error: error.message };
		}
	}
}

module.exports = StripeProvider;
