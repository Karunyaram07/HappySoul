# Bhagavad Gita Seeding Instructions & Metadata Log

This document outlines the instructions for running the Bhagavad Gita database import and enrichment seed pipeline.

---

## 1. Prerequisites & Environment Setup

Before running the seeder, verify that:
1. You have created a database backup or schema export in Supabase.
2. The following variables exist in your local `.env.local` configuration file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-bypassing-rls
   ```
   > [!WARNING]
   > The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security policies. Never commit this key to Git or expose it in public client scripts.

---

## 2. Dataset Sources

The seeder fetches data from the open-source repository `https://ravisiyer.github.io/gita-data/v1`:
* **Chapters metadata**: `/chapters.json`
* **Verses text/transliteration**: `/verse.json`
* **Translations (multilingual)**: `/translation.json`
* **Commentaries (multilingual)**: `/commentary.json`

---

## 3. How to Run the Seeder

To execute the staged import pipeline, run:
```bash
npm run db:seed-gita
```

This runs `scripts/gita/index.js` which performs the following staged actions:
1. **Fetch Dataset**: Downloads the static JSON files concurrently with an automatic 3-attempt retry loop for network stability.
2. **Compute Checksum**: Generates a SHA-256 hash of the downloaded content to audit modifications.
3. **Stage 1 (Chapters Seeding)**: Upserts 18 chapters into `public.gita_chapters`.
4. **Stage 2 (Verses Seeding)**: Upserts 700 verses in batches of 50 into `public.gita_verses`.
5. **Stage 3 (Translation Seeding)**: Extracts Sivananda (or configured from `lib/gita/config.js`) English translations and updates verses.
6. **Stage 4 (Commentary Seeding)**: Extracts Sivananda (or configured from `lib/gita/config.js`) commentaries and updates verses.
7. **Metadata Log**: Appends a summary log of the seeding session (checksum, counts, version) to `public.seed_metadata`.

---

## 4. Verification & Expected Counts

After the run finishes, verify that each stage prints `PASS`:
```text
✓ Chapters Imported: 18 / 18 | PASS
✓ Verses Imported: 700 / 700 | PASS
✓ Translation Updated: 700 | PASS
✓ Commentary Updated: 700 | PASS
✓ Seeding session logged in seed_metadata | PASS
```

Query the database directly to verify:
* `SELECT COUNT(*) FROM public.gita_chapters` $\to$ **18**
* `SELECT COUNT(*) FROM public.gita_verses` $\to$ **700**
* `SELECT COUNT(*) FROM public.seed_metadata` $\to$ **1**
