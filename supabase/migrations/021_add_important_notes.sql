-- Add important_notes column to accounts table if it doesn't exist
alter table accounts
  add column if not exists important_notes text;