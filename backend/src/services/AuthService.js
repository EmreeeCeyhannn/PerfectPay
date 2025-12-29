const User = require("../models/User");
const { generateToken } = require("../config/jwt");

class AuthService {
	static async register(userData) {
		// Check if user already exists
		const existingUser = await User.findByEmail(userData.email);
		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		// Create new user
		const user = await User.create(userData);
		const token = generateToken(user.id);

		return {
			user,
			token,
		};
	}

	static async login(email, password) {
		const user = await User.findByEmail(email);
		if (!user) {
			throw new Error("Invalid email or password");
		}

		const isPasswordValid = await User.verifyPassword(
			password,
			user.password_hash
		);
		if (!isPasswordValid) {
			throw new Error("Invalid email or password");
		}

		const token = generateToken(user.id);
		delete user.password_hash;

		return {
			user,
			token,
		};
	}
}

module.exports = AuthService;
