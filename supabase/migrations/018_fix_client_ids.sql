-- Update clients table to use proper UUIDs
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  custom_fields jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert default clients with proper UUIDs
insert into clients (id, name, email)
values 
  ('98f1c8d7-2b4a-4b5c-9d6e-3f4a5b6c7d8e', 'J&M Automation', 'admin@jmautomation.com'),
  ('76d5e4f3-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'DRA', 'admin@dra.com')
on conflict (email) do nothing;