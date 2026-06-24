"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Quote, Eye, Smile, BookOpen, Music, Sparkles } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "Krishna AI Guide",
      description: "Chat with a compassionate AI mentor inspired by the Bhagavad Gita to navigate relationships, careers, stress, and life goals.",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      icon: Quote,
      title: "Daily Positive Thoughts",
      description: "Receive a personalized quote, author attribution, and affirmation every single day, cached to load instantly.",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      icon: Eye,
      title: "Yoga & Meditation Hub",
      description: "Browse routines, breathing exercise step-by-steps, and focus exercises categorized by sleep, relief, and calmness goals.",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      icon: Smile,
      title: "Mood Tracking",
      description: "Log your daily emoji mood. View a 7-day analytics chart and receive instant content recommendations based on how you feel.",
      color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    },
    {
      icon: BookOpen,
      title: "Inspirational Stories",
      description: "Explore a feed of motivational life stories, spiritual anecdotes, and real-world wisdom designed to trigger self-improvement.",
      color: "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      icon: Music,
      title: "Personalized Recommendations",
      description: "Get weekly lists of inspiring songs, devotional playlists, motivation speeches, and movies based on your language and mood.",
      color: "from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="features" className="w-full bg-background py-20 lg:py-28 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Experience Holism. Live Positively.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A beautiful, fully-integrated suite of features designed to guide you toward peace, focus, and purposeful living.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={feat.title}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] overflow-hidden"
                variants={itemVariants}
              >
                {/* Visual hover background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`} />

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feat.color} mb-6 shadow-sm`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                  {feat.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
