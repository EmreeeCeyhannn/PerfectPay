import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import DashboardCharts from "./DashboardCharts";

export default function AdminDashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const data = await adminService.getDashboardStats();
				setStats(data);
			} catch (error) {
				console.error("Failed to fetch stats", error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading) return <div>Loading stats...</div>;
	if (!stats) return <div>No stats available</div>;

	return (
		<div className="admin-dashboard">
			<h2>Dashboard Overview</h2>
			<div
				className="stats-grid"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "1rem",
				}}
			>
				<div
					className="stat-card"
					style={{
						padding: "1rem",
						border: "1px solid #ddd",
						borderRadius: "8px",
					}}
				>
					<h3>Total Transactions</h3>
					<p style={{ fontSize: "2rem", fontWeight: "bold" }}>
						{stats.totalTransactions}
					</p>
				</div>
				<div
					className="stat-card"
					style={{
						padding: "1rem",
						border: "1px solid #ddd",
						borderRadius: "8px",
					}}
				>
					<h3>Total Volume</h3>
					<p style={{ fontSize: "2rem", fontWeight: "bold" }}>
						${stats.totalVolume.toFixed(2)}
					</p>
				</div>
				<div
					className="stat-card"
					style={{
						padding: "1rem",
						border: "1px solid #ddd",
						borderRadius: "8px",
					}}
				>
					<h3>Successful</h3>
					<p style={{ fontSize: "2rem", fontWeight: "bold" }}>
						{stats.successfulTransactions}
					</p>
				</div>
				<div
					className="stat-card"
					style={{
						padding: "1rem",
						border: "1px solid #ddd",
						borderRadius: "8px",
					}}
				>
					<h3>Total Users</h3>
					<p style={{ fontSize: "2rem", fontWeight: "bold" }}>
						{stats.totalUsers}
					</p>
				</div>
				<div
					className="stat-card"
					style={{
						padding: "1rem",
						border: "1px solid #ddd",
						borderRadius: "8px",
					}}
				>
					<h3>Active Providers</h3>
					<p style={{ fontSize: "2rem", fontWeight: "bold" }}>
						{stats.activeProviders}
					</p>
				</div>
			</div>

			{/* Dashboard Charts Section */}
			<DashboardCharts stats={stats} />
		</div>
	);
}

