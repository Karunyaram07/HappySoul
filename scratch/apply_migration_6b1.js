// Scratch: Apply supabase_migration_6b1.sql using postgres npm driver
// Run from: a:\June2026\happy-soul via: node scratch/apply_migration_6b1.js

const fs = require('fs');
const path = require('path');
const postgres = require('A:/June2026/happy-soul/node_modules/postgres/cjs/src/index.js');

// ── Manual .env.local parser ──────────────────────────────────────────────────
function loadEnv() {
  const raw = fs.readFileSync('.env.local', 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const directUrl = process.env.DIRECT_URL;
if (!directUrl || directUrl.includes('xxxx')) {
  console.error('ERROR: DIRECT_URL is not set or still contains placeholder credentials.');
  console.error('Please update DIRECT_URL in .env.local with your actual Supabase direct connection string.');
  process.exit(1);
}

const migrationSql = fs.readFileSync('./supabase_migration_6b1.sql', 'utf-8');

async function main() {
  const sql = postgres(directUrl, { ssl: 'require', max: 1 });
  console.log('Connected to Supabase via DIRECT_URL.');

  try {
    console.log('\n=== APPLYING supabase_migration_6b1.sql ===');
    await sql.unsafe(migrationSql);
    console.log('✓ Migration executed successfully.');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
  console.log('\nDone. Run the test script next.');
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
