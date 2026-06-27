"use client";

import React from "react";
import { Check } from "lucide-react";

export default function Stepper({ currentStep, totalSteps = 5 }) {
  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-8">
      {[...Array(totalSteps)].map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Step Node */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-all duration-300 ${
                isCompleted
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : isActive
                  ? "bg-primary/10 text-primary border-primary ring-2 ring-primary/20 scale-110"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
            </div>
            
            {/* Connection Line */}
            {stepNum < totalSteps && (
              <div
                className={`flex-grow h-[2px] mx-2 transition-all duration-300 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
