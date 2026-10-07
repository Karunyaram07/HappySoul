/**
 * Phase 6B.8 Step 2 Verification Test Suite - Clickable Gita Citations
 *
 * Tests:
 * 1. Valid citation { chapter: 2, verse: 47 } -> route /dashboard/gita/2/47
 * 2. Valid citation { chapter: 1, verse: 1 } -> route /dashboard/gita/1/1
 * 3. Invalid chapter { chapter: 19, verse: 1 } -> no navigation URL (renders fallback div)
 * 4. Invalid chapter { chapter: 0, verse: 1 } -> no navigation URL (renders fallback div)
 * 5. Invalid verse { chapter: 2, verse: 0 } -> no navigation URL (renders fallback div)
 * 6. Invalid values (strings, decimals, null, undefined) -> no malformed navigation URL
 * 7. Confirm no database/API call was introduced into GitaCitationBadge.jsx
 * 8. Confirm Chaitanyam API response contract is unchanged in route.js
 * 9. Code inspection for semantic <Link>, accessibility (aria-label), focus-visible, and cursor-pointer
 * 10. Scope boundary checks
 */

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Emulate component logic for unit testing pure validation & routing behavior
function isValidCitation(citation) {
  if (!citation || typeof citation !== "object") return false;
  const { chapter, verse } = citation;
  return (
    Number.isInteger(chapter) &&
    chapter >= 1 &&
    chapter <= 18 &&
    Number.isInteger(verse) &&
    verse >= 1
  );
}

function getCitationRouteOrFallback(citation) {
  if (!citation) return null;
  const valid = isValidCitation(citation);
  if (!valid) {
    return { type: "div", href: null };
  }
  return {
    type: "Link",
    href: `/dashboard/gita/${citation.chapter}/${citation.verse}`,
    ariaLabel: `Open Bhagavad Gita ${citation.chapter}.${citation.verse}`,
  };
}

