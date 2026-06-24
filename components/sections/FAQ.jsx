"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is Krishna AI?",
      answer: "Krishna AI is an advanced AI guide designed with the system prompt of a compassionate, wise mentor. It draws upon the timeless teachings of the Bhagavad Gita to answer your questions about life, relationships, careers, stress, decision-making, and emotional conflicts in a practical and non-judgmental way.",
    },
    {
      question: "Is Happy Soul free?",
      answer: "Yes, Happy Soul offers a robust free tier that allows you to read daily quotes, log your mood, write journal entries, browse the yoga and meditation library, and chat with Krishna AI. We may offer premium features in the future, but our core mindfulness tools will remain accessible.",
    },
    {
      question: "Is this tied to a specific religion?",
      answer: "Happy Soul is designed for everyone, regardless of their background, spiritual path, or personal beliefs. While the chatbot is inspired by the philosophical and psychological insights of the Bhagavad Gita, the guidance centers on universal principles of self-improvement, mindfulness, duty (dharma), resilience, and inner peace.",
    },
    {
      question: "How does personalization work?",
      answer: "During onboarding, you select your preferred language, personal growth goals, and areas of wellness focus. As you use the app (by tracking your mood and completing journal reflections), our recommendation engine customizes quotes, meditation guides, music, and videos to fit your current state.",
    },
    {
      question: "Can I use Happy Soul daily?",
      answer: "Absolutely! In fact, consistency is key to forming positive mental habits. We recommend checking in every morning for your Daily Positive Thought and logging your mood, then wrapping up your day with a reflection in your gratitude journal.",
    },
    {
      question: "Is my reflection journal private?",
      answer: "Yes. Your journal entries are completely private. We implement database Row Level Security (RLS) policies, which means only you can read or edit your own entries. Your raw journal data is never sold, shared, or used for ads.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-secondary/30 py-20 lg:py-28 border-b border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Have questions about Happy Soul? Explore our quick answers below.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="border-t border-border/60 p-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
