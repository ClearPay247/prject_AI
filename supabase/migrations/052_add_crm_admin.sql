-- Start transaction
begin;

-- Create CRM admin user
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
    'crm@clearpay247.com',
    crypt('CP247crm@2024!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "access_level": "crm_admin"}',
    '{"name": "CRM Administrator"}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

commit;