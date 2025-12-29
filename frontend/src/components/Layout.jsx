import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

export function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	const isActive = (path) => location.pathname === path;

	return (
		<header className="header">
			<div className="container">
				<div className="header-content">
					<div
						className="logo"
						onClick={() => navigate("/")}
						style={{ cursor: "pointer" }}
					>
						💳 PerfectPay
					</div>

					{/* Desktop Navigation */}
					<nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
						<ul className="nav-links" style={{ display: "flex", gap: "2rem" }}>
							<li>
								<a
									href="/"
									style={{
										borderBottom: isActive("/") ? "2px solid #3498db" : "none",
									}}
								>
									Home
								</a>
							</li>
							{isAuthenticated && (
								<>
									<li>
										<a
											href="/payment"
											style={{
												borderBottom: isActive("/payment")
													? "2px solid #3498db"
													: "none",
											}}
										>
											Payment
										</a>
									</li>
									<li>
										<a
											href="/profile"
											style={{
												borderBottom: isActive("/profile")
													? "2px solid #3498db"
													: "none",
											}}
										>
											Profile
										</a>
									</li>
									<li>
										<a
											href="/admin"
											style={{
												borderBottom: isActive("/admin")
													? "2px solid #3498db"
													: "none",
											}}
										>
											Admin
										</a>
									</li>
								</>
							)}
						</ul>

						{isAuthenticated ? (
							<div
								style={{ display: "flex", alignItems: "center", gap: "1rem" }}
							>
								<span style={{ fontSize: "0.9rem", color: "#666" }}>
									{user?.full_name || "User"}
								</span>
								<button
									onClick={handleLogout}
									className="btn btn-secondary"
									style={{
										padding: "0.5rem 1rem",
										fontSize: "0.9rem",
										width: "auto",
									}}
								>
									Logout
								</button>
							</div>
						) : (
							<div style={{ display: "flex", gap: "1rem" }}>
								<button
									onClick={() => navigate("/login")}
									className="btn btn-primary"
									style={{
										padding: "0.5rem 1rem",
										fontSize: "0.9rem",
										width: "auto",
									}}
								>
									Login
								</button>
								<button
									onClick={() => navigate("/register")}
									className="btn btn-secondary"
									style={{
										padding: "0.5rem 1rem",
										fontSize: "0.9rem",
										width: "auto",
									}}
								>
									Register
								</button>
							</div>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer
			style={{
				background: "linear-gradient(135deg, #2c3e50, #34495e)",
				color: "#ecf0f1",
				padding: "3rem 2rem",
				marginTop: "4rem",
				textAlign: "center",
				borderTop: "2px solid #3498db",
			}}
		>
			<div className="container">
				<h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>PerfectPay</h3>
				<p style={{ marginBottom: "1rem", opacity: 0.8 }}>
					Secure, fast, and reliable payment processing for everyone
				</p>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						gap: "2rem",
						marginBottom: "2rem",
						fontSize: "0.9rem",
					}}
				>
					<a href="#" style={{ color: "#3498db", textDecoration: "none" }}>
						Privacy Policy
					</a>
					<a href="#" style={{ color: "#3498db", textDecoration: "none" }}>
						Terms of Service
					</a>
					<a href="#" style={{ color: "#3498db", textDecoration: "none" }}>
						Contact
					</a>
				</div>
				<p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
					&copy; {currentYear} PerfectPay. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

export default function Layout({ children }) {
	return (
		<div
			style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
		>
			<Header />
			<main style={{ flex: 1 }}>{children}</main>
			<Footer />
		</div>
	);
}
