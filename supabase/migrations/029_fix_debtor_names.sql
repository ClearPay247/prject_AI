-- Drop existing trigger if it exists
drop trigger if exists update_debtor_name_trigger on accounts;
drop function if exists update_debtor_name();

-- Add or modify debtor name columns
alter table accounts
  add column if not exists debtor_first_name text,
  add column if not exists debtor_middle_name text,
  add column if not exists debtor_last_name text;

-- Create function to handle name components
create or replace function update_debtor_name()
returns trigger as $$
begin
  -- Combine name components if they exist
  if new.debtor_first_name is not null or new.debtor_middle_name is not null or new.debtor_last_name is not null then
    new.debtor_name := trim(concat_ws(' ', 
      nullif(new.debtor_first_name, ''),
      nullif(new.debtor_middle_name, ''),
      nullif(new.debtor_last_name, '')
    ));
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger for name updates
create trigger update_debtor_name_trigger
  before insert or update on accounts
  for each row
  execute function update_debtor_name();