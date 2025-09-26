-- Create counties lookup table
create table if not exists public.counties (
  id bigserial primary key,
  name text not null,
  state text,
  slug text unique,
  fips_code text,
  created_at timestamptz not null default now()
);

-- Ensure uniqueness of (name, state-with-empty-for-null)
create unique index if not exists idx_counties_name_state_unique
  on public.counties (name, (coalesce(state, '')));

-- Add county_id to properties (nullable for phased rollout)
alter table public.properties
  add column if not exists county_id bigint;

-- Seed counties from existing properties.county values (assumes Texas; adjust if needed)
insert into public.counties (name, state, slug)
select distinct p.county as name, 'TX' as state, lower(p.county) as slug
from public.properties p
where p.county is not null and p.county <> ''
on conflict do nothing;

-- Backfill properties.county_id using counties table
update public.properties p
set county_id = c.id
from public.counties c
where p.county is not null
  and c.name = p.county
  and (p.county_id is null or p.county_id <> c.id);

-- Add FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    select 1 from information_schema.table_constraints tc
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_name = 'properties'
      and tc.constraint_name = 'properties_county_id_fkey'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_county_id_fkey
      FOREIGN KEY (county_id)
      REFERENCES public.counties(id)
      ON UPDATE NO ACTION ON DELETE NO ACTION;
  END IF;
END$$;

-- Index for faster filtering by county_id
create index if not exists idx_properties_county_id on public.properties(county_id);

