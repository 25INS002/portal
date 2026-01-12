"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";
import { useMounted } from "@/hooks/useMounted";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Prototype {
  title: string;
  description: string;
  category: string;
}

export default function PrototypesSection() {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const { content } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Fallback content
  const prototypesData: Prototype[] = content.prototypes?.prototypes ?? [
    {
      title: "Smart Agriculture System",
      description:
        "An automated IoT-based system for monitoring soil health and crop growth.",
      category: "IoT & Automation",
    },
    {
      title: "Wearable Health Tracker",
      description:
        "A compact wearable for monitoring vitals and encouraging healthy habits.",
      category: "Healthcare",
    },
    {
      title: "Sustainable Energy Solution",
      description:
        "A prototype focused on clean energy generation using renewables.",
      category: "Energy",
    },
  ];

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".prototype-card");
      
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={sectionRef} className="relative w-full bg-background overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 py-24 lg:py-32">
        {/* SECTION TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className={`
            inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6
            ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-100 text-green-600"}
          `}>
            Innovation Showcase
          </span>
          <h2 className="h2">
            Student{" "}
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Prototypes
            </span>
          </h2>
        </motion.div>

        {/* PROTOTYPE CARDS */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypesData.map((prototype, index) => (
            <SpotlightCard
              key={index}
              className="prototype-card p-8 h-full flex flex-col"
              spotlightColor={isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.08)"}
            >
              {/* ICON */}
              <div className="
                  w-12 h-12
                  rounded-xl
                  bg-gradient-to-br from-green-500 to-cyan-500
                  mb-6
                  flex items-center justify-center
                  shadow-lg
                  text-white
                  transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                "
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              {/* CATEGORY */}
              <span className={`text-sm font-semibold block mb-2 ${isDark ? "text-green-400" : "text-green-600"}`}>
                {prototype.category}
              </span>

              {/* TITLE */}
              <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                {prototype.title}
              </h3>

              {/* DESCRIPTION */}
              <p className={`leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                {prototype.description}
              </p>

              {/* Arrow */}
              <div className={`mt-auto flex items-center text-sm font-medium transition-colors ${isDark ? "text-green-400" : "text-green-600"}`}>
                View Project
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
