import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

export default function AdminSettings() {
	const [commissions, setCommissions] = useState([]);
	const [providers, setProviders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [commData, provData] = await Promise.all([
				adminService.getCommissionSettings(),
				adminService.getProviderPreferences(),
			]);
			setCommissions(commData);
			setProviders(provData);
		} catch (error) {
			console.error("Failed to fetch settings", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCommissionUpdate = async (id, rate) => {
		try {
			await adminService.updateCommissionSettings({
				id,
				commission_rate: rate,
			});
			fetchData(); // Refresh
		} catch (error) {
			console.error("Update failed", error);
		}
	};

	const handleProviderToggle = async (id, isActive) => {
		try {
			await adminService.updateProviderPreferences({ id, is_active: isActive });
			fetchData(); // Refresh
		} catch (error) {
			console.error("Update failed", error);
		}
	};

	if (loading) return <div>Loading settings...</div>;

	return (
		<div className="admin-settings">
			<div className="section" style={{ marginBottom: "2rem" }}>
				<h2>Provider Preferences</h2>
				<div className="provider-list">
					{providers.map((p) => (
						<div
							key={p.id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								padding: "0.5rem",
								borderBottom: "1px solid #eee",
							}}
						>
							<span style={{ fontWeight: "bold", minWidth: "100px" }}>
								{p.name}
							</span>
							<label>
								<input
									type="checkbox"
									checked={p.is_active}
									onChange={(e) => handleProviderToggle(p.id, e.target.checked)}
								/>{" "}
								Active
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="section">
				<h2>Commission Settings</h2>
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr style={{ textAlign: "left" }}>
							<th>Provider</th>
							<th>Rate (%)</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{commissions.map((c) => (
							<tr key={c.id}>
								<td>{c.provider_name}</td>
								<td>
									<input
										type="number"
										defaultValue={c.commission_rate}
										onBlur={(e) => handleCommissionUpdate(c.id, e.target.value)}
										style={{ width: "60px" }}
									/>
								</td>
								<td>
									<button onClick={() => fetchData()}>Refresh</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
