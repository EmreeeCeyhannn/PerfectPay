import React, { useState, useEffect } from "react";
import { paymentService } from "../services/paymentService";
import TransactionMap from "./TransactionMap";

export function TransactionHistory() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	const fetchTransactions = async () => {
		try {
			const data = await paymentService.getTransactionHistory();
			// data.transactions contains the array
			setTransactions(data?.transactions || data || []);
		} catch (err) {
			console.error("Failed to load transactions:", err);
			setError(err.response?.data?.error || "Failed to load transactions");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const handleRefresh = () => {
		setRefreshing(true);
		fetchTransactions();
	};

	const getPSPIcon = (providerName) => {
		const provider = (providerName || "Unknown").toLowerCase();
		const icons = {
			stripe: "🔵 Stripe",
			wise: "🟢 Wise",
			paypal: "🔷 PayPal",
			iyzico: "🟣 İyzico",
			İyzico: "🟣 İyzico",
		};
		return icons[providerName] || `⚪ ${providerName || "Unknown"}`;
	};

	const getStatusBadge = (status) => {
		const normalizedStatus = (status || "pending").toLowerCase();

		const statusConfig = {
			success: { bg: "#d4edda", color: "#155724", icon: "✓", label: "Success" },
			completed: {
				bg: "#d4edda",
				color: "#155724",
				icon: "✓",
				label: "Completed",
			},
			failed: { bg: "#f8d7da", color: "#721c24", icon: "✕", label: "Failed" },
			declined: {
				bg: "#f8d7da",
				color: "#721c24",
				icon: "🚫",
				label: "Declined",
			},
			pending: {
				bg: "#fff3cd",
				color: "#856404",
				icon: "⏳",
				label: "Pending",
			},
		};

		const config = statusConfig[normalizedStatus] || statusConfig.pending;

		return (
			<span
				style={{
					padding: "0.5rem 0.75rem",
					borderRadius: "20px",
					backgroundColor: config.bg,
					color: config.color,
					fontWeight: "600",
					fontSize: "0.85rem",
					display: "inline-flex",
					alignItems: "center",
					gap: "0.5rem",
				}}
			>
				{config.icon} {config.label}
			</span>
		);
	};

	if (loading) {
		return (
			<div className="card" style={{ textAlign: "center" }}>
				<div className="spinner"></div>
				<p style={{ marginTop: "1rem", color: "#666" }}>
					Loading transactions...
				</p>
			</div>
		);
	}

	return (
		<div className="card">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "1.5rem",
				}}
			>
				<h3 className="card-title" style={{ margin: 0 }}>
					📊 Transaction History
				</h3>
				<button
					onClick={handleRefresh}
					disabled={refreshing}
					className="btn"
					style={{
						padding: "0.5rem 1rem",
						width: "auto",
						background: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
						color: "white",
						border: "none",
						fontSize: "0.9rem",
						cursor: refreshing ? "not-allowed" : "pointer",
						opacity: refreshing ? 0.6 : 1,
					}}
				>
					{refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
				</button>
			</div>

			{error && (
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			)}

			{/* Show selected transaction map */}
			{selectedTransaction && (
				<div style={{ marginBottom: "2rem" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<h4 style={{ margin: 0 }}>
							📍 Transaction Details: {selectedTransaction}
						</h4>
						<button
							onClick={() => setSelectedTransaction(null)}
							className="btn"
							style={{
								padding: "0.5rem 1rem",
								background: "#95a5a6",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
							}}
						>
							✕ Close
						</button>
					</div>
					<TransactionMap transactionId={selectedTransaction} />
				</div>
			)}

			{transactions.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						color: "#999",
					}}
				>
					<p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
						No transactions yet
					</p>
					<p style={{ fontSize: "0.9rem" }}>
						Make a payment to see it listed here
					</p>
				</div>
			) : (
				<div style={{ overflowX: "auto" }}>
					<p
						style={{
							fontSize: "0.9rem",
							color: "#666",
							marginBottom: "1rem",
							fontStyle: "italic",
						}}
					>
						💡 Click on any transaction to view its real-time transparency map
					</p>
					<table className="table">
						<thead>
							<tr>
								<th>📅 Date</th>
								<th>💰 Amount</th>
								<th>💵 Currency</th>
								<th>✓ Status</th>
								<th>🏦 Provider</th>
								<th>🗺️ Map</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((tx, index) => (
								<tr
									key={tx.id || index}
									onClick={() =>
										setSelectedTransaction(
											tx.transaction_id || tx.transactionId || `tx_${tx.id}`
										)
									}
									style={{
										cursor: "pointer",
										transition: "background-color 0.2s",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.backgroundColor = "#f8f9fa")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.backgroundColor = "transparent")
									}
								>
									<td>
										{new Date(
											tx.date || tx.created_at || tx.timestamp
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</td>
									<td style={{ fontWeight: "bold" }}>
										${parseFloat(tx.amount || 0).toFixed(2)}
									</td>
									<td>{tx.currency || "N/A"}</td>
									<td>
										{getStatusBadge((tx.status || "pending").toLowerCase())}
									</td>
									<td>{getPSPIcon(tx.provider || tx.pspName)}</td>
									<td>
										<span
											style={{
												fontSize: "1.2rem",
												color: "#667eea",
											}}
										>
											🗺️ View
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
