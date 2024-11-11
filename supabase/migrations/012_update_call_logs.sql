-- Update call_logs status enum to remove 'attempted'
alter table call_logs 
  drop constraint if exists call_logs_status_check;

alter table call_logs
  add constraint call_logs_status_check
  check (status in ('completed', 'no_answer', 'voicemail', 'failed'));