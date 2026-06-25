import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Heart, MessageSquare, BookOpen, Smile, Calendar, Compass, User } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side session check (double guard alongside middleware)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch public profile if trigger has synced it
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email.split("@")[0];

  const modules = [
    {
      icon: MessageSquare,
      title: "Krishna AI Guide",
      description: "Chat with your personal spiritual mentor inspired by the Bhagavad Gita.",
      phase: "Phase 5",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Compass,
      title: "Daily Positive Thoughts",
      description: "Read your custom daily affirmations and motivational quote.",
      phase: "Phase 4",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Heart,
      title: "Yoga & Meditation Hub",
      description: "Browse curated breathing exercises, yoga routines, and sleep focus guides.",
      phase: "Phase 9",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Smile,
      title: "Mood Tracker",
      description: "Track your emotional states and view a 7-day wellness chart.",
      phase: "Phase 7",
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    },
    {
      icon: BookOpen,
      title: "Inspirational Stories",
      description: "Read motivational life stories, success journeys, and spiritual parables.",
      phase: "Phase 6",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Calendar,
      title: "Daily Reflection Journal",
      description: "Write private journals and analyze your positivity patterns using AI.",
      phase: "Phase 8",
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background py-10 sm:py-16">
      {/* Calm glowing backdrops */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[350px] w-[350px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="relative rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 sm:p-10 shadow-xl mb-12">
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
                Welcome to Happy Soul. Take a deep breath and start your journey towards positive thinking, clarity, and mental calmness.
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

        {/* Modules Grid */}
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
            Explore Sanctuary Modules
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              const IconComponent = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow transition-shadow overflow-hidden"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${mod.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-secondary text-primary border border-border px-2.5 py-0.5 rounded-full">
                        {mod.phase}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Coming soon button indicator */}
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <button
                      disabled
                      className="w-full text-center py-2 text-xs font-semibold bg-secondary/60 text-muted-foreground rounded-lg border border-border/60 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
