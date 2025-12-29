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
			setError(err.response?.data?.error || "Payment failed");
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
						backgroundColor: "#d4edda",
						borderRadius: "6px",
						marginBottom: "1rem",
						color: "#155724",
					}}
				>
					<p>✅ Payment successful!</p>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<h2
					style={{
						color: "#2c3e50",
						marginBottom: "1.5rem",
						textAlign: "center",
					}}
				>
					💳 Card Payment
				</h2>

				{error && (
					<div
						style={{
							padding: "0.75rem",
							backgroundColor: "#f8d7da",
							color: "#721c24",
							borderRadius: "6px",
							marginBottom: "1.5rem",
							fontSize: "0.9rem",
						}}
					>
						❌ {error}
					</div>
				)}

				<div style={formGroupStyle}>
					<label style={labelStyle} htmlFor="amount">
						Amount *
					</label>
					<input
						style={inputStyle}
						type="number"
						id="amount"
						name="amount"
						value={formData.amount}
						onChange={handleChange}
						step="0.01"
						min="0"
						placeholder="0.00"
						required
						disabled={loading}
					/>
				</div>

				<div style={formGroupStyle}>
					<label style={labelStyle} htmlFor="currency">
						Currency *
					</label>
					<select
						style={inputStyle}
						id="currency"
						name="currency"
						value={formData.currency}
						onChange={handleChange}
						disabled={loading}
					>
						<option value="USD">USD (US Dollar)</option>
						<option value="EUR">EUR (Euro)</option>
						<option value="GBP">GBP (British Pound)</option>
						<option value="TRY">TRY (Turkish Lira)</option>
					</select>
				</div>

				<div style={formGroupStyle}>
					<label style={labelStyle} htmlFor="cardToken">
						Card Token *
					</label>
					<input
						style={inputStyle}
						type="text"
						id="cardToken"
						name="cardToken"
						value={formData.cardToken}
						onChange={handleChange}
						placeholder="tok_visa (for testing)"
						required
						disabled={loading}
					/>
					<small
						style={{ marginTop: "0.3rem", color: "#666", fontSize: "0.85rem" }}
					>
						Use 'tok_visa' for test payments
					</small>
				</div>

				<div style={formGroupStyle}>
					<label style={labelStyle} htmlFor="description">
						Description (Optional)
					</label>
					<textarea
						style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						placeholder="Payment description"
						disabled={loading}
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loading}
					style={{
						...buttonStyle,
						opacity: loading ? 0.7 : 1,
						cursor: loading ? "not-allowed" : "pointer",
					}}
				>
					{loading ? "⏳ Processing..." : "💰 Pay Now"}
				</button>
			</form>
		</div>
	);
}
