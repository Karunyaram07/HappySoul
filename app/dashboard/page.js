import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Heart, Languages, Target, Compass, User, AlertCircle } from "lucide-react";
import Link from "next/link";

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

  // * Fetch user profile information (automatically synced during sign-up and updated during onboarding)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // * Extra Guard: If onboarding is not completed, redirect to /onboarding
  if (profile && !profile.is_onboarded) {
    redirect("/onboarding");
  }

  const displayName = profile?.full_name || user.email.split("@")[0];
  const language = profile?.preferred_language || "English";
  const goals = profile?.goals || [];
  const interests = profile?.interests || [];

  return (
    <div className="relative min-h-screen bg-background py-10 sm:py-16">
      {/* Calm glowing backdrops */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[350px] w-[350px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="relative rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 sm:p-10 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                <span className="text-sm font-semibold tracking-wider uppercase">Your Personal Sanctuary</span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl leading-tight">
                Peace be with you, <span className="text-primary">{displayName}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Welcome to Happy Soul. Your preferences have been successfully configured. This is a temporary view verifying your personalization data.
              </p>
            </div>
            
            {/* User Profile Summary */}
            <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm border border-border/80 px-6 py-4 rounded-2xl shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground truncate max-w-[150px]">{user.email}</h4>
                <p className="text-xs text-muted-foreground">Free Account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Personalized Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          
          {/* Preferred Language Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Preferred Language</h3>
            </div>
            <p className="text-2xl font-black text-primary">{language}</p>
          </div>

          {/* Goals Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Your Wellness Goals</h3>
            </div>
            {goals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No goals selected.</p>
            )}
          </div>

        </div>

        {/* Interests Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Your Interests</h3>
          </div>
          {interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-accent/20 text-accent-foreground border border-accent/20 px-3 py-1.5 rounded-full"
                >
                  {i}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No interests selected.</p>
          )}
        </div>

        {/* Verification Status Banner */}
        <div className="flex items-start gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-700 dark:text-emerald-300 shadow-inner">
          <Heart className="h-6 w-6 shrink-0 text-accent fill-accent animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base">Verification Successful!</h4>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              This confirms that Phase 3B: Onboarding completed successfully and persisted your customized data directly to your Supabase profile row.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
