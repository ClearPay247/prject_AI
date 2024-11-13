-- First verify the count of accounts with null client_id
SELECT COUNT(*) 
FROM accounts 
WHERE client_id IS NULL;

-- Update all accounts with null client_id to DRA's ID
UPDATE accounts 
SET 
  client_id = '9992443d-f25b-4dec-adae-d1864fb9869f',
  updated_at = NOW()
WHERE client_id IS NULL;

-- Verify the update by checking remaining null client_ids
SELECT COUNT(*) 
FROM accounts 
WHERE client_id IS NULL;

-- Show updated accounts with client names
SELECT 
  a.account_number,
  a.debtor_name,
  c.name as client_name,
  a.updated_at
FROM accounts a
LEFT JOIN clients c ON c.id = a.client_id
WHERE a.updated_at >= NOW() - INTERVAL '5 minutes'
ORDER BY a.updated_at DESC;