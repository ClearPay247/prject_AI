-- Drop existing email constraint if it exists
alter table accounts 
drop constraint if exists valid_email_format;

-- Add new email validation constraint that allows null values
alter table accounts
add constraint valid_email_format check (
  email is null or 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);