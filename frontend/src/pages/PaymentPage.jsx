import React, { useState } from "react";
import { Header, Footer } from "../components/Layout";
import { PaymentForm } from "../components/PaymentForm";
import TransferForm from "../components/TransferForm";
import PSPAnalytics from "../components/PSPAnalytics";
import { TransactionHistory } from "../components/TransactionHistory";

export function PaymentPage() {
	const [activeTab, setActiveTab] = useState("transfer");

	return (
		<>
			<Header />
			<div
				className="container"
				style={{ minHeight: "calc(100vh - 200px)", paddingBottom: "2rem" }}
			>
				<h1
					style={{
						fontSize: "2.5rem",
						marginBottom: "1rem",
						color: "#2c3e50",
						textAlign: "center",
					}}
				>
					💼 Payment Orchestration Platform
				</h1>
				<p
					style={{
						textAlign: "center",
						color: "#7f8c8d",
						marginBottom: "2rem",
						fontSize: "14px",
					}}
				>
					Intelligent payment routing with optimal cost selection
				</p>

				{/* Tab Navigation */}
				<div
					style={{
						display: "flex",
						gap: "10px",
						justifyContent: "center",
						marginBottom: "30px",
						flexWrap: "wrap",
					}}
				>
					<button
						onClick={() => setActiveTab("transfer")}
						style={{
							padding: "10px 20px",
							border: "none",
							borderRadius: "8px",
							backgroundColor: activeTab === "transfer" ? "#3498db" : "#ecf0f1",
							color: activeTab === "transfer" ? "white" : "#2c3e50",
							cursor: "pointer",
							fontWeight: "600",
							transition: "all 0.3s ease",
							fontSize: "14px",
						}}
					>
						💸 Send Money (P2P)
					</button>
					<button
						onClick={() => setActiveTab("payment")}
						style={{
							padding: "10px 20px",
							border: "none",
							borderRadius: "8px",
							backgroundColor: activeTab === "payment" ? "#3498db" : "#ecf0f1",
							color: activeTab === "payment" ? "white" : "#2c3e50",
							cursor: "pointer",
							fontWeight: "600",
							transition: "all 0.3s ease",
							fontSize: "14px",
						}}
					>
						💳 Card Payment
					</button>
					<button
						onClick={() => setActiveTab("analytics")}
						style={{
							padding: "10px 20px",
							border: "none",
							borderRadius: "8px",
							backgroundColor:
								activeTab === "analytics" ? "#3498db" : "#ecf0f1",
							color: activeTab === "analytics" ? "white" : "#2c3e50",
							cursor: "pointer",
							fontWeight: "600",
							transition: "all 0.3s ease",
							fontSize: "14px",
						}}
					>
						📊 PSP Analytics
					</button>
					<button
						onClick={() => setActiveTab("history")}
						style={{
							padding: "10px 20px",
							border: "none",
							borderRadius: "8px",
							backgroundColor: activeTab === "history" ? "#3498db" : "#ecf0f1",
							color: activeTab === "history" ? "white" : "#2c3e50",
							cursor: "pointer",
							fontWeight: "600",
							transition: "all 0.3s ease",
							fontSize: "14px",
						}}
					>
						📜 History
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === "transfer" && (
					<div>
						<TransferForm />
					</div>
				)}

				{activeTab === "payment" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
							gap: "2rem",
							marginBottom: "2rem",
						}}
					>
						<div>
							<PaymentForm />
						</div>
						<div>
							<TransactionHistory />
						</div>
					</div>
				)}

				{activeTab === "analytics" && (
					<div>
						<PSPAnalytics />
					</div>
				)}

				{activeTab === "history" && (
					<div>
						<TransactionHistory />
					</div>
				)}
			</div>
			<Footer />
		</>
	);
}
