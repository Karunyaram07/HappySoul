"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute h-[350px] w-[350px] rounded-full bg-primary/20 blur-[100px] dark:bg-primary/10" />
        <div className="absolute h-[250px] w-[250px] rounded-full bg-accent/25 blur-[90px] dark:bg-accent/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/50 dark:from-card/60 dark:to-secondary/20 p-8 sm:p-12 md:p-16 text-center shadow-xl overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle geometric circles */}
          <div className="absolute -top-[15%] -right-[10%] h-48 w-48 rounded-full border border-primary/10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-[15%] -left-[10%] h-64 w-64 rounded-full border border-accent/10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

          {/* Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-6 transition-transform group-hover:rotate-12 duration-300">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Ready to Begin Your Journey?
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Find peace, positivity, and purpose through daily guidance, meditative practice routines, and mindful living.
          </p>

          {/* Button */}
          <div className="mt-8 flex justify-center">
            <a
              href="#signup"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
