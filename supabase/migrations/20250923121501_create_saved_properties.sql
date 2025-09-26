-- Create global saved_properties table (v1, no auth)
create table if not exists public.saved_properties (
  id bigserial primary key,
  property_id bigint not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (property_id)
);

create index if not exists idx_saved_properties_property_id on public.saved_properties(property_id);

