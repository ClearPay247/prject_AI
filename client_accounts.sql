-- Query to show accounts with their associated client names
SELECT 
  a.account_number,
  a.debtor_name,
  c.name as client_name,
  a.current_balance,
  a.created_at
FROM accounts a
JOIN clients c ON c.id = a.client_id
ORDER BY a.created_at DESC;