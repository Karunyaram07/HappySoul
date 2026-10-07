// * DASHBOARD SERVER LAYOUT - PHASE 6B.5
// ! Server Component wrapping dashboard pages with ChaitanyamProvider
// ? Queries authenticated session and profile onboarding status safely on the server.
// ? If authenticated and onboarded, wraps children with ChaitanyamProvider.
// ? Otherwise, passes children through without duplicating page-level redirect guards.

import { createClient } from "@/lib/supabase/server";
import { ChaitanyamProvider } from "@/components/krishna/ChaitanyamProvider";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  // Retrieve user session on server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  // Retrieve profile information
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, is_onboarded, preferred_language")
    .eq("id", user.id)
    .single();

  const isOnboarded = Boolean(profile?.is_onboarded);

  // If user is not onboarded yet, pass children through directly
  if (!isOnboarded) {
    return <>{children}</>;
  }

  const firstName = profile?.full_name
    ? profile.full_name.trim().split(" ")[0]
    : "Seeker";

  return (
    <ChaitanyamProvider
      userId={user.id}
      userFirstName={firstName}
      preferredLanguage={profile?.preferred_language || "English"}
    >
      {children}
    </ChaitanyamProvider>
  );
}
