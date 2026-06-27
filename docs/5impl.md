# Implementation Plan - Phase 5: Daily Positive Thoughts & Personalized Wisdom

This phase replaces the dashboard's thought widget placeholder with a fully featured Daily Thoughts system. We will expand the database to at least 100 curated, categorized quotes, implement an upgraded personalization algorithm (with score-based language fallback: Preferred $\to$ English $\to$ Any), enhance the `ThoughtCard` styling, add user actions (copy, share, save to favorites, dev-only next thought), create a loading skeleton, and verify accessibility and production compiles.

---

## User Review Required

> [!IMPORTANT]
> **Dataset Expansion**:
> `lib/thoughts/dataset.js` will be updated to include at least 100 high-quality, curated, public-domain or attributed quotes across 8 categories in English, Hindi, and Telugu.
> **Three-Level Language Fallback**:
> We will update `lib/thoughts/selector.js` to score and merge quotes:
> 1. Matches Preferred Language (gets $+20$ points)
> 2. Matches English (gets $+10$ points)
> 3. Falls back to Any Language (gets normal matching scores)
> **Metadata Schema Extensions**:
> `lib/thoughts/schema.js` will be updated to document: `{ id, quote, author, category, language, tags, source, isPublicDomain }`.
> **Localization UI Constants**:
> UI text labels are extracted to `lib/thoughts/constants.js` to support future localization.
> **Accessibility**:
> Buttons will feature explicit `aria-label`, visible focus rings (`focus-visible:ring-2`), and screen-reader-friendly notifications (via `aria-live="polite"`).
> **Framer Motion Easing**:
> Initial render uses a fade-in animation, thought transitions use a crossfade, and animations respect CSS reduced-motion preferences.
> **Dev-Only "Next Thought" Button**:
> The "Next Thought" action will check `process.env.NODE_ENV !== 'production'` and only render in development.

---

## Open Questions

> [!NOTE]
> None.

---

## Proposed Changes

### Component 1: Data & Refined Selector

#### [MODIFY] [schema.js](file:///a:/June2026/happy-soul/lib/thoughts/schema.js)
- Extend schema definition with `source` and `isPublicDomain`.

#### [MODIFY] [dataset.js](file:///a:/June2026/happy-soul/lib/thoughts/dataset.js)
- Expand to at least 100 curated quotes containing metadata fields.

#### [NEW] [constants.js](file:///a:/June2026/happy-soul/lib/thoughts/constants.js)
- Defines UI labels: `copy`, `share`, `favorite`, `copied`, `comingSoon`, etc.

#### [MODIFY] [selector.js](file:///a:/June2026/happy-soul/lib/thoughts/selector.js)
- Refactor the selector to implement the three-level fallback (Preferred $\to$ English $\to$ Any).
- Score candidate thoughts based on user profile goals and interests.

---

### Component 2: Create Thoughts UI Subcomponents
We will create thoughts UI components under a new `components/thoughts/` folder:

#### [NEW] [ThoughtCategory.jsx](file:///a:/June2026/happy-soul/components/thoughts/ThoughtCategory.jsx)
- Renders the category badge with customized colors.

#### [NEW] [ThoughtActions.jsx](file:///a:/June2026/happy-soul/components/thoughts/ThoughtActions.jsx)
- Renders copy, share, save to favorites placeholder, and the dev-only next thought button.
- Implements `aria-label`, `aria-live="polite"` for copy state, and focus indicators.

#### [NEW] [ThoughtSkeleton.jsx](file:///a:/June2026/happy-soul/components/thoughts/ThoughtSkeleton.jsx)
- Calming shimmer skeleton loader.

---

### Component 3: Enhance ThoughtCard Widget

#### [MODIFY] [ThoughtCard.jsx](file:///a:/June2026/happy-soul/components/dashboard/widgets/ThoughtCard.jsx)
- Update layout structure with improved typography and spacing.
- Incorporate `<ThoughtCategory />` and `<ThoughtActions />`.
- Wrap the quote transitions in an `AnimatePresence` crossfade block that respects reduced-motion.
- Add a loading state: if profile data is still being read, render `<ThoughtSkeleton />`.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify production compilation.
- Run `npm run lint` to verify clean ESLint execution.

### Manual Verification
- Check that the daily thought renders based on user profile preferences.
- Verify that copy-to-clipboard copies `"Quote" - Author` correctly.
- Verify "Next Thought" button is hidden in production build simulation (or is omitted from the UI output if built).
- Test keyboard accessibility: ensure all action buttons are focusable (`Tab`) and triggers execute via `Enter`/`Space`.
- Verify light and dark mode text contrast.
