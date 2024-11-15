-- Start fresh with a simplified auth system
begin;

-- 1. Drop and recreate auth schema
drop schema if exists auth cascade;
create schema auth;

-- 2. Create a simplified users table
create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password text not null,
    role text not null default 'user',
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Insert our users with clear roles and metadata
insert into auth.users (email, password, role, metadata) values
-- Site Admin
('admin@clearpay247.com', 
 crypt('CP247@dm1n2024!', gen_salt('bf')),
 'site_admin',
 '{"name": "Site Administrator"}'),

-- CRM Admin
('crm@clearpay247.com',
 crypt('CP247crm@2024!', gen_salt('bf')),
 'crm_admin', 
 '{"name": "CRM Administrator"}'),

-- DRA Admin
('dra.admin@clearpay247.com',
 crypt('DRA@admin2024!', gen_salt('bf')),
 'client_admin',
 '{"name": "DRA Administrator", "client_id": "9992443d-f25b-4dec-adae-d1864fb9869f"}'),

-- J&M Admin  
('admin@jmautomation.com',
 crypt('JM@admin2024!', gen_salt('bf')),
 'client_admin',
 '{"name": "J&M Administrator", "client_id": "98f1c8d7-2b4a-4b5c-9d6e-3f4a5b6c7d8e"}');

-- 4. Grant permissions
grant usage on schema auth to public;
grant select on auth.users to public;

-- 5. Create auth functions
create or replace function auth.authenticate(
    email text,
    password text
) returns auth.users as $$
declare
    user_record auth.users;
begin
    select * into user_record
    from auth.users
    where users.email = authenticate.email
    and users.password = crypt(authenticate.password, users.password);
    
    return user_record;
end;
$$ language plpgsql security definer;

commit;