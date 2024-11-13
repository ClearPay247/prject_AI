-- Drop existing SSN constraint if it exists
alter table accounts 
drop constraint if exists valid_ssn_format;

-- Add new flexible SSN constraint that allows either:
-- 1. Full SSN with or without dashes (9 digits)
-- 2. Last 4 digits only (4 digits)
-- 3. Null values
alter table accounts
add constraint flexible_ssn_format check (
  ssn is null or 
  ssn ~ '^\d{4}$' or -- Last 4 digits only
  ssn ~ '^\d{9}$' or -- 9 digits without dashes
  ssn ~ '^\d{3}-\d{2}-\d{4}$' -- Full SSN with dashes
);