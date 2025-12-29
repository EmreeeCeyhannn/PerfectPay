import apiClient from "./api";

export const paymentService = {
	// Card Payment
	processCardPayment: async (paymentData) => {
		const response = await apiClient.post("/card/process", paymentData);
		return response.data;
	},

	getCardHistory: async () => {
		const response = await apiClient.get("/card/history");
		return response.data;
	},

	getPaymentMethods: async () => {
		const response = await apiClient.get("/card/methods");
		return response.data;
	},

	// Transaction History
	getTransactionHistory: async () => {
		const response = await apiClient.get("/history/");
		return response.data;
	},

	getTransactionById: async (id) => {
		const response = await apiClient.get(`/history/${id}`);
		return response.data;
	},

	// PSP Analytics
	getPSPAnalytics: async () => {
		const response = await apiClient.get("/analytics/");
		return response.data;
	},

	getPSPMetrics: async (pspName) => {
		const response = await apiClient.get(`/analytics/psp/${pspName}`);
		return response.data;
	},

	// P2P Transfer
	transferMoney: async (transferData) => {
		const response = await apiClient.post("/payment/transfer", transferData);
		return response.data;
	},

	// Route Estimation
	estimateRoute: async (estimateData) => {
		const response = await apiClient.post(
			"/payment/estimate-route",
			estimateData
		);
		return response.data;
	},

	// PSP List
	getPSPs: async () => {
		const response = await apiClient.get("/payment/psps");
		return response.data;
	},
};
