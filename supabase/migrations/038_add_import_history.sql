-- Create import_history table
create table if not exists import_history (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id),
  imported_by uuid references auth.users(id),
  account_count integer not null,
  account_ids uuid[] not null,
  created_at timestamp with time zone default now(),
  rolled_back_at timestamp with time zone,
  rolled_back_by uuid references auth.users(id)
);

-- Create indexes
create index idx_import_history_client on import_history(client_id);
create index idx_import_history_created on import_history(created_at);

-- Create function to rollback import
create or replace function rollback_import(import_id uuid)
returns void as $$
declare
  account_list uuid[];
begin
  -- Get list of account IDs to rollback
  select account_ids into account_list
  from import_history
  where id = import_id and rolled_back_at is null;

  if found then
    -- Delete phone numbers for these accounts
    delete from phone_numbers
    where account_id = any(account_list);

    -- Delete the accounts
    delete from accounts
    where id = any(account_list);

    -- Mark import as rolled back
    update import_history
    set 
      rolled_back_at = now(),
      rolled_back_by = auth.uid()
    where id = import_id;
  end if;
end;
$$ language plpgsql security definer;