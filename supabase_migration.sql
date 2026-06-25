-- Migration script for Happy Soul - Phase 3A: Authentication Profiles Table
-- To be executed in the Supabase project SQL Editor

-- 1. Create public.profiles table linking to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_language text default 'English',
  goals text[] default array[]::text[],
  interests text[] default array[]::text[],
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create RLS Policies for access control
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Create trigger to automatically insert a profile row when a user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, preferred_language, goals, interests, avatar_url, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'English',
    array[]::text[],
    array[]::text[],
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
