-- Migration script for Happy Soul - Phase 6A.2: Krishna Wisdom Library Seeding Metadata Table
-- To be executed in the Supabase project SQL Editor

create table if not exists public.seed_metadata (
  id uuid primary key default gen_random_uuid(),
  dataset_name text not null,
  translator text not null,
  commentary text not null,
  version text not null,
  chapters_count integer not null,
  verses_count integer not null,
  checksum text,
  seeded_at timestamptz default now()
);

-- Enable RLS
alter table public.seed_metadata enable row level security;

-- Enable SELECT policy for authenticated users
drop policy if exists "Allow read access to authenticated users on seed_metadata" on public.seed_metadata;
create policy "Allow read access to authenticated users on seed_metadata"
  on public.seed_metadata for select
  to authenticated
  using (true);
