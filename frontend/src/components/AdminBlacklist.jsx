import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";

export default function AdminBlacklist() {
	const [blacklist, setBlacklist] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchBlacklist();
	}, []);

	const fetchBlacklist = async () => {
		try {
			setLoading(true);
			const data = await adminService.getBlacklist();
			setBlacklist(data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch blacklist:", err);
			setError("Failed to load blacklist data");
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (id) => {
		if (
			!window.confirm(
				"Are you sure you want to remove this user from the blacklist?"
			)
		) {
			return;
		}

		try {
			await adminService.removeFromBlacklist(id);
			fetchBlacklist(); // Refresh list
		} catch (err) {
			console.error("Failed to remove from blacklist:", err);
			alert("Failed to remove user from blacklist");
		}
	};

	if (loading) return <div>Loading blacklist...</div>;
	if (error) return <div style={{ color: "red" }}>{error}</div>;

	return (
		<div className="admin-blacklist">
			<h2>Blacklisted Users</h2>
			{blacklist.length === 0 ? (
				<p>No users currently blacklisted.</p>
			) : (
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						marginTop: "1rem",
					}}
				>
					<thead>
						<tr style={{ background: "#f5f5f5", textAlign: "left" }}>
							<th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
								ID
							</th>
							<th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
								Identifier (Email)
							</th>
							<th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
								Reason
							</th>
							<th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
								Date
							</th>
							<th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{blacklist.map((item) => (
							<tr key={item.id}>
								<td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
									{item.id}
								</td>
								<td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
									{item.identifier}
								</td>
								<td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
									{item.reason}
								</td>
								<td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
									{new Date(item.created_at).toLocaleString()}
								</td>
								<td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
									<button
										onClick={() => handleRemove(item.id)}
										style={{
											padding: "5px 10px",
											background: "#ff4444",
											color: "white",
											border: "none",
											borderRadius: "4px",
											cursor: "pointer",
										}}
									>
										Remove
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
