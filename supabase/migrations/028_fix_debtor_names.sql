-- Add debtor name fields if they don't exist
alter table accounts
  add column if not exists debtor_first_name text,
  add column if not exists debtor_middle_name text,
  add column if not exists debtor_last_name text;

-- Create indexes for name fields
create index if not exists idx_accounts_debtor_first_name on accounts(debtor_first_name);
create index if not exists idx_accounts_debtor_middle_name on accounts(debtor_middle_name);
create index if not exists idx_accounts_debtor_last_name on accounts(debtor_last_name);

-- Create function to handle name components
create or replace function update_debtor_name()
returns trigger as $$
begin
  -- Combine name components if they exist
  if new.debtor_first_name is not null or new.debtor_middle_name is not null or new.debtor_last_name is not null then
    new.debtor_name := trim(concat_ws(' ', 
      new.debtor_first_name, 
      new.debtor_middle_name, 
      new.debtor_last_name
    ));
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger for name updates
drop trigger if exists update_debtor_name_trigger on accounts;
create trigger update_debtor_name_trigger
  before insert or update on accounts
  for each row
  execute function update_debtor_name();