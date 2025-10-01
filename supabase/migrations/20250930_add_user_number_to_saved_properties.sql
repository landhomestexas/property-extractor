-- Add user_number column to saved_properties table
-- This will store the county-based sequential numbers like MAD-001, BUR-001, etc.

alter table public.saved_properties
  add column if not exists user_number text;

-- Create unique index to ensure no duplicate user_numbers within the same county
-- We'll enforce this at the application level since we need to join with properties table
create index if not exists idx_saved_properties_user_number on public.saved_properties(user_number);

-- Add a comment to explain the column
comment on column public.saved_properties.user_number is 'County-based sequential property number (e.g., MAD-000001, BUR-000002)';
