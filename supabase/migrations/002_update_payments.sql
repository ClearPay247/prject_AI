-- Add new columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_plan_type text CHECK (payment_plan_type IN ('settlement', 'payment_plan')) DEFAULT 'settlement',
ADD COLUMN IF NOT EXISTS monthly_payment numeric(10,2),
ADD COLUMN IF NOT EXISTS total_payments integer,
ADD COLUMN IF NOT EXISTS savings_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS original_balance numeric(10,2),
ADD COLUMN IF NOT EXISTS settlement_percentage numeric(5,2);

-- Make payment_method_encrypted required
ALTER TABLE payments 
ALTER COLUMN payment_method_encrypted SET NOT NULL;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_plan_type ON payments(payment_plan_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);