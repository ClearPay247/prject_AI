-- Start a transaction block
begin;

  -- 1. First clean up any existing data
  update accounts set client_id = null 
  where client_id = '9992443d-f25b-4dec-adae-d1864fb9869f';

  delete from auth.users where email = 'dra.admin@clearpay247.com';
  delete from client_users where email = 'dra.admin@clearpay247.com';
  delete from clients where id = '9992443d-f25b-4dec-adae-d1864fb9869f';

  -- 2. Ensure roles exist
  create table if not exists user_roles (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp with time zone default now()
  );

  insert into user_roles (name) values
    ('admin'),
    ('agent')
  on conflict (name) do nothing;

  -- 3. Create fresh DRA client
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
      'contact_name', 'DRA Admin',
      'timezone', 'America/New_York'
    )
  );

  -- 4. Create auth user for DRA admin with explicit UUID
  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) values (
    gen_random_uuid(), -- Generate a new UUID for the user
    '00000000-0000-0000-0000-000000000000',
    'dra.admin@clearpay247.com',
    crypt('DRA@admin2024!', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"DRA Administrator"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  -- 5. Create client user record
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

  -- 6. Relink accounts to DRA client
  update accounts 
  set client_id = '9992443d-f25b-4dec-adae-d1864fb9869f'
  where client_id is null;

commit;