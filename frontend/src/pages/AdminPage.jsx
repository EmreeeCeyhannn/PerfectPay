import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../components/AdminDashboard";
import AdminUserList from "../components/AdminUserList";
import AdminTransactionList from "../components/AdminTransactionList";
import AdminSettings from "../components/AdminSettings";
import AdminBlacklist from "../components/AdminBlacklist";

export default function AdminPage() {
	const [activeTab, setActiveTab] = useState("dashboard");

	const renderContent = () => {
		switch (activeTab) {
			case "dashboard":
				return <AdminDashboard />;
			case "users":
				return <AdminUserList />;
			case "transactions":
				return <AdminTransactionList />;
			case "settings":
				return <AdminSettings />;
			case "blacklist":
				return <AdminBlacklist />;
			default:
				return <AdminDashboard />;
		}
	};

	return (
		<AdminLayout>
			<div className="admin-page-container" style={{ padding: "2rem" }}>
				<h1>Admin Panel</h1>
				<div
					className="admin-tabs"
					style={{
						display: "flex",
						gap: "1rem",
						marginBottom: "2rem",
						borderBottom: "1px solid #ddd",
					}}
				>
					<button
						onClick={() => setActiveTab("dashboard")}
						style={{
							padding: "0.5rem 1rem",
							background: activeTab === "dashboard" ? "#eee" : "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						Dashboard
					</button>
					<button
						onClick={() => setActiveTab("users")}
						style={{
							padding: "0.5rem 1rem",
							background: activeTab === "users" ? "#eee" : "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						Users
					</button>
					<button
						onClick={() => setActiveTab("transactions")}
						style={{
							padding: "0.5rem 1rem",
							background: activeTab === "transactions" ? "#eee" : "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						Transactions
					</button>
					<button
						onClick={() => setActiveTab("blacklist")}
						style={{
							padding: "0.5rem 1rem",
							background: activeTab === "blacklist" ? "#eee" : "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						Blacklist
					</button>
					<button
						onClick={() => setActiveTab("settings")}
						style={{
							padding: "0.5rem 1rem",
							background: activeTab === "settings" ? "#eee" : "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						Settings
					</button>
				</div>
				<div className="admin-content">{renderContent()}</div>
			</div>
		</AdminLayout>
	);
}
