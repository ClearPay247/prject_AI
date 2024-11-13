-- Drop all existing SSN-related constraints
alter table accounts 
drop constraint if exists valid_ssn_format,
drop constraint if exists flexible_ssn_format;

-- Remove any validation on SSN field completely
comment on column accounts.ssn is 'SSN field - no format validation';

-- Ensure SSN column allows nulls
alter table accounts
alter column ssn drop not null,
alter column ssn type text;