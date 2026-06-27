// * YOUR WELLNESS JOURNEY WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays the user's preferred language, wellness goals, and interests collected during onboarding.

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Compass, Languages } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function WellnessJourney({ profile }) {
  const goals = profile?.goals || [];
  const interests = profile?.interests || [];
  const language = profile?.preferred_language || "English";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Your Wellness Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Language */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-blue-500" />
              Preferred Language
            </h4>
            <div className="flex">
              <span className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-1.5 rounded-full">
                {language}
              </span>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-emerald-500" />
              Your Wellness Goals
            </h4>
            {goals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <span
                    key={goal}
                    className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No goals selected.</p>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-purple-500" />
              Your Content Interests
            </h4>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3.5 py-1.5 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No interests selected.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
