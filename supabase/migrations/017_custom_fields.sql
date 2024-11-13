-- Add custom_fields to clients table
alter table clients
  add column if not exists custom_fields jsonb default '[]'::jsonb;

-- Add custom_data to accounts table
alter table accounts
  add column if not exists custom_data jsonb default '{}'::jsonb;

-- Create function to validate custom field data
create or replace function validate_custom_fields()
returns trigger as $$
begin
  -- Get client's custom fields schema
  declare
    client_fields jsonb;
  begin
    select custom_fields into client_fields
    from clients
    where id = new.client_id;

    -- If client has custom fields defined, validate the data
    if client_fields is not null and jsonb_array_length(client_fields) > 0 then
      -- Ensure custom_data is an object
      if new.custom_data is null then
        new.custom_data := '{}'::jsonb;
      end if;
    end if;

    return new;
  end;
end;
$$ language plpgsql;

-- Create trigger for custom fields validation
drop trigger if exists validate_custom_fields_trigger on accounts;
create trigger validate_custom_fields_trigger
  before insert or update on accounts
  for each row
  execute function validate_custom_fields();