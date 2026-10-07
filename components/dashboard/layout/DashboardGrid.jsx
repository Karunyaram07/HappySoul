// * DASHBOARD RESPONSIVE WIDGET GRID — PHASE 6C.2.2
// ! This is a Client Component (rendered on the browser)
// ? Implements the 4-tier visual hierarchy from the 6C.2.1 audit.
// ?
// ? Layout uses a FLAT grid (no nested left/right wrapper divs) so that
// ? both the desktop 12-column layout and the mobile stacking order are
// ? explicitly controlled. Each row is a pair of adjacent grid items.
// ?
// ? Desktop 12-col grid:
// ?   Row 1 (Tier 1 — above fold):  WelcomeCard (8col) | ThoughtCard (4col)
// ?   Row 2 (Tier 2 — primary):     ChaitanyamCard (8col) | ProgressCard (4col)
// ?   Row 3 (Tier 2/3 — features):  QuickActions (8col) | WellnessJourney (4col)
// ?   Row 4 (Tier 3/4 — support):   RecommendationCard (8col) | ComingSoon (4col)
// ?
// ? Mobile stacking order (single col):
// ?   WelcomeCard → ThoughtCard → ChaitanyamCard → ProgressCard →
// ?   QuickActions → WellnessJourney → RecommendationCard → ComingSoon

"use client";

import React from "react";
import WelcomeCard from "@/components/dashboard/widgets/WelcomeCard";
import ThoughtCard from "@/components/dashboard/widgets/ThoughtCard";
import ChaitanyamCard from "@/components/krishna/ChaitanyamCard";
import ProgressCard from "@/components/dashboard/widgets/ProgressCard";
import QuickActions from "@/components/dashboard/actions/QuickActions";
import WellnessJourney from "@/components/dashboard/widgets/WellnessJourney";
import RecommendationCard from "@/components/dashboard/widgets/RecommendationCard";
import ComingSoon from "@/components/dashboard/widgets/ComingSoon";

export default function DashboardGrid({ profile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ── ROW 1 — TIER 1: Identity + Spiritual Anchor (above the fold) ── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <WelcomeCard profile={profile} />
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <ThoughtCard profile={profile} />
      </div>

      {/* ── ROW 2 — TIER 2: Chaitanyam AI + Progress ──────────────────── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <ChaitanyamCard />
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <ProgressCard />
      </div>

      {/* ── ROW 3 — TIER 2/3: Feature Discovery + Wellness Profile ─────── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <QuickActions />
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <WellnessJourney profile={profile} />
      </div>

      {/* ── ROW 4 — TIER 3/4: Recommendations + Roadmap ─────────────────── */}
      <div className="lg:col-span-7 xl:col-span-8">
        <RecommendationCard />
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <ComingSoon />
      </div>

    </div>
  );
}
