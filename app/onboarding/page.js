"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Stepper from "@/components/onboarding/Stepper";
import StepCard from "@/components/onboarding/StepCard";
import GoalSelector from "@/components/onboarding/GoalSelector";
import InterestSelector from "@/components/onboarding/InterestSelector";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  LIFE_SITUATIONS,
  PRIMARY_CHALLENGES,
  EXPERIENCE_LEVELS,
  REMINDER_PERIODS,
  NOTIFICATION_FREQUENCIES,
  CONTENT_PREFERENCES,
  LEARNING_STYLES,
  MUSIC_PREFERENCES,
  SPIRITUAL_PATHS,
  AVATAR_TYPES,
  AVATAR_COLORS,
  AVATAR_CONFIG,
  updateProfile,
} from "@/lib/profile";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // * Form State
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState("English");
  const [goals, setGoals] = useState([]);
  const [interests, setInterests] = useState([]);
  
  // * Personalization State (Step 3)
  const [lifeSituation, setLifeSituation] = useState("");
  const [primaryChallenge, setPrimaryChallenge] = useState("");

  // * Preferences State (Step 4)
  const [experienceLevel, setExperienceLevel] = useState("");
  const [reminderPeriod, setReminderPeriod] = useState("Morning");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState("Daily");
  const [contentPreference, setContentPreference] = useState("Balanced Reading");
  const [learningStyle, setLearningStyle] = useState("");
  const [musicPreference, setMusicPreference] = useState("Peaceful");
  const [spiritualPath, setSpiritualPath] = useState("Balanced");

  // * Avatar State (Step 5)
  const [avatarType, setAvatarType] = useState("lotus");
  const [avatarColor, setAvatarColor] = useState("indigo");

  const languagesOptions = ["English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"];

  // * Check auth state on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
      if (userError || !user) {
        router.push("/sign-in?next=/onboarding");
      } else {
        setUserId(user.id);
        setFullName(user.user_metadata?.full_name || "");
      }
      setFetchingUser(false);
    });
  }, [router]);

  const handleNext = () => {
    setError(null);

    // * Validations
    if (step === 2) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!language) {
        setError("Please select your preferred language.");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    setError(null);
    if (step === 5) {
      // If skipping the avatar step, complete immediately with current states/defaults
      handleComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    
    // Prepare the profiles record update object matching db schema guidelines
    const profileUpdates = {
      full_name: fullName,
      preferred_language: language,
      goals: goals,
      interests: interests,
      current_life_situation: lifeSituation || null,
      primary_challenge: primaryChallenge || null,
      experience_level: experienceLevel || null,
      daily_reminder_period: reminderPeriod.toLowerCase(),
      notifications_enabled: notificationsEnabled,
      notification_frequency: notificationFrequency.toLowerCase(),
      content_format_preference: contentPreference.toLowerCase(),
      learning_style: learningStyle || null,
      music_mood_preference: musicPreference.toLowerCase(),
      avatar_type: avatarType,
      avatar_color: avatarColor,
      spiritual_path: spiritualPath.toLowerCase(),
      onboarding_version: 1,
      profile_version: 1,
      onboarding_completed_at: new Date().toISOString(),
      is_onboarded: true,
    };

    try {
      await updateProfile(supabase, userId, profileUpdates);
      router.push("/dashboard");
      router.refresh();
    } catch (updateError) {
      setError(updateError.message);
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper map for avatar color dot classes
  const colorDotClasses = {
    indigo: "bg-indigo-500 ring-indigo-500/30",
    emerald: "bg-emerald-500 ring-emerald-500/30",
    amber: "bg-amber-500 ring-amber-500/30",
    rose: "bg-rose-500 ring-rose-500/30",
    teal: "bg-teal-500 ring-teal-500/30",
    purple: "bg-purple-500 ring-purple-500/30",
  };

  // Helper mapping from Tailwind color to preview classes
  const previewBgColorClasses = {
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      {/* Calm glowing backgrounds */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Stepper Node Progress */}
        <Stepper currentStep={step} totalSteps={5} />

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <ProgressBar currentStep={step} totalSteps={5} />
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-medium text-left">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="min-h-[380px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* Step 1: Welcome Screen */}
              {step === 1 && (
                <StepCard key="step1">
                  <div className="text-center space-y-4 py-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="h-7 w-7 text-accent animate-pulse" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold">Welcome to Happy Soul 🌿</CardTitle>
                    <CardDescription className="text-base max-w-md mx-auto">
                      Let&apos;s personalize your sanctuary toward peace, positivity, and mindful living. Tell us a bit about yourself so we can curate the best wisdom.
                    </CardDescription>
                  </div>
                </StepCard>
              )}

              {/* Step 2: About You */}
              {step === 2 && (
                <StepCard key="step2">
                  <div className="space-y-6 w-full max-w-md mx-auto py-4">
                    <div className="text-center">
                      <CardTitle className="text-2xl">About You</CardTitle>
                      <CardDescription>What should we call you and which language do you prefer?</CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Your Full Name
                        </label>
                        <Input
                          id="fullName"
                          type="text"
                          required
                          placeholder="e.g. Aarav Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="language" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Preferred Language
                        </label>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                        >
                          {languagesOptions.map((lang) => (
                            <option key={lang} value={lang} className="text-foreground bg-card">
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </StepCard>
              )}

              {/* Step 3: Your Journey */}
              {step === 3 && (
                <StepCard key="step3">
                  <div className="space-y-6 w-full max-h-[460px] overflow-y-auto px-1 pr-2 scrollbar-thin">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Your Journey</CardTitle>
                      <CardDescription>Select what aligns with your wellness goals and current challenges.</CardDescription>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Select Wellness Goals
                        </label>
                        <GoalSelector selectedGoals={goals} setSelectedGoals={setGoals} />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Select Areas of Interest
                        </label>
                        <InterestSelector selectedInterests={interests} setSelectedInterests={setInterests} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="lifeSituation" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Current Life Situation
                          </label>
                          <select
                            id="lifeSituation"
                            value={lifeSituation}
                            onChange={(e) => setLifeSituation(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            <option value="">Select situation...</option>
                            {LIFE_SITUATIONS.map((sit) => (
                              <option key={sit} value={sit} className="text-foreground bg-card">
                                {sit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="primaryChallenge" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Primary Challenge
                          </label>
                          <select
                            id="primaryChallenge"
                            value={primaryChallenge}
                            onChange={(e) => setPrimaryChallenge(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            <option value="">Select challenge...</option>
                            {PRIMARY_CHALLENGES.map((chal) => (
                              <option key={chal} value={chal} className="text-foreground bg-card">
                                {chal}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </StepCard>
              )}

              {/* Step 4: Preferences */}
              {step === 4 && (
                <StepCard key="step4">
                  <div className="space-y-6 w-full max-h-[460px] overflow-y-auto px-1 pr-2 scrollbar-thin">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Preferences</CardTitle>
                      <CardDescription>Customize your daily reminders and content priorities.</CardDescription>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                      <div>
                        <label htmlFor="experienceLevel" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Experience Level
                        </label>
                        <select
                          id="experienceLevel"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                        >
                          <option value="">Select level...</option>
                          {EXPERIENCE_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl} className="text-foreground bg-card">
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="reminderPeriod" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Daily Reminder Period
                        </label>
                        <select
                          id="reminderPeriod"
                          value={reminderPeriod}
                          onChange={(e) => setReminderPeriod(e.target.value)}
                          className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                        >
                          {REMINDER_PERIODS.map((per) => (
                            <option key={per} value={per} className="text-foreground bg-card">
                              {per}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <span className="block text-sm font-bold text-foreground">Enable Daily Notifications</span>
                          <span className="block text-xs text-muted-foreground">Receive daily thoughts and mindfulness nudges</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="notificationsEnabled"
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                          />
                          {notificationsEnabled && (
                            <select
                              id="notificationFrequency"
                              value={notificationFrequency}
                              onChange={(e) => setNotificationFrequency(e.target.value)}
                              className="flex h-9 rounded-lg border border-border bg-secondary/20 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                            >
                              {NOTIFICATION_FREQUENCIES.filter(f => f !== "Off").map((freq) => (
                                <option key={freq} value={freq} className="text-foreground bg-card">
                                  {freq}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-2 border-t border-border/40 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contentPreference" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Preferred Reading Format
                          </label>
                          <select
                            id="contentPreference"
                            value={contentPreference}
                            onChange={(e) => setContentPreference(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            {CONTENT_PREFERENCES.map((pref) => (
                              <option key={pref} value={pref} className="text-foreground bg-card">
                                {pref}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="learningStyle" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Preferred Learning Style
                          </label>
                          <select
                            id="learningStyle"
                            value={learningStyle}
                            onChange={(e) => setLearningStyle(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            <option value="">Select style...</option>
                            {LEARNING_STYLES.map((style) => (
                              <option key={style} value={style} className="text-foreground bg-card">
                                {style}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="musicPreference" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Music Preference
                          </label>
                          <select
                            id="musicPreference"
                            value={musicPreference}
                            onChange={(e) => setMusicPreference(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            {MUSIC_PREFERENCES.map((m) => (
                              <option key={m} value={m} className="text-foreground bg-card">
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="spiritualPath" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Spiritual Path Preference
                          </label>
                          <select
                            id="spiritualPath"
                            value={spiritualPath}
                            onChange={(e) => setSpiritualPath(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                          >
                            {SPIRITUAL_PATHS.map((path) => (
                              <option key={path} value={path} className="text-foreground bg-card">
                                {path}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </StepCard>
              )}

              {/* Step 5: Avatar & Finish */}
              {step === 5 && (
                <StepCard key="step5">
                  <div className="space-y-6 w-full py-2">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Avatar & Style</CardTitle>
                      <CardDescription>Choose a spiritual symbol and theme color for your profile.</CardDescription>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
                      {/* Interactive Avatar Preview */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`h-28 w-28 rounded-full border-4 border-card flex items-center justify-center text-4xl shadow-md transition-all duration-300 ${previewBgColorClasses[avatarColor]}`}>
                          {AVATAR_CONFIG[avatarType]?.emoji || "🌸"}
                        </div>
                        <span className="text-xs font-bold tracking-wider text-muted-foreground capitalize">
                          {AVATAR_CONFIG[avatarType]?.label || "Lotus"}
                        </span>
                      </div>

                      {/* Selectors Panel */}
                      <div className="flex-1 w-full space-y-4 max-w-sm">
                        {/* Avatar Type Picker */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-left">
                            Choose Symbol
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {AVATAR_TYPES.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setAvatarType(type)}
                                className={`flex h-10 w-full items-center justify-center rounded-xl border text-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                  avatarType === type
                                    ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/25"
                                    : "bg-secondary/20 border-border hover:bg-secondary/40 text-muted-foreground"
                                }`}
                                title={AVATAR_CONFIG[type]?.label || type}
                              >
                                {AVATAR_CONFIG[type]?.emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Avatar Accent Color Picker */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-left">
                            Choose Accent Color
                          </label>
                          <div className="flex items-center gap-3 py-1">
                            {AVATAR_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setAvatarColor(color)}
                                className={`h-7 w-7 rounded-full border border-border/80 transition-all hover:scale-110 active:scale-90 cursor-pointer ${colorDotClasses[color]} ${
                                  avatarColor === color ? "ring-4" : ""
                                }`}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </StepCard>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/40 pt-6 mt-8">
            {/* Back Button */}
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div /> // Placeholder spacer
            )}

            {/* Skip for now (Steps 3, 4, 5) */}
            {step >= 3 && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading} className="text-xs text-muted-foreground hover:text-foreground">
                Skip for now
              </Button>
            )}

            {/* Next / Complete Button */}
            {step < 5 ? (
              <Button onClick={handleNext} className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-600/90 text-white">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  <>
                    Begin Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
