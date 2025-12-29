# PerfectPay - Smart Payment Orchestration System

<div align="center">

![PerfectPay](https://img.shields.io/badge/PerfectPay-Payment%20System-667eea?style=for-the-badge&logo=stripe&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**A comprehensive payment orchestration platform that optimizes transactions across multiple PSPs (Payment Service Providers)**

[Features](#features) • [Quick Start](#quick-start) • [API Documentation](#api-endpoints) • [Architecture](#architecture)

</div>

---

## 📋 Overview

PerfectPay is a full-stack payment orchestration system designed to:

- Route payments through optimal PSPs (Stripe, Wise, PayPal, Iyzico)
- Detect and prevent fraud using a 7-rule engine
- Optimize transaction costs based on user preferences
- Provide real-time transaction transparency maps
- Generate smart receipts with cost breakdowns
- Support multi-card payment splitting

## ✨ Features

### 🔐 Security & Compliance

- **JWT Authentication** - Secure token-based auth
- **KYC/AML Integration** - Blacklist management
- **Fraud Detection Engine** - 7 security rules with risk scoring
- **Audit Logging** - Complete transaction audit trail

### 💳 Payment Processing

- **Multi-PSP Support** - Stripe, Wise, PayPal, Iyzico
- **Smart Routing** - Cost-optimized PSP selection
- **Multi-Card Optimization** - Split payments across cards
- **Real-time FX Rates** - Dynamic currency conversion

### 📊 Analytics & Transparency

- **Transaction Map** - Geographic flow visualization
- **PSP Performance Analytics** - Success rates, latency
- **Admin Dashboard** - Charts and statistics
- **Smart Receipts** - HTML receipt generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/perfectpay.git
cd perfectpay

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start backend server
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` in backend folder:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/perfectpay
JWT_SECRET=your-secret-key
STRIPE_API_KEY=sk_test_...
WISE_API_KEY=your-wise-key
PAYPAL_API_KEY=your-paypal-key
IYZICO_API_KEY=your-iyzico-key
```

## 📁 Project Structure

```
perfectpay/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   │   ├── PaymentOrchestrationService.js
│   │   │   ├── ReceiptGenerator.js
│   │   │   └── MultiCardOptimizer.js
│   │   ├── fraud/           # Fraud detection engine
│   │   ├── psp/             # PSP integrations
│   │   ├── routing/         # Optimal routing engine
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── models/          # Database models
│   ├── receipts/            # Generated receipts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── styles/          # CSS files
│   └── package.json
└── database/
    └── migrations/          # SQL migrations
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login and get token |

### Payments

| Method | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| POST   | `/api/payments`                    | Create payment             |
| POST   | `/api/payments/transfer`           | P2P money transfer         |
| GET    | `/api/payments/receipt/:id`        | Get smart receipt          |
| GET    | `/api/payments/map/:id`            | Get transaction map        |
| POST   | `/api/payments/multi-card/analyze` | Analyze multi-card options |
| POST   | `/api/payments/estimate-route`     | Estimate optimal route     |
| GET    | `/api/payments/psps`               | List available PSPs        |

### Admin

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| GET    | `/api/admin/dashboard`    | Dashboard statistics  |
| GET    | `/api/admin/users`        | List all users        |
| GET    | `/api/admin/transactions` | List all transactions |

## 🏗️ Architecture

```mermaid
graph TD
    A[Client App] --> B[API Gateway]
    B --> C[Auth Middleware]
    C --> D[Payment Controller]
    D --> E[Fraud Detection Engine]
    E --> F[Routing Engine]
    F --> G{PSP Selection}
    G --> H[Stripe]
    G --> I[Wise]
    G --> J[PayPal]
    G --> K[Iyzico]
    D --> L[Receipt Generator]
    D --> M[Transaction Map]
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Individual test files
node test-receipt-generation.js
node test-multi-card.js
node test-fraud-detection.js
```

## 👥 Team

- **Emre Ceyhan** (21118080034) - Scrum Master, Backend Lead
- **Kıvanç Avcı** (22118080038) - Frontend Lead
- **Necmettin Sönmez** (22118080037) - Database & UI Components
- **Yaren Dönmez** (21118080035) - Documentation & Testing

## 📄 License

This project is licensed under the MIT License.
