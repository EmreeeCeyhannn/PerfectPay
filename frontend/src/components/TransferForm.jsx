import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { paymentService } from "../services/paymentService";
import TransactionMap from "./TransactionMap";
import apiClient from "../services/api";
import "./TransferForm.css";

export default function TransferForm({ onSuccess }) {
	const { user, logout } = useAuth();
	const [loading, setLoading] = useState(false);
	const [selectedRoute, setSelectedRoute] = useState(null);
	const [selectedPSP, setSelectedPSP] = useState(null); // Manuel seçilen PSP
	const [step, setStep] = useState("form"); // 'form', 'estimate', 'confirm', 'processing', 'complete'
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [transactionId, setTransactionId] = useState(null);
	const [cards, setCards] = useState([]);
	const [selectedCard, setSelectedCard] = useState("");

	const [formData, setFormData] = useState({
		recipientName: "",
		recipientEmail: "",
		recipientCountry: "US",
		recipientBankAccount: "",
		amount: "",
		fromCurrency: "TRY",
		toCurrency: "USD",
		senderCountry: "TR",
		userMode: "balanced",
		description: "",
	});

	const currencies = ["TRY", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];
	const countries = [
		"TR",
		"US",
		"GB",
		"DE",
		"FR",
		"IT",
		"ES",
		"CA",
		"AU",
		"JP",
	];
	const modes = [
		{ value: "cheap", label: "💰 Cheapest Route" },
		{ value: "fast", label: "⚡ Fastest Route" },
		{ value: "balanced", label: "⚖️ Balanced" },
	];

	// Fetch user's saved cards on component mount
	useEffect(() => {
		const fetchCards = async () => {
			try {
				const response = await apiClient.get("/user/cards");
				setCards(response.data.cards || []);
				// Auto-select primary card if available
				const primaryCard = response.data.cards?.find(
					(card) => card.is_primary
				);
				if (primaryCard) {
					setSelectedCard(primaryCard.card_token);
				}
			} catch (err) {
				console.error("Failed to fetch cards:", err);
			}
		};
		fetchCards();
	}, []);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setError("");
	};

	const estimateRoute = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validation
		if (!formData.recipientName || formData.recipientName.trim() === "") {
			setError("❌ Please enter recipient name");
			setLoading(false);
			return;
		}

		if (!formData.recipientEmail || formData.recipientEmail.trim() === "") {
			setError("❌ Please enter recipient email");
			setLoading(false);
			return;
		}

		if (!formData.amount || parseFloat(formData.amount) <= 0) {
			setError("❌ Please enter a valid amount");
			setLoading(false);
			return;
		}

		try {
			const data = await paymentService.estimateRoute({
				amount: parseFloat(formData.amount),
				fromCurrency: formData.fromCurrency,
				toCurrency: formData.toCurrency,
				senderCountry: formData.senderCountry,
				recipientCountry: formData.recipientCountry,
				userMode: formData.userMode,
			});
			setSelectedRoute(data);
			setStep("estimate");
		} catch (err) {
			setError(`❌ ${err.response?.data?.error || err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const proceedToTransfer = async () => {
		setLoading(true);
		setError("");

		// Validate card selection
		if (!selectedCard) {
			setError("❌ Please select a payment card");
			setLoading(false);
			return;
		}

		try {
			const transferData = {
				recipientId: Math.random().toString(36),
				recipientName: formData.recipientName,
				recipientEmail: formData.recipientEmail,
				amount: parseFloat(formData.amount),
				fromCurrency: formData.fromCurrency,
				toCurrency: formData.toCurrency,
				senderCountry: formData.senderCountry,
				recipientCountry: formData.recipientCountry,
				senderBankAccount:
					user?.bankAccount || "TR89 0000 0000 0000 0000 0000 00",
				recipientBankAccount: formData.recipientBankAccount,
				userMode: formData.userMode,
				description: formData.description,
				cardToken: selectedCard, // Include selected card token
			};

			// Add selected PSP if user manually chose one
			if (selectedPSP) {
				transferData.preferredProvider = selectedPSP;
			}

			// Start processing in background - show map immediately
			const processingPromise = paymentService.transferMoney(transferData);

			// Generate temporary transaction ID and show live map immediately
			const tempTxId = `tx_pending_${Date.now()}`;
			setTransactionId(tempTxId);
			setStep("processing"); // This will now show the live map
			setLoading(false);

			// Wait for completion in background
			const result = await processingPromise;

			// Check if transaction was declined by fraud detection
			if (result.status === "DECLINED") {
				const fraudScore = result.riskAssessment?.riskScore || 0;
				const reason =
					result.reason ||
					result.riskAssessment?.recommendation ||
					"Security concerns detected";

				setLoading(false);
				setError(
					`🚨 TRANSACTION BLOCKED - Account Suspended\n\n` +
						`Fraud Risk Score: ${fraudScore}/100\n` +
						`Reason: ${reason}\n\n` +
						`${result.riskAssessment?.violations?.join("\n") || ""}\n\n` +
						`For security reasons, you will be logged out automatically.\n` +
						`Please contact support if you believe this is an error.`
				);
				setStep("form");

				// Otomatik logout - 3 saniye sonra
				setTimeout(() => {
					logout();
				}, 3000);

				return;
			}

			// Update with real transaction ID when complete
			setTransactionId(result.transactionId);
			setSuccess(
				`✅ Transfer successful! Transaction ID: ${result.transactionId}\n` +
					`Fraud Score: ${result.riskAssessment?.riskScore || 0}/100 (${
						result.riskAssessment?.riskLevel || "LOW"
					})`
			);
			setStep("complete"); // Show the completed map with success message
		} catch (err) {
			console.error("Transfer error details:", err);
			const errorData = err.response?.data;

			// Handle fraud detection decline from API error response
			if (errorData?.status === "DECLINED" || err.response?.status === 403) {
				const fraudScore = errorData?.riskAssessment?.riskScore || 0;
				setLoading(false);
				setError(
					`🚨 TRANSACTION BLOCKED - Account Suspended\n\n` +
						`Risk Score: ${fraudScore}/100\n` +
						`Reason: ${
							errorData?.reason ||
							errorData?.riskAssessment?.recommendation ||
							"High fraud risk detected"
						}\n\n` +
						`Violations detected:\n${
							errorData?.riskAssessment?.violations?.join("\n") ||
							"Multiple security concerns"
						}\n\n` +
						`For security reasons, you will be logged out automatically.\n` +
						`Please contact support if you believe this is an error.`
				);
				setStep("form");

				// Otomatik logout - 3 saniye sonra
				setTimeout(() => {
					logout();
				}, 3000);

				return;
			} else {
				setError(`❌ Transfer Failed: ${errorData?.error || err.message}`);
			}
			setStep("confirm");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			recipientName: "",
			recipientEmail: "",
			recipientCountry: "US",
			recipientBankAccount: "",
			amount: "",
			fromCurrency: "TRY",
			toCurrency: "USD",
			senderCountry: "TR",
			userMode: "balanced",
			description: "",
		});
		setStep("form");
		setSelectedRoute(null);
		setSelectedPSP(null);
	};

	// Step 1: Form
	if (step === "form") {
		return (
			<div className="transfer-container">
				<h2>💸 Send Money Globally</h2>

				<form onSubmit={estimateRoute}>
					<div className="form-section">
						<h3>📤 Sender Information</h3>
						<input
							type="text"
							disabled
							value={user?.name || "Your Account"}
							className="form-input readonly"
						/>
						<select
							name="senderCountry"
							value={formData.senderCountry}
							onChange={handleInputChange}
							className="form-input"
						>
							<option value="">Select Your Country</option>
							{countries.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="form-section">
						<h3>📥 Recipient Information</h3>
						<input
							type="text"
							name="recipientName"
							placeholder="Recipient Full Name"
							value={formData.recipientName}
							onChange={handleInputChange}
							required
							className="form-input"
						/>
						<input
							type="email"
							name="recipientEmail"
							placeholder="Recipient Email"
							value={formData.recipientEmail}
							onChange={handleInputChange}
							required
							className="form-input"
						/>
						<select
							name="recipientCountry"
							value={formData.recipientCountry}
							onChange={handleInputChange}
							className="form-input"
							required
						>
							<option value="">Select Recipient Country</option>
							{countries.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
						<input
							type="text"
							name="recipientBankAccount"
							placeholder="Recipient Bank Account / IBAN"
							value={formData.recipientBankAccount}
							onChange={handleInputChange}
							required
							className="form-input"
						/>
					</div>

					<div className="form-section">
						<h3>�💰 Amount & Currency</h3>
						<div className="amount-row">
							<input
								type="number"
								name="amount"
								placeholder="0.00"
								value={formData.amount}
								onChange={handleInputChange}
								required
								min="0.01"
								step="0.01"
								className="form-input"
							/>
							<select
								name="fromCurrency"
								value={formData.fromCurrency}
								onChange={handleInputChange}
								className="form-select-small"
							>
								{currencies.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>

						<div className="currency-arrow">→</div>

						<div className="amount-row">
							<select
								name="toCurrency"
								value={formData.toCurrency}
								onChange={handleInputChange}
								className="form-select-small"
							>
								{currencies.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="form-section">
						<h3>⚙️ Transfer Mode</h3>
						<div className="mode-selector">
							{modes.map((mode) => (
								<label key={mode.value} className="mode-option">
									<input
										type="radio"
										name="userMode"
										value={mode.value}
										checked={formData.userMode === mode.value}
										onChange={handleInputChange}
									/>
									<span>{mode.label}</span>
								</label>
							))}
						</div>
					</div>

					<div className="form-section">
						<h3>📝 Description (Optional)</h3>
						<textarea
							name="description"
							placeholder="Add a note about this transfer..."
							value={formData.description}
							onChange={handleInputChange}
							className="form-textarea"
							rows="3"
						/>
					</div>

					{error && (
						<div
							className={
								error.includes("BLOCKED")
									? "error-box critical-error"
									: "error-box"
							}
						>
							{error}
							{error.includes("BLOCKED") && (
								<div
									style={{
										marginTop: "15px",
										fontSize: "13px",
										fontWeight: "bold",
									}}
								>
									⏳ Logging out in 3 seconds for security...
								</div>
							)}
						</div>
					)}

					<button
						type="submit"
						disabled={loading || !formData.recipientName || !formData.amount}
						className="submit-button"
					>
						{loading ? "⏳ Calculating..." : "🔍 Calculate Best Route"}
					</button>
				</form>
			</div>
		);
	}

	// Step 2: Route Estimate
	if (step === "estimate" && selectedRoute) {
		// Seçilen PSP'yi belirle (manuel seçim varsa onu, yoksa optimal)
		const currentPSP = selectedPSP || selectedRoute?.estimatedRoute.pspName;
		const currentRoute = selectedPSP
			? selectedRoute?.alternatives.find((alt) => alt.pspName === selectedPSP)
			: selectedRoute?.estimatedRoute;

		// Dinamik işlem süresi hesaplama (realistic seconds/minutes)
		const calculateEstimatedTime = () => {
			const amount = parseFloat(formData.amount);
			const isInternational =
				formData.senderCountry !== formData.recipientCountry;

			// PSP processing time in seconds
			const pspProcessingTimes = {
				Wise: 20, // 20-40 seconds
				Stripe: 30, // 30-60 seconds
				PayPal: 35, // 35-70 seconds
				İyzico: 25, // 25-50 seconds
			};

			let baseSeconds = pspProcessingTimes[currentPSP] || 30;

			// Add fraud detection time (5-15 seconds)
			baseSeconds += 10;

			// Add routing optimization time (2-5 seconds)
			baseSeconds += 3;

			// International transfers take slightly longer
			if (isInternational) baseSeconds += 10;

			// Large amounts take longer (additional verification)
			if (amount > 10000) baseSeconds += 20;
			else if (amount > 5000) baseSeconds += 10;
			else if (amount > 1000) baseSeconds += 5;

			// Add randomness (±50%)
			const randomFactor = 0.5 + Math.random();
			const totalSeconds = Math.round(baseSeconds * randomFactor);

			if (totalSeconds < 60) return `${totalSeconds} seconds`;
			const minutes = Math.round(totalSeconds / 60);
			if (minutes === 1) return "1 minute";
			return `${minutes} minutes`;
		};

		const estimatedTime = calculateEstimatedTime();
		const displayRoute = currentRoute || selectedRoute?.estimatedRoute;

		return (
			<div className="transfer-container">
				<h2>🎯 Optimal Route Selected</h2>

				<p
					style={{
						fontSize: "13px",
						color: "#555",
						marginBottom: "20px",
						textAlign: "center",
					}}
				>
					💡 We analyzed all providers and selected the best option. You can
					also choose an alternative below.
				</p>

				<div className="route-card selected">
					<div className="route-header">
						<h3>✅ {selectedPSP ? "Your Selection" : "Best Route"}</h3>
						<span className="route-badge selected">
							{selectedPSP ? "Selected" : "Recommended"}
						</span>
					</div>

					<div className="route-detail">
						<div className="detail-item">
							<span className="label">Provider:</span>
							<span className="value psp-name">{currentPSP}</span>
						</div>
						<div className="detail-item">
							<span className="label">Recommendation:</span>
							<span className="value recommendation">
								{displayRoute.recommendation}
							</span>
						</div>
						<div className="detail-item">
							<span className="label">Estimated Time:</span>
							<span
								className="value"
								style={{ color: "#27ae60", fontWeight: "600" }}
							>
								⏱️ {estimatedTime}
							</span>
						</div>
					</div>

					<div className="costs-breakdown">
						<h4>💵 Cost Breakdown</h4>
						<div className="cost-row">
							<span>Base Amount:</span>
							<span>
								{formData.amount} {formData.fromCurrency}
							</span>
						</div>
						<div className="cost-row">
							<span>Exchange Rate:</span>
							<span>
								1 {formData.fromCurrency} ={" "}
								{displayRoute.exchangeRate.toFixed(4)} {formData.toCurrency}
							</span>
						</div>
						<div className="cost-row">
							<span>Provider Fee:</span>
							<span>-${displayRoute.breakdown.commission.toFixed(2)}</span>
						</div>
						<div className="cost-row">
							<span>FX Cost:</span>
							<span>-${displayRoute.breakdown.fxCost.toFixed(2)}</span>
						</div>
						<div className="cost-row total">
							<span>Total Cost:</span>
							<span>${displayRoute.breakdown.totalScore.toFixed(2)}</span>
						</div>
					</div>
				</div>

				{selectedRoute?.alternatives &&
					selectedRoute.alternatives.length > 0 && (
						<div className="alternatives">
							<h3>
								🔄 {selectedPSP ? "All Available Routes" : "Alternative Routes"}{" "}
								(Click to Select)
							</h3>
							<p
								style={{
									fontSize: "12px",
									color: "#666",
									marginBottom: "10px",
								}}
							>
								💡 Lower scores mean better optimization (cheaper/faster).
								Negative scores indicate cost savings.
							</p>

							{/* Optimal route'u göster eğer kullanıcı alternatif seçtiyse */}
							{selectedPSP && (
								<div
									className={`route-card alternative clickable ${
										!selectedPSP ? "alternative-selected" : ""
									}`}
									onClick={() => {
										setSelectedPSP(null);
									}}
									style={{ cursor: "pointer" }}
								>
									<div className="route-header">
										<h4>{selectedRoute.estimatedRoute.pspName}</h4>
										<span
											className="cost-diff"
											style={{ background: "#d4edda", color: "#155724" }}
										>
											✨ Best Option
										</span>
									</div>
									<p>
										Optimization Score:{" "}
										{selectedRoute.estimatedRoute.expectedScore >= 0 ? "+" : ""}
										{selectedRoute.estimatedRoute.expectedScore.toFixed(2)}
										{selectedRoute.estimatedRoute.expectedScore < 0 &&
											" (cheaper than baseline)"}
									</p>
								</div>
							)}

							{selectedRoute.alternatives.slice(0, 2).map((alt, idx) => (
								<div
									key={idx}
									className={`route-card alternative clickable ${
										selectedPSP === alt.pspName ? "alternative-selected" : ""
									}`}
									onClick={() => {
										setSelectedPSP(alt.pspName);
									}}
									style={{ cursor: "pointer" }}
								>
									<div className="route-header">
										<h4>{alt.pspName}</h4>
										<span className="cost-diff">
											+${Math.abs(parseFloat(alt.costDifference)).toFixed(2)}{" "}
											more expensive
										</span>
									</div>
									<p>
										Optimization Score: {alt.weightedScore >= 0 ? "+" : ""}
										{alt.weightedScore.toFixed(2)}
										{alt.weightedScore < 0 && " (cheaper than baseline)"}
									</p>
								</div>
							))}
						</div>
					)}

				<div className="action-buttons">
					<button onClick={() => setStep("form")} className="button-secondary">
						← Back
					</button>
					<button
						onClick={() => {
							setStep("confirm");
						}}
						className="button-primary"
					>
						Confirm & Continue →
					</button>
				</div>
			</div>
		);
	}

	// Step 3: Confirmation
	if (step === "confirm") {
		// Seçilen PSP'yi belirle (manuel seçim varsa onu, yoksa optimal)
		const currentPSP = selectedPSP || selectedRoute?.estimatedRoute.pspName;
		const currentRoute = selectedPSP
			? selectedRoute?.alternatives.find((alt) => alt.pspName === selectedPSP)
			: selectedRoute?.estimatedRoute;

		// Filter cards by selected PSP provider
		const pspCards = cards.filter((card) => {
			const cardBrand = card.card_brand.toLowerCase();
			const psp = currentPSP.toLowerCase();

			// Match card brands to PSPs
			if (
				psp === "stripe" &&
				(cardBrand === "visa" || cardBrand === "mastercard")
			)
				return true;
			if (
				psp === "wise" &&
				(cardBrand === "visa" || cardBrand === "mastercard")
			)
				return true;
			if (psp === "paypal" && cardBrand === "amex") return true;
			if (psp === "iyzico" && cardBrand === "mastercard") return true;
			if (psp === "İyzico" && cardBrand === "mastercard") return true;
			return false;
		});

		// Auto-select first available card for this PSP
		if (pspCards.length > 0 && !selectedCard) {
			setSelectedCard(pspCards[0].card_token);
		}

		// Dinamik işlem süresi hesaplama (realistic seconds/minutes)
		const calculateEstimatedTime = () => {
			const amount = parseFloat(formData.amount);
			const isInternational =
				formData.senderCountry !== formData.recipientCountry;

			// PSP processing time in seconds
			const pspProcessingTimes = {
				Wise: 20,
				Stripe: 30,
				PayPal: 35,
				İyzico: 25,
			};

			let baseSeconds = pspProcessingTimes[currentPSP] || 30;
			baseSeconds += 10; // Fraud detection
			baseSeconds += 3; // Routing
			if (isInternational) baseSeconds += 10;

			if (amount > 10000) baseSeconds += 20;
			else if (amount > 5000) baseSeconds += 10;
			else if (amount > 1000) baseSeconds += 5;

			const randomFactor = 0.5 + Math.random();
			const totalSeconds = Math.round(baseSeconds * randomFactor);

			if (totalSeconds < 60) return `${totalSeconds} seconds`;
			const minutes = Math.round(totalSeconds / 60);
			if (minutes === 1) return "1 minute";
			return `${minutes} minutes`;
		};

		const estimatedTime = calculateEstimatedTime();

		const totalCost =
			currentRoute?.breakdown?.totalScore || currentRoute?.expectedScore || 0;

		return (
			<div className="transfer-container">
				<h2>🔐 Confirm Transfer</h2>

				{selectedPSP && (
					<div
						style={{
							background: "#fff3cd",
							padding: "10px",
							borderRadius: "8px",
							marginBottom: "15px",
							fontSize: "13px",
						}}
					>
						⚠️ You selected an alternative payment provider:{" "}
						<strong>{selectedPSP}</strong>
					</div>
				)}

				<div className="confirmation-box">
					<div className="confirm-row">
						<span>From:</span>
						<span className="highlight">{user?.name || "Your Account"}</span>
					</div>
					<div className="confirm-row">
						<span>To:</span>
						<span className="highlight">{formData.recipientName}</span>
					</div>
					<div className="confirm-row">
						<span>Amount:</span>
						<span className="highlight">
							{formData.amount} {formData.fromCurrency}
						</span>
					</div>
					<div className="confirm-row">
						<span>Route:</span>
						<span className="highlight">{currentPSP}</span>
					</div>
					<div className="confirm-row">
						<span>Payment Card:</span>
						<span className="highlight">
							{pspCards.length > 0 ? (
								<select
									value={selectedCard}
									onChange={(e) => setSelectedCard(e.target.value)}
									style={{
										padding: "8px",
										borderRadius: "4px",
										border: "1px solid #ddd",
										fontSize: "14px",
										cursor: "pointer",
									}}
								>
									{pspCards.map((card) => (
										<option key={card.card_token} value={card.card_token}>
											{card.card_brand.toUpperCase()} •••• {card.last_four}
											{card.is_primary ? " (Primary)" : ""}
										</option>
									))}
								</select>
							) : (
								<span style={{ color: "#dc3545" }}>
									No cards available for {currentPSP}
								</span>
							)}
						</span>
					</div>
					<div className="confirm-row">
						<span>Estimated Time:</span>
						<span className="highlight">{estimatedTime}</span>
					</div>
					<div className="confirm-row">
						<span>Total Cost:</span>
						<span className="highlight danger">${totalCost.toFixed(2)}</span>
					</div>
				</div>

				{error && <div className="error-box">{error}</div>}

				<div className="action-buttons">
					<button
						onClick={() => setStep("estimate")}
						className="button-secondary"
					>
						← Back
					</button>
					<button
						onClick={proceedToTransfer}
						disabled={loading}
						className="button-primary danger"
					>
						{loading ? "⏳ Processing..." : "✅ Confirm Transfer"}
					</button>
				</div>
			</div>
		);
	}

	// Step 4: Processing - Show Live Transaction Map
	if (step === "processing") {
		return (
			<div className="transfer-container">
				<h2>📍 Live Transaction Tracking</h2>

				{/* Show Real-Time Transaction Transparency Map */}
				{transactionId && <TransactionMap transactionId={transactionId} />}

				{success && (
					<div className="success-box" style={{ marginTop: "20px" }}>
						<div className="success-icon">✅</div>
						<h3>Transfer Completed!</h3>
						<p className="success-message">{success}</p>
					</div>
				)}

				<div style={{ marginTop: "20px", textAlign: "center" }}>
					<button onClick={resetForm} className="button-primary">
						New Transfer
					</button>
				</div>
			</div>
		);
	}

	// Step 5: Complete - Show Transaction Map
	if (step === "complete") {
		return (
			<div className="transfer-container">
				<h2>📍 Live Transaction Tracking</h2>

				{/* Show Real-Time Transaction Transparency Map */}
				{transactionId && <TransactionMap transactionId={transactionId} />}

				<div className="success-box" style={{ marginTop: "20px" }}>
					<div className="success-icon">✅</div>
					<h3>Transfer Completed!</h3>
					<p className="success-message">{success}</p>
				</div>

				<div style={{ marginTop: "20px", textAlign: "center" }}>
					<button onClick={resetForm} className="button-primary">
						New Transfer
					</button>
				</div>
			</div>
		);
	}
}
