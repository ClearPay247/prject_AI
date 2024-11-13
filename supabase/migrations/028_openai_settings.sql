-- Insert default OpenAI settings if they don't exist
insert into integration_settings (provider, settings)
values (
  'openai',
  '{
    "apiKey": "",
    "model": "gpt-4",
    "temperature": 0.3,
    "maxTokens": 2000,
    "organization": ""
  }'::jsonb
)
on conflict (provider) do nothing;