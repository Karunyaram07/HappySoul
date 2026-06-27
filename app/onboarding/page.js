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

  const languagesOptions = ["English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"];

  // * Check auth state on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
      if (userError || !user) {
        // ! Send unauthenticated visitors to login
        router.push("/sign-in?next=/onboarding");
      } else {
        setUserId(user.id);
        // * Attempt to pre-fill name from metadata
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

    if (step === 3 && goals.length === 0) {
      setError("Please select at least one wellness goal.");
      return;
    }

    if (step === 4 && interests.length === 0) {
      setError("Please select at least one area of interest.");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        preferred_language: language,
        goals: goals,
        interests: interests,
        is_onboarded: true,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

          <CardContent className="min-h-[280px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* Step 1: Welcome Screen */}
              {step === 1 && (
                <StepCard key="step1">
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="h-7 w-7 text-accent animate-pulse" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold">Welcome to Happy Soul 🌿</CardTitle>
                    <CardDescription className="text-base max-w-md mx-auto">
                      Let&apos;s personalize your journey toward peace, positivity, and mindful living. Tell us a bit about yourself so we can curate the best wisdom.
                    </CardDescription>
                  </div>
                </StepCard>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <StepCard key="step2">
                  <div className="space-y-6 w-full max-w-md mx-auto">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
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

              {/* Step 3: Goals */}
              {step === 3 && (
                <StepCard key="step3">
                  <div className="space-y-6 w-full">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Choose Your Wellness Goals</CardTitle>
                      <CardDescription>Select the intentions you want to focus on (multiple allowed)</CardDescription>
                    </div>
                    <GoalSelector selectedGoals={goals} setSelectedGoals={setGoals} />
                  </div>
                </StepCard>
              )}

              {/* Step 4: Interests */}
              {step === 4 && (
                <StepCard key="step4">
                  <div className="space-y-6 w-full">
                    <div className="text-center">
                      <CardTitle className="text-2xl">Choose Your Interests</CardTitle>
                      <CardDescription>Select what content formats and topics interest you (multiple allowed)</CardDescription>
                    </div>
                    <InterestSelector selectedInterests={interests} setSelectedInterests={setInterests} />
                  </div>
                </StepCard>
              )}

              {/* Step 5: Completion Screen */}
              {step === 5 && (
                <StepCard key="step5">
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                      <Sparkles className="h-7 w-7 text-accent animate-pulse" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold">You&apos;re all set! 🎉</CardTitle>
                    <CardDescription className="text-base max-w-md mx-auto">
                      Your Happy Soul journey begins today. We have customized your sanctuary experience based on your aspirations and preferences.
                    </CardDescription>
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
                    Go to Dashboard
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
