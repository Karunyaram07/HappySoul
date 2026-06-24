"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Flame, Compass, CalendarRange } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserCheck,
      title: "Create Your Profile",
      description: "Quick sign-up followed by our multi-step onboarding wizard to choose your preferred language and growth preferences.",
      stepNum: "01",
    },
    {
      icon: Flame,
      title: "Choose Your Wellness Goals",
      description: "Target specific areas such as stress relief, better sleep, focus enhancement, career decisions, or finding overall inner peace.",
      stepNum: "02",
    },
    {
      icon: Compass,
      title: "Receive Personalized Guidance",
      description: "Get daily positive quotes, yoga suggestions, motivational videos, movie recs, and custom insights synced to your daily mood.",
      stepNum: "03",
    },
    {
      icon: CalendarRange,
      title: "Build Positive Daily Habits",
      description: "Maintain a private gratitude journal, log your daily mood state, and seek instant guidance from your digital Bhagavad Gita mentor.",
      stepNum: "04",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="how-it-works" className="w-full bg-secondary/20 py-20 lg:py-28 border-b border-border relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Journey to Tranquility
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, scientifically grounded 4-step path to integrating mindfulness and spiritual growth into your busy daily life.
          </p>
        </div>

        {/* Timeline Layout */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Central Vertical Line (hidden on tiny screens, aligned on medium+) */}
          <div className="absolute left-[31px] md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-border hidden sm:block" />

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                  variants={itemVariants}
                >
                  {/* Circle Number Marker */}
                  <div className="absolute left-0 sm:left-1/2 top-1.5 sm:top-auto sm:-translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground shadow-md z-10 transition-transform hover:scale-110">
                    <StepIcon className="h-6 w-6 text-accent" />
                  </div>

                  {/* Spacer / Align Column Left/Right */}
                  <div className="w-full sm:w-1/2 pl-20 sm:pl-0 sm:px-12">
                    <div
                      className={`flex flex-col p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow transition-shadow relative ${
                        isEven ? "sm:text-right" : "sm:text-left"
                      }`}
                    >
                      {/* Step Indicator */}
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground bg-accent/20 px-2.5 py-1 rounded-full w-fit mb-4 mx-0 self-start sm:self-auto group-hover:bg-primary/20">
                        Step {step.stepNum}
                      </span>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty Spacer Column for layout mapping */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
