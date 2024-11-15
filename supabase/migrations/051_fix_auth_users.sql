-- Start transaction
begin;

-- First clean up existing users
delete from auth.users 
where email in ('admin@jmautomation.com', 'dra.admin@clearpay247.com');

-- Create J&M admin user with explicit ID
insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
) values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@jmautomation.com',
    crypt('JM@admin2024!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "J&M Administrator"}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Create DRA admin user with explicit ID
insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
) values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'dra.admin@clearpay247.com',
    crypt('DRA@admin2024!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "DRA Administrator"}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Ensure client_users records exist
insert into client_users (
    client_id,
    email,
    role_id,
    name,
    status
) values 
    -- J&M Admin
    (
        '98f1c8d7-2b4a-4b5c-9d6e-3f4a5b6c7d8e', -- J&M client ID
        'admin@jmautomation.com',
        (select id from user_roles where name = 'admin'),
        'J&M Administrator',
        'active'
    ),
    -- DRA Admin
    (
        '9992443d-f25b-4dec-adae-d1864fb9869f', -- DRA client ID
        'dra.admin@clearpay247.com',
        (select id from user_roles where name = 'admin'),
        'DRA Administrator',
        'active'
    )
on conflict (email) do update set
    client_id = excluded.client_id,
    role_id = excluded.role_id,
    name = excluded.name,
    status = excluded.status;

commit;