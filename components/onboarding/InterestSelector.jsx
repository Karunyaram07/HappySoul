"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function InterestSelector({ selectedInterests, setSelectedInterests }) {
  const interestsOptions = [
    "Bhagavad Gita",
    "Krishna Teachings",
    "Yoga",
    "Meditation",
    "Motivational Stories",
    "Inspirational Quotes",
    "Devotional Music",
    "Motivational Songs",
    "Podcasts",
    "Movies",
  ];

  const handleToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {interestsOptions.map((interest) => {
        const isSelected = selectedInterests.includes(interest);
        return (
          <button
            key={interest}
            type="button"
            onClick={() => handleToggle(interest)}
            className={cn(
              "flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-300 font-semibold text-xs sm:text-sm hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-secondary/40"
            )}
          >
            <span>{interest}</span>
            <div
              className={cn(
                "h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ml-2",
                isSelected
                  ? "border-primary-foreground bg-primary-foreground text-primary"
                  : "border-border"
              )}
            >
              {isSelected && (
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
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
