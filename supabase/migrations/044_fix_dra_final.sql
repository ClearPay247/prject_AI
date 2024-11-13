-- First, let's check and clean up any existing data
do $$
begin
  -- 1. Temporarily unlink accounts
  update accounts 
  set client_id = null 
  where client_id = '9992443d-f25b-4dec-adae-d1864fb9869f';

  -- 2. Delete existing DRA client records
  delete from client_users 
  where client_id = '9992443d-f25b-4dec-adae-d1864fb9869f';
  
  delete from clients 
  where id = '9992443d-f25b-4dec-adae-d1864fb9869f';

  -- 3. Create fresh DRA client record
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

  -- 4. Create DRA admin user
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

  -- 5. Relink accounts to DRA client
  update accounts 
  set client_id = '9992443d-f25b-4dec-adae-d1864fb9869f'
  where client_id is null;

end $$;