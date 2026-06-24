import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "I use Krishna AI whenever I feel confused about important life decisions. The guidance is grounded in timeless Gita wisdom but feels incredibly practical, modern, and compassionate.",
      author: "Aarav Sharma",
      role: "Software Architect",
      initials: "AS",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      quote: "Daily reflections and mood tracking helped me maintain a consistent mindfulness routine. I love how the platform recommends peaceful meditation tracks based exactly on my current emotional log.",
      author: "Priya Patel",
      role: "Yoga Instructor",
      initials: "PP",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      quote: "Happy Soul helped me create a healthier and calmer daily mindset. The layout is completely distraction-free, and the daily positive affirmations are a beautiful way to start my mornings.",
      author: "Rohan Das",
      role: "Creative Director",
      initials: "RD",
      gradient: "from-blue-400 to-indigo-500",
    },
  ];

  return (
    <section id="testimonials" className="w-full bg-background py-20 lg:py-28 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Seekers of Peace
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from members of our community who have transformed their minds and habits using Happy Soul.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((test, index) => (
            <div
              key={test.author}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Quote icon watermark */}
              <Quote className="absolute right-6 top-6 h-12 w-12 text-border/40 pointer-events-none group-hover:text-primary/10 transition-colors" />

              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-accent text-accent-foreground" />
                  ))}
                </div>

                <p className="text-base text-muted-foreground leading-relaxed italic relative z-10">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border/60">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${test.gradient} text-white text-sm font-bold shadow-sm`}>
                  {test.initials}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    {test.author}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {test.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
