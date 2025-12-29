import apiClient from "./api";

export const authService = {
	register: async (userData) => {
		const response = await apiClient.post("/auth/register", userData);
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));
		}
		return response.data;
	},

	login: async (email, password) => {
		const response = await apiClient.post("/auth/login", { email, password });
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));
		}
		return response.data;
	},

	logout: async () => {
		try {
			// Call backend to clear fraud detection history
			await apiClient.post("/auth/logout");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			// Always clear local storage even if backend call fails
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
	},

	getCurrentUser: () => {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	},

	isAuthenticated: () => {
		return !!localStorage.getItem("token");
	},
};
