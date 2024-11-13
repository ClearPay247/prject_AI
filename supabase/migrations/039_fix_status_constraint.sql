-- Drop existing status constraint if it exists
alter table accounts 
drop constraint if exists accounts_status_check;

-- Add new status constraint with all valid statuses
alter table accounts
add constraint accounts_status_check check (
  status in (
    'New',
    'Active', 
    'Paid',
    'Settled',
    'Uncollectible',
    'Legal',
    'Disputed',
    'Payment Plan',
    'Deceased',
    'Bankruptcy'
  )
);