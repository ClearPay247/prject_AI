-- Add debtor_full_name column to accounts table
alter table accounts
  add column if not exists debtor_full_name text;

-- Create index for the new column
create index if not exists idx_accounts_debtor_full_name on accounts(debtor_full_name);

-- Update any existing records to have debtor_full_name match debtor_name
update accounts 
set debtor_full_name = debtor_name 
where debtor_full_name is null;