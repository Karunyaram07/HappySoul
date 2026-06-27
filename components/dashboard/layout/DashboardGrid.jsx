// * DASHBOARD RESPONSIVE WIDGET GRID
// ! This is a Client Component (rendered on the browser)
// ? It handles the multi-column distribution of widgets on Desktop and stack layout on Mobile.

"use client";

import React from "react";
import WelcomeCard from "@/components/dashboard/widgets/WelcomeCard";
import QuickActions from "@/components/dashboard/actions/QuickActions";
import RecommendationCard from "@/components/dashboard/widgets/RecommendationCard";
import ThoughtCard from "@/components/dashboard/widgets/ThoughtCard";
import ProgressCard from "@/components/dashboard/widgets/ProgressCard";
import WellnessJourney from "@/components/dashboard/widgets/WellnessJourney";
import ComingSoon from "@/components/dashboard/widgets/ComingSoon";

export default function DashboardGrid({ profile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Main Welcome, Quick Actions, and Recommendations */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
        <WelcomeCard profile={profile} />
        <QuickActions />
        <RecommendationCard />
      </div>

      {/* RIGHT COLUMN: Today's Thought, Progress, Onboarding preferences, Roadmap */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        <ThoughtCard profile={profile} />
        <ProgressCard />
        <WellnessJourney profile={profile} />
        <ComingSoon />
      </div>
    </div>
  );
}
