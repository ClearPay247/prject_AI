-- First ensure we have a roles table if it doesn't exist
create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Insert standard roles if they don't exist
insert into user_roles (name) values
  ('admin'),
  ('agent')
on conflict (name) do nothing;

-- Create client_users table if it doesn't exist
create table if not exists client_users (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  email text not null unique,
  role_id uuid references user_roles(id),
  name text not null,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_client_users_client on client_users(client_id);
create index if not exists idx_client_users_email on client_users(email);
create index if not exists idx_client_users_role on client_users(role_id);

-- Create a new admin user for DRA
insert into client_users (
  client_id,
  email,
  role_id,
  name,
  status
) values (
  '9992443d-f25b-4dec-adae-d1864fb9869f', -- DRA client ID
  'dra.admin@clearpay247.com',
  (select id from user_roles where name = 'admin'),
  'DRA Administrator',
  'active'
);