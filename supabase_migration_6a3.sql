-- Migration script for Happy Soul - Phase 6A.3: User Profile System & Personalized Onboarding
-- To be executed in the Supabase project SQL Editor

alter table public.profiles
  add column if not exists current_life_situation text,
  add column if not exists primary_challenge text,
  add column if not exists experience_level text,
  add column if not exists daily_reminder_period text default 'morning',
  add column if not exists notifications_enabled boolean default true,
  add column if not exists notification_frequency text default 'daily',
  add column if not exists content_format_preference text default 'balanced',
  add column if not exists learning_style text,
  add column if not exists music_mood_preference text default 'peaceful',
  add column if not exists avatar_type text default 'lotus',
  add column if not exists avatar_color text default 'indigo',
  add column if not exists spiritual_path text default 'balanced',
  add column if not exists onboarding_version integer default 1,
  add column if not exists profile_version integer default 1,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- Update existing rows to have default values if they are null to preserve compatibility
update public.profiles
  set
    daily_reminder_period = coalesce(daily_reminder_period, 'morning'),
    notifications_enabled = coalesce(notifications_enabled, true),
    notification_frequency = coalesce(notification_frequency, 'daily'),
    content_format_preference = coalesce(content_format_preference, 'balanced'),
    music_mood_preference = coalesce(music_mood_preference, 'peaceful'),
    avatar_type = coalesce(avatar_type, 'lotus'),
    avatar_color = coalesce(avatar_color, 'indigo'),
    spiritual_path = coalesce(spiritual_path, 'balanced'),
    onboarding_version = coalesce(onboarding_version, 1),
    profile_version = coalesce(profile_version, 1)
  where is_onboarded = true;

-- Drop trigger if it exists and recreate it to manage updated_at
drop trigger if exists tr_profiles_updated_at on public.profiles;
create or replace function public.update_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_profiles_updated_at();
