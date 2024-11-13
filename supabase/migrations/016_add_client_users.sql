-- Create clients table if it doesn't exist
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive')),
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on email
create index if not exists idx_clients_email on clients(email);

-- Enable RLS
alter table clients enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for authenticated users" on clients;
drop policy if exists "Enable insert for super admins" on clients;
drop policy if exists "Enable update for super admins" on clients;
drop policy if exists "Enable read access for all users" on clients;
drop policy if exists "Enable insert for all users" on clients;
drop policy if exists "Enable update for all users" on clients;
drop policy if exists "Enable delete for all users" on clients;

-- Create new policies with public access
create policy "Enable read access for all users" on clients
  for select using (true);

create policy "Enable insert for all users" on clients
  for insert with check (true);

create policy "Enable update for all users" on clients
  for update using (true);

create policy "Enable delete for all users" on clients
  for delete using (true);

-- Insert initial clients if they don't exist
insert into clients (name, email, settings) values
  (
    'J&M Automation',
    'admin@jmautomation.com',
    '{
      "company_name": "J&M Automation",
      "contact_name": "J&M Admin",
      "phone": "",
      "address": "",
      "city": "",
      "state": "",
      "zip": "",
      "timezone": "America/New_York"
    }'::jsonb
  ),
  (
    'DRA',
    'admin@dra.com',
    '{
      "company_name": "DRA",
      "contact_name": "DRA Admin",
      "phone": "",
      "address": "",
      "city": "",
      "state": "",
      "zip": "",
      "timezone": "America/New_York"
    }'::jsonb
  )
on conflict (email) do nothing;

-- Add client_id to accounts table
alter table accounts
  add column if not exists client_id uuid references clients(id),
  add column if not exists imported_by uuid references auth.users(id),
  add column if not exists imported_at timestamp with time zone;

-- Create index on client_id
create index if not exists idx_accounts_client on accounts(client_id);

-- Drop existing account policies
drop policy if exists "Users can view their client accounts" on accounts;
drop policy if exists "Users can insert accounts for their client" on accounts;
drop policy if exists "Users can update their client accounts" on accounts;
drop policy if exists "Enable read access for all users" on accounts;
drop policy if exists "Enable insert for all users" on accounts;
drop policy if exists "Enable update for all users" on accounts;

-- Create new account policies
create policy "Enable read access for all users" on accounts
  for select using (true);

create policy "Enable insert for all users" on accounts
  for insert with check (true);

create policy "Enable update for all users" on accounts
  for update using (true);