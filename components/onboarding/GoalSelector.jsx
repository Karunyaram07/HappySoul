"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function GoalSelector({ selectedGoals, setSelectedGoals }) {
  const goalsOptions = [
    "Peace of Mind",
    "Reduce Stress",
    "Better Focus",
    "Self Discipline",
    "Motivation",
    "Spiritual Growth",
    "Better Decision Making",
    "Build Positive Habits",
  ];

  const handleToggle = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {goalsOptions.map((goal) => {
        const isSelected = selectedGoals.includes(goal);
        return (
          <button
            key={goal}
            type="button"
            onClick={() => handleToggle(goal)}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-foreground border-border hover:bg-secondary/40"
            )}
          >
            <span>{goal}</span>
            <div
              className={cn(
                "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-4",
                isSelected
                  ? "border-primary-foreground bg-primary-foreground text-primary"
                  : "border-border"
              )}
            >
              {isSelected && (
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
