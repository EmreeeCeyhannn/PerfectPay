import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// Initialize auth state from localStorage
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
			setIsAuthenticated(true);
		}

		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			setLoading(true);
			const response = await authService.login(email, password);

			if (response.token && response.user) {
				setToken(response.token);
				setUser(response.user);
				setIsAuthenticated(true);

				localStorage.setItem("token", response.token);
				localStorage.setItem("user", JSON.stringify(response.user));

				return { success: true, user: response.user };
			}

			throw new Error("Invalid login response");
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: error.message };
		} finally {
			setLoading(false);
		}
	};

	const register = async (userData) => {
		try {
			setLoading(true);
			const response = await authService.register(userData);

			if (response.token && response.user) {
				setToken(response.token);
				setUser(response.user);
				setIsAuthenticated(true);

				localStorage.setItem("token", response.token);
				localStorage.setItem("user", JSON.stringify(response.user));

				return { success: true, user: response.user };
			}

			throw new Error("Invalid register response");
		} catch (error) {
			console.error("Register error:", error);
			return { success: false, error: error.message };
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		await authService.logout();
		setUser(null);
		setToken(null);
		setIsAuthenticated(false);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	const value = {
		user,
		token,
		loading,
		isAuthenticated,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};
