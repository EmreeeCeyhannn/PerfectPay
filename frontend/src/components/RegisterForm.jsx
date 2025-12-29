import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterForm() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		full_name: "",
		phone: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { register } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await register(formData);

			if (result.success) {
				// Clear form
				setFormData({
					email: "",
					password: "",
					full_name: "",
					phone: "",
				});
				// Redirect to payment page
				navigate("/payment", { replace: true });
			} else {
				setError(result.error || "Registration failed");
			}
		} catch (err) {
			console.error("Register error:", err);
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="form" onSubmit={handleSubmit}>
			<h2>Create Your PerfectPay Account</h2>
			{error && (
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			)}

			<div className="form-group">
				<label htmlFor="full_name">Full Name *</label>
				<input
					type="text"
					id="full_name"
					name="full_name"
					placeholder="John Doe"
					value={formData.full_name}
					onChange={handleChange}
					required
					disabled={loading}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="email">Email Address *</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="you@example.com"
					value={formData.email}
					onChange={handleChange}
					required
					disabled={loading}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="password">Password *</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="At least 8 characters"
					value={formData.password}
					onChange={handleChange}
					required
					disabled={loading}
				/>
				<small
					style={{
						display: "block",
						marginTop: "0.5rem",
						color: "#999",
						fontSize: "0.85rem",
					}}
				>
					Use a strong password with numbers and special characters
				</small>
			</div>

			<div className="form-group">
				<label htmlFor="phone">Phone Number</label>
				<input
					type="tel"
					id="phone"
					name="phone"
					placeholder="+1 (555) 000-0000"
					value={formData.phone}
					onChange={handleChange}
					disabled={loading}
				/>
			</div>

			<button type="submit" className="btn btn-primary" disabled={loading}>
				{loading ? (
					<>
						<span className="spinner"></span> Creating Account...
					</>
				) : (
					"✍️ Register"
				)}
			</button>

			<p style={{ marginTop: "1.5rem", textAlign: "center", color: "#666" }}>
				Already have an account?{" "}
				<a
					href="/login"
					style={{
						color: "#3498db",
						textDecoration: "none",
						fontWeight: "bold",
					}}
				>
					Login here
				</a>
			</p>
		</form>
	);
}
