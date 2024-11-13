-- Allow null client_id for global templates
alter table mapping_templates
  alter column client_id drop not null;

-- Add index for templates with null client_id (global templates)
create index if not exists idx_mapping_templates_global on mapping_templates(client_id) 
where client_id is null;

-- Drop existing policies first
drop policy if exists "Enable read access for all users" on mapping_templates;
drop policy if exists "Enable insert for all users" on mapping_templates;
drop policy if exists "Enable update for all users" on mapping_templates;
drop policy if exists "Enable delete for all users" on mapping_templates;

-- Create new policies
create policy "Enable read access for all users" on mapping_templates
  for select using (true);

create policy "Enable insert for all users" on mapping_templates
  for insert with check (true);

create policy "Enable update for all users" on mapping_templates
  for update using (true);

create policy "Enable delete for all users" on mapping_templates
  for delete using (true);