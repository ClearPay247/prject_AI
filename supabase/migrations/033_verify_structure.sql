-- Check table structure
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'accounts'
order by ordinal_position;

-- Check existing triggers
select tgname as trigger_name, 
       proname as function_name
from pg_trigger 
join pg_proc on pg_proc.oid = pg_trigger.tgfoid
where tgrelid = 'accounts'::regclass;

-- Check indexes
select
    i.relname as index_name,
    a.attname as column_name
from
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
where
    t.oid = ix.indrelid
    and i.oid = ix.indexrelid
    and a.attrelid = t.oid
    and a.attnum = ANY(ix.indkey)
    and t.relkind = 'r'
    and t.relname = 'accounts'
order by
    t.relname,
    i.relname;