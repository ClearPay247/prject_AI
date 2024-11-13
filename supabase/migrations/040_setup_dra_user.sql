-- First, ensure the DRA client exists with the correct ID
insert into clients (id, name, email, status)
values (
  '9992443d-f25b-4dec-adae-d1864fb9869f',  -- Correct UUID for DRA
  'DRA',
  'admin@dra.com',
  'active'
) on conflict (email) do update set
  id = '9992443d-f25b-4dec-adae-d1864fb9869f',  -- Ensure ID is updated if record exists
  name = 'DRA',
  status = 'active';

-- Create auth user for DRA (this is handled by Supabase auth UI, just documenting the link)
-- The user will sign up with:
-- Email: admin@dra.com
-- Password: DRA@2024!