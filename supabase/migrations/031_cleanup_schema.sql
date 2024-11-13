-- Drop any existing triggers related to name processing
drop trigger if exists update_debtor_name_trigger on accounts;
drop trigger if exists handle_names_trigger on accounts;
drop function if exists update_debtor_name();
drop function if exists handle_names();

-- Ensure the accounts table has the correct columns
alter table accounts 
  drop column if exists debtor_full_name,  -- Remove if it exists
  alter column debtor_name set not null,   -- Ensure debtor_name is required
  alter column debtor_name set default ''; -- Set default empty string

-- Update any null debtor_name values to empty string
update accounts set debtor_name = '' where debtor_name is null;

-- Recreate indexes
drop index if exists idx_accounts_debtor_full_name;
create index if not exists idx_accounts_debtor_name on accounts(debtor_name);
create index if not exists idx_accounts_debtor_first_name on accounts(debtor_first_name);
create index if not exists idx_accounts_debtor_middle_name on accounts(debtor_middle_name);
create index if not exists idx_accounts_debtor_last_name on accounts(debtor_last_name);