// scratch/test_6c23.js — Phase 6C.2.3 Verification Test Suite
// Run: node scratch/test_6c23.js

const fs = require("fs");
const path = require("path");

let pass = 0;
let fail = 0;

function assert(label, condition) {
  if (condition) {
    console.log("[PASS]", label);
    pass++;
  } else {
    console.error("[FAIL]", label);
    fail++;
  }
}

console.log("=== PHASE 6C.2.3 VERIFICATION TEST SUITE ===");

// ── 1. FONT ARCHITECTURE (PART A) ──────────────────────────────────────────
const layoutPath = path.join("app", "layout.js");
assert("app/layout.js exists", fs.existsSync(layoutPath));
const layoutSrc = fs.readFileSync(layoutPath, "utf8");
assert("layout.js: imports next/font/google", layoutSrc.includes("next/font/google"));
assert("layout.js: imports Montserrat", layoutSrc.includes("Montserrat"));
assert("layout.js: imports Roboto_Condensed", layoutSrc.includes("Roboto_Condensed"));
assert("layout.js: imports Ramabhadra", layoutSrc.includes("Ramabhadra"));
assert("layout.js: imports Chathura", layoutSrc.includes("Chathura"));
assert("layout.js: loads Ramabhadra with telugu subset", layoutSrc.includes("subsets: [\"telugu\"]"));
assert("layout.js: passes font variables to html className", 
  layoutSrc.includes("montserrat.variable") &&
  layoutSrc.includes("robotoCondensed.variable") &&
  layoutSrc.includes("ramabhadra.variable") &&
  layoutSrc.includes("chathura.variable")
);

const globalsPath = path.join("app", "globals.css");
const globalsSrc = fs.readFileSync(globalsPath, "utf8");
assert("globals.css: has --font-heading token", globalsSrc.includes("--font-heading: var(--font-montserrat)"));
assert("globals.css: has --font-condensed token", globalsSrc.includes("--font-condensed: var(--font-roboto-condensed)"));
assert("globals.css: has --font-telugu token", globalsSrc.includes("--font-telugu: var(--font-ramabhadra)"));
assert("globals.css: has --font-chathura token", globalsSrc.includes("--font-chathura: var(--font-chathura)"));
assert("globals.css: has .telugu-reading class with line-height 2.2", globalsSrc.includes(".telugu-reading") && globalsSrc.includes("line-height: 2.2;"));
assert("globals.css: has .telugu-display class", globalsSrc.includes(".telugu-display"));

// ── 2. TYPOGRAPHY HELPER (PART A & H) ──────────────────────────────────────
const typoHelperPath = path.join("lib", "typography.js");
assert("lib/typography.js exists", fs.existsSync(typoHelperPath));
const { getLanguageTypography } = require("../../../../../../../June2026/happy-soul/lib/typography.js");

const teluguTypo = getLanguageTypography("Telugu");
assert("typography helper: isTelugu is true for Telugu", teluguTypo.isTelugu === true);
assert("typography helper: Telugu bodyFont includes font-telugu", teluguTypo.bodyFont.includes("font-telugu"));
assert("typography helper: Telugu bodyFont includes leading-[2.2]", teluguTypo.bodyFont.includes("leading-[2.2]"));
assert("typography helper: Telugu displayFont includes font-chathura", teluguTypo.displayFont.includes("font-chathura"));

const englishTypo = getLanguageTypography("English");
assert("typography helper: isTelugu is false for English", englishTypo.isTelugu === false);
assert("typography helper: Non-Telugu does not use font-telugu for body", !englishTypo.bodyFont.includes("font-telugu"));
assert("typography helper: Non-Telugu uses font-heading for major display", englishTypo.headingFont.includes("font-heading"));
assert("typography helper: metaFont uses font-condensed", englishTypo.metaFont.includes("font-condensed"));

// ── 3. FULL-PAGE CHAITANYAM ROUTE (PART B & D) ─────────────────────────────
const pagePath = path.join("app", "dashboard", "chaitanyam", "page.js");
assert("/dashboard/chaitanyam/page.js exists", fs.existsSync(pagePath));
const pageSrc = fs.readFileSync(pagePath, "utf8");
assert("chaitanyam/page.js: has auth session guard", pageSrc.includes("auth.getUser()"));
assert("chaitanyam/page.js: redirects unauthenticated users", pageSrc.includes('redirect("/sign-in")'));
assert("chaitanyam/page.js: checks onboarding status", pageSrc.includes("is_onboarded"));
assert("chaitanyam/page.js: renders ChaitanyamWorkspace", pageSrc.includes("<ChaitanyamWorkspace"));

const workspacePath = path.join("components", "krishna", "ChaitanyamWorkspace.jsx");
assert("ChaitanyamWorkspace.jsx exists", fs.existsSync(workspacePath));
const wsSrc = fs.readFileSync(workspacePath, "utf8");
assert("ChaitanyamWorkspace: use client directive", wsSrc.includes('"use client"'));
assert("ChaitanyamWorkspace: imports useChaitanyam", wsSrc.includes("useChaitanyam"));
assert("ChaitanyamWorkspace: renders ChaitanyamMessageList", wsSrc.includes("<ChaitanyamMessageList"));
assert("ChaitanyamWorkspace: renders ChaitanyamInput", wsSrc.includes("<ChaitanyamInput"));
assert("ChaitanyamWorkspace: renders ChaitanyamHistoryList", wsSrc.includes("<ChaitanyamHistoryList"));
assert("ChaitanyamWorkspace: renders ThemeToggle", wsSrc.includes("<ThemeToggle"));
assert("ChaitanyamWorkspace: has back link to /dashboard Sanctuary", wsSrc.includes('href="/dashboard"'));
assert("ChaitanyamWorkspace: has desktop sidebar collapsible toggle", wsSrc.includes("sidebarOpen"));
assert("ChaitanyamWorkspace: has mobile drawer toggle", wsSrc.includes("mobileDrawerOpen"));
assert("ChaitanyamWorkspace: has startNewConversation action", wsSrc.includes("startNewConversation"));
assert("ChaitanyamWorkspace: respects typography helper", wsSrc.includes("getLanguageTypography"));
assert("ChaitanyamWorkspace: no fetch() call (no second AI)", !wsSrc.includes("fetch("));

