"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Heart, CheckCircle2, Languages } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: Cpu,
      title: "AI-Powered Guidance",
      description: "Ask important life questions to Krishna AI, a compassionate assistant modeled on timeless Bhagavad Gita principles.",
      bg: "bg-primary/5 dark:bg-primary/10 text-primary",
    },
    {
      icon: Heart,
      title: "Personalized Wellness",
      description: "Receive highly customized recommendations for music, yoga, breathing exercises, and movies tailored to your goals.",
      bg: "bg-accent/20 text-accent-foreground",
    },
    {
      icon: CheckCircle2,
      title: "Daily Positive Habits",
      description: "Form lasting mental health habits by tracking daily moods, reading daily reflections, and logging in your private journal.",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Languages,
      title: "Multi-Language Support",
      description: "Personalize your experience by selecting your preferred language during onboarding to read quotes and recommendations.",
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full bg-secondary/30 py-16 sm:py-24 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Happy Soul?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive, digital sanctuary built to uplift your mental, emotional, and spiritual well-being.
          </p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.03]"
                variants={cardVariants}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${benefit.bg} mb-5`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
