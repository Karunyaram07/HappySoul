"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, User, Brain, Heart, MessageCircle, Sun } from "lucide-react";
import AmbientGlow from "@/components/motion/AmbientGlow";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const diagramSteps = [
    { icon: User, label: "You", color: "bg-primary text-primary-foreground border-primary" },
    { icon: Brain, label: "Positive Thoughts", color: "bg-accent/20 text-accent-foreground border-accent" },
    { icon: Heart, label: "Meditation", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30" },
    { icon: Sparkles, label: "AI Guidance", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    { icon: Sun, label: "Peaceful Life", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 lg:py-32">
      {/* Calm glowing backdrops with shared AmbientGlow breathing halo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <AmbientGlow
          size="xl"
          intensity="gentle"
          variant="accent"
          position="top-left"
          duration={18}
        />
        <div className="absolute -top-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-accent/20 blur-[100px] dark:bg-accent/10" />
        <div className="absolute top-[40%] right-[10%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">

          {/* Hero Content Left */}
          <motion.div
            className="relative lg:col-span-7 flex flex-col justify-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Subtle sacred lotus ambient presence behind headline */}
            <div
              aria-hidden="true"
              role="presentation"
              className="pointer-events-none absolute -top-10 -left-6 sm:-top-14 sm:-left-10 lg:-top-16 lg:-left-12 -z-10 select-none overflow-visible"
            >
              <style>{`
                @keyframes hs-lotus-drift {
                  0%, 100% {
                    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
                    opacity: 0.08;
                  }
                  50% {
                    transform: translate3d(12px, -8px, 0) rotate(2deg) scale(1.04);
                    opacity: 0.12;
                  }
                }
                @media (max-width: 640px) {
                  @keyframes hs-lotus-drift {
                    0%, 100% {
                      transform: translate3d(0, 0, 0) rotate(0deg) scale(0.92);
                      opacity: 0.06;
                    }
                    50% {
                      transform: translate3d(6px, -4px, 0) rotate(1.2deg) scale(0.96);
                      opacity: 0.09;
                    }
                  }
                }
                @media (prefers-reduced-motion: reduce) {
                  .hs-lotus-ambient {
                    animation: none !important;
                    transform: none !important;
                  }
                }
              `}</style>
              <div
                className="hs-lotus-ambient will-change-transform"
                style={{
                  animation: "hs-lotus-drift 16s ease-in-out infinite",
                }}
              >
                <svg
                  viewBox="0 0 200 200"
                  className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 text-primary fill-current transition-opacity"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M100 20 C92 55 86 95 100 140 C114 95 108 55 100 20 Z" />
                  <path d="M100 140 C80 120 62 90 68 55 C82 75 92 108 100 140 Z" />
                  <path d="M100 140 C120 120 138 90 132 55 C118 75 108 108 100 140 Z" />
                  <path d="M100 140 C70 125 44 105 40 75 C60 90 80 120 100 140 Z" />
                  <path d="M100 140 C130 125 156 105 160 75 C140 90 120 120 100 140 Z" />
                  <path d="M100 140 C60 135 30 120 22 95 C45 105 75 130 100 140 Z" />
                  <path d="M100 140 C140 135 170 120 178 95 C155 105 125 130 100 140 Z" />
                  <path d="M75 142 C85 152 115 152 125 142 C115 147 85 147 75 142 Z" />
                </svg>
              </div>
            </div>
            <motion.div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary border border-border w-fit" variants={itemVariants}>
              <Sparkles className="h-3.5 w-3.5" />
              Your Daily Compass for Inner Harmony
            </motion.div>

            <motion.h1
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl leading-[1.1] flex flex-col gap-2"
              variants={itemVariants}
            >
              <span className="text-foreground">Transform Your Thoughts.</span>
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Find Inner Peace.</span>
              <span className="text-foreground">Live With Purpose.</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
              variants={itemVariants}
            >
              Your AI-powered companion for mindfulness, spiritual growth, emotional well-being, and positive living. Receive daily inspiration, connect with Krishna AI, track your mood, and discover personalized wellness paths.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              variants={itemVariants}
            >
              <a
                href="./dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg hover:scale-[1.02]"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="./dashboard/chaitanyam"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background/50 backdrop-blur-sm px-6 py-3.5 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-secondary hover:scale-[1.02]"
              >
                Meet Krishna AI
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Visual Right */}
          <motion.div
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full max-w-[420px] rounded-3xl border border-border bg-card/60 backdrop-blur-md p-8 shadow-xl dark:bg-card/30">

              {/* Graphic Flow Layout */}
              <h3 className="text-center font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-8">
                The Journey to Inner Harmony
              </h3>

              <div className="relative flex flex-col items-center gap-6">

                {/* Connecting Line background */}
                <div className="absolute top-4 bottom-4 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary via-accent to-yellow-400 z-0" />

                {diagramSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <motion.div
                      key={step.label}
                      className="relative z-10 flex items-center justify-between w-full bg-background/90 dark:bg-background/95 rounded-2xl border p-4 shadow-sm group hover:border-primary transition-colors"
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.15, duration: 0.5 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${step.color} shadow-inner`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm text-foreground">{step.label}</span>
                      </div>

                      <div className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-opacity font-semibold">
                        Step 0{idx + 1}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Decorative floating dots/sparkles */}
              <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-accent/30 blur-sm animate-bounce" />
              <div className="absolute -bottom-3 -left-3 h-8 w-8 rounded-full bg-primary/20 blur-sm animate-pulse" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
