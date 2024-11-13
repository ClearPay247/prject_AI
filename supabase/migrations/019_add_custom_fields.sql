-- Add custom_data JSONB column to accounts table
alter table accounts
  add column if not exists custom_data jsonb default '{}'::jsonb;

-- Create index for JSONB queries
create index if not exists idx_accounts_custom_data on accounts using gin (custom_data);

-- Create function to validate custom data
create or replace function validate_custom_data()
returns trigger as $$
begin
  -- Ensure custom_data is an object
  if new.custom_data is null then
    new.custom_data := '{}'::jsonb;
  end if;

  -- Validate custom_data is a valid JSONB object
  if jsonb_typeof(new.custom_data) != 'object' then
    raise exception 'custom_data must be a JSON object';
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger for custom data validation
drop trigger if exists validate_custom_data_trigger on accounts;
create trigger validate_custom_data_trigger
  before insert or update on accounts
  for each row
  execute function validate_custom_data();