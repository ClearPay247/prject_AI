-- 1. First, let's verify the exact client ID in the clients table
SELECT id, name, email, created_at 
FROM clients 
WHERE name = 'DRA';

-- 2. Check for any whitespace or hidden characters
SELECT 
  id,
  length(id::text) as id_length,
  encode(id::text::bytea, 'hex') as hex_representation
FROM clients 
WHERE name = 'DRA';

-- 3. Verify the data type of client_id in both tables
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE column_name = 'client_id' 
  AND table_name IN ('accounts', 'clients');

-- 4. Check the foreign key constraint definition
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'accounts';