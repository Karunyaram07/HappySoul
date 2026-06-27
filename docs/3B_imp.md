# Implementation Plan - Happy Soul (Phase 3B: User Onboarding & Personalization)

This phase implements a premium onboarding wizard to collect user personalization settings (name, language, goals, and interests) and protects the app so only onboarded users can access the dashboard.

---

## User Review Required

> [!IMPORTANT]
> **Database Changes**:
> Executing `supabase_migration_3b.sql` is required to add `is_onboarded` column to `public.profiles`.
> **Route Guarding**:
> The authentication flow is modified such that any authenticated user with `is_onboarded = false` is routed to `/onboarding`.

---

## Open Questions

> [!NOTE]
> None. Phase 3B features have been fully implemented, built, and linted successfully.

---

## Proposed Changes

### Component 1: Database Migration SQL
#### [NEW] [supabase_migration_3b.sql](file:///a:/June2026/happy-soul/supabase_migration_3b.sql)
- Appends `is_onboarded` boolean column defaulting to `false` to the existing `profiles` table.

### Component 2: Route Protection
#### [MODIFY] [middleware.js](file:///a:/June2026/happy-soul/lib/supabase/middleware.js)
- Redirects authenticated users with `is_onboarded = false` to `/onboarding` if they try to access other routes.
- Redirects onboarded users from `/onboarding` or `/sign-in` directly to `/dashboard`.

### Component 3: Onboarding Layout and Wizard Page
#### [NEW] [page.js](file:///a:/June2026/happy-soul/app/onboarding/page.js)
- Multi-step wizard wizard (Steps 1 to 5) with input validations and Supabase updates.
- Styled using a calming modern palette, subtle glowing backdrops, and Framer Motion transitions.

### Component 4: Onboarding Subcomponents
#### [NEW] [Stepper.jsx](file:///a:/June2026/happy-soul/components/onboarding/Stepper.jsx)
- Visual top nodes representing current/completed/active steps.
#### [NEW] [ProgressBar.jsx](file:///a:/June2026/happy-soul/components/onboarding/ProgressBar.jsx)
- Horizontal loader showing overall percentage.
#### [NEW] [StepCard.jsx](file:///a:/June2026/happy-soul/components/onboarding/StepCard.jsx)
- Framer Motion animation container.
#### [NEW] [GoalSelector.jsx](file:///a:/June2026/happy-soul/components/onboarding/GoalSelector.jsx)
- Premium selectable cards for goals.
#### [NEW] [InterestSelector.jsx](file:///a:/June2026/happy-soul/components/onboarding/InterestSelector.jsx)
- Premium selectable cards for topics.

### Component 5: Dashboard View
#### [MODIFY] [page.js](file:///a:/June2026/happy-soul/app/dashboard/page.js)
- Displays name, language, goals, and interests to verify onboarding data persistence.

---

## Verification Plan

### Automated Tests
- Running `npm run build` to verify Next.js Turbopack compilation.
- Running `npm run lint` to verify that there are no ESLint syntax or formatting errors.

### Manual Verification
- Test user registration and check redirection to `/onboarding`.
- Complete the onboarding steps and verify database updates.
- Verify dashboard renders user's selections.