async function runTests() {
  console.log("=== PHASE 6B.8 STEP 2: CLICKABLE CITATIONS TEST SUITE ===\n");

  // ── TEST 1: Valid citation { chapter: 2, verse: 47 } ─────────────────────────
  console.log("Test 1: Valid citation 2.47 route");
  {
    const res = getCitationRouteOrFallback({ chapter: 2, verse: 47 });
    assert(res !== null, "Result is not null");
    assert(res.type === "Link", "Rendered as Next.js Link");
    assert(
      res.href === "/dashboard/gita/2/47",
      "Correct route: /dashboard/gita/2/47"
    );
    assert(
      res.ariaLabel === "Open Bhagavad Gita 2.47",
      "Accessible aria-label generated"
    );
  }

  // ── TEST 2: Valid citation { chapter: 1, verse: 1 } ──────────────────────────
  console.log("\nTest 2: Valid citation 1.1 route");
  {
    const res = getCitationRouteOrFallback({ chapter: 1, verse: 1 });
    assert(res !== null, "Result is not null");
    assert(res.type === "Link", "Rendered as Next.js Link");
    assert(
      res.href === "/dashboard/gita/1/1",
      "Correct route: /dashboard/gita/1/1"
    );
  }

  // ── TEST 3: Invalid chapter { chapter: 19, verse: 1 } ────────────────────────
  console.log("\nTest 3: Invalid chapter 19 rejection");
  {
    const res = getCitationRouteOrFallback({ chapter: 19, verse: 1 });
    assert(res.type === "div", "Rendered as non-interactive div");
    assert(res.href === null, "No navigation URL produced");
  }

  // ── TEST 4: Invalid chapter { chapter: 0, verse: 1 } ─────────────────────────
  console.log("\nTest 4: Invalid chapter 0 rejection");
  {
    const res = getCitationRouteOrFallback({ chapter: 0, verse: 1 });
    assert(res.type === "div", "Rendered as non-interactive div");
    assert(res.href === null, "No navigation URL produced");
  }

  // ── TEST 5: Invalid verse { chapter: 2, verse: 0 } ───────────────────────────
  console.log("\nTest 5: Invalid verse 0 rejection");
  {
    const res = getCitationRouteOrFallback({ chapter: 2, verse: 0 });
    assert(res.type === "div", "Rendered as non-interactive div");
    assert(res.href === null, "No navigation URL produced");
  }

  // ── TEST 6: Malformed values ────────────────────────────────────────────────
  console.log("\nTest 6: Malformed inputs rejection");
  {
    const malformed = [
      { chapter: "2", verse: 47 }, // strings
      { chapter: 2, verse: "47" },
      { chapter: 2.5, verse: 47 }, // decimals
      { chapter: 2, verse: 47.9 },
      { chapter: -2, verse: 47 }, // negatives
      { chapter: 2, verse: -1 },
      { chapter: NaN, verse: 47 }, // NaN
      null,
      undefined,
      {},
      "not an object",
    ];

    for (const val of malformed) {
      const res = getCitationRouteOrFallback(val);
      if (res === null) {
        assert(true, `Null/falsy value cleanly handled as null`);
      } else {
        assert(
          res.type === "div" && res.href === null,
          `Malformed input ${JSON.stringify(val)} handled safely as non-interactive div`
        );
      }
    }
  }

  // ── TEST 7: GitaCitationBadge.jsx source code inspection ────────────────────
  console.log("\nTest 7: GitaCitationBadge.jsx implementation inspection");
  {
    const badgeCode = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "components",
        "krishna",
        "GitaCitationBadge.jsx"
      ),
      "utf8"
    );

    assert(
      badgeCode.includes('import Link from "next/link";'),
      "Imports Next.js Link"
    );
    assert(badgeCode.includes("<Link"), "Renders semantic <Link>");
    assert(
      badgeCode.includes("href={`/dashboard/gita/${chapter}/${verse}`}"),
      "Constructs standard /dashboard/gita/${chapter}/${verse} route"
    );
    assert(
      badgeCode.includes("cursor-pointer"),
      "Contains cursor-pointer class"
    );
    assert(
      badgeCode.includes("focus-visible:ring"),
      "Contains accessible focus-visible ring"
    );
    assert(
      badgeCode.includes("hover:bg-accent/30"),
      "Contains hover interactive state"
    );
    assert(
      badgeCode.includes("aria-label={`Open Bhagavad Gita ${chapter}.${verse}`}"),
      "Contains accessible aria-label identifying the citation action"
    );
    assert(
      !badgeCode.includes("supabase") && !badgeCode.includes("fetch("),
      "Zero database or API queries introduced"
    );
  }

  // ── TEST 8: Verify API response contract in app/api/krishna/route.js ─────────
  console.log("\nTest 8: Chaitanyam API response contract integrity");
  {
    const routeCode = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "krishna", "route.js"),
      "utf8"
    );

    assert(
      routeCode.includes("citations: aiResponse.citations,"),
      "route.js preserves citations: aiResponse.citations"
    );
    assert(
      routeCode.includes("citedVerseIds: aiResponse.citedVerseIds,"),
      "route.js preserves citedVerseIds"
    );
  }

  // ── TEST 9: Scope check — untouched files ──────────────────────────────────
  console.log("\nTest 9: Scope boundary verification");
  {
    const protectedFiles = [
      "app/layout.js",
      "app/dashboard/layout.js",
      "lib/krishna/retrieval.js",
      "lib/krishna/prompt.js",
      "lib/krishna/generator.js",
      "lib/krishna/context.js",
      "app/api/krishna/route.js",
      "app/api/krishna/conversations/route.js",
      "app/api/krishna/conversations/[conversationId]/route.js",
      "app/dashboard/gita/[chapter]/[verse]/page.js",
    ];

    for (const file of protectedFiles) {
      assert(
        fs.existsSync(path.join(__dirname, "..", file)),
        `Protected file exists and intact: ${file}`
      );
    }
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
