-- Migration script for Happy Soul - Phase 6B.1: Database Foundation for Krishna AI
-- To be executed in the Supabase project SQL Editor

-- ============================================================================
-- 1. match_verses Vector-Search RPC Function
-- ============================================================================
-- Retrieves the most semantically relevant Bhagavad Gita verses using cosine
-- similarity against the existing ivfflat index (vector_cosine_ops, 768-dim).
--
-- THRESHOLD NOTE:
--   match_threshold is expressed as a minimum cosine SIMILARITY (0.0 – 1.0).
--   Internally it is converted to a maximum cosine DISTANCE for the WHERE clause
--   so that PostgreSQL can use the ivfflat index to prune candidates early:
--     distance = gv.embedding <=> query_embedding   (range: 0.0 = identical, 2.0 = opposite)
--     similarity = 1 - distance
--   Therefore:  similarity >= match_threshold  <=>  distance <= (1.0 - match_threshold)
--
-- ORDERING:
--   ORDER BY gv.embedding <=> query_embedding ASC  (closest first)
--   This ordering lets the ivfflat index return candidates in distance order
--   without a full-table sort.
--
-- THEME FILTERING:
--   The themes table has NO slug column — its canonical identifier is `name`
--   (text, unique). filter_themes accepts display names or hyphen-separated
--   equivalents (e.g. "Self Control" or "self-control").
--   Both forms are matched case-insensitively.
--
-- GRANT:
--   Execution is restricted to `authenticated` only, consistent with all
--   existing Gita table RLS policies established in migration 6A.1.

create or replace function public.match_verses (
  query_embedding vector(768),
  match_threshold float default 0.0,
  match_count integer default 5,
  filter_themes text[] default null,
  filter_chapter integer default null
)
returns table (
  id uuid,
  chapter_number integer,
  chapter_name text,
  verse_number integer,
  sanskrit_text text,
  transliteration text,
  translation text,
  commentary text,
  practical_insight text,
  similarity float
)
language sql
stable
parallel safe
security definer
set search_path = public, extensions, pg_temp
as $$
  select
    gv.id,
    gv.chapter_number,
    coalesce(gc.name_translated, gc.name) as chapter_name,
    gv.verse_number,
    gv.sanskrit_text,
    gv.transliteration,
    gv.translation,
    gv.commentary,
    gv.practical_insight,
    (1.0 - (gv.embedding <=> query_embedding))::float as similarity
  from public.gita_verses gv
  left join public.gita_chapters gc on gv.chapter_id = gc.id
  where gv.embedding is not null
    -- Express threshold as a maximum distance so the ivfflat index can prune early
    and (gv.embedding <=> query_embedding) <= (1.0 - match_threshold)
    and (filter_chapter is null or gv.chapter_number = filter_chapter)
    and (
      filter_themes is null
      or array_length(filter_themes, 1) is null
      or exists (
        select 1
        from public.verse_themes vt
        join public.themes t on vt.theme_id = t.id
        where vt.verse_id = gv.id
          and (
            -- Match display name (e.g. "Peace") or hyphen form (e.g. "self-control")
            lower(t.name) = any(select lower(unnest(filter_themes)))
            or lower(replace(t.name, ' ', '-')) = any(select lower(unnest(filter_themes)))
          )
      )
    )
  order by gv.embedding <=> query_embedding asc
  limit match_count;
$$;

-- Grant execution permission to authenticated users only.
-- Consistent with all existing Gita table RLS policies (migration 6A.1).
-- Anonymous callers are not permitted anywhere in this project's architecture.
grant execute on function public.match_verses(vector(768), float, integer, text[], integer) to authenticated;


-- ============================================================================
-- 2. conversations Table
-- ============================================================================
-- Stores conversation threads initiated by seekers with Krishna AI.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Conversation',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for retrieving conversations by user ordered by most recently updated
create index if not exists idx_conversations_user_updated
  on public.conversations(user_id, updated_at desc);

-- Trigger to automatically maintain updated_at timestamp on conversations
create or replace function public.update_conversations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_conversations_updated_at on public.conversations;
create trigger tr_conversations_updated_at
  before update on public.conversations
  for each row
  execute function public.update_conversations_updated_at();


-- ============================================================================
-- 3. messages Table
-- ============================================================================
-- Stores individual message turns within a conversation thread.
-- Citations reference canonical verse UUIDs directly instead of duplicating text.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  cited_verse_ids uuid[] default array[]::uuid[],
  retrieval_meta jsonb default '{}'::jsonb,
  is_flagged boolean default false,
  created_at timestamptz default now() not null
);

-- Index for chronological retrieval of messages in a conversation
create index if not exists idx_messages_conversation_created
  on public.messages(conversation_id, created_at asc);


-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on conversations
alter table public.conversations enable row level security;

-- Policies for conversations: user can only access and modify their own records
drop policy if exists "Users can view their own conversations" on public.conversations;
create policy "Users can view their own conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own conversations" on public.conversations;
create policy "Users can create their own conversations"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own conversations" on public.conversations;
create policy "Users can update their own conversations"
  on public.conversations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own conversations" on public.conversations;
create policy "Users can delete their own conversations"
  on public.conversations for delete
  to authenticated
  using (auth.uid() = user_id);


-- Enable RLS on messages
alter table public.messages enable row level security;

-- Policies for messages: access is verified through the parent conversation's ownership
drop policy if exists "Users can view messages from their own conversations" on public.messages;
create policy "Users can view messages from their own conversations"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages into their own conversations" on public.messages;
create policy "Users can insert messages into their own conversations"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update messages in their own conversations" on public.messages;
create policy "Users can update messages in their own conversations"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete messages in their own conversations" on public.messages;
create policy "Users can delete messages in their own conversations"
  on public.messages for delete
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );
