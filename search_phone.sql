-- Search for phone number across all relevant tables and formats
WITH formatted_numbers AS (
  SELECT 
    '2093613507' as raw_number,
    '+12093613507' as e164_format,
    '(209) 361-3507' as formatted_number
)
SELECT 
  'phone_numbers' as source_table,
  pn.id as record_id,
  pn.number as found_number,
  a.account_number,
  a.debtor_name,
  pn.status as phone_status,
  pn.last_called,
  a.current_balance
FROM phone_numbers pn
JOIN accounts a ON a.id = pn.account_id
CROSS JOIN formatted_numbers fn
WHERE pn.number IN (fn.raw_number, fn.e164_format) 
   OR pn.number LIKE '%' || fn.raw_number || '%'

UNION ALL

SELECT 
  'call_logs' as source_table,
  cl.id as record_id,
  cl.phone_number as found_number,
  a.account_number,
  a.debtor_name,
  cl.status as call_status,
  cl.call_time as last_called,
  a.current_balance
FROM call_logs cl
LEFT JOIN accounts a ON a.id = cl.account_id
CROSS JOIN formatted_numbers fn
WHERE cl.phone_number IN (fn.raw_number, fn.e164_format)
   OR cl.phone_number LIKE '%' || fn.raw_number || '%'

ORDER BY last_called DESC NULLS LAST;