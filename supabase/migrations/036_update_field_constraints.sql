-- Drop existing constraints if they exist
alter table accounts 
drop constraint if exists valid_ssn_format,
drop constraint if exists valid_email_format,
drop constraint if exists flexible_ssn_format;

-- Add new flexible SSN constraint that allows:
-- 1. Full SSN with or without dashes (9 digits)
-- 2. Last 4 digits only (4 digits)
-- 3. Null values
-- 4. Any string format
alter table accounts
add constraint flexible_ssn_format check (
  ssn is null or 
  length(regexp_replace(ssn, '\D', '', 'g')) between 4 and 9
);

-- Remove email format validation completely
-- This allows any string format for email addresses
comment on column accounts.email is 'Email address field - no format validation';