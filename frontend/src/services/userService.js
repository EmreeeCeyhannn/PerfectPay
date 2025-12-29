import apiClient from "./api";

export const userService = {
	getProfile: async () => {
		const response = await apiClient.get("/user/profile");
		return response.data;
	},

	updateProfile: async (profileData) => {
		const response = await apiClient.put("/user/profile", profileData);
		return response.data;
	},
};
