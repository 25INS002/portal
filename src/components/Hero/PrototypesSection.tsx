"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";
import { useMounted } from "@/hooks/useMounted";
export default function PrototypesSection() {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const { content, loading, error } = useContent();

  // Fallback content
  const prototypesData = content.prototypes?.prototypes ?? [
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

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* EVENTS → PROTOTYPES TRANSITION */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-b from-background to-background" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-20 pt-40 pb-32">
        {/* SECTION TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h2 text-center mb-16"
        >
          Student{" "}
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Prototypes
          </span>
        </motion.h2>

        {/* PROTOTYPE CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prototypesData.map((prototype, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className={`
                rounded-2xl
                p-8
                border
                backdrop-blur-xl
                transition-all
                duration-500
                ${
                  isDark
                    ? `
                      bg-white/[0.06]
                      border-white/[0.12]
                      hover:bg-white/[0.09]
                      hover:border-white/[0.18]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                    `
                    : `
                      bg-white/[0.85]
                      border-black/[0.08]
                      hover:bg-white
                      hover:border-black/[0.12]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]
                    `
                }
              `}
            >
              {/* ICON */}
              <div
                className="
                  w-12 h-12
                  rounded-lg
                  bg-gradient-to-r from-green-500 to-cyan-500
                  mb-6
                  flex items-center justify-center
                "
              >
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="text-sm font-semibold text-green-400 block mb-2">
                {prototype.category}
              </span>

              {/* TITLE */}
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {prototype.title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className={`leading-relaxed ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                {prototype.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
