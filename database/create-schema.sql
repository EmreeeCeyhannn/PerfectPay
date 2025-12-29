-- ============================================================================
-- PerfectPay Database - Complete Schema Creation
-- ============================================================================

-- Create new database
CREATE DATABASE perfectpay_db;

-- ============================================================================
-- Core Schema Tables
-- ============================================================================

-- Users Table - KYC and user information
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(100),
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods - Cards for card payments
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_token VARCHAR(255) NOT NULL,
  last_four VARCHAR(4),
  card_brand VARCHAR(50),
  exp_month INTEGER,
  exp_year INTEGER,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions - P2P money transfers
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER REFERENCES users(id),
  recipient_name VARCHAR(255),
  recipient_account VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  fx_rate DECIMAL(20, 10),
  selected_psp VARCHAR(100) NOT NULL,
  fraud_score INTEGER DEFAULT 0,
  fraud_status VARCHAR(50) DEFAULT 'low_risk',
  total_cost DECIMAL(15, 2),
  commission DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card Transactions - Card payment records
CREATE TABLE card_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  selected_psp VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  psp_transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction History - Complete audit trail
CREATE TABLE transaction_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255),
  transaction_type VARCHAR(50),
  psp_name VARCHAR(100),
  amount DECIMAL(15, 2),
  currency VARCHAR(3),
  status VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PSP Metrics - Performance tracking
CREATE TABLE psp_metrics (
  id SERIAL PRIMARY KEY,
  psp_name VARCHAR(100) NOT NULL UNIQUE,
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(20, 2) DEFAULT 0,
  average_value DECIMAL(15, 2) DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  average_latency_ms INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fraud Logs - Fraud detection records
CREATE TABLE fraud_logs (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255),
  user_id INTEGER REFERENCES users(id),
  fraud_score INTEGER,
  fraud_status VARCHAR(50),
  fraud_rules_triggered TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

CREATE INDEX idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_psp ON transactions(selected_psp);

CREATE INDEX idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX idx_card_transactions_status ON card_transactions(status);
CREATE INDEX idx_card_transactions_created_at ON card_transactions(created_at);

CREATE INDEX idx_transaction_history_user_id ON transaction_history(user_id);
CREATE INDEX idx_transaction_history_timestamp ON transaction_history(timestamp);
CREATE INDEX idx_transaction_history_type ON transaction_history(transaction_type);

CREATE INDEX idx_psp_metrics_psp_name ON psp_metrics(psp_name);

CREATE INDEX idx_fraud_logs_user_id ON fraud_logs(user_id);
CREATE INDEX idx_fraud_logs_created_at ON fraud_logs(created_at);
