# Database Schema Documentation

## Tables

### users

- `id` (INT, PK) - User identifier
- `email` (VARCHAR) - User email address (unique)
- `password_hash` (VARCHAR) - Hashed password
- `full_name` (VARCHAR) - User full name
- `phone` (VARCHAR) - Phone number
- `kyc_status` (VARCHAR) - KYC approval status
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

### payment_providers

- `id` (INT, PK) - Provider identifier
- `name` (VARCHAR) - Provider name (Stripe, PayPal, etc.)
- `api_key` (VARCHAR) - API credentials
- `is_active` (BOOLEAN) - Active status

### transactions

- `id` (INT, PK) - Transaction identifier
- `user_id` (INT, FK) - User who made the transaction
- `provider_id` (INT, FK) - Payment provider used
- `amount` (DECIMAL) - Transaction amount
- `currency` (VARCHAR) - Currency code (USD, EUR, etc.)
- `status` (VARCHAR) - Transaction status (pending, success, failed)
- `provider_transaction_id` (VARCHAR) - Provider's transaction ID
- `is_suspicious` (BOOLEAN) - Fraud flag
- `created_at` (TIMESTAMP) - Transaction time
- `updated_at` (TIMESTAMP) - Last update time

### cards

- `id` (INT, PK) - Card identifier
- `user_id` (INT, FK) - Card owner
- `card_token` (VARCHAR) - Tokenized card info
- `last_four` (VARCHAR) - Last 4 digits
- `card_brand` (VARCHAR) - Card brand (Visa, MasterCard, etc.)
- `is_primary` (BOOLEAN) - Primary card flag

### blacklist

- `id` (INT, PK) - Blacklist entry ID
- `identifier` (VARCHAR) - Identifier (email, ID, etc.)
- `reason` (VARCHAR) - Blacklist reason
- `created_at` (TIMESTAMP) - Entry date

### commission_settings

- `id` (INT, PK) - Setting identifier
- `provider_id` (INT, FK) - Payment provider
- `commission_rate` (DECIMAL) - Commission percentage
- `min_amount` (DECIMAL) - Minimum transaction amount
- `max_amount` (DECIMAL) - Maximum transaction amount

### audit_logs

- `id` (INT, PK) - Log entry ID
- `user_id` (INT, FK) - User performing action
- `action` (VARCHAR) - Action description
- `entity_type` (VARCHAR) - Entity type affected
- `entity_id` (INT) - Entity identifier
- `details` (TEXT) - Additional details
- `created_at` (TIMESTAMP) - Log time

## Indexes

- `idx_users_email` on `users(email)`
- `idx_transactions_user_id` on `transactions(user_id)`
- `idx_transactions_created_at` on `transactions(created_at)`
- `idx_cards_user_id` on `cards(user_id)`
- `idx_blacklist_identifier` on `blacklist(identifier)`
