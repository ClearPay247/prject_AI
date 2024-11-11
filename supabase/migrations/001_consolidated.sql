-- Enable required extensions
create extension if not exists "pgcrypto";

-- Create accounts table
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  account_number text not null unique,
  original_account_number text,
  debtor_name text not null,
  address text,
  city text,
  state text,
  zip_code text,
  ssn text check (ssn ~ '^[0-9]{3}-[0-9]{2}-[0-9]{4}$' OR ssn IS NULL),
  date_of_birth timestamp with time zone,
  email text,
  current_balance numeric(10,2),
  original_creditor text,
  status text not null default 'new',
  add_date timestamp with time zone default now(),
  add_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create phone_numbers table
create table if not exists phone_numbers (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references accounts(id) on delete cascade,
  number text not null,
  status text default 'unknown',
  last_called timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create payments table
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references accounts(id),
  amount numeric(10,2) not null,
  payment_type text not null check (payment_type in ('card', 'check')),
  payment_method_encrypted text not null,
  status text not null default 'pending' check (status in ('pending', 'processed', 'declined')),
  post_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create call_logs table with corrected status constraint
create table if not exists call_logs (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references accounts(id) on delete set null,
  phone_number text not null,
  call_time timestamp with time zone default now(),
  duration integer,
  status text not null check (status in ('completed', 'no_answer', 'voicemail', 'failed', 'initiated')),
  recording_url text,
  transcript text,
  bland_call_id text,
  voice_used text,
  from_number text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_accounts_number on accounts(account_number);
create index if not exists idx_accounts_original_number on accounts(original_account_number);
create index if not exists idx_accounts_status on accounts(status);
create index if not exists idx_phone_numbers_account on phone_numbers(account_id);
create index if not exists idx_phone_numbers_number on phone_numbers(number);
create index if not exists idx_payments_account on payments(account_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_call_logs_account on call_logs(account_id);
create index if not exists idx_call_logs_status on call_logs(status);
create index if not exists idx_call_logs_call_time on call_logs(call_time);

-- Enable RLS
alter table accounts enable row level security;
alter table phone_numbers enable row level security;
alter table payments enable row level security;
alter table call_logs enable row level security;

-- Create policies
create policy "Enable read access for all users" on accounts
  for select using (true);

create policy "Enable insert for all users" on accounts
  for insert with check (true);

create policy "Enable update for all users" on accounts
  for update using (true);

create policy "Enable read access for all users" on phone_numbers
  for select using (true);

create policy "Enable insert for all users" on phone_numbers
  for insert with check (true);

create policy "Enable update for all users" on phone_numbers
  for update using (true);

create policy "Enable read access for all users" on payments
  for select using (true);

create policy "Enable insert for all users" on payments
  for insert with check (true);

create policy "Enable update for all users" on payments
  for update using (true);

create policy "Enable read access for all users" on call_logs
  for select using (true);

create policy "Enable insert for all users" on call_logs
  for insert with check (true);

create policy "Enable update for all users" on call_logs
  for update using (true);