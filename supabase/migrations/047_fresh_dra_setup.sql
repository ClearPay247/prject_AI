-- Start transaction
begin;

-- Drop and recreate necessary tables
drop table if exists client_users cascade;
drop table if exists user_roles cascade;

-- Create roles table
create table user_roles (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    created_at timestamptz default now()
);

-- Insert standard roles
insert into user_roles (name) values
    ('admin'),
    ('agent');

-- Create client_users table
create table client_users (
    id uuid primary key default gen_random_uuid(),
    client_id uuid references clients(id) on delete cascade,
    email text unique not null,
    role_id uuid references user_roles(id),
    name text not null,
    status text not null default 'active',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes
create index idx_client_users_client on client_users(client_id);
create index idx_client_users_email on client_users(email);
create index idx_client_users_role on client_users(role_id);

-- Clean up existing data
delete from auth.users where email = 'dra.admin@clearpay247.com';
update accounts set client_id = null where client_id = '9992443d-f25b-4dec-adae-d1864fb9869f';
delete from clients where id = '9992443d-f25b-4dec-adae-d1864fb9869f';

-- Create fresh DRA client
insert into clients (
    id,
    name,
    email,
    status,
    settings
) values (
    '9992443d-f25b-4dec-adae-d1864fb9869f',
    'DRA',
    'dra.admin@clearpay247.com',
    'active',
    jsonb_build_object(
        'company_name', 'DRA',
        'contact_name', 'DRA Administrator',
        'timezone', 'America/New_York'
    )
);

-- Create DRA admin user in auth.users
insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    confirmation_sent_at,
    last_sign_in_at
) values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'dra.admin@clearpay247.com',
    crypt('DRA@admin2024!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"DRA Administrator"}',
    now(),
    now(),
    'authenticated',
    'authenticated',
    encode(gen_random_bytes(32), 'hex'),
    now(),
    now()
);

-- Create client user record
insert into client_users (
    client_id,
    email,
    role_id,
    name,
    status
) values (
    '9992443d-f25b-4dec-adae-d1864fb9869f',
    'dra.admin@clearpay247.com',
    (select id from user_roles where name = 'admin'),
    'DRA Administrator',
    'active'
);

-- Relink accounts to DRA client
update accounts 
set client_id = '9992443d-f25b-4dec-adae-d1864fb9869f'
where client_id is null;

-- Grant necessary permissions
grant usage on schema auth to authenticated;
grant usage on schema public to authenticated;
grant select on auth.users to authenticated;

-- Enable RLS on auth.users
alter table auth.users enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own record" on auth.users;
create policy "Users can view own record"
    on auth.users for select
    using (auth.uid() = id);

commit;