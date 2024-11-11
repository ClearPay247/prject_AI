-- Add all necessary columns for payment plans
alter table payments
  add column if not exists payment_plan_type text check (payment_plan_type in ('settlement', 'payment_plan')),
  add column if not exists monthly_payment numeric(10,2),
  add column if not exists total_payments integer,
  add column if not exists savings_amount numeric(10,2),
  add column if not exists original_balance numeric(10,2),
  add column if not exists payment_schedule jsonb default '[]',
  add column if not exists first_payment_date timestamp with time zone,
  add column if not exists last_payment_date timestamp with time zone,
  add column if not exists payment_frequency text check (payment_frequency in ('monthly', 'bi-weekly', 'weekly')),
  add column if not exists payments_remaining integer,
  add column if not exists next_payment_date timestamp with time zone,
  add column if not exists payment_day integer check (payment_day between 1 and 31),
  add column if not exists settlement_percentage numeric(5,2),
  add column if not exists total_with_savings numeric(10,2);

-- Add indexes for new columns
create index if not exists idx_payments_plan_type on payments(payment_plan_type);
create index if not exists idx_payments_next_payment on payments(next_payment_date);
create index if not exists idx_payments_payment_status on payments(status);

-- Update existing settlement amounts if not set
update payments 
set 
  total_with_savings = amount,
  original_balance = case 
    when payment_plan_type = 'settlement' then amount / 0.6  -- Assuming 40% discount
    else amount 
  end,
  savings_amount = case 
    when payment_plan_type = 'settlement' then (amount / 0.6) * 0.4  -- Calculate 40% savings
    else 0
  end,
  settlement_percentage = case
    when payment_plan_type = 'settlement' then 40.00
    else 0.00
  end
where total_with_savings is null;

-- Set default payment frequency for existing payment plans
update payments
set payment_frequency = 'monthly'
where payment_plan_type = 'payment_plan' 
and payment_frequency is null;

-- Calculate payments_remaining for existing payment plans
update payments
set payments_remaining = 
  case 
    when payment_plan_type = 'payment_plan' then 
      ceil(amount / monthly_payment)::integer
    else 
      0
  end
where payment_plan_type = 'payment_plan' 
and payments_remaining is null;