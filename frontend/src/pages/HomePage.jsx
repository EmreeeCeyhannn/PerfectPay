import React from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	return (
		<>
			<Header />
			<div className="container" style={{ paddingBottom: "3rem" }}>
				{/* Hero Section */}
				<div
					style={{
						textAlign: "center",
						padding: "4rem 2rem",
						animation: "slideUp 0.8s ease-out",
					}}
				>
					<h1
						style={{
							fontSize: "3.5rem",
							fontWeight: "800",
							marginBottom: "1rem",
							background: "linear-gradient(135deg, #3498db, #e74c3c)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						💳 Welcome to PerfectPay
					</h1>
					<p
						style={{
							fontSize: "1.3rem",
							color: "#666",
							marginTop: "1rem",
							maxWidth: "600px",
							margin: "1rem auto 0",
						}}
					>
						Fast, secure, and reliable payment processing for everyone. Join
						thousands of satisfied customers.
					</p>

					{/* CTA Buttons */}
					<div
						style={{
							marginTop: "3rem",
							display: "flex",
							gap: "1.5rem",
							justifyContent: "center",
							flexWrap: "wrap",
						}}
					>
						{isAuthenticated ? (
							<>
								<button
									onClick={() => navigate("/payment")}
									className="btn btn-primary"
									style={{ maxWidth: "200px" }}
								>
									💰 Make Payment
								</button>
								<button
									onClick={() => navigate("/profile")}
									className="btn btn-secondary"
									style={{ maxWidth: "200px" }}
								>
									👤 View Profile
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => navigate("/login")}
									className="btn btn-primary"
									style={{ maxWidth: "200px" }}
								>
									🔓 Login
								</button>
								<button
									onClick={() => navigate("/register")}
									className="btn btn-secondary"
									style={{ maxWidth: "200px" }}
								>
									✍️ Register
								</button>
							</>
						)}
					</div>
				</div>

				{/* Features Section */}
				<div style={{ marginTop: "4rem" }}>
					<h2
						style={{
							textAlign: "center",
							fontSize: "2.5rem",
							marginBottom: "3rem",
							color: "#2c3e50",
						}}
					>
						Why Choose PerfectPay?
					</h2>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
							gap: "2rem",
							marginBottom: "4rem",
						}}
					>
						{/* Feature 1 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Bank-Level Security
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Your data is protected with advanced encryption and security
								protocols. We take your privacy seriously.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Lightning Fast
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Process payments in seconds. Our optimized infrastructure
								ensures minimal latency and maximum uptime.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌍</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Global Support
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Accept payments in multiple currencies from customers worldwide.
								Available 24/7.
							</p>
						</div>

						{/* Feature 4 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💵</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Competitive Rates
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Transparent pricing with no hidden fees. Get the best rates in
								the industry.
							</p>
						</div>

						{/* Feature 5 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📱</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Mobile Ready
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Seamless experience on all devices. Pay anytime, anywhere with
								our responsive platform.
							</p>
						</div>

						{/* Feature 6 */}
						<div className="card">
							<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
							<h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
								Advanced Analytics
							</h3>
							<p style={{ color: "#666", lineHeight: "1.6" }}>
								Track every transaction with detailed reports and analytics.
								Make data-driven decisions.
							</p>
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div
					style={{
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						padding: "4rem 2rem",
						borderRadius: "15px",
						color: "white",
						textAlign: "center",
						marginBottom: "4rem",
					}}
				>
					<h2 style={{ fontSize: "2rem", marginBottom: "3rem" }}>
						Trusted by Millions
					</h2>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
							gap: "2rem",
						}}
					>
						<div>
							<div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>1M+</div>
							<p>Active Users</p>
						</div>
						<div>
							<div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
								$50B+
							</div>
							<p>Transactions</p>
						</div>
						<div>
							<div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
								99.9%
							</div>
							<p>Uptime</p>
						</div>
						<div>
							<div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>180+</div>
							<p>Countries</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
