// * SANCTUARY DASHBOARD HUB
// ! This is a Server Component (runs on the server to securely fetch data)
// ? It enforces auth and onboarding guards, then composes the responsive widget layout.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/layout/DashboardHeader";
import DashboardGrid from "@/components/dashboard/layout/DashboardGrid";
import CalmBreathAtmosphere from "@/components/dashboard/layout/CalmBreathAtmosphere";

export default async function DashboardPage() {
  const supabase = await createClient();

  // * Double-Guard: Perform a server-side session check to secure dashboard route
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ! Redirect unauthenticated visitors immediately back to login
    redirect("/sign-in");
  }

  // * Fetch user profile information
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // * Extra Guard: If onboarding is not completed, redirect to /onboarding
  if (profile && !profile.is_onboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="relative min-h-screen bg-background py-8 sm:py-12">
      {/* Mental-wellness "Calm Breath" ambient atmosphere */}
      <CalmBreathAtmosphere />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Render modular Dashboard Header and Grid */}
        <DashboardHeader profile={profile} />
        <DashboardGrid profile={profile} />
      </div>
    </div>
  );
}

