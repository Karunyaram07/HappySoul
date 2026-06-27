-- Migration script for Happy Soul - Phase 6A.4: pgvector, Gita Verse Embeddings, and Metadata Expansion
-- To be executed in the Supabase project SQL Editor

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Add embedding and metadata columns to public.gita_verses table
-- We use 768 dimensions matching gemini-embedding-001 with outputDimensionality
alter table public.gita_verses
  add column if not exists embedding vector(768),
  add column if not exists embedding_model text,
  add column if not exists embedding_version text,
  add column if not exists embedding_text_version integer default 1,
  add column if not exists embedded_at timestamptz;

-- 3. Create IVFFLAT index on gita_verses for optimized Approximate Nearest Neighbor (ANN) search via cosine similarity
-- Cosine similarity is chosen because it evaluates the semantic angle between text vectors independently of 
-- overall text length, which is optimal for documents of varying size (sanskrit verses vs commentaries).
-- Additionally, gemini-embedding-001 outputs unit-normalized vectors.
create index if not exists gita_verses_embedding_ivfflat_idx
  on public.gita_verses
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- 4. Extend public.seed_metadata table to capture embedding seeding logs
alter table public.seed_metadata
  add column if not exists embedding_model text,
  add column if not exists embedding_dimensions integer,
  add column if not exists embedded_rows integer,
  add column if not exists embedding_version text,
  add column if not exists embedding_text_version integer,
  add column if not exists completed_at timestamptz;
