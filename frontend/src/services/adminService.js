import api from "./api";

export const adminService = {
	getDashboardStats: async () => {
		const response = await api.get("/admin/dashboard");
		return response.data;
	},
	getUsers: async () => {
		const response = await api.get("/admin/users");
		return response.data;
	},
	getTransactions: async () => {
		const response = await api.get("/admin/transactions");
		return response.data;
	},
	getCommissionSettings: async () => {
		const response = await api.get("/admin/commission");
		return response.data;
	},
	updateCommissionSettings: async (data) => {
		const response = await api.put("/admin/commission", data);
		return response.data;
	},
	getProviderPreferences: async () => {
		const response = await api.get("/admin/providers");
		return response.data;
	},
	updateProviderPreferences: async (data) => {
		const response = await api.put("/admin/providers", data);
		return response.data;
	},
};
