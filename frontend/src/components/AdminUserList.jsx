import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

export default function AdminUserList() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await adminService.getUsers();
				setUsers(data);
			} catch (error) {
				console.error("Failed to fetch users", error);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	const handleSuspend = async (email) => {
		if (
			!window.confirm(
				`Are you sure you want to suspend user ${email}? They will be added to the blacklist.`
			)
		) {
			return;
		}

		try {
			await adminService.addToBlacklist(email, "Manual suspension by admin");
			alert(`User ${email} has been suspended.`);
		} catch (error) {
			console.error("Failed to suspend user", error);
			alert("Failed to suspend user");
		}
	};

	if (loading) return <div>Loading users...</div>;

	return (
		<div className="admin-user-list">
			<h2>Users</h2>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
						<th style={{ padding: "0.5rem" }}>ID</th>
						<th style={{ padding: "0.5rem" }}>Name</th>
						<th style={{ padding: "0.5rem" }}>Email</th>
						<th style={{ padding: "0.5rem" }}>Phone</th>
						<th style={{ padding: "0.5rem" }}>KYC Status</th>
						<th style={{ padding: "0.5rem" }}>Joined</th>
						<th style={{ padding: "0.5rem" }}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
							<td style={{ padding: "0.5rem" }}>{user.id}</td>
							<td style={{ padding: "0.5rem" }}>{user.full_name}</td>
							<td style={{ padding: "0.5rem" }}>{user.email}</td>
							<td style={{ padding: "0.5rem" }}>{user.phone || "-"}</td>
							<td style={{ padding: "0.5rem" }}>
								<span
									style={{
										padding: "0.25rem 0.5rem",
										borderRadius: "4px",
										backgroundColor:
											user.kyc_status === "approved" ? "#d4edda" : "#fff3cd",
										color:
											user.kyc_status === "approved" ? "#155724" : "#856404",
									}}
								>
									{user.kyc_status}
								</span>
							</td>
							<td style={{ padding: "0.5rem" }}>
								{new Date(user.created_at).toLocaleDateString()}
							</td>
							<td style={{ padding: "0.5rem" }}>
								<button
									onClick={() => handleSuspend(user.email)}
									style={{
										padding: "0.25rem 0.5rem",
										backgroundColor: "#dc3545",
										color: "white",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
									}}
								>
									Suspend
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
