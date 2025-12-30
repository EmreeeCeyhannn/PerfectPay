import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";

export default function AddCard({ onCardAdded }) {
	const [formData, setFormData] = useState({
		cardNumber: "",
		cardBrand: "",
		isPrimary: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const { user } = useAuth();

	const testCards = {
		stripe: [
			{
				number: "4242424242424242",
				brand: "visa",
				description: "Stripe - Success",
			},
			{
				number: "4000000000000002",
				brand: "visa",
				description: "Stripe - Failed",
			},
			{
				number: "4000002500003155",
				brand: "visa",
				description: "Stripe - Requires Auth",
			},
		],
		wise: [
			{
				number: "5555555555554444",
				brand: "mastercard",
				description: "Wise - Success",
			},
			{
				number: "5200828282828210",
				brand: "mastercard",
				description: "Wise - Failed",
			},
		],
		paypal: [
			{
				number: "378282246310005",
				brand: "amex",
				description: "PayPal - Success",
			},
			{
				number: "371449635398431",
				brand: "amex",
				description: "PayPal - Failed",
			},
		],
		iyzico: [
			{
				number: "5528790000000008",
				brand: "mastercard",
				description: "Iyzico - Success",
			},
			{
				number: "5406670000000009",
				brand: "mastercard",
				description: "Iyzico - Failed",
			},
		],
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			// Validate card number (remove spaces)
			const cleanCardNumber = formData.cardNumber.replace(/\s/g, "");

			if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
				throw new Error("Card number must be between 13 and 19 digits");
			}

			// Get last 4 digits
			const lastFour = cleanCardNumber.slice(-4);

			// Auto-detect card brand if not specified
			let cardBrand = formData.cardBrand;
			if (!cardBrand) {
				// Simple brand detection
				if (cleanCardNumber.startsWith("4")) cardBrand = "visa";
				else if (cleanCardNumber.startsWith("5")) cardBrand = "mastercard";
				else if (cleanCardNumber.startsWith("3")) cardBrand = "amex";
				else cardBrand = "unknown";
			}

			const response = await apiClient.post("/user/cards", {
				cardNumber: cleanCardNumber,
				lastFour: lastFour,
				cardBrand: cardBrand,
				isPrimary: formData.isPrimary,
			});

			setSuccess("Card added successfully!");
			setFormData({
				cardNumber: "",
				cardBrand: "",
				isPrimary: false,
			});

			// Notify parent component
			if (onCardAdded) {
				onCardAdded(response.data.card);
			}

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error("Add card error:", err);
			setError(
				err.response?.data?.error || err.message || "Failed to add card"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleTestCardClick = (card) => {
		setFormData({
			...formData,
			cardNumber: card.number,
			cardBrand: card.brand,
		});
	};

	return (
		<div style={{ padding: "1rem" }}>
			<h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>
				➕ Add New Card
			</h2>

			{error && (
				<div className="alert alert-error" style={{ marginBottom: "1rem" }}>
					<span>⚠️ {error}</span>
				</div>
			)}

			{success && (
				<div
					className="alert"
					style={{
						marginBottom: "1rem",
						backgroundColor: "#d4edda",
						color: "#155724",
						padding: "1rem",
						borderRadius: "8px",
						border: "1px solid #c3e6cb",
					}}
				>
					<span>✅ {success}</span>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="form-group" style={{ marginBottom: "1rem" }}>
					<label
						htmlFor="cardNumber"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "600",
						}}
					>
						Card Number *
					</label>
					<input
						type="text"
						id="cardNumber"
						placeholder="4242 4242 4242 4242"
						value={formData.cardNumber}
						onChange={(e) =>
							setFormData({ ...formData, cardNumber: e.target.value })
						}
						required
						disabled={loading}
						style={{
							width: "100%",
							padding: "0.75rem",
							border: "1px solid #ddd",
							borderRadius: "8px",
							fontSize: "1rem",
						}}
					/>
				</div>

				<div className="form-group" style={{ marginBottom: "1rem" }}>
					<label
						htmlFor="cardBrand"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "600",
						}}
					>
						Card Brand (Optional - Auto-detected)
					</label>
					<select
						id="cardBrand"
						value={formData.cardBrand}
						onChange={(e) =>
							setFormData({ ...formData, cardBrand: e.target.value })
						}
						disabled={loading}
						style={{
							width: "100%",
							padding: "0.75rem",
							border: "1px solid #ddd",
							borderRadius: "8px",
							fontSize: "1rem",
						}}
					>
						<option value="">Auto-detect</option>
						<option value="visa">Visa</option>
						<option value="mastercard">Mastercard</option>
						<option value="amex">American Express</option>
					</select>
				</div>

				<div className="form-group" style={{ marginBottom: "1.5rem" }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={formData.isPrimary}
							onChange={(e) =>
								setFormData({ ...formData, isPrimary: e.target.checked })
							}
							disabled={loading}
							style={{ width: "18px", height: "18px" }}
						/>
						<span>Set as primary card</span>
					</label>
				</div>

				<button
					type="submit"
					className="btn btn-primary"
					disabled={loading}
					style={{
						width: "100%",
						padding: "0.75rem",
						fontSize: "1rem",
						fontWeight: "600",
					}}
				>
					{loading ? (
						<>
							<span className="spinner"></span> Adding Card...
						</>
					) : (
						"💳 Add Card"
					)}
				</button>
			</form>

			{/* Test Cards Reference */}
			<div
				style={{
					marginTop: "2rem",
					padding: "1rem",
					backgroundColor: "#f8f9fa",
					borderRadius: "8px",
				}}
			>
				<h3
					style={{ fontSize: "0.9rem", marginBottom: "1rem", color: "#6c757d" }}
				></h3>
				<div style={{ fontSize: "0.85rem" }}>
					{Object.entries(testCards).map(([provider, cards]) => (
						<div key={provider} style={{ marginBottom: "1rem" }}>
							<strong style={{ textTransform: "capitalize", color: "#495057" }}>
								{provider}:
							</strong>
							<div style={{ marginTop: "0.5rem" }}>
								{cards.map((card, idx) => (
									<div
										key={idx}
										onClick={() => handleTestCardClick(card)}
										style={{
											padding: "0.5rem",
											marginBottom: "0.25rem",
											backgroundColor: "#fff",
											border: "1px solid #dee2e6",
											borderRadius: "4px",
											cursor: "pointer",
											display: "flex",
											justifyContent: "space-between",
										}}
									>
										<span style={{ fontFamily: "monospace" }}>
											{card.number}
										</span>
										<span style={{ color: "#6c757d" }}>{card.description}</span>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
