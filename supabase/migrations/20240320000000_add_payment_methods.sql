-- Create enum for payment methods first
CREATE TYPE payment_method_type AS ENUM (
  'PAYPAL',
  'BANK_TRANSFER',
  'CASHAPP',
  'ZELLE'
);

-- Create enum for verification status
CREATE TYPE verification_status_type AS ENUM (
  'PENDING',
  'VERIFIED',
  'FAILED',
  'CANCELLED'
);

-- Ensure transactions table exists with user_id
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wallet_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(19,4) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add payment method tracking to transactions table with correct types
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method payment_method_type,
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_status verification_status_type DEFAULT 'PENDING'::verification_status_type,
ADD COLUMN IF NOT EXISTS payment_details JSONB,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_payment_reference ON transactions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_verification_status ON transactions(verification_status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Add comment for documentation
COMMENT ON TABLE transactions IS 'Stores all financial transactions including payment method and verification status';
COMMENT ON COLUMN transactions.payment_method IS 'The payment method used for this transaction (PAYPAL, BANK_TRANSFER, CASHAPP, ZELLE)';
COMMENT ON COLUMN transactions.payment_reference IS 'Reference number or identifier from the payment provider';
COMMENT ON COLUMN transactions.verification_status IS 'Status of payment verification (PENDING, VERIFIED, FAILED, CANCELLED)';
COMMENT ON COLUMN transactions.payment_details IS 'Additional payment details stored as JSON';
COMMENT ON COLUMN transactions.verified_at IS 'Timestamp when the payment was verified';

-- Create function to update verification status
CREATE OR REPLACE FUNCTION update_transaction_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'VERIFIED' AND OLD.verification_status != 'VERIFIED' THEN
    NEW.verified_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic verified_at update
CREATE TRIGGER set_transaction_verified_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_verification_status();

-- Add RLS policies for payment details
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transaction payment details"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transaction verification status"
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 