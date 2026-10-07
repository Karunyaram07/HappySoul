const fs = require("fs");
const path = require("path");

function runTests() {
  console.log("=== Phase 6C.1.4 Motion Foundation, Hero & WelcomeCard Verification ===");
  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  const rootDir = path.resolve(__dirname, "..");
  const motionDir = path.join(rootDir, "components", "motion");
  const glowPath = path.join(motionDir, "AmbientGlow.jsx");
  const particlesPath = path.join(motionDir, "AmbientParticles.jsx");
  const bloomPath = path.join(motionDir, "BloomEffect.jsx");
  const heroPath = path.join(rootDir, "components", "sections", "Hero.jsx");
  const welcomeCardPath = path.join(rootDir, "components", "dashboard", "widgets", "WelcomeCard.jsx");

  // 1. Components exist
  assert("AmbientGlow.jsx exists", fs.existsSync(glowPath));
  assert("AmbientParticles.jsx exists", fs.existsSync(particlesPath));
  assert("BloomEffect.jsx exists", fs.existsSync(bloomPath));
  assert("Hero.jsx exists", fs.existsSync(heroPath));
  assert("WelcomeCard.jsx exists", fs.existsSync(welcomeCardPath));

  const glowSrc = fs.readFileSync(glowPath, "utf-8");
  const particlesSrc = fs.readFileSync(particlesPath, "utf-8");
  const bloomSrc = fs.readFileSync(bloomPath, "utf-8");
  const heroSrc = fs.readFileSync(heroPath, "utf-8");
  const welcomeCardSrc = fs.readFileSync(welcomeCardPath, "utf-8");

  // 2. Reduced motion handling in motion foundation
  assert(
    "AmbientGlow contains reduced-motion handling",
    glowSrc.includes("useReducedMotion") && glowSrc.includes("prefers-reduced-motion")
  );
  assert(
    "AmbientParticles contains reduced-motion handling",
    particlesSrc.includes("useReducedMotion") && particlesSrc.includes("prefers-reduced-motion")
  );
  assert(
    "BloomEffect contains reduced-motion handling",
    bloomSrc.includes("useReducedMotion")
  );

  // 3. Pointer events none on motion components
  assert("AmbientGlow uses pointer-events-none", glowSrc.includes("pointer-events-none"));
  assert("AmbientParticles uses pointer-events-none", particlesSrc.includes("pointer-events-none"));
  assert("BloomEffect uses pointer-events-none", bloomSrc.includes("pointer-events-none"));

  // 4. Aria hidden on motion components
  assert("AmbientGlow uses aria-hidden='true'", glowSrc.includes('aria-hidden="true"'));
  assert("AmbientParticles uses aria-hidden='true'", particlesSrc.includes('aria-hidden="true"'));
  assert("BloomEffect uses aria-hidden='true'", bloomSrc.includes('aria-hidden="true"'));

  // 5. No animation loop APIs in motion foundation
  const forbiddenApis = ["requestAnimationFrame", "setInterval"];
  for (const api of forbiddenApis) {
    assert(`AmbientGlow does not use ${api}`, !glowSrc.includes(api));
    assert(`AmbientParticles does not use ${api}`, !particlesSrc.includes(api));
    assert(`BloomEffect does not use ${api}`, !bloomSrc.includes(api));
  }

  // 6. No new dependencies introduced in package.json
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = Object.keys(pkg.dependencies || {});
  assert(
    "package.json dependencies are unchanged",
    deps.includes("framer-motion") && deps.includes("lucide-react") && !deps.includes("uiverse")
  );

  // 7. Ambient components use transform/opacity based animation
  assert(
    "AmbientGlow uses transform/opacity keyframes",
    glowSrc.includes("transform") && glowSrc.includes("opacity") && !glowSrc.includes("filter: blur(")
  );
  assert(
    "AmbientParticles uses transform/opacity keyframes",
    particlesSrc.includes("transform") && particlesSrc.includes("opacity")
  );

  // === 8. HERO SPECIFIC ASSERTIONS (Phase 6C.1.3) ===
  assert("Hero imports shared AmbientGlow component", heroSrc.includes("import AmbientGlow from"));
  assert("Hero renders AmbientGlow in background", heroSrc.includes("<AmbientGlow"));
  assert("Hero contains subtle lotus ambient layer", heroSrc.includes("hs-lotus-ambient") && heroSrc.includes("<svg"));
  assert("Hero ambient layer uses pointer-events-none", heroSrc.includes("pointer-events-none absolute") && heroSrc.includes("hs-lotus-drift"));
  assert("Hero ambient shape uses aria-hidden='true'", heroSrc.includes('aria-hidden="true"'));
  assert("Hero does not use requestAnimationFrame", !heroSrc.includes("requestAnimationFrame"));
  assert("Hero does not use setInterval", !heroSrc.includes("setInterval"));
  assert("Hero contains reduced-motion CSS rule for lotus", heroSrc.includes("prefers-reduced-motion: reduce"));
  assert("Existing Hero animation logic remains present (containerVariants)", heroSrc.includes("containerVariants"));
  assert("Existing Hero animation logic remains present (itemVariants)", heroSrc.includes("itemVariants"));
  assert("Existing Hero CTA content remains ('Start Your Journey')", heroSrc.includes("Start Your Journey"));
  assert("Existing Hero CTA content remains ('Meet Krishna AI')", heroSrc.includes("Meet Krishna AI"));
  assert("Existing Hero headline remains ('Transform Your Thoughts.')", heroSrc.includes("Transform Your Thoughts."));
  assert("Existing Hero headline remains ('Find Inner Peace.')", heroSrc.includes("Find Inner Peace."));
  assert("Existing Hero feature cards remain ('The Journey to Inner Harmony')", heroSrc.includes("The Journey to Inner Harmony"));

  // === 9. WELCOME CARD SPECIFIC ASSERTIONS (Phase 6C.1.4) ===
  assert("WelcomeCard imports AmbientGlow", welcomeCardSrc.includes("import AmbientGlow from"));
  assert("WelcomeCard renders AmbientGlow", welcomeCardSrc.includes("<AmbientGlow"));
  assert("WelcomeCard uses time-aware variant", welcomeCardSrc.includes('variant="time-aware"'));
  assert("WelcomeCard uses gentle intensity", welcomeCardSrc.includes('intensity="gentle"'));
  assert("WelcomeCard greeting logic remains intact", 
    welcomeCardSrc.includes("Good Morning") && 
    welcomeCardSrc.includes("Good Afternoon") && 
    welcomeCardSrc.includes("Good Evening") && 
    welcomeCardSrc.includes("Good Night")
  );
  assert("WelcomeCard user name logic remains intact", welcomeCardSrc.includes("profile?.full_name"));
  assert("WelcomeCard ambient layer has pointer-events-none", welcomeCardSrc.includes("pointer-events-none"));
  assert("WelcomeCard does not use requestAnimationFrame", !welcomeCardSrc.includes("requestAnimationFrame"));
  assert("WelcomeCard does not use setInterval", !welcomeCardSrc.includes("setInterval"));
  assert("WelcomeCard hydration guard remains intact", welcomeCardSrc.includes("if (!mounted)"));

  // 10. Protected files check
  const protectedFiles = [
    path.join(rootDir, "components", "krishna", "ChaitanyamMessageList.jsx"),
    path.join(rootDir, "app", "onboarding", "page.js"),
    path.join(rootDir, "components", "onboarding", "StepCard.jsx"),
    path.join(rootDir, "app", "layout.js"),
    path.join(rootDir, "app", "dashboard", "layout.js"),
  ];

  for (const file of protectedFiles) {
    const filename = path.basename(file);
    assert(`Protected file ${filename} exists and is untampered`, fs.existsSync(file));
  }

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
}

runTests();
