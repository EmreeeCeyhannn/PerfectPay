-- Add location tracking columns to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS sender_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS recipient_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS processing_step VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS step_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_cancel BOOLEAN DEFAULT true;

-- Update existing transactions with default values
UPDATE transactions 
SET sender_country = 'TR', recipient_country = 'US'
WHERE sender_country IS NULL;
