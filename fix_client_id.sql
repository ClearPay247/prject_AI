-- 1. Drop and recreate the foreign key constraint
ALTER TABLE accounts 
DROP CONSTRAINT IF EXISTS accounts_client_id_fkey;

ALTER TABLE accounts 
ADD CONSTRAINT accounts_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id);

-- 2. Update accounts with correct client ID
UPDATE accounts 
SET 
  client_id = '9992443d-f25b-4dec-adae-d1864fb9869f',  -- Note the correct ID ending in '9f'
  updated_at = NOW()
WHERE client_id IS NULL;