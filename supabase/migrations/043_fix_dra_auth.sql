-- First, ensure the DRA client exists with the correct ID and email
insert into clients (
  id,
  name,
  email,
  status,
  settings
) values (
  '9992443d-f25b-4dec-adae-d1864fb9869f',
  'DRA',
  'dra.admin@clearpay247.com', -- Using the same email for consistency
  'active',
  jsonb_build_object(
    'company_name', 'DRA',
    'contact_name', 'DRA Admin',
    'timezone', 'America/New_York'
  )
) on conflict (email) do update set
  id = '9992443d-f25b-4dec-adae-d1864fb9869f',
  name = 'DRA',
  status = 'active';

-- Update any existing accounts to use this client ID
update accounts 
set client_id = '9992443d-f25b-4dec-adae-d1864fb9869f'
where client_id is null;