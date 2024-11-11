-- Add separate columns for card and check details
alter table payments
  -- Card payment details
  add column if not exists card_number_encrypted text,
  add column if not exists card_expiry_encrypted text,
  add column if not exists card_cvv_encrypted text,
  add column if not exists card_name_encrypted text,
  add column if not exists card_zip_encrypted text,
  
  -- Check payment details  
  add column if not exists check_routing_encrypted text,
  add column if not exists check_account_encrypted text,
  add column if not exists check_name_encrypted text,
  add column if not exists check_type text check (check_type in ('checking', 'savings')),

  -- Payment plan details
  add column if not exists payment_plan_type text check (payment_plan_type in ('settlement', 'payment_plan')),
  add column if not exists monthly_payment numeric(10,2),
  add column if not exists total_payments integer,
  add column if not exists savings_amount numeric(10,2),
  add column if not exists original_balance numeric(10,2),
  add column if not exists settlement_percentage numeric(5,2),
  add column if not exists payment_schedule jsonb default '[]',
  add column if not exists first_payment_date timestamp with time zone,
  add column if not exists last_payment_date timestamp with time zone,
  add column if not exists next_payment_date timestamp with time zone,
  add column if not exists payments_remaining integer;

-- Add indexes
create index if not exists idx_payments_type on payments(payment_type);
create index if not exists idx_payments_plan_type on payments(payment_plan_type);
create index if not exists idx_payments_next_payment on payments(next_payment_date);

-- Create view for masked payment details
create or replace view masked_payment_details as
select 
  id,
  payment_type,
  case 
    when payment_type = 'card' then 
      '****-****-****-' || right(card_number_encrypted, 4)
    when payment_type = 'check' then
      '********' || right(check_account_encrypted, 4)
  end as masked_number,
  case
    when payment_type = 'card' then
      card_name_encrypted
    when payment_type = 'check' then
      check_name_encrypted
  end as payment_name,
  case
    when payment_type = 'card' then
      card_expiry_encrypted
    else null
  end as expiry,
  check_type
from payments;

-- Function to get decrypted payment details
create or replace function get_payment_details(payment_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  payment_record payments%rowtype;
  result jsonb;
begin
  select * into payment_record
  from payments
  where id = payment_id;

  if payment_record.payment_type = 'card' then
    result = jsonb_build_object(
      'type', 'card',
      'number', payment_record.card_number_encrypted,
      'expiry', payment_record.card_expiry_encrypted,
      'name', payment_record.card_name_encrypted,
      'zip', payment_record.card_zip_encrypted
    );
  else
    result = jsonb_build_object(
      'type', 'check',
      'routing', payment_record.check_routing_encrypted,
      'account', payment_record.check_account_encrypted,
      'name', payment_record.check_name_encrypted,
      'check_type', payment_record.check_type
    );
  end if;

  return result;
end;
$$;