// ── 4. FULLSCREEN BUTTON & NAVIGATION (PART C) ─────────────────────────────
const headerPath = path.join("components", "krishna", "ChaitanyamHeader.jsx");
const headerSrc = fs.readFileSync(headerPath, "utf8");
assert("ChaitanyamHeader: imports Maximize2", headerSrc.includes("Maximize2"));
assert("ChaitanyamHeader: has handleFullscreen", headerSrc.includes("handleFullscreen"));
assert("ChaitanyamHeader: navigates to /dashboard/chaitanyam", headerSrc.includes('router.push("/dashboard/chaitanyam")'));
assert("ChaitanyamHeader: closes drawer when opening fullscreen", headerSrc.includes("closeChat()"));

const cardPath = path.join("components", "krishna", "ChaitanyamCard.jsx");
const cardSrc = fs.readFileSync(cardPath, "utf8");
assert("ChaitanyamCard: has link to /dashboard/chaitanyam", cardSrc.includes('href="/dashboard/chaitanyam"'));

// ── 5. STATE CONTINUITY & PROVIDER ARCHITECTURE (PART E) ───────────────────
const dashLayoutPath = path.join("app", "dashboard", "layout.js");
const dashLayoutSrc = fs.readFileSync(dashLayoutPath, "utf8");
assert("dashboard/layout.js: wraps children in ChaitanyamProvider", dashLayoutSrc.includes("<ChaitanyamProvider"));
assert("dashboard/layout.js: selects preferred_language", dashLayoutSrc.includes("preferred_language"));
assert("dashboard/layout.js: passes preferredLanguage to provider", dashLayoutSrc.includes("preferredLanguage="));

const providerPath = path.join("components", "krishna", "ChaitanyamProvider.jsx");
const providerSrc = fs.readFileSync(providerPath, "utf8");
assert("ChaitanyamProvider: detects isFullscreenPage", providerSrc.includes("isFullscreenPage"));
assert("ChaitanyamProvider: hides trigger on fullscreen page", providerSrc.includes("{!isFullscreenPage && <ChaitanyamTrigger />}"));
assert("ChaitanyamProvider: hides drawer on fullscreen page", providerSrc.includes("{!isFullscreenPage && <DynamicChaitanyamDrawer />}"));
assert("ChaitanyamProvider: auto-fetches history on fullscreen visit", providerSrc.includes("isOpen || isFullscreenPage"));
assert("ChaitanyamProvider: exposes preferredLanguage", providerSrc.includes("preferredLanguage,"));

// ── 6. COMPONENT TYPOGRAPHY & TELUGU RENDERING (PART H) ────────────────────
const msgListPath = path.join("components", "krishna", "ChaitanyamMessageList.jsx");
const msgListSrc = fs.readFileSync(msgListPath, "utf8");
assert("ChaitanyamMessageList: reads preferredLanguage", msgListSrc.includes("preferredLanguage"));
assert("ChaitanyamMessageList: supports isTelugu formatting", msgListSrc.includes("isTelugu"));
assert("ChaitanyamMessageList: uses font-telugu and leading-[2.2] when Telugu", msgListSrc.includes("font-telugu leading-[2.2]"));
assert("ChaitanyamMessageList: centered in max-w-3xl container", msgListSrc.includes("max-w-3xl mx-auto"));

const inputPath = path.join("components", "krishna", "ChaitanyamInput.jsx");
const inputSrc = fs.readFileSync(inputPath, "utf8");
assert("ChaitanyamInput: reads preferredLanguage", inputSrc.includes("preferredLanguage"));
assert("ChaitanyamInput: centers in max-w-3xl container", inputSrc.includes("max-w-3xl mx-auto"));
assert("ChaitanyamInput: has Telugu placeholder when preferredLanguage is Telugu", inputSrc.includes("చైతన్యం AI"));

// ── 7. SCOPE PROTECTION (PART L) ───────────────────────────────────────────
const generatorPath = path.join("lib", "krishna", "generator.js");
const generatorSrc = fs.readFileSync(generatorPath, "utf8");
assert("Scope: generator.js has generateKrishnaResponse", generatorSrc.includes("generateKrishnaResponse"));

const essencePath = path.join("lib", "gita", "essenceGenerator.js");
assert("Scope: essenceGenerator.js exists", fs.existsSync(essencePath));

// Ensure no canvas or webgl introduced in ChaitanyamWorkspace
assert("Performance: no canvas in workspace", !wsSrc.includes("<canvas"));
assert("Performance: no webgl in workspace", !wsSrc.includes("webgl"));

console.log("");
console.log("────────────────────────────────────────────────────");
console.log(`Results: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
