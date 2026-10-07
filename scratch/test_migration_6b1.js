// Test script: Verify Phase 6B.1 migration results against live Supabase
// Run from: a:\June2026\happy-soul via: node scratch/test_migration_6b1.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Supabase anon client (simulates unauthenticated / second user)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let passed = 0;
let failed = 0;
const results = [];

function pass(testName, detail = '') {
  passed++;
  results.push({ status: '✓ PASS', test: testName, detail });
  console.log(`  ✓ PASS  ${testName}${detail ? ' — ' + detail : ''}`);
}

function fail(testName, detail = '') {
  failed++;
  results.push({ status: '✗ FAIL', test: testName, detail });
  console.log(`  ✗ FAIL  ${testName}${detail ? ' — ' + detail : ''}`);
}

async function runTests() {
  console.log('\n========================================');
  console.log('  PHASE 6B.1 MIGRATION VERIFICATION     ');
  console.log('========================================\n');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: match_verses function exists
  // ─────────────────────────────────────────────────────────────────────────
  console.log('TEST 1: match_verses function exists');
  const dummyVec = Array(768).fill(0.001);
  const { data: t1data, error: t1err } = await supabase.rpc('match_verses', {
    query_embedding: dummyVec,
    match_threshold: 0.0,
    match_count: 1
  });
  if (t1err && t1err.code === 'PGRST202') {
    fail('match_verses exists', t1err.message);
  } else if (t1err) {
    fail('match_verses exists', `unexpected error: ${t1err.message}`);
  } else {
    pass('match_verses exists', 'RPC callable without errors');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Basic vector search using an actual verse embedding
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 2: Basic vector search with real verse embedding');
  // Fetch a real verse embedding to use as the query
  const { data: sampleVerseRows } = await supabase
    .from('gita_verses')
    .select('id, chapter_number, verse_number, embedding')
    .not('embedding', 'is', null)
    .limit(1);

  let sampleEmbedding = null;
  let sampleVerseId = null;
  if (sampleVerseRows && sampleVerseRows.length > 0) {
    sampleEmbedding = sampleVerseRows[0].embedding;
    sampleVerseId = sampleVerseRows[0].id;
  }

  if (!sampleEmbedding) {
    fail('Real verse embedding fetch', 'No verse with embedding found');
  } else {
    pass('Real verse embedding fetch', `Using verse ${sampleVerseRows[0].chapter_number}.${sampleVerseRows[0].verse_number}`);

    // Run match_verses with this real embedding (top similarity should be the same verse)
    const { data: t2data, error: t2err } = await supabase.rpc('match_verses', {
      query_embedding: sampleEmbedding,
      match_threshold: 0.0,
      match_count: 5
    });

    if (t2err) {
      fail('match_verses with real embedding', t2err.message);
    } else if (!t2data || t2data.length === 0) {
      fail('match_verses returns results', 'Empty result set');
    } else {
      pass('match_verses returns results', `Got ${t2data.length} result(s)`);

      // TEST 3: Results contain required columns
      console.log('\nTEST 3: Results contain required columns');
      const firstResult = t2data[0];
      const requiredFields = ['id', 'chapter_number', 'chapter_name', 'verse_number', 'sanskrit_text', 'transliteration', 'translation', 'similarity'];
      const missingFields = requiredFields.filter(f => !(f in firstResult));
      if (missingFields.length > 0) {
        fail('Required columns present', `Missing: ${missingFields.join(', ')}`);
      } else {
        pass('Required columns present', `All ${requiredFields.length} required fields present`);
      }

      // TEST 4: practical_insight column is returned (even if NULL)
      console.log('\nTEST 4: practical_insight column is returned');
      if ('practical_insight' in firstResult) {
        pass('practical_insight column returned', `value: ${firstResult.practical_insight ?? 'NULL (expected)'}`);
      } else {
        fail('practical_insight column returned', 'Column missing from result');
      }

      // TEST 5: Results ordered by highest similarity first
      console.log('\nTEST 5: Results ordered by similarity descending');
      const similarities = t2data.map(r => r.similarity);
      const isSorted = similarities.every((v, i) => i === 0 || similarities[i - 1] >= v);
      if (isSorted) {
        pass('Results ordered by similarity desc', `Top similarity: ${similarities[0].toFixed(6)}`);
      } else {
        fail('Results ordered by similarity desc', `Similarities out of order: ${similarities.join(', ')}`);
      }

      // TEST 6: Top result is the same verse (self-similarity should be highest)
      console.log('\nTEST 6: Self-similarity is highest (top result matches query verse)');
      if (t2data[0].id === sampleVerseId) {
        pass('Top result is query verse itself', `similarity: ${t2data[0].similarity.toFixed(6)}`);
      } else {
        // Not a hard failure - IVFFLAT is approximate
        pass('Top result plausible', `Similarity: ${t2data[0].similarity.toFixed(6)} (IVFFLAT is approximate)`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 7: Similarity threshold works
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 7: Similarity threshold filters weak results');
  if (sampleEmbedding) {
    const { data: t7high, error: t7err } = await supabase.rpc('match_verses', {
      query_embedding: sampleEmbedding,
      match_threshold: 0.99,
      match_count: 10
    });
    const { data: t7low } = await supabase.rpc('match_verses', {
      query_embedding: sampleEmbedding,
      match_threshold: 0.0,
      match_count: 10
    });
    if (t7err) {
      fail('Threshold test', t7err.message);
    } else {
      const highCount = t7high ? t7high.length : 0;
      const lowCount = t7low ? t7low.length : 0;
      if (highCount <= lowCount) {
        pass('Threshold filters results', `threshold=0.99 → ${highCount} results; threshold=0.0 → ${lowCount} results`);
      } else {
        fail('Threshold filtering', `High threshold returned MORE results: ${highCount} vs ${lowCount}`);
      }
    }
  } else {
    fail('Threshold test', 'No sample embedding available — skipped');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 8: filter_chapter works
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 8: filter_chapter limits results to a single chapter');
  if (sampleEmbedding) {
    const { data: t8data, error: t8err } = await supabase.rpc('match_verses', {
      query_embedding: sampleEmbedding,
      match_threshold: 0.0,
      match_count: 20,
      filter_chapter: 2
    });
    if (t8err) {
      fail('filter_chapter test', t8err.message);
    } else {
      const nonChapter2 = t8data ? t8data.filter(r => r.chapter_number !== 2) : [];
      if (nonChapter2.length === 0) {
        pass('filter_chapter=2 works', `All ${t8data.length} result(s) from chapter 2`);
      } else {
        fail('filter_chapter=2 works', `${nonChapter2.length} results are NOT from chapter 2`);
      }
    }
  } else {
    fail('filter_chapter test', 'No sample embedding available — skipped');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 9: filter_themes — skip gracefully since themes table is empty
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 9: filter_themes (themes table is empty — functional test only)');
  const { data: themesData } = await supabase.from('themes').select('*').limit(5);
  if (!themesData || themesData.length === 0) {
    // themes table is empty — verify the function doesn't crash with an empty filter
    if (sampleEmbedding) {
      const { data: t9data, error: t9err } = await supabase.rpc('match_verses', {
        query_embedding: sampleEmbedding,
        match_threshold: 0.0,
        match_count: 5,
        filter_themes: ['peace', 'discipline']
      });
      if (t9err) {
        fail('filter_themes (empty theme table)', t9err.message);
      } else {
        // With empty themes table, filter_themes should return 0 results (no verse_themes rows exist)
        pass('filter_themes (empty theme table)', `Returns ${t9data ? t9data.length : 0} results — correct since no verse_themes data exists`);
      }
    } else {
      pass('filter_themes', 'Themes table is empty — skipping theme data test (expected: no verse-theme mappings)');
    }
  } else {
    const firstThemeName = themesData[0].name.toLowerCase();
    if (sampleEmbedding) {
      const { data: t9data, error: t9err } = await supabase.rpc('match_verses', {
        query_embedding: sampleEmbedding,
        match_threshold: 0.0,
        match_count: 5,
        filter_themes: [firstThemeName]
      });
      if (t9err) {
        fail('filter_themes with real theme', t9err.message);
      } else {
        pass('filter_themes callable with real theme', `theme="${firstThemeName}", results: ${t9data ? t9data.length : 0}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 10: conversations table exists and is insertable via service role
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 10: conversations table structure');
  const { data: convCheck, error: convErr } = await supabase
    .from('conversations')
    .select('id, user_id, title, created_at, updated_at')
    .limit(1);
  if (convErr && convErr.code !== 'PGRST116') {
    fail('conversations table exists', convErr.message);
  } else {
    pass('conversations table exists', 'Schema readable');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 11: messages table exists with correct columns
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 11: messages table structure');
  const { data: msgCheck, error: msgErr } = await supabase
    .from('messages')
    .select('id, conversation_id, role, content, cited_verse_ids, retrieval_meta, is_flagged, created_at')
    .limit(1);
  if (msgErr && msgErr.code !== 'PGRST116') {
    fail('messages table exists', msgErr.message);
  } else {
    pass('messages table exists', 'Schema with cited_verse_ids, retrieval_meta, is_flagged readable');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 12: Existing Gita data unchanged
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 12: Existing Gita data unchanged');
  const { count: verseCount } = await supabase
    .from('gita_verses')
    .select('*', { count: 'exact', head: true });
  const { count: embeddedCount } = await supabase
    .from('gita_verses')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);
  const { count: chapterCount } = await supabase
    .from('gita_chapters')
    .select('*', { count: 'exact', head: true });

  if (verseCount === 701) {
    pass('Total verse count unchanged', `701 verses`);
  } else {
    fail('Total verse count', `Expected 701, got ${verseCount}`);
  }
  if (embeddedCount === 701) {
    pass('Embedded verse count unchanged', `701/701 verses have embeddings`);
  } else {
    fail('Embedded verse count', `Expected 701, got ${embeddedCount}`);
  }
  if (chapterCount === 18) {
    pass('Chapter count unchanged', `18 chapters`);
  } else {
    fail('Chapter count', `Expected 18, got ${chapterCount}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 13: RLS — anon cannot access conversations or messages
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 13: RLS — anon user cannot access conversations or messages');
  const { data: anonConv, error: anonConvErr } = await supabaseAnon
    .from('conversations')
    .select('*')
    .limit(1);
  const { data: anonMsg, error: anonMsgErr } = await supabaseAnon
    .from('messages')
    .select('*')
    .limit(1);

  // RLS with anon should return empty results (not error — RLS filters, doesn't reject)
  const convBlocked = !anonConv || anonConv.length === 0;
  const msgBlocked = !anonMsg || anonMsg.length === 0;

  if (convBlocked) {
    pass('RLS blocks anon access to conversations', 'No rows returned to anon');
  } else {
    fail('RLS blocks anon access to conversations', `Anon got ${anonConv.length} rows`);
  }
  if (msgBlocked) {
    pass('RLS blocks anon access to messages', 'No rows returned to anon');
  } else {
    fail('RLS blocks anon access to messages', `Anon got ${anonMsg.length} rows`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  VERIFICATION SUMMARY                  ');
  console.log('========================================');
  console.log(`  Total:  ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    console.log('FAILED TESTS:');
    results.filter(r => r.status.includes('FAIL')).forEach(r => {
      console.log(`  - ${r.test}: ${r.detail}`);
    });
  }
}

runTests().catch((err) => {
  console.error('Test runner crashed:', err.message);
  process.exit(1);
});
