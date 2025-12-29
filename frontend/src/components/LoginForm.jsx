import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await login(email, password);

			if (result.success) {
				// Clear form
				setEmail("");
				setPassword("");
				// Redirect to payment page
				navigate("/payment", { replace: true });
			} else {
				setError(result.error || "Login failed");
			}
		} catch (err) {
			console.error("Login error:", err);
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="form" onSubmit={handleSubmit}>
			<h2>Login to PerfectPay</h2>
			{error && (
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			)}

			<div className="form-group">
				<label htmlFor="email">Email Address</label>
				<input
					type="email"
					id="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={loading}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" className="btn btn-primary" disabled={loading}>
				{loading ? (
					<>
						<span className="spinner"></span> Logging in...
					</>
				) : (
					"Login"
				)}
			</button>

			<p style={{ marginTop: "1.5rem", textAlign: "center", color: "#666" }}>
				Don't have an account?{" "}
				<a
					href="/register"
					style={{
						color: "#3498db",
						textDecoration: "none",
						fontWeight: "bold",
					}}
				>
					Register here
				</a>
			</p>
		</form>
	);
}
