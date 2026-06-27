// * SANCTUARY DASHBOARD HUB
// ! This is a Server Component (runs on the server to securely fetch data)
// ? It enforces auth and onboarding guards, then composes the responsive widget layout.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/layout/DashboardHeader";
import DashboardGrid from "@/components/dashboard/layout/DashboardGrid";

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
      {/* Calm glowing backdrops */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[350px] w-[350px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Render modular Dashboard Header and Grid */}
        <DashboardHeader profile={profile} />
        <DashboardGrid profile={profile} />
      </div>
    </div>
  );
}

