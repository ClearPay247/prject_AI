-- Drop existing state constraint if it exists
alter table accounts 
drop constraint if exists valid_state_code;

-- Add new state validation constraint
alter table accounts
add constraint valid_state_code check (
  state is null or 
  state in (
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
    'DC','AS','GU','MP','PR','VI'
  )
);