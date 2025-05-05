-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification codes"
  ON verification_codes
  FOR SELECT
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can insert their own verification codes"
  ON verification_codes
  FOR INSERT
  WITH CHECK (email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own verification codes"
  ON verification_codes
  FOR UPDATE
  USING (email = auth.jwt()->>'email');

-- Add indexes
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON verification_codes (email);
CREATE INDEX IF NOT EXISTS verification_codes_code_idx ON verification_codes (code);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verification_codes_updated_at
  BEFORE UPDATE ON verification_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 