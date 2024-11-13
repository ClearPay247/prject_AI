-- Drop existing ZIP code constraint if it exists
alter table accounts 
drop constraint if exists valid_zip_code;

-- Add new ZIP code validation constraint that allows null values and both 5 and 9 digit formats
alter table accounts
add constraint valid_zip_code check (
  zip_code is null or 
  zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'
);