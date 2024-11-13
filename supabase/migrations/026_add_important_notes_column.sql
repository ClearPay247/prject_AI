-- Add important_notes and add_to_important_notes columns to accounts table
alter table accounts
  add column if not exists important_notes text default '',
  add column if not exists add_to_important_notes text;

-- Create indexes for better performance
create index if not exists idx_accounts_important_notes on accounts(important_notes);
create index if not exists idx_accounts_add_to_important_notes on accounts(add_to_important_notes);

-- Create or replace function to handle important notes
create or replace function handle_important_notes()
returns trigger as $$
begin
  -- Initialize important_notes if null
  if new.important_notes is null then
    new.important_notes := '';
  end if;

  -- Append add_to_important_notes content if present
  if new.add_to_important_notes is not null and new.add_to_important_notes != '' then
    -- Add newline if important_notes not empty
    if new.important_notes != '' then
      new.important_notes := new.important_notes || E'\n';
    end if;
    -- Append new content
    new.important_notes := new.important_notes || new.add_to_important_notes;
    -- Clear the temporary field
    new.add_to_important_notes := null;
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger for handling important notes
drop trigger if exists handle_important_notes_trigger on accounts;
create trigger handle_important_notes_trigger
  before insert or update on accounts
  for each row
  execute function handle_important_notes();