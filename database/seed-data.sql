-- ============================================================================
-- PerfectPay Database - Seed Data
-- ============================================================================

-- Insert test users (password: "password" hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, phone, country, kyc_status) VALUES
('test1@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Alice Johnson', '+1234567890', 'USA', 'approved'),
('test2@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Bob Smith', '+1987654321', 'UK', 'approved'),
('test3@example.com', '$2a$10$9h.1xLZUE6.lFnV8QUXWH.OAGmNq8fDQvF3C2L3oLzJmD5gKJ1OKe', 'Charlie Brown', '+905551234567', 'Turkey', 'approved');

-- Insert sample payment methods
INSERT INTO payment_methods (user_id, card_token, last_four, card_brand, exp_month, exp_year, is_primary) VALUES
(1, 'tok_visa', '4242', 'Visa', 12, 2025, true),
(2, 'tok_mastercard', '5555', 'Mastercard', 6, 2024, true),
(3, 'tok_amex', '3782', 'Amex', 3, 2025, false);

-- Insert sample transactions (P2P transfers)
INSERT INTO transactions (transaction_id, sender_id, recipient_id, recipient_name, amount, from_currency, to_currency, fx_rate, selected_psp, fraud_score, fraud_status, total_cost, commission, status) VALUES
('TXN-20240101-001', 1, 2, 'Bob Smith', 100.00, 'USD', 'GBP', 0.8, 'Wise', 15, 'low_risk', 98.50, 1.50, 'completed'),
('TXN-20240101-002', 2, 3, 'Charlie Brown', 500.00, 'GBP', 'TRY', 43.2, 'Stripe', 22, 'low_risk', 495.00, 5.00, 'completed'),
('TXN-20240101-003', 3, 1, 'Alice Johnson', 250.00, 'TRY', 'USD', 0.033, 'PayPal', 18, 'low_risk', 247.45, 2.55, 'completed'),
('TXN-20240102-001', 1, 2, 'Bob Smith', 75.00, 'USD', 'GBP', 0.8, 'İyzico', 10, 'low_risk', 74.40, 0.60, 'completed');

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
