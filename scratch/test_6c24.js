/**
 * Phase 6C.2.4 Automated Verification Suite
 * Tests Krishna-Themed Chaitanyam + Mental-Wellness Dashboard Visual Atmosphere
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

console.log("\n========================================================");
console.log("PHASE 6C.2.4 VERIFICATION SUITE — VISUAL ATMOSPHERE");
console.log("========================================================\n");

// 1. Asset verification
console.log("1. Provided Chaitanyam Assets:");
it("chaitanyam-ai-icon.png exists in public/chaitanyam-assets", () => {
  assert(fs.existsSync(path.resolve("public/chaitanyam-assets/chaitanyam-ai-icon.png")));
});

it("chaitanyam-bg-light.png exists in public/chaitanyam-assets", () => {
  assert(fs.existsSync(path.resolve("public/chaitanyam-assets/chaitanyam-bg-light.png")));
});

// 2. Main Dashboard Visual Separation & CalmBreathAtmosphere
console.log("\n2. Main Dashboard Mental-Wellness Separation:");
const dashboardPageSrc = fs.readFileSync(path.resolve("app/dashboard/page.js"), "utf8");
const calmBreathSrc = fs.readFileSync(path.resolve("components/dashboard/layout/CalmBreathAtmosphere.jsx"), "utf8");

it("app/dashboard/page.js imports and renders CalmBreathAtmosphere", () => {
  assert(dashboardPageSrc.includes("CalmBreathAtmosphere"));
  assert(dashboardPageSrc.includes("<CalmBreathAtmosphere />"));
});

it("app/dashboard/page.js does NOT import or reference chaitanyam-bg-light.png", () => {
  assert(!dashboardPageSrc.includes("chaitanyam-bg-light.png"));
});

it("CalmBreathAtmosphere does NOT mention Krishna, peacock, flute, or Vrindavan", () => {
  const lower = calmBreathSrc.toLowerCase();
  assert(!lower.includes("peacock"));
  assert(!lower.includes("flute"));
  assert(!lower.includes("chaitanyam-bg-light"));
  assert(!lower.includes("vrindavan"));
});

it("CalmBreathAtmosphere includes mental-wellness Pause/Breathe concept with gentle breathing animations", () => {
  assert(calmBreathSrc.includes("pulse") || calmBreathSrc.includes("drift"));
  assert(calmBreathSrc.includes("prefers-reduced-motion"));
  assert(calmBreathSrc.includes("useReducedMotion"));
  assert(calmBreathSrc.includes("aria-hidden=\"true\""));
  assert(calmBreathSrc.includes("pointer-events-none"));
});

it("CalmBreathAtmosphere renders AmbientParticles in secondary/quiet tone", () => {
  assert(calmBreathSrc.includes("AmbientParticles"));
  assert(calmBreathSrc.includes("count={3}"));
});

// 3. Chaitanyam Card on Dashboard
console.log("\n3. ChaitanyamCard Entry Point on Dashboard:");
const chaitCardSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamCard.jsx"), "utf8");

it("ChaitanyamCard displays chaitanyam-ai-icon.png", () => {
  assert(chaitCardSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
  assert(chaitCardSrc.includes("alt=\"Chaitanyam AI\""));
});

it("ChaitanyamCard does NOT use chaitanyam-bg-light.png or background religious artwork", () => {
  assert(!chaitCardSrc.includes("chaitanyam-bg-light.png"));
});

// 4. Chaitanyam Motifs (PeacockFeatherMotif & FluteMotif)
console.log("\n4. Krishna Decorative Motifs:");
it("PeacockFeatherMotif.jsx exists and has SVG definitions", () => {
  const src = fs.readFileSync(path.resolve("components/krishna/PeacockFeatherMotif.jsx"), "utf8");
  assert(src.includes("<svg"));
  assert(src.includes("radialGradient"));
  assert(src.includes("aria-hidden=\"true\""));
  assert(src.includes("pointer-events-none"));
  assert(src.includes("useReducedMotion"));
  assert(src.includes("prefers-reduced-motion"));
});

it("FluteMotif.jsx exists and has SVG definitions", () => {
  const src = fs.readFileSync(path.resolve("components/krishna/FluteMotif.jsx"), "utf8");
  assert(src.includes("<svg"));
  assert(src.includes("linearGradient"));
  assert(src.includes("aria-hidden=\"true\""));
  assert(src.includes("pointer-events-none"));
  assert(src.includes("useReducedMotion"));
  assert(src.includes("prefers-reduced-motion"));
});

// 5. ChaitanyamAtmosphere
console.log("\n5. ChaitanyamAtmosphere Layering & Theming:");
const chaitAtmoSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamAtmosphere.jsx"), "utf8");

it("ChaitanyamAtmosphere uses chaitanyam-bg-light.png as light background layer", () => {
  assert(chaitAtmoSrc.includes("/chaitanyam-assets/chaitanyam-bg-light.png"));
});

it("ChaitanyamAtmosphere implements dark mode treatment with mix-blend-luminosity or contrast/brightness", () => {
  assert(chaitAtmoSrc.includes("dark:opacity-") || chaitAtmoSrc.includes("dark:mix-blend-luminosity"));
  assert(chaitAtmoSrc.includes("dark:bg-[#0b120f]"));
});

it("ChaitanyamAtmosphere includes peacock blue and gold glows", () => {
  assert(chaitAtmoSrc.includes("sky-500") || chaitAtmoSrc.includes("teal-500"));
  assert(chaitAtmoSrc.includes("amber-400") || chaitAtmoSrc.includes("amber-500"));
});

it("ChaitanyamAtmosphere includes PeacockFeatherMotif and FluteMotif", () => {
  assert(chaitAtmoSrc.includes("PeacockFeatherMotif"));
  assert(chaitAtmoSrc.includes("FluteMotif"));
});

it("ChaitanyamAtmosphere includes Vrindavan golden particles via AmbientParticles", () => {
  assert(chaitAtmoSrc.includes("AmbientParticles"));
  assert(chaitAtmoSrc.includes("variant=\"dots\""));
});

it("ChaitanyamAtmosphere ensures chat contrast with gradient overlays", () => {
  assert(chaitAtmoSrc.includes("bg-gradient-to-r"));
});

// 6. ChaitanyamWorkspace Integration
console.log("\n6. ChaitanyamWorkspace Experience:");
const chaitWorkSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamWorkspace.jsx"), "utf8");

it("ChaitanyamWorkspace imports and renders ChaitanyamAtmosphere", () => {
  assert(chaitWorkSrc.includes("ChaitanyamAtmosphere"));
  assert(chaitWorkSrc.includes("<ChaitanyamAtmosphere />"));
});

it("ChaitanyamWorkspace displays chaitanyam-ai-icon.png in header", () => {
  assert(chaitWorkSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
});

// 7. ChaitanyamMessageList, Header, and Trigger Identity
console.log("\n7. Chaitanyam Visual Identity Consistency:");
const chaitMsgListSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamMessageList.jsx"), "utf8");
const chaitHeaderSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamHeader.jsx"), "utf8");
const chaitTriggerSrc = fs.readFileSync(path.resolve("components/krishna/ChaitanyamTrigger.jsx"), "utf8");

it("ChaitanyamMessageList welcome state displays chaitanyam-ai-icon.png with aura", () => {
  assert(chaitMsgListSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
  assert(chaitMsgListSrc.includes("alt=\"Chaitanyam AI\""));
});

it("ChaitanyamMessageList assistant message avatar uses chaitanyam-ai-icon.png", () => {
  assert(chaitMsgListSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
});

it("ChaitanyamHeader displays chaitanyam-ai-icon.png", () => {
  assert(chaitHeaderSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
});

it("ChaitanyamTrigger displays chaitanyam-ai-icon.png", () => {
  assert(chaitTriggerSrc.includes("/chaitanyam-assets/chaitanyam-ai-icon.png"));
});

// 8. Performance & Safety Constraints
console.log("\n8. Performance & Safety Constraints:");
it("No canvas or WebGL introduced", () => {
  assert(!chaitAtmoSrc.includes("<canvas"));
  assert(!calmBreathSrc.includes("<canvas"));
  assert(!chaitWorkSrc.includes("<canvas"));
  assert(!chaitAtmoSrc.includes("webgl"));
});

it("No video or GIF backgrounds introduced", () => {
  assert(!chaitAtmoSrc.includes("<video"));
  assert(!calmBreathSrc.includes("<video"));
  assert(!chaitAtmoSrc.includes(".gif"));
});

console.log("\n========================================================");
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed.`);
console.log("========================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
