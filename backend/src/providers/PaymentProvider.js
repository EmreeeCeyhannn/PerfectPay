// Abstract base class for payment providers
class PaymentProvider {
	async processPayment(paymentData) {
		throw new Error("processPayment method must be implemented");
	}

	async refundPayment(transactionId) {
		throw new Error("refundPayment method must be implemented");
	}

	async getStatus(transactionId) {
		throw new Error("getStatus method must be implemented");
	}

	validatePaymentData(paymentData) {
		if (!paymentData.amount || !paymentData.currency) {
			throw new Error("Amount and currency are required");
		}
	}
}

module.exports = PaymentProvider;
