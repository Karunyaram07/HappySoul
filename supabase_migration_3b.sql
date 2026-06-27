-- Migration script for Happy Soul - Phase 3B: User Onboarding
-- To be executed in the Supabase project SQL Editor

-- 1. Add is_onboarded column to profiles table
alter table public.profiles
add column if not exists is_onboarded boolean default false;
