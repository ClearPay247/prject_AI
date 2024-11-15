-- Start fresh with auth system
begin;

-- 1. Clean up existing auth data
delete from auth.users;

-- 2. Create auth schema and users table properly
create schema if not exists auth;

drop table if exists auth.users cascade;
create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    encrypted_password text not null,
    email_confirmed_at timestamptz default now(),
    last_sign_in_at timestamptz default now(),
    raw_app_meta_data jsonb default '{}'::jsonb,
    raw_user_meta_data jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    role text default 'authenticated',
    aud text default 'authenticated'
);

-- 3. Create the users with proper encryption
insert into auth.users (email, encrypted_password, raw_app_meta_data, raw_user_meta_data) values
-- Site Admin
('admin@clearpay247.com', crypt('CP247@dm1n2024!', gen_salt('bf')), 
 '{"provider":"email","providers":["email"],"role":"site_admin"}',
 '{"name":"Site Administrator"}'),

-- CRM Admin 
('crm@clearpay247.com', crypt('CP247crm@2024!', gen_salt('bf')),
 '{"provider":"email","providers":["email"],"role":"crm_admin"}',
 '{"name":"CRM Administrator"}'),

-- DRA Admin
('dra.admin@clearpay247.com', crypt('DRA@admin2024!', gen_salt('bf')),
 '{"provider":"email","providers":["email"],"role":"client_admin"}',
 '{"name":"DRA Administrator","client_id":"9992443d-f25b-4dec-adae-d1864fb9869f"}'),

-- J&M Admin
('admin@jmautomation.com', crypt('JM@admin2024!', gen_salt('bf')),
 '{"provider":"email","providers":["email"],"role":"client_admin"}',
 '{"name":"J&M Administrator","client_id":"98f1c8d7-2b4a-4b5c-9d6e-3f4a5b6c7d8e"}');

-- 4. Grant necessary permissions
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;

-- 5. Enable RLS
alter table auth.users enable row level security;

-- 6. Create RLS policies
create policy "Public users are viewable by everyone" 
    on auth.users for select using (true);

create policy "Users can update own record" 
    on auth.users for update using (auth.uid() = id);

commit;