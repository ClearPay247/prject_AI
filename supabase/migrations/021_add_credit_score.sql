-- Add credit_score field to accounts table
alter table accounts
  add column if not exists credit_score integer;

-- Create index for credit_score
create index if not exists idx_accounts_credit_score on accounts(credit_score);