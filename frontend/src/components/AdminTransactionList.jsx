import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

export default function AdminTransactionList() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				const data = await adminService.getTransactions();
				setTransactions(data);
			} catch (error) {
				console.error("Failed to fetch transactions", error);
			} finally {
				setLoading(false);
			}
		};
		fetchTransactions();
	}, []);

	if (loading) return <div>Loading transactions...</div>;

	return (
		<div className="admin-transaction-list">
			<h2>Recent Transactions</h2>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
						<th style={{ padding: "0.5rem" }}>ID</th>
						<th style={{ padding: "0.5rem" }}>User</th>
						<th style={{ padding: "0.5rem" }}>Amount</th>
						<th style={{ padding: "0.5rem" }}>Provider</th>
						<th style={{ padding: "0.5rem" }}>Status</th>
						<th style={{ padding: "0.5rem" }}>Date</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map((tx) => (
						<tr key={tx.id} style={{ borderBottom: "1px solid #eee" }}>
							<td style={{ padding: "0.5rem" }}>{tx.id}</td>
							<td style={{ padding: "0.5rem" }}>{tx.user_email}</td>
							<td style={{ padding: "0.5rem" }}>
								{tx.amount} {tx.currency}
							</td>
							<td style={{ padding: "0.5rem" }}>{tx.provider_name}</td>
							<td style={{ padding: "0.5rem" }}>
								<span
									style={{
										padding: "0.25rem 0.5rem",
										borderRadius: "4px",
										backgroundColor:
											tx.status === "success" ? "#d4edda" : "#f8d7da",
										color: tx.status === "success" ? "#155724" : "#721c24",
									}}
								>
									{tx.status}
								</span>
							</td>
							<td style={{ padding: "0.5rem" }}>
								{new Date(tx.created_at).toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
