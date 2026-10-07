// * CHAITANYAM AI DEDICATED FULL-PAGE ROUTE — PHASE 6C.2.3
// ! Server Component performing session & onboarding auth double-guards
// ? Renders the dedicated Chaitanyam workspace inside the dashboard layout.
// ? Inherits ChaitanyamProvider state seamlessly from DashboardLayout.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChaitanyamWorkspace from "@/components/krishna/ChaitanyamWorkspace";

export const metadata = {
  title: "Chaitanyam AI — Spiritual Wisdom Companion | Happy Soul",
  description: "Dedicated spiritual workspace for Bhagavad Gita wisdom, reflection, and inner guidance.",
};

export default async function ChaitanyamPage() {
  const supabase = await createClient();

  // Guard 1: Authenticated session check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Guard 2: Profile & Onboarding status check
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && !profile.is_onboarded) {
    redirect("/onboarding");
  }

  return <ChaitanyamWorkspace profile={profile} />;
}
