-- Add check constraint to ensure phone numbers are in E.164 format
alter table phone_numbers 
  add constraint phone_number_format 
  check (number ~ '^\+[1-9]\d{1,14}$');

-- Update existing phone numbers to E.164 format
update phone_numbers
set number = case 
  when number ~ '^\+' then number -- Already has + prefix
  when length(regexp_replace(number, '\D', '', 'g')) = 10 then '+1' || regexp_replace(number, '\D', '', 'g') -- US numbers
  else '+' || regexp_replace(number, '\D', '', 'g') -- Other numbers
end
where number is not null;