import React, { useState } from "react";
import { paymentService } from "../services/paymentService";

export function PaymentForm() {
	const [formData, setFormData] = useState({
		amount: "",
		currency: "USD",
		cardToken: "",
		description: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			const result = await paymentService.processCardPayment(formData);
			setSuccess(true);
			// Reset form after 2 seconds
			setTimeout(() => {
				setFormData({
					amount: "",
					currency: "USD",
					cardToken: "",
					description: "",
				});
				setSuccess(false);
			}, 2000);
		} catch (err) {
			const errorMessage = err.response?.data?.error || "Payment failed";
			setError(errorMessage);

			if (err.response?.status === 429) {
			}
		} finally {
			setLoading(false);
		}
	};

	const formStyle = {
		maxWidth: "500px",
		margin: "0 auto",
		padding: "2rem",
		backgroundColor: "#fff",
		borderRadius: "12px",
		boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
	};

	const formGroupStyle = {
		marginBottom: "1.5rem",
		display: "flex",
		flexDirection: "column",
	};

	const labelStyle = {
		fontSize: "0.9rem",
		fontWeight: "600",
		marginBottom: "0.5rem",
		color: "#2c3e50",
	};

	const inputStyle = {
		padding: "0.75rem",
		border: "1px solid #ddd",
		borderRadius: "6px",
		fontSize: "1rem",
		fontFamily: "inherit",
		transition: "border-color 0.3s",
	};

	const buttonStyle = {
		padding: "0.75rem 1.5rem",
		backgroundColor: "#3498db",
		color: "white",
		border: "none",
		borderRadius: "6px",
		fontSize: "1rem",
		fontWeight: "600",
		cursor: "pointer",
		transition: "background-color 0.3s",
	};

	return (
		<div style={formStyle}>
			{loading && (
				<div
					style={{
						textAlign: "center",
						padding: "1rem",
						backgroundColor: "#f0f4ff",
						borderRadius: "6px",
						marginBottom: "1rem",
					}}
				>
					<p style={{ color: "#3498db" }}>⏳ Processing your payment...</p>
				</div>
			)}
			{success && (
				<div
					style={{
						textAlign: "center",
						padding: "1rem",
						backgroundColor: "#e8f5e9",
						borderRadius: "6px",
						marginBottom: "1rem",
						color: "#2e7d32",
					}}
				>
					✅ Payment successful!
				</div>
			)}
			{error && (
				<div
					style={{
						textAlign: "center",
						padding: "1rem",
						backgroundColor: "#ffebee",
						borderRadius: "6px",
						marginBottom: "1rem",
						color: "#c62828",
					}}
				>
					{error}
				</div>
			)}
			<form onSubmit={handleSubmit}>
				<div style={formGroupStyle}>
					<label htmlFor="amount" style={labelStyle}>
						Amount
					</label>
					<input
						type="number"
						id="amount"
						name="amount"
						value={formData.amount}
						onChange={handleChange}
						style={inputStyle}
						placeholder="e.g., 100.00"
						required
					/>
				</div>
				<div style={formGroupStyle}>
					<label htmlFor="currency" style={labelStyle}>
						Currency
					</label>
					<select
						id="currency"
						name="currency"
						value={formData.currency}
						onChange={handleChange}
						style={inputStyle}
						required
					>
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
						<option value="TRY">TRY</option>
					</select>
				</div>
				<div style={formGroupStyle}>
					<label htmlFor="cardToken" style={labelStyle}>
						Card Token
					</label>
					<input
						type="text"
						id="cardToken"
						name="cardToken"
						value={formData.cardToken}
						onChange={handleChange}
						style={inputStyle}
						placeholder="tok_visa"
						required
					/>
				</div>
				<div style={formGroupStyle}>
					<label htmlFor="description" style={labelStyle}>
						Description
					</label>
					<input
						type="text"
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						style={inputStyle}
						placeholder="e.g., Monthly Subscription"
						required
					/>
				</div>
				<button
					type="submit"
					style={{
						...buttonStyle,
						backgroundColor: loading || cooldownActive ? "#bdc3c7" : "#3498db",
						cursor: loading || cooldownActive ? "not-allowed" : "pointer",
					}}
					disabled={loading || cooldownActive}
				>
					{cooldownActive
						? `Please wait ${cooldownTime}s`
						: loading
						? "Processing..."
						: "Pay Now"}
				</button>
			</form>
		</div>
	);
}
