import React, { useEffect, useState } from "react";
import "./PSPAnalytics.css";
import { paymentService } from "../services/paymentService";

export default function PSPAnalytics() {
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAnalytics = async () => {
			try {
				const data = await paymentService.getPSPAnalytics();
				setAnalytics(data);
			} catch (err) {
				console.error("Analytics fetch error:", err);
				setError(
					err.response?.data?.error || err.message || "Failed to load analytics"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAnalytics();
		// Refresh every 30 seconds
		const interval = setInterval(fetchAnalytics, 30000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="analytics-container">
				<div className="analytics-loading">📊 Loading PSP Analytics...</div>
			</div>
		);
	}

	if (error) {
		return <div className="analytics-error">❌ {error}</div>;
	}

	if (!analytics) {
		return <div className="analytics-error">No analytics data available</div>;
	}

	return (
		<div className="analytics-container">
			<h2>📊 PSP Performance Analytics</h2>

			<div className="analytics-header">
				<div className="stat-card">
					<div className="stat-icon">💼</div>
					<div className="stat-content">
						<span className="stat-label">Active PSPs</span>
						<span className="stat-value">
							{analytics.overallStats.activePSPs}
						</span>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">📈</div>
					<div className="stat-content">
						<span className="stat-label">Total PSPs</span>
						<span className="stat-value">
							{analytics.overallStats.totalPSPs}
						</span>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">⏰</div>
					<div className="stat-content">
						<span className="stat-label">Last Updated</span>
						<span className="stat-value">
							{new Date().toLocaleTimeString()}
						</span>
					</div>
				</div>
			</div>

			<div className="psp-grid">
				{analytics.pspPerformance.map((psp, index) => {
					const successRate = parseFloat(psp.successRate);
					const getPerformanceColor = (rate) => {
						if (rate >= 98) return "#27ae60"; // Green
						if (rate >= 95) return "#f39c12"; // Orange
						return "#e74c3c"; // Red
					};

					const getPerformanceBadge = (rate) => {
						if (rate >= 98) return "⭐⭐⭐ Excellent";
						if (rate >= 95) return "⭐⭐ Good";
						return "⭐ Needs Improvement";
					};

					return (
						<div key={index} className="psp-card">
							<div className="psp-header">
								<h3 className="psp-name">{psp.pspName}</h3>
								<span
									className="success-badge"
									style={{ backgroundColor: getPerformanceColor(successRate) }}
								>
									{successRate.toFixed(1)}%
								</span>
							</div>

							<div className="psp-performance">
								<div className="performance-label">
									{getPerformanceBadge(successRate)}
								</div>
								<div className="progress-bar">
									<div
										className="progress-fill"
										style={{
											width: `${successRate}%`,
											backgroundColor: getPerformanceColor(successRate),
										}}
									></div>
								</div>
							</div>

							<div className="psp-metrics">
								<div className="metric-row">
									<span className="metric-label">💸 Total Transactions</span>
									<span className="metric-value">{psp.totalTransactions}</span>
								</div>

								<div className="metric-row">
									<span className="metric-label">✅ Successful</span>
									<span className="metric-value success">
										{psp.successfulTransactions}
									</span>
								</div>

								<div className="metric-row">
									<span className="metric-label">❌ Failed</span>
									<span className="metric-value error">
										{psp.failedTransactions}
									</span>
								</div>

								<div className="metric-row">
									<span className="metric-label">💰 Total Volume</span>
									<span className="metric-value">{psp.totalVolume}</span>
								</div>

								<div className="metric-row">
									<span className="metric-label">📊 Avg Value</span>
									<span className="metric-value">{psp.avgValue}</span>
								</div>
							</div>

							<div className="psp-footer">
								<span className="indicator">
									{successRate >= 95 ? "🟢 Operational" : "🟡 Degraded"}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="analytics-footer">
				<p>
					💡 These metrics help optimize payment routing for the best user
					experience.
				</p>
				<p>Auto-refreshes every 30 seconds</p>
			</div>
		</div>
	);
}
