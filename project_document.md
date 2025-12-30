# PerfectPay Developer Documentation

## 1. Product Overview

[cite_start]**PerfectPay** is an intelligent payment orchestration platform designed to manage multiple payment service providers (PSPs) and user cards under a single unified API[cite: 4]. [cite_start]Unlike a traditional PSP, PerfectPay does not process payments directly but acts as a high-level orchestration layer that simulates transaction flows and optimizes them[cite: 5, 9].

[cite_start]The system solves the problem of fragmentation in modern finance by aggregating variable fees, speeds, exchange rates, and security risks into a single decision-making engine[cite: 7, 8].

---

## 2. System Architecture & Modules

The PerfectPay architecture is built on five core modules designed for modularity and scalability.

### 2.1 Optimization Engine (The Core)

[cite_start]The engine calculates a "Total Cost Score" for every transaction to determine the optimal route[cite: 18, 20].

- [cite_start]**Routing Logic:** The system evaluates every PSP + Card combination[cite: 18].
- [cite_start]**Scoring Formula:** `Score = PSP Fees + Card Fees + FX Costs + Latency + Risk Penalty`[cite: 21].
- [cite_start]**Selection Modes:** Users can prioritize "Cheap", "Fast", or "Balanced" routing[cite: 19].
- [cite_start]**Self-Healing:** If the selected PSP fails, the system automatically retries with the next best option[cite: 23].

### 2.2 Payment Plugin Store

[cite_start]A modular architecture where every PSP is treated as a "plugin"[cite: 51].

- [cite_start]**Supported Plugins:** Stripe, PayPal, Wise, Iyzico, Bank APIs, Mock PSP[cite: 14].
- [cite_start]**Management:** Admins can enable/disable plugins, update API keys, and adjust commission configurations without changing the codebase[cite: 50, 52].

### 2.3 Fraud Guard (Rule-Based Security)

[cite_start]A pre-processing security layer that assigns a risk score (0-100) before a transaction is attempted[cite: 25, 26].

- **Scoring System:**
  - [cite_start]0-30: Low Risk (Proceed) [cite: 27]
  - [cite_start]31-70: Medium Risk (Require verification) [cite: 27]
  - [cite_start]71-100: High Risk (Block transaction) [cite: 27]
- [cite_start]**Rules:** Includes checks for high frequency (>3 tx/min), IP location mismatches, and new account age (<2 days)[cite: 26].

**Implementation Details:**

- **Rule 1:** Rapid Transaction Detection (0-40 points) - Checks for multiple transactions within short time periods
- **Rule 2:** Unusual Amount (0-25 points) - Detects amounts significantly higher than user's average
- **Rule 3:** Geolocation Anomaly (0-30 points) - Identifies impossible travel scenarios and suspicious location changes
- **Rule 4:** Device Mismatch (0-20 points) - Flags unknown devices and IP combinations
- **Rule 5:** High-Risk Country Pair (0-15 points) - Identifies transactions between high-risk jurisdictions
- **Rule 6:** Card Velocity (0-20 points) - Monitors card usage frequency
- **Rule 7:** Time-of-Day Anomaly (0-10 points) - Detects unusual transaction timing patterns

**Actions Based on Score:**

# In backend terminal - Ctrl+C then:

cd backend
npm run dev
Stop the backend terminal (Ctrl+C)
cd backend
npm run dev

- **0-30 (LOW):** `APPROVE` - Transaction proceeds automatically
- **31-70 (MEDIUM):** `VERIFY` - Additional verification required (2FA/OTP)
- **71-100 (HIGH):** `DECLINE` - Transaction blocked immediately

The fraud detection engine is automatically invoked for all payment requests before PSP selection.

### 2.4 Geo-Smart & FX Routing

- [cite_start]**FX Routing:** Automatically selects the cheapest path for currency conversion (e.g., using Wise for TR → US transactions)[cite: 31, 33].
- [cite_start]**Geo-Routing:** Prioritizes PSPs based on regional performance (e.g., prioritizing PayPal for EU → UK flows)[cite: 33, 47].

### 2.5 Real-Time Transparency Map

[cite_start]A visual tool that traces the backend flow of a transaction on a map[cite: 55].

- [cite_start]**Visualization:** Shows the path from User IP → PerfectPay Server → PSP Server[cite: 55, 57].
- [cite_start]**Metrics:** Displays the duration of every step and success/failure status[cite: 55].

---

