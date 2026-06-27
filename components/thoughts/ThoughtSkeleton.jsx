// * THOUGHT LOADING SKELETON
// ! This is a Client Component (rendered on the browser)
// ? It displays a subtle shimmer loading animation while thoughts data is resolving.

"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ThoughtSkeleton() {
  return (
    <Card className="h-full border border-border bg-gradient-to-br from-card to-secondary/30 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Shimmer overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* Title skeleton */}
        <div className="h-4.5 w-32 rounded-lg bg-muted animate-pulse" />
        {/* Cycle button skeleton */}
        <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
      </CardHeader>

      <CardContent className="pt-2 flex-grow flex flex-col justify-between space-y-4">
        {/* Quote body placeholder */}
        <div className="space-y-2 mt-2">
          <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-[92%] rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-[60%] rounded-md bg-muted animate-pulse" />
        </div>

        {/* Author details placeholder */}
        <div className="h-4.5 w-24 rounded-md bg-muted self-end animate-pulse mt-4" />

        {/* Actions panel placeholder */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40 w-full">
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-xl bg-muted animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
