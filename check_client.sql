-- Query to find the client record
SELECT id, name, email, status, created_at 
FROM clients 
WHERE id = '9992443d-f25b-4dec-adae-d1864fb9869f';

-- Or find by client name
SELECT id, name, email, status, created_at 
FROM clients 
WHERE name = 'DRA';