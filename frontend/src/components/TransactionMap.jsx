import React, { useEffect, useState, useRef } from "react";
import "./TransactionMap.css";

export default function TransactionMap({ transactionId }) {
	const [mapData, setMapData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [visibleNodeCount, setVisibleNodeCount] = useState(0);
	const [simulationProgress, setSimulationProgress] = useState(0);
	const isSimulated = useRef(false);
	const simulationTimer = useRef(null);

	// Simulated data structure
	const getSimulatedData = () => ({
		overview: {
			totalDuration: "Calculating...",
			status: "processing",
			path: "Optimizing Route...",
		},
		geographicPath: [
			{
				type: "origin",
				location: "Sender Device",
				city: "Istanbul",
				country: "TR",
				ip: "192.168.1.1",
			},
			{
				type: "orchestrator",
				location: "Secure Orchestrator",
				city: "Frankfurt",
				country: "DE",
				ip: "10.0.0.1",
			},
			{
				type: "psp",
				location: "Payment Provider",
				city: "London",
				country: "GB",
				ip: "172.16.0.1",
			},
			{
				type: "destination",
				location: "Recipient Bank",
				city: "New York",
				country: "US",
				ip: "192.168.2.1",
			},
		],
		steps: [
			{
				step: 1,
				name: "Request Initiated",
				status: "completed",
				timestamp: new Date().toISOString(),
				location: "Istanbul",
				details: "Payment request received from user",
			},
			{
				step: 2,
				name: "Fraud Detection",
				status: "in-progress",
				location: "Frankfurt",
				details: "Analyzing risk patterns...",
			},
			{
				step: 3,
				name: "Route Optimization",
				status: "pending",
				location: "Frankfurt",
				details: "Calculating optimal path...",
			},
			{
				step: 4,
				name: "PSP Authorization",
				status: "pending",
				location: "London",
				details: "Waiting for provider...",
			},
			{
				step: 5,
				name: "Bank Settlement",
				status: "pending",
				location: "New York",
				details: "Pending final settlement",
			},
		],
	});

	useEffect(() => {
		const fetchMap = async () => {
			// Check if this is a temporary client-side ID
			if (transactionId && transactionId.startsWith("tx_pending_")) {
				console.log("Using simulated map for pending transaction");
				isSimulated.current = true;
				setMapData(getSimulatedData());
				setLoading(false);
				startSimulation();
				return;
			}

			try {
				const response = await fetch(
					`http://localhost:3000/api/payment/map/${transactionId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("authToken")}`,
						},
					}
				);

				if (!response.ok) {
					// If 404, it might be because the transaction is still processing in the backend
					// and hasn't been committed to DB yet (if using async flow).
					// But for now, if it fails, we assume it's not ready.
					throw new Error("Failed to fetch transaction map");
				}

				const data = await response.json();
				isSimulated.current = false;
				setMapData(data);
				setVisibleNodeCount(
					data.geographicPath ? data.geographicPath.length : 4
				); // Show all for completed

				// If transaction is not completed, poll for updates
				if (
					data.overview &&
					data.overview.status !== "completed" &&
					data.overview.status !== "failed"
				) {
					setTimeout(fetchMap, 2000);
				}
			} catch (err) {
				// If fetch fails but we have a transaction ID, maybe fallback to simulation?
				// For now, just show error or loading
				console.error(err);
				// If it's a real ID but failed, maybe it's just created?
				// Let's not simulate for real IDs to avoid confusion.
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (transactionId) {
			fetchMap();
		}

		return () => {
			if (simulationTimer.current) clearInterval(simulationTimer.current);
		};
	}, [transactionId]);

	const startSimulation = () => {
		let seconds = 0;
		setVisibleNodeCount(1); // Start with Sender

		if (simulationTimer.current) clearInterval(simulationTimer.current);

		simulationTimer.current = setInterval(() => {
			seconds++;
			setSimulationProgress(seconds);

			setMapData((prev) => {
				if (!prev) return prev;
				const newSteps = [...prev.steps];

				// Timeline: 0-36s
				// 0s: Request Initiated (Done)
				// 0-10s: Fraud Detection
				if (seconds < 10) {
					newSteps[1].status = "in-progress";
					newSteps[1].details = `Analyzing risk patterns... (${Math.round(
						(seconds / 10) * 100
					)}%)`;
				} else if (seconds === 10) {
					newSteps[1].status = "completed";
					newSteps[1].details = "Security checks passed (Low Risk)";
					newSteps[2].status = "in-progress";
					setVisibleNodeCount(2); // Show Orchestrator
				}

				// 10-16s: Route Optimization
				else if (seconds < 16) {
					newSteps[2].status = "in-progress";
					newSteps[2].details = `Comparing PSP rates... (${Math.round(
						((seconds - 10) / 6) * 100
					)}%)`;
				} else if (seconds === 16) {
					newSteps[2].status = "completed";
					newSteps[2].details = "Optimal route selected: Stripe";
					newSteps[3].status = "in-progress";
					setVisibleNodeCount(3); // Show PSP
				}

				// 16-36s: PSP Authorization
				else if (seconds < 36) {
					newSteps[3].status = "in-progress";
					newSteps[3].details = `Processing payment with provider... (${Math.round(
						((seconds - 16) / 20) * 100
					)}%)`;
				} else if (seconds === 36) {
					newSteps[3].status = "completed";
					newSteps[3].details = "Authorization successful";
					newSteps[4].status = "in-progress";
					setVisibleNodeCount(4); // Show Recipient
				}

				// 36s+: Settlement
				else if (seconds > 36) {
					newSteps[4].status = "completed";
					newSteps[4].details = "Funds transferred";
					// Stop simulation? No, wait for real update.
				}

				return { ...prev, steps: newSteps };
			});
		}, 1000);
	};

	if (loading) {
		return (
			<div className="transaction-map-container">
				<div className="map-loading">Loading transaction map...</div>
			</div>
		);
	}

	if (error && !isSimulated.current) {
		return <div className="map-error">❌ {error}</div>;
	}

	if (!mapData) {
		return <div className="map-error">No map data available</div>;
	}

	return (
		<div className="transaction-map-container">
			<h3>📍 Real-Time Transaction Transparency Map</h3>

			{/* Overview Section */}
			{mapData.overview && (
				<div className="map-overview">
					<div className="overview-item">
						<span className="overview-label">Total Duration:</span>
						<span className="overview-value">
							{isSimulated.current
								? `${simulationProgress}s`
								: mapData.overview.totalDuration}
						</span>
					</div>
					<div className="overview-item">
						<span className="overview-label">Status:</span>
						<span
							className={`overview-value status-${mapData.overview.status}`}
						>
							{mapData.overview.status.toUpperCase()}
						</span>
					</div>
					<div className="overview-item full-width">
						<span className="overview-label">Path:</span>
						<span className="overview-value path">{mapData.overview.path}</span>
					</div>
				</div>
			)}

			{/* Geographic Path Visualization */}
			{mapData.geographicPath && (
				<div className="geographic-path">
					<h4>🌍 Geographic Route</h4>
					<div className="path-nodes">
						{mapData.geographicPath.map((node, index) => {
							// Only show nodes that are "visible" based on animation
							if (index >= visibleNodeCount) return null;

							return (
								<React.Fragment key={index}>
									<div className={`path-node ${node.type} fade-in`}>
										<div className="node-icon">
											{node.type === "origin" && "📱"}
											{node.type === "orchestrator" && "🏢"}
											{node.type === "psp" && "🏦"}
											{node.type === "destination" && "📥"}
										</div>
										<div className="node-info">
											<div className="node-title">{node.location}</div>
											<div className="node-location">
												{node.city}, {node.country}
											</div>
											<div className="node-ip">IP: {node.ip}</div>
										</div>
									</div>
									{index < visibleNodeCount - 1 && (
										<div className="path-arrow fade-in">→</div>
									)}
								</React.Fragment>
							);
						})}
					</div>
				</div>
			)}

			{/* Timeline Section */}
			<div className="map-timeline">
				<h4>⏱️ Transaction Timeline</h4>
				{mapData.steps.map((step, index) => {
					const getIcon = (stepName) => {
						const icons = {
							"Request Initiated": "🚀",
							"Fraud Detection": "🔍",
							"Route Optimization": "🎯",
							"PSP Authorization": "💳",
							"Bank Settlement": "🏦",
							"Confirmation Sent": "✅",
							// Legacy icons for backward compatibility
							"User Account": "👤",
							"Fraud Check": "🔍",
							"PSP Processing": "💳",
							"Bank Transfer": "🏦",
							"Recipient Account": "📥",
						};
						return icons[stepName] || "📍";
					};

					const getStatusColor = (status) => {
						switch (status) {
							case "completed":
								return "#27ae60";
							case "in-progress":
								return "#f39c12";
							case "pending":
								return "#bdc3c7";
							default:
								return "#7f8c8d";
						}
					};

					return (
						<div key={step.step} className="timeline-step">
							<div
								className="step-marker"
								style={{ borderColor: getStatusColor(step.status) }}
							>
								<span className="step-icon">{getIcon(step.name)}</span>
							</div>

							<div className="step-content">
								<div className="step-header">
									<h4 className="step-title">{step.name}</h4>
									{step.duration && (
										<span className="step-duration">{step.duration}</span>
									)}
								</div>
								<div
									className="step-status"
									style={{ color: getStatusColor(step.status) }}
								>
									{step.status === "completed" && "✅ Completed"}
									{step.status === "in-progress" && "⏳ In Progress"}
									{step.status === "pending" && "⌛ Pending"}
								</div>
								{step.timestamp && (
									<div className="step-time">
										{new Date(step.timestamp).toLocaleTimeString()}
									</div>
								)}
								{step.location && (
									<div className="step-location">📍 {step.location}</div>
								)}
								{step.details && (
									<div className="step-details">{step.details}</div>
								)}
							</div>

							{index < mapData.steps.length - 1 && (
								<div
									className="step-connector"
									style={{ backgroundColor: getStatusColor(step.status) }}
								></div>
							)}
						</div>
					);
				})}
			</div>

			<div className="map-legend">
				<div className="legend-item">
					<div
						className="legend-dot"
						style={{ backgroundColor: "#27ae60" }}
					></div>
					<span>Completed</span>
				</div>
				<div className="legend-item">
					<div
						className="legend-dot"
						style={{ backgroundColor: "#f39c12" }}
					></div>
					<span>In Progress</span>
				</div>
				<div className="legend-item">
					<div
						className="legend-dot"
						style={{ backgroundColor: "#bdc3c7" }}
					></div>
					<span>Pending</span>
				</div>
			</div>
		</div>
	);
}
