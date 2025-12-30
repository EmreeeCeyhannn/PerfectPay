import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";

export default function MyCards() {
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { user } = useAuth();

	useEffect(() => {
		fetchCards();
	}, []);

	const fetchCards = async () => {
		try {
			setLoading(true);
			const response = await apiClient.get("/user/cards");
			setCards(response.data.cards || []);
			setError("");
		} catch (err) {
			console.error("Failed to fetch cards:", err);
			setError(err.response?.data?.error || "Failed to load cards");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div style={{ padding: "2rem", textAlign: "center" }}>
				<div className="spinner"></div>
				<p>Loading cards...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: "2rem" }}>
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			</div>
		);
	}

	return (
		<div style={{ padding: "1rem" }}>
			<h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>💳 My Cards</h2>

			{cards.length === 0 ? (
				<div
					style={{
						padding: "3rem",
						textAlign: "center",
						backgroundColor: "#f8f9fa",
						borderRadius: "8px",
						border: "2px dashed #dee2e6",
					}}
				>
					<p
						style={{
							fontSize: "1.2rem",
							color: "#6c757d",
							marginBottom: "1rem",
						}}
					>
						No cards found
					</p>
					<p style={{ color: "#adb5bd" }}>
						Add a card to start making payments
					</p>
				</div>
			) : (
				<div
					style={{
						display: "grid",
						gap: "1rem",
					}}
				>
					{cards.map((card) => (
						<div
							key={card.id}
							style={{
								padding: "1.5rem",
								backgroundColor: "#fff",
								border: "1px solid #dee2e6",
								borderRadius: "8px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div style={{ flex: 1 }}>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
										marginBottom: "8px",
									}}
								>
									<span style={{ fontSize: "1.5rem" }}>
										{card.card_brand === "visa"
											? "💳"
											: card.card_brand === "mastercard"
											? "💳"
											: card.card_brand === "amex"
											? "💳"
											: "💳"}
									</span>
									<span
										style={{
											fontSize: "1.1rem",
											fontWeight: "600",
											textTransform: "capitalize",
										}}
									>
										{card.card_brand || "Card"}
									</span>
								</div>
								<div
									style={{
										fontSize: "1.2rem",
										fontWeight: "500",
										color: "#2c3e50",
										marginBottom: "4px",
									}}
								>
									•••• •••• •••• {card.last_four}
								</div>
								{card.is_primary && (
									<span
										style={{
											display: "inline-block",
											padding: "4px 12px",
											backgroundColor: "#d4edda",
											color: "#155724",
											borderRadius: "12px",
											fontSize: "0.8rem",
											fontWeight: "600",
										}}
									>
										Primary Card
									</span>
								)}
							</div>
							<div style={{ textAlign: "right" }}>
								<p
									style={{
										fontSize: "0.85rem",
										color: "#6c757d",
										marginBottom: "4px",
									}}
								>
									Added on
								</p>
								<p style={{ fontSize: "0.9rem", color: "#2c3e50" }}>
									{new Date(card.created_at).toLocaleDateString()}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
