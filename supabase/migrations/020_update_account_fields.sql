<content>-- Update accounts table to rename date_of_service to open_date
alter table accounts 
  rename column if exists date_of_service to open_date;

-- Add missing balance fields if they don't exist
alter table accounts
  add column if not exists current_balance numeric(10,2),
  add column if not exists charge_off_date timestamp with time zone,
  add column if not exists charge_off_balance numeric(10,2);

-- Create indexes for new fields
create index if not exists idx_accounts_open_date on accounts(open_date);
create index if not exists idx_accounts_charge_off_date on accounts(charge_off_date);
create index if not exists idx_accounts_current_balance on accounts(current_balance);</content>