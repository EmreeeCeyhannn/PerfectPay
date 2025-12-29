-- ============================================================================
-- PerfectPay Database - Complete Reset and Schema Creation
-- ============================================================================

-- Drop existing database if it exists
DROP DATABASE IF EXISTS perfectpay_db;

-- Create new database
CREATE DATABASE perfectpay_db;

-- Connect to the new database
\c perfectpay_db;

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
  kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods - Cards and wallets for card payments
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
  fraud_status VARCHAR(50) DEFAULT 'low_risk', -- low_risk, medium_risk, high_risk
  total_cost DECIMAL(15, 2),
  commission DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
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
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction History - Complete audit trail
CREATE TABLE transaction_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255),
  transaction_type VARCHAR(50), -- transfer, card_payment
  psp_name VARCHAR(100),
  amount DECIMAL(15, 2),
  currency VARCHAR(3),
  status VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PSP Metrics - Performance tracking
CREATE TABLE psp_metrics (
  id SERIAL PRIMARY KEY,
  psp_name VARCHAR(100) NOT NULL,
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
  fraud_rules_triggered TEXT, -- JSON array of triggered rules
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

-- ============================================================================
-- Seed Data
-- ============================================================================

-- Insert test users
INSERT INTO users (email, password_hash, full_name, phone, country, kyc_status) VALUES
('test1@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Test User 1', '+1234567890', 'USA', 'approved'),
('test2@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Test User 2', '+1987654321', 'UK', 'approved'),
('test3@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Test User 3', '+905551234567', 'Turkey', 'approved');

-- Insert sample payment methods
INSERT INTO payment_methods (user_id, card_token, last_four, card_brand, exp_month, exp_year, is_primary) VALUES
(1, 'tok_visa', '4242', 'Visa', 12, 2025, true),
(2, 'tok_mastercard', '5555', 'Mastercard', 6, 2024, true),
(3, 'tok_amex', '3782', 'Amex', 3, 2025, false);

-- Insert sample transactions (P2P transfers)
INSERT INTO transactions (transaction_id, sender_id, recipient_id, recipient_name, amount, from_currency, to_currency, fx_rate, selected_psp, fraud_score, fraud_status, total_cost, commission, status) VALUES
('TXN-20240101-001', 1, 2, 'Test User 2', 100.00, 'USD', 'GBP', 0.8, 'Wise', 15, 'low_risk', 98.50, 1.50, 'completed'),
('TXN-20240101-002', 2, 3, 'Test User 3', 500.00, 'GBP', 'TRY', 43.2, 'Stripe', 22, 'low_risk', 495.00, 5.00, 'completed'),
('TXN-20240101-003', 3, 1, 'Test User 1', 250.00, 'TRY', 'USD', 0.033, 'PayPal', 18, 'low_risk', 247.45, 2.55, 'completed'),
('TXN-20240102-001', 1, 2, 'Test User 2', 75.00, 'USD', 'GBP', 0.8, 'İyzico', 10, 'low_risk', 74.40, 0.60, 'completed');

-- Insert sample card transactions
INSERT INTO card_transactions (user_id, payment_method_id, amount, currency, selected_psp, description, status) VALUES
(1, 1, 50.00, 'USD', 'Stripe', 'Coffee Purchase', 'completed'),
(2, 2, 150.00, 'GBP', 'Stripe', 'Subscription Payment', 'completed'),
(3, 3, 200.00, 'TRY', 'İyzico', 'Online Shopping', 'completed');

-- Insert transaction history
INSERT INTO transaction_history (user_id, transaction_id, transaction_type, psp_name, amount, currency, status) VALUES
(1, 'TXN-20240101-001', 'transfer', 'Wise', 100.00, 'USD', 'completed'),
(2, 'TXN-20240101-001', 'transfer', 'Wise', 80.00, 'GBP', 'completed'),
(1, NULL, 'card_payment', 'Stripe', 50.00, 'USD', 'completed'),
(2, 'TXN-20240101-002', 'transfer', 'Stripe', 500.00, 'GBP', 'completed'),
(3, 'TXN-20240101-002', 'transfer', 'Stripe', 21600.00, 'TRY', 'completed'),
(3, NULL, 'card_payment', 'İyzico', 200.00, 'TRY', 'completed');

-- Insert PSP metrics
INSERT INTO psp_metrics (psp_name, total_transactions, successful_transactions, failed_transactions, total_volume, average_value, success_rate, average_latency_ms) VALUES
('Stripe', 10, 10, 0, 1500.00, 150.00, 100.0, 580),
('Wise', 12, 12, 0, 2100.00, 175.00, 100.0, 450),
('PayPal', 8, 8, 0, 1200.00, 150.00, 100.0, 620),
('İyzico', 5, 5, 0, 500.00, 100.00, 100.0, 300);

-- ============================================================================
-- Summary
-- ============================================================================
-- Database reset complete with:
-- - 3 test users (all with password: "password" hashed)
-- - 3 payment methods
-- - 4 sample P2P transactions
-- - 3 sample card transactions
-- - 6 transaction history records
-- - 4 PSP metrics records
-- ============================================================================
