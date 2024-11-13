-- Verify the DRA client record
select id, name, email, status, created_at, settings
from clients 
where id = '9992443d-f25b-4dec-adae-d1864fb9869f';

-- Check accounts linked to DRA
select count(*) as account_count
from accounts
where client_id = '9992443d-f25b-4dec-adae-d1864fb9869f';

-- Verify no orphaned accounts
select count(*) as orphaned_count
from accounts
where client_id is null;