## 3. API Reference

### Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://api.perfectpay.io/api`

> **Note:** All endpoints are prefixed with `/api`. For example, the payments endpoint is accessed at `/api/payments` or `/api/payment` depending on the operation.

### 3.1 Transactions

#### Create Payment

**POST** `/api/payments`  
Initiates a new payment orchestration. [cite_start]The system calculates the optimization matrix in real-time[cite: 18].

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "amount": 150.00,
  "currency": "USD",
  "source_currency": "TRY",
  "user_id": "usr_8821",
  "card_id": "card_9912",
  [cite_start]"preference": "cheap", // Options: cheap, fast, balanced [cite: 19]
  "location_country": "TR"
}
```

**Response:**

```json
{
	"transaction_id": "tx_7712a",
	"status": "success",
	"routed_via": "Wise",
	"optimization_details": {
		"selected_mode": "cheap",
		"savings": "3.40 USD",
		"fx_rate_applied": 34.12
	},
	"fraud_score": 10
}
```

#### Alternative P2P Transfer Endpoint

**POST** `/api/payment/transfer`  
Alternative endpoint for peer-to-peer money transfers with detailed recipient information.

**Request Body:**

```json
{
	"recipientId": "usr_9921",
	"recipientName": "John Doe",
	"recipientEmail": "john@example.com",
	"amount": 1000.0,
	"fromCurrency": "TRY",
	"toCurrency": "USD",
	"senderCountry": "TR",
	"recipientCountry": "US",
	"userMode": "balanced",
	"description": "Payment for services"
}
```

**Response:**

```json
{
	"success": true,
	"status": "COMPLETED",
	"transactionId": "tx_7712a",
	"selectedPSP": "Wise",
	"amount": 1000,
	"exchangeRate": 34.12,
	"costs": {
		"commission": 15.0,
		"fxCost": 5.0,
		"totalCost": 20.0
	},
	"riskAssessment": {
		"riskScore": 10,
		"riskLevel": "LOW",
		"action": "APPROVE"
	}
}
```

#### Get Smart Receipt

**GET** `/api/payments/{id}/receipt`  
**Alternative:** **GET** `/api/payment/receipt/{transactionId}`  
Retrieves a detailed analysis report instead of a standard receipt.

**Response includes:**

- Selected PSP and Card.

- Simulated Total Cost.

- Alternative PSPs and why they were rejected (e.g., "Stripe was $2 more expensive").

- Link to Transparency Map view.

---

### 3.2 Analytics

#### Get Performance Metrics

**GET** `/api/analytics/performance`  
Fetches real-time performance data for the admin dashboard as documented.

**Response:**

```json
{
	"stripe": {
		"success_rate": 99.0,
		"avg_latency": "320ms"
	},
	"wise": {
		"success_rate": 95.0,
		"avg_latency": "410ms"
	},
	"paypal": {
		"success_rate": 92.0,
		"avg_latency": "550ms"
	},
	"iyzico": {
		"success_rate": 96.5,
		"avg_latency": "380ms"
	}
}
```

#### Get All PSP Analytics

**GET** `/api/analytics/`  
Returns comprehensive analytics including overall statistics and detailed PSP performance metrics.

**Response:**

```json
{
	"userId": "usr_123",
	"overallStats": {
		"activePSPs": 4,
		"totalPSPs": 4,
		"avgSuccessRate": 97.8,
		"totalTransactions": 215,
		"totalVolume": "$71,000"
	},
	"pspPerformance": [
		{
			"pspName": "Stripe",
			"successRate": 98.5,
			"totalTransactions": 45,
			"totalVolume": "$12,500"
		}
	]
}
```

#### Get Specific PSP Metrics

**GET** `/api/analytics/psp/{pspName}`  
Returns detailed metrics for a specific payment service provider.

---

## 4. Frontend Guidelines

### Dashboard Design

- **Style:** Clean, data-centric interface similar to Checkout.com.
- **Performance Monitor:** Displays live graphs of PSP latency and success rates (e.g., Stripe: 99% success vs PayPal: 92%).

### Smart Receipt UI

- **Concept:** A digital report card.
- **Components:**
- **Cost Breakdown:** Shows the "Total Cost Score" components (Fees + FX + Risk).

- **Timeline:** A chronological list of steps (Start → Routing → PSP → Finish).

- **Map Integration:** An embedded view of the Transaction Transparency Map.

---

## 5. Software Requirements Summary

| ID        | Feature     | Requirement Description                                                                                    | Source |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| **REQ-1** | **Routing** | The system must calculate a "Total Cost Score" for every transaction based on fees, FX, latency, and risk. |

| |
| **REQ-2** | **Resilience** | The system must implement "Self-Healing Routing" to automatically switch to a backup PSP if the primary fails.

| |
| **REQ-3** | **Security** | The system must block transactions with a Fraud Score between 71-100.

| |
| **REQ-4** | **Extensibility** | New PSPs must be addable as plugins via configuration (JSON) without altering the source code.

| |
| **REQ-5** | **Visualization** | The system must provide a "Transparency Map" showing the geographical path of the transaction data.

| |
| **REQ-6** | **Reporting** | The system must generate a "Smart Receipt" analyzing the cost/performance of the chosen route versus alternatives.

| |

---

## 6. Implementation Status & Technical Notes

### Implemented Features

✅ **Optimization Engine (REQ-1)**

- Total Cost Score calculation implemented in `OptimalRoutingEngine.js`
- Supports three modes: cheap, fast, balanced
- Evaluates PSP fees, FX costs, latency, and risk penalties
- Geo-Smart routing with country-specific optimizations

✅ **Self-Healing Routing (REQ-2)**

- Alternative PSP selection implemented
- Automatic fallback to next best option on failure
- Transaction retry logic in place

✅ **Fraud Detection & Blocking (REQ-3)**

- 7-rule fraud detection system in `FraudDetectionEngine.js`
- Automatic blocking for scores 71-100 implemented
- Risk assessment runs before every transaction
- Returns detailed breakdown of risk factors

✅ **Plugin Architecture (REQ-4)**

- PSP Plugin Store implemented in `PSPPluginStore.js`
- Supports: Stripe, PayPal, Wise, İyzico
- Enable/disable PSPs without code changes
- Modular design for easy PSP additions

✅ **Transparency Map (REQ-5)**

- Transaction map endpoint implemented: `GET /api/payment/map/:transactionId`
- Returns step-by-step transaction flow
- Frontend component available in `TransactionMap.jsx`

✅ **Smart Receipt (REQ-6)**

- Endpoint: `GET /api/payments/:id/receipt` or `GET /api/payment/receipt/:transactionId`
- Shows cost breakdown and alternative comparisons
- Includes estimated savings calculation

### API Endpoints Summary

| Method | Endpoint                              | Purpose                           | Status         |
| ------ | ------------------------------------- | --------------------------------- | -------------- |
| POST   | `/api/payments`                       | Create payment with orchestration | ✅ Implemented |
| POST   | `/api/payment/transfer`               | P2P money transfer                | ✅ Implemented |
| GET    | `/api/payments/:id/receipt`           | Get smart receipt                 | ✅ Implemented |
| GET    | `/api/payment/receipt/:transactionId` | Get smart receipt (legacy)        | ✅ Implemented |
| GET    | `/api/payment/map/:transactionId`     | Get transaction transparency map  | ✅ Implemented |
| GET    | `/api/analytics/performance`          | Get PSP performance metrics       | ✅ Implemented |
| GET    | `/api/analytics/`                     | Get all analytics                 | ✅ Implemented |
| GET    | `/api/analytics/psp/:pspName`         | Get specific PSP metrics          | ✅ Implemented |
| GET    | `/api/payment/psps`                   | List available PSPs               | ✅ Implemented |
| POST   | `/api/payment/estimate-route`         | Estimate optimal route            | ✅ Implemented |

### Configuration

**Environment Variables Required:**

```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
STRIPE_API_KEY=sk_...
PAYPAL_CLIENT_ID=...
WISE_API_KEY=...
IYZICO_API_KEY=...
```

**Frontend Configuration:**

```env
VITE_API_URL=http://localhost:3000/api
```

### Database Schema

See `database/` folder for complete schema including:

- Users table with authentication
- Transactions table with PSP routing info
- Cards table for payment methods
- Analytics tracking tables

### Testing

- All PSP integrations include mock implementations for testing
- Fraud detection engine can be tested with various scenarios
- Route optimization can be simulated without actual PSP calls

---

## 7. Future Enhancements

- Real-time PSP health monitoring
- Machine learning-based fraud detection
- Multi-currency wallet support
- Advanced reporting dashboard
- WebSocket support for real-time transaction updates
- Mobile SDK for iOS and Android

```

```

```

```
