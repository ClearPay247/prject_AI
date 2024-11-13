-- First, verify and fix the accounts table structure
do $$ 
begin
  -- Drop any existing name-related triggers
  if exists (select 1 from pg_trigger where tgname = 'update_debtor_name_trigger') then
    drop trigger update_debtor_name_trigger on accounts;
  end if;
  
  if exists (select 1 from pg_trigger where tgname = 'handle_names_trigger') then
    drop trigger handle_names_trigger on accounts;
  end if;

  -- Drop any existing name-related functions
  if exists (select 1 from pg_proc where proname = 'update_debtor_name') then
    drop function update_debtor_name();
  end if;
  
  if exists (select 1 from pg_proc where proname = 'handle_names') then
    drop function handle_names();
  end if;
end $$;

-- Ensure the accounts table has the correct columns
alter table accounts 
  add column if not exists debtor_name text not null default '',
  add column if not exists debtor_first_name text,
  add column if not exists debtor_middle_name text,
  add column if not exists debtor_last_name text;

-- Update indexes
drop index if exists idx_accounts_debtor_full_name;
create index if not exists idx_accounts_debtor_name on accounts(debtor_name);
create index if not exists idx_accounts_debtor_first_name on accounts(debtor_first_name);
create index if not exists idx_accounts_debtor_middle_name on accounts(debtor_middle_name);
create index if not exists idx_accounts_debtor_last_name on accounts(debtor_last_name);