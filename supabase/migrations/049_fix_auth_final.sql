-- Start transaction
begin;

-- Create auth schema if it doesn't exist
create schema if not exists auth;

-- Create auth.users table if it doesn't exist
create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    instance_id uuid,
    email text unique,
    encrypted_password text,
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token text,
    confirmation_sent_at timestamptz,
    recovery_token text,
    recovery_sent_at timestamptz,
    email_change_token_new text,
    email_change text,
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    phone text,
    phone_confirmed_at timestamptz,
    phone_change text,
    phone_change_token text,
    phone_change_sent_at timestamptz,
    email_change_token_current text,
    email_change_confirm_status smallint,
    banned_until timestamptz,
    reauthentication_token text,
    reauthentication_sent_at timestamptz,
    is_sso_user boolean default false,
    deleted_at timestamptz,
    role text default 'authenticated'::text,
    aud text default 'authenticated'::text
);

-- Grant necessary permissions
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;

-- Create fresh DRA admin user
delete from auth.users where email = 'dra.admin@clearpay247.com';

insert into auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud
) values (
    'dra.admin@clearpay247.com',
    crypt('DRA@admin2024!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "DRA Administrator"}',
    'authenticated',
    'authenticated'
);

-- Enable RLS
alter table auth.users enable row level security;

-- Create RLS policies
drop policy if exists "Public users are viewable by everyone" on auth.users;
create policy "Public users are viewable by everyone"
    on auth.users for select
    using (true);

drop policy if exists "Users can insert" on auth.users;
create policy "Users can insert"
    on auth.users for insert
    with check (true);

drop policy if exists "Users can update own record" on auth.users;
create policy "Users can update own record"
    on auth.users for update
    using (auth.uid() = id);

-- Ensure client user exists
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

commit;