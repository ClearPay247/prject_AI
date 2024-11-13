-- First, update any accounts using the old client ID
update accounts 
set client_id = null
where client_id in (
  '76d5e4f3-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
  '9992443d-f25b-4dec-adae-d1864fb9869f'
);

-- Now we can safely remove existing DRA clients
delete from clients 
where name = 'DRA' 
   or email = 'admin@dra.com'
   or id = '76d5e4f3-1a2b-3c4d-5e6f-7a8b9c0d1e2f'
   or id = '9992443d-f25b-4dec-adae-d1864fb9869f';

-- Then insert the correct DRA client record
insert into clients (
  id,
  name,
  email,
  status,
  settings
) values (
  '9992443d-f25b-4dec-adae-d1864fb9869f',
  'DRA',
  'admin@dra.com',
  'active',
  jsonb_build_object(
    'company_name', 'DRA',
    'contact_name', 'DRA Admin',
    'timezone', 'America/New_York'
  )
);

-- Finally, update accounts to use the new client ID
update accounts 
set client_id = '9992443d-f25b-4dec-adae-d1864fb9869f'
where client_id is null;