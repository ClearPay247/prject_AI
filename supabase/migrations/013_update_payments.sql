-- Add new columns to payments table
alter table payments
  add column if not exists payment_plan_type text check (payment_plan_type in ('settlement', 'payment_plan')),
  add column if not exists monthly_payment numeric(10,2),
  add column if not exists total_payments integer,
  add column if not exists savings_amount numeric(10,2),
  add column if not exists original_balance numeric(10,2);

-- Add indexes for new columns
create index if not exists idx_payments_plan_type on payments(payment_plan_type);

-- Update existing rows to have settlement as default payment_plan_type
update payments 
set payment_plan_type = 'settlement'
where payment_plan_type is null;