-- Start transaction
begin;

-- Grant necessary permissions to authenticated users
grant usage on schema auth to authenticated;
grant usage on schema public to authenticated;

-- Grant select permissions on necessary auth views
grant select on auth.users to authenticated;

-- Ensure auth schema exists and has correct permissions
create schema if not exists auth;

-- Recreate the auth user cleanly
delete from auth.users where email = 'dra.admin@clearpay247.com';

-- Create auth user with proper schema permissions
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
    confirmation_token
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
    encode(gen_random_bytes(32), 'hex')
);

-- Ensure the client user exists
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
) on conflict (email) do update set
    client_id = excluded.client_id,
    role_id = excluded.role_id,
    name = excluded.name,
    status = excluded.status;

-- Grant RLS permissions
alter table auth.users enable row level security;

create policy "Users can view own record"
    on auth.users for select
    using (auth.uid() = id);

commit;