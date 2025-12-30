import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

export function AdminHeader() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate("/admin/login", { replace: true });
	};

	return (
		<header className="header" style={{ borderBottom: "4px solid #e74c3c" }}>
			<div className="container">
				<div className="header-content">
					<div
						className="logo"
						onClick={() => navigate("/admin")}
						style={{ cursor: "pointer", color: "#c0392b" }}
					>
						🛡️ PerfectPay Admin
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<span style={{ fontSize: "0.9rem", color: "#666" }}>
							Admin: {user?.full_name || "Administrator"}
						</span>
						<button
							onClick={handleLogout}
							className="btn btn-secondary"
							style={{
								padding: "0.5rem 1rem",
								fontSize: "0.9rem",
								width: "auto",
								borderColor: "#e74c3c",
								color: "#e74c3c",
							}}
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}

export function AdminFooter() {
	return (
		<footer className="footer" style={{ marginTop: "auto" }}>
			<div className="container">
				<p>
					&copy; {new Date().getFullYear()} PerfectPay Admin Portal. Restricted
					Access.
				</p>
			</div>
		</footer>
	);
}

export default function AdminLayout({ children }) {
	return (
		<div className="layout">
			<AdminHeader />
			<main className="main-content">{children}</main>
			<AdminFooter />
		</div>
	);
}
