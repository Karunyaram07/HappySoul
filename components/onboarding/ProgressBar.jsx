"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProgressBar({ currentStep, totalSteps = 5 }) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden border border-border/40">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
