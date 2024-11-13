-- Create mapping_templates table
create table if not exists mapping_templates (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  description text,
  mappings jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_mapping_templates_client on mapping_templates(client_id);
create index if not exists idx_mapping_templates_created_by on mapping_templates(created_by);

-- Enable RLS
alter table mapping_templates enable row level security;

-- Create policies
create policy "Enable read access for all users" on mapping_templates
  for select using (true);

create policy "Enable insert for all users" on mapping_templates
  for insert with check (true);

create policy "Enable update for all users" on mapping_templates
  for update using (true);

create policy "Enable delete for all users" on mapping_templates
  for delete using (true);