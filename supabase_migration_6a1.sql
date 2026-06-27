-- Migration script for Happy Soul - Phase 6A.1: Krishna Wisdom Library Database Architecture
-- To be executed in the Supabase project SQL Editor

-- 1. Create public.gita_chapters table
create table if not exists public.gita_chapters (
  id uuid primary key default gen_random_uuid(),
  api_id text not null,
  chapter_number integer unique not null,
  name text not null,
  slug text not null,
  name_transliterated text not null,
  name_translated text not null,
  verses_count integer not null,
  name_meaning text not null,
  chapter_summary text not null,
  chapter_summary_hindi text not null,
  theme_overview text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create public.gita_verses table
create table if not exists public.gita_verses (
  id uuid primary key default gen_random_uuid(),
  api_id text not null,
  chapter_id uuid references public.gita_chapters(id) on delete cascade not null,
  chapter_number integer not null,
  verse_number integer not null,
  slug text not null,
  sanskrit_text text not null,
  transliteration text not null,
  word_meanings text not null,
  translation text not null,
  translation_author text not null,
  translation_author_id text not null,
  translation_language text not null,
  commentary text not null,
  commentary_author text not null,
  commentary_author_id text not null,
  commentary_language text not null,
  practical_insight text,
  modern_explanation text,
  mood_relevance text,
  source text not null,
  source_version text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (chapter_number, verse_number)
);

-- 3. Create public.themes table (reusable wellness categories)
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null,
  icon text not null,
  color text not null
);

-- 4. Create public.verse_themes table (many-to-many relationship map)
create table if not exists public.verse_themes (
  verse_id uuid references public.gita_verses(id) on delete cascade not null,
  theme_id uuid references public.themes(id) on delete cascade not null,
  primary key (verse_id, theme_id)
);

-- 5. Create public.verse_feature_tags table (tags mapping verses to features)
create table if not exists public.verse_feature_tags (
  id uuid primary key default gen_random_uuid(),
  verse_id uuid references public.gita_verses(id) on delete cascade not null,
  feature_name text not null,
  unique (verse_id, feature_name)
);

-- 6. Enable Row Level Security (RLS) on all tables
alter table public.gita_chapters enable row level security;
alter table public.gita_verses enable row level security;
alter table public.themes enable row level security;
alter table public.verse_themes enable row level security;
alter table public.verse_feature_tags enable row level security;

-- 7. Create sensible read-only SELECT policies for authenticated users
-- INSERT, UPDATE, and DELETE operations are denied by default since no policies exist for them.
-- Admins and seed pipelines can bypass RLS via the service_role key.

drop policy if exists "Allow read access to authenticated users on gita_chapters" on public.gita_chapters;
create policy "Allow read access to authenticated users on gita_chapters"
  on public.gita_chapters for select
  to authenticated
  using (true);

drop policy if exists "Allow read access to authenticated users on gita_verses" on public.gita_verses;
create policy "Allow read access to authenticated users on gita_verses"
  on public.gita_verses for select
  to authenticated
  using (true);

drop policy if exists "Allow read access to authenticated users on themes" on public.themes;
create policy "Allow read access to authenticated users on themes"
  on public.themes for select
  to authenticated
  using (true);

drop policy if exists "Allow read access to authenticated users on verse_themes" on public.verse_themes;
create policy "Allow read access to authenticated users on verse_themes"
  on public.verse_themes for select
  to authenticated
  using (true);

drop policy if exists "Allow read access to authenticated users on verse_feature_tags" on public.verse_feature_tags;
create policy "Allow read access to authenticated users on verse_feature_tags"
  on public.verse_feature_tags for select
  to authenticated
  using (true);

-- 8. Create highly useful indexes for rapid joining and query performance
create index if not exists idx_gita_verses_chapter_id on public.gita_verses(chapter_id);
create index if not exists idx_gita_verses_reference on public.gita_verses(chapter_number, verse_number);
create index if not exists idx_verse_themes_theme_id on public.verse_themes(theme_id);
create index if not exists idx_verse_feature_tags_name on public.verse_feature_tags(feature_name);
