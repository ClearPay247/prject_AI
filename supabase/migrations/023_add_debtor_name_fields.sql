-- Add separate name fields to accounts table
alter table accounts
  add column if not exists debtor_first_name text,
  add column if not exists debtor_middle_name text,
  add column if not exists debtor_last_name text;

-- Create indexes for name fields
create index if not exists idx_accounts_debtor_first_name on accounts(debtor_first_name);
create index if not exists idx_accounts_debtor_middle_name on accounts(debtor_middle_name);
create index if not exists idx_accounts_debtor_last_name on accounts(debtor_last_name);