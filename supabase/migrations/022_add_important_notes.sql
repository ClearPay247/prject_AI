-- Add important_notes field to accounts table
alter table accounts
  add column if not exists important_notes text;

-- Create index for important_notes
create index if not exists idx_accounts_important_notes on accounts(important_notes);