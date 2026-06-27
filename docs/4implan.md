# Implementation Plan - Happy Soul (Phase 4: Dashboard Foundation)

This phase establishes the architectural foundation of the user dashboard. The dashboard is designed as a modular widget system, allowing future features (such as Krishna AI, Journal, Mood Tracker, etc.) to replace placeholders without altering page layout.

---

## User Review Required

> [!IMPORTANT]
> **Component Modularity**:
> Every dashboard widget will be placed in `components/dashboard/`. The main route `app/dashboard/page.js` will act solely as a layout composer and data fetcher.
> **No Database Writes**:
> During this phase, database actions are read-only (fetching the Supabase user profile data to personalize greetings and showcase goals/interests).
> **Framer Motion**:
> Subtle entry/hover animations will be implemented using Framer Motion to create a premium, calm, and responsive experience.

---

## Open Questions

> [!NOTE]
> None. The layout sections, component names, and options are well-defined.

---

## Proposed Changes

### Component 1: Dashboard Base Grid & Layout
#### [NEW] [DashboardGrid.jsx](file:///a:/June2026/happy-soul/components/dashboard/DashboardGrid.jsx)
- Handles the responsive grid layout (Desktop: two columns; Mobile: single-column stack).
- Distributes widgets:
  - **Left Column**: WelcomeCard, QuickActions, RecommendationCard.
  - **Right Column**: ThoughtCard, ProgressCard, WellnessJourney, ComingSoon.

#### [NEW] [DashboardHeader.jsx](file:///a:/June2026/happy-soul/components/dashboard/DashboardHeader.jsx)
- Top bar containing section title, a personalized greeting summary, and current system date.

---

### Component 2: Dashboard Widgets
#### [NEW] [WelcomeCard.jsx](file:///a:/June2026/happy-soul/components/dashboard/WelcomeCard.jsx)
- Welcomes user with a greeting that changes dynamically based on local time (Morning, Afternoon, Evening, Night).
- Displays full name, preferred language, and current date.

#### [NEW] [ThoughtCard.jsx](file:///a:/June2026/happy-soul/components/dashboard/ThoughtCard.jsx)
- Displays static placeholder positive quotes (e.g. from the Bhagavad Gita or famous philosophers).
- Includes a decorative placeholder "Refresh" button.

#### [NEW] [QuickActions.jsx](file:///a:/June2026/happy-soul/components/dashboard/QuickActions.jsx)
- Clickable action cards for **Krishna AI**, **Journal**, **Meditation**, **Stories**, **Music**, and **Movies**.
- Includes hover scale animations, custom theme colors/icons, and "Coming Soon" overlays.

#### [NEW] [WellnessJourney.jsx](file:///a:/June2026/happy-soul/components/dashboard/WellnessJourney.jsx)
- Displays user preferences gathered during onboarding (Preferred Language, Goals, and Interests) as clean chips.

#### [NEW] [ProgressCard.jsx](file:///a:/June2026/happy-soul/components/dashboard/ProgressCard.jsx)
- Renders progress circles showing placeholder zero metrics: Current Streak (0 days), Meditation (0 mins), Journal (0 entries), and AI Chats (0).

#### [NEW] [RecommendationCard.jsx](file:///a:/June2026/happy-soul/components/dashboard/RecommendationCard.jsx)
- UI placeholder list showing three recommendations: Bhagavad Gita Wisdom, Morning Meditation, and Positive Habit Challenge.

#### [NEW] [ComingSoon.jsx](file:///a:/June2026/happy-soul/components/dashboard/ComingSoon.jsx)
- Displays upcoming feature items in a timeline card format (Krishna AI, Mood Tracker, Smart Journal, Daily Reflection, Personalized Music, AI Recommendations) with "Coming Soon" badges.

---

### Component 3: Dashboard Route Integration
#### [MODIFY] [page.js](file:///a:/June2026/happy-soul/app/dashboard/page.js)
- Server-side fetches user profile from Supabase.
- Composes the above components, passing relevant profile data (`full_name`, `preferred_language`, `goals`, `interests`) to the widgets.

---

## Verification Plan

### Automated Tests
- Build verification: Run `npm run build` to verify there are no Turbopack compiling issues.
- Lint verification: Run `npm run lint` to verify that there are no ESLint syntax or formatting errors.

### Manual Verification
- Verify responsive layout on mobile screens (breakpoint stacks) and desktop screens.
- Confirm dark mode support and smooth theme toggling.
- Check user name, preferred language, and dynamic date are correctly rendered.
- Ensure Framer Motion animations feel light, fluid, and premium.
