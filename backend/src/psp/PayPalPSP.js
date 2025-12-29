const PaymentServiceProvider = require("./PaymentServiceProvider");

class PayPalPSP extends PaymentServiceProvider {
constructor(apiKey) {
super({
name: "PayPal",
apiConfig: { apiKey },
supportedCurrencies: ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","CZK","DKK","HUF","INR","ILS","MXN","MYR","NOK","NZD","PHP","PLN","SGD","SEK","THB","TRY","TWD"],
commissionRules: {
USD: { percentage: 3.49, fixed: 0.49 },
EUR: { percentage: 3.49, fixed: 0.35 },
GBP: { percentage: 3.49, fixed: 0.35 },
TRY: { percentage: 4.5, fixed: 1.0 },
default: { percentage: 3.49, fixed: 0.49 },
},
priority: 70,
});
this.apiKey = apiKey;
this.avgLatency = 900;
}
async validateTransaction(transactionData) {
const { paypalEmail, amount, currency } = transactionData;
if (!paypalEmail || !paypalEmail.includes("@")) {
throw new Error("Valid PayPal email required");
}
if (!this.supportedCurrencies.includes(currency)) {
throw new Error(`${currency} not supported by PayPal`);
}
return { valid: true, accountEmail: paypalEmail, riskLevel: this.assessPayPalRisk(amount) };
}
async processPayment(paymentData) {
const startTime = Date.now();
try {
const { amount, currency, senderEmail, recipientEmail, description } = paymentData;
const isSuccess = Math.random() > 0.025;
const latency = Math.random() * 600 + 400;
if (!isSuccess) { throw new Error("PayPal: Transaction failed"); }
this.updateMetrics(latency, true);
return { success: true, transactionId: `paypal_${Date.now()}`, pspName: "PayPal", amount, currency, senderEmail, recipientEmail, description, processingTime: latency, timestamp: new Date() };
} catch (error) {
this.updateMetrics(Date.now() - startTime, false);
throw error;
}
}
async getExchangeRate(fromCurrency, toCurrency) {
const rates = { "TRY-USD": 0.031, "TRY-EUR": 0.029, "USD-EUR": 0.92, "EUR-USD": 1.09 };
const key = `${fromCurrency}-${toCurrency}`;
return rates[key] || 1.0;
}
assessPayPalRisk(amount) {
if (amount > 10000) return "medium";
if (amount > 20000) return "high";
return "low";
}
}
module.exports = PayPalPSP;
