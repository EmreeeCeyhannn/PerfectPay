import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminLoginForm() {
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
				// Redirect to admin dashboard
				navigate("/admin", { replace: true });
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
		<form
			className="form"
			onSubmit={handleSubmit}
			style={{ borderTop: "4px solid #e74c3c" }}
		>
			<h2 style={{ color: "#c0392b" }}>Admin Portal Login</h2>
			{error && (
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			)}

			<div className="form-group">
				<label htmlFor="email">Admin Email</label>
				<input
					type="email"
					id="email"
					placeholder="admin@perfectpay.com"
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
					placeholder="Enter admin password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={loading}
				/>
			</div>

			<button
				type="submit"
				className="btn btn-primary"
				disabled={loading}
				style={{ backgroundColor: "#e74c3c", borderColor: "#c0392b" }}
			>
				{loading ? (
					<>
						<span className="spinner"></span> Authenticating...
					</>
				) : (
					"Access Admin Panel"
				)}
			</button>

			<div style={{ marginTop: "1rem", textAlign: "center" }}>
				<a href="/login" style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
					Return to User Login
				</a>
			</div>
		</form>
	);
}
