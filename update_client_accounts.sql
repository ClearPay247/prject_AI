-- First verify the correct client ID and get it
SELECT id, name, email 
FROM clients 
WHERE name = 'DRA';

-- Then update accounts with the correct client ID
UPDATE accounts 
SET 
  client_id = '9992443d-f25b-4dec-adae-d1864fb98699', -- DRA's actual client ID from clients table
  updated_at = NOW()
WHERE client_id IS NULL;