// about.tsx – null-proof, type-safe with consistent homepage theme
"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { useMounted } from "@/hooks/useMounted";
import SectionDivider from "../SectionDivider";
import HistorySection from "@/components/Hero/HistorySection";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
/* --------------------- TYPE DEFINITIONS --------------------------- */
type Gradient = string;
interface Hero {
  title?: string[];
  subtitle?: string;
  cta?: {
    primary?: { label?: string; href?: string };
    secondary?: { label?: string; href?: string };
  };
}
interface Mission {
  heading?: string;
  paragraphs?: string[];
  pillars?: {
    title?: string;
    desc?: string;
    icon?: string;
    gradient?: Gradient;
  }[];
}
interface Values {
  heading?: string;
  summary?: string;
  cards?: {
    title?: string;
    desc?: string;
    icon?: string;
    gradient?: Gradient;
  }[];
}
interface Timeline {
  heading?: string;
  milestones?: { year?: string; event?: string }[];
}
interface AboutPageData {
  hero?: Hero;
  mission?: Mission;
  values?: Values;
  timeline?: Timeline;
}

/* --------------------- SMALL HELPERS ------------------------------ */
const safeArr = <T,>(v?: T[]): T[] => (Array.isArray(v) ? v : []);
const safeStr = (v?: string): string => (typeof v === "string" ? v : "");

const renderSVG = (svg?: string) => {
  if (!svg) return null;
  const fixed = svg.replace(/className=/g, "class=");
  return (
    <span
      className="pointer-events-none"
      dangerouslySetInnerHTML={{ __html: fixed }}
    />
  );
};

// Map common emojis to SVG icons
const emojiToSVG: Record<string, string> = {
  "💡": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>',
  "🤝": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  "⚡": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
  "🔒": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  "⭐": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  "🌍": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
  "🛡️": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  "🚀": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
  "📋": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
  "🧡": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  "✨": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
};

const getIconSVG = (icon?: string): string | undefined => {
  if (!icon) return undefined;
  // If it's already an SVG string, return as-is
  if (icon.includes("<svg")) return icon;
  // If it's an emoji, convert to SVG
  if (emojiToSVG[icon]) return emojiToSVG[icon];
  // Fallback star icon
  return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
};

// Animated Counter Component
const AnimatedCounter = ({ 
  target, 
  duration = 2,
  className = ""
}: { 
  target: number; 
  duration?: number;
  className?: string;
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            gsap.fromTo(
              counterRef.current,
              { innerText: 0 },
              {
                innerText: target,
                duration: duration,
                ease: "power2.out",
                snap: { innerText: 1 },
                onUpdate: function() {
                  if (counterRef.current) {
                    counterRef.current.innerText = Math.round(
                      parseFloat(counterRef.current.innerText || "0")
                    ).toString();
                  }
                }
              }
            );
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(counterRef.current);

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={counterRef} className={className}>0</span>;
};

/* --------------------- PAGE SHELL --------------------------------- */
export default function AboutPage() {
  const { content } = useContent();
  const about = content?.aboutpg as AboutPageData | undefined;
  
  // Fallback data
  const heroFallback = {
    title: ["Discover Our", "Innovation", "Journey"],
    subtitle: "The Institute Innovation Entrepreneurship Development Cell (I2EDC) at IIT Jammu is dedicated to fostering innovation, entrepreneurship, and creative problem-solving among students.",
    cta: {
      primary: { label: "Explore Programs", href: "/programs" },
      secondary: { label: "Join Community", href: "/auth" }
    }
  };

  if (!about) {
    return (
      <div className="relative w-full overflow-x-hidden">
        <AboutHeroSection {...heroFallback} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-hidden">
      <AboutHeroSection {...(about.hero ?? heroFallback)} />
      <SectionDivider />
      <MissionSection {...(about.mission ?? {})} />
      <SectionDivider />
      <ValuesSection {...(about.values ?? {})} />
      <SectionDivider />
      <HistorySection />
      <SectionDivider />
      <TeamSection />
    </div>
  );
}

/* --------------------- HERO --------------------------------------- */
const AboutHeroSection = ({ title, subtitle, cta }: Hero) => {
  const { theme } = useTheme();
  const mounted = useMounted(); // Assuming useMounted is available or imported, same as Services page
  const isDark = mounted && theme === "dark";
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !heroRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      // Title reveal animation
      const tl = gsap.timeline();

      tl.from(".hero-text-reveal", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
      })
      .from(".hero-subtext", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5")
      .from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4");

    }, heroRef);

    return () => ctx.revert();
  }, [mounted]);

  const titleSafe = safeArr(title);
  const subSafe = safeStr(subtitle);
  const primary = cta?.primary;
  const secondary = cta?.secondary;

  return (
    <section ref={heroRef} className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-20">
      {/* 🌈 Gradient background matching homepage */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]"
          }
        `}
      />

      {/* CONTENT - Matching homepage layout */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center">
         <div ref={textRef} className="max-w-4xl mx-auto">
            <div className="overflow-hidden mb-2">
              <p
                className={`
                  hero-text-reveal uppercase tracking-[0.2em] text-sm font-semibold mb-6 inline-block
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                About · I2EDC · IIT Jammu
              </p>
            </div>

            {/* Title with gradient like homepage */}
            {!!titleSafe.length && (
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                {titleSafe.map((chunk, i) => (
                  <div key={i} className="overflow-hidden inline-block mr-4 last:mr-0">
                    <span className="hero-text-reveal inline-block">
                      {chunk.includes("Innovation") || chunk.includes("Journey") ? (
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2">
                          {chunk}
                        </span>
                      ) : (
                        <span className={`${isDark ? "text-white" : "text-gray-900"}`}>
                           {chunk}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </h1>
            )}

            {/* Subtitle with proper spacing */}
            {!!subSafe && (
              <p
                className={`
                  hero-subtext text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed
                  ${isDark ? "text-slate-300" : "text-gray-600"}
                `}
              >
                {subSafe}
              </p>
            )}

            {/* CTA Buttons matching homepage */}
            {(primary?.label || secondary?.label) && (
              <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
                {primary?.label && (
                  <Link href={primary.href ?? "#"}>
                    <button
                      className="
                        px-8 py-6 rounded-full font-semibold text-base
                        bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                        hover:from-indigo-500 hover:to-purple-500
                        shadow-lg shadow-indigo-500/25
                        transition-all duration-300 hover:scale-105
                      "
                    >
                      {primary.label}
                    </button>
                  </Link>
                )}

                {secondary?.label && (
                  <Link href={secondary.href ?? "#"}>
                    <button
                      className={`
                        px-8 py-6 rounded-full font-semibold text-base border-2 transition-all duration-300 hover:scale-105
                        ${
                          isDark
                            ? "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                            : "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                        }
                      `}
                    >
                      {secondary.label}
                    </button>
                  </Link>
                )}
              </div>
            )}
         </div>
      </div>

      {/* HERO → NEXT SECTION TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
      </div>
    </section>
  );
};

/* ------------------- MISSION -------------------------------------- */
import { Rocket, Users, Shield, Zap, Heart, Star, Globe, Lightbulb, Target, Award, Key } from "lucide-react";

// Helper to get icon and theme based on title
const getThemeForTitle = (title: string, defaultGradient?: string) => {
  const t = (title || "").toLowerCase();
  
  if (t.includes("innovation")) return { Icon: Rocket, gradient: "from-pink-500 to-rose-600", color: "text-white" };
  if (t.includes("accessibility")) return { Icon: Key, gradient: "from-cyan-400 to-blue-500", color: "text-white" };
  if (t.includes("community")) return { Icon: Users, gradient: "from-violet-500 to-indigo-600", color: "text-white" };
  if (t.includes("excellence")) return { Icon: Award, gradient: "from-amber-400 to-orange-500", color: "text-white" };
  if (t.includes("collaboration")) return { Icon: Users, gradient: "from-blue-500 to-indigo-500", color: "text-white" };
  if (t.includes("integrity")) return { Icon: Shield, gradient: "from-emerald-400 to-green-600", color: "text-white" };
  if (t.includes("resilience")) return { Icon: Target, gradient: "from-red-500 to-rose-600", color: "text-white" };
  if (t.includes("inclusivity")) return { Icon: Heart, gradient: "from-fuchsia-500 to-pink-600", color: "text-white" };
  if (t.includes("impact")) return { Icon: Zap, gradient: "from-yellow-400 to-orange-500", color: "text-white" };
  
  return { Icon: Star, gradient: defaultGradient || "from-slate-500 to-gray-500", color: "text-white" };
};

const MissionSection = ({ heading, paragraphs, pillars }: Mission) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";

  const headingSafe = safeStr(heading) || "Our Mission";
  const paraSafe = safeArr(paragraphs) || [
    "To cultivate a culture of innovation and entrepreneurship at IIT Jammu by providing resources, mentorship, and opportunities for students to transform ideas into impactful solutions."
  ];
  const pillarSafe = safeArr(pillars) || [
    {
      title: "Innovation",
      desc: "Fostering creative thinking and problem-solving skills",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "Collaboration",
      desc: "Building interdisciplinary teams and partnerships",
      gradient: "from-violet-500 to-indigo-500"
    },
    {
      title: "Impact",
      desc: "Creating solutions with real-world applications",
      gradient: "from-yellow-400 to-orange-500"
    }
  ];

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".mission-card");
      
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
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
    <section
      ref={sectionRef}
      id="mission"
      className="relative lg:py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {headingSafe}
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          {paraSafe[0]}
        </p>

        {/* Pillars as cards matching homepage style */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillarSafe.map((item, i) => {
             const { Icon, gradient, color } = getThemeForTitle(item.title || "", item.gradient);
             
             // Extract simple color for spotlight
             let spotlightColor = "rgba(99, 102, 241, 0.2)";
             if (gradient.includes("pink")) spotlightColor = "rgba(236, 72, 153, 0.2)";
             else if (gradient.includes("cyan")) spotlightColor = "rgba(6, 182, 212, 0.2)";
             else if (gradient.includes("violet")) spotlightColor = "rgba(139, 92, 246, 0.2)";
             else if (gradient.includes("emerald")) spotlightColor = "rgba(16, 185, 129, 0.2)";
             else if (gradient.includes("amber")) spotlightColor = "rgba(245, 158, 11, 0.2)";

            return (
              <SpotlightCard 
                key={i} 
                className="mission-card h-full p-1 border-white/10"
                spotlightColor={spotlightColor}
              >
                 <div className="relative h-full bg-secondary/5 rounded-[0.9rem] p-8 flex flex-col items-start text-left overflow-hidden group hover:bg-secondary/10 transition-colors duration-500">
                    
                    {/* Hover Glow Background */}
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div
                      className={`
                        mb-6
                        inline-flex
                        h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-gradient-to-br ${gradient}
                        shadow-lg
                        text-white
                        transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3
                      `}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className={`text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.title}
                    </h3>

                    <p className={`text-base leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {item.desc}
                    </p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Additional paragraphs */}
        {paraSafe.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            {paraSafe.slice(1).map((p, i) => (
              <p key={i} className="text-lg text-muted-foreground mb-4">
                {p}
              </p>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

/* ------------------- VALUES --------------------------------------- */
const ValuesSection = ({ heading, summary, cards }: Values) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";

  const headingSafe = safeStr(heading) || "Our Values";
  const summarySafe = safeStr(summary) || "Guiding principles that drive our innovation ecosystem";
  const cardsSafe = safeArr(cards) || [
    {
      title: "Integrity",
      desc: "Commitment to ethical practices and transparency in all endeavors",
    },
    {
      title: "Excellence",
      desc: "Striving for the highest quality in innovation and execution",
    },
    {
      title: "Inclusivity",
      desc: "Creating opportunities for all students regardless of background",
    },
    {
      title: "Resilience",
      desc: "Persevering through challenges and learning from failures",
    }
  ];

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".value-card");
      
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
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
    <section 
      ref={sectionRef}
      className="relative lg:py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {headingSafe}
          </motion.h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {summarySafe}
          </p>
        </div>

        {/* Cards grid matching homepage */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 gap-8">
          {cardsSafe.map((value, index) => {
             const { Icon, gradient } = getThemeForTitle(value.title || "", value.gradient);
             
              // Extract simple color for spotlight
             let spotlightColor = "rgba(99, 102, 241, 0.2)";
             if (gradient.includes("pink")) spotlightColor = "rgba(236, 72, 153, 0.2)";
             else if (gradient.includes("cyan")) spotlightColor = "rgba(6, 182, 212, 0.2)";
             else if (gradient.includes("emerald")) spotlightColor = "rgba(16, 185, 129, 0.2)";
             else if (gradient.includes("amber")) spotlightColor = "rgba(245, 158, 11, 0.2)";

            return (
              <SpotlightCard 
                key={index} 
                className="value-card h-full p-1 border-white/10"
                spotlightColor={spotlightColor}
              >
                <div className="relative h-full bg-secondary/5 rounded-[0.9rem] p-8 flex flex-col items-start text-left overflow-hidden group hover:bg-secondary/10 transition-colors duration-500">
                    {/* Hover Glow Background */}
                     <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* ICON BADGE */}
                    <div
                      className={`
                        mb-6
                        inline-flex
                        h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-gradient-to-br ${gradient}
                        shadow-lg
                        text-white
                        transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                      `}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* TITLE */}
                    <h3 className={`text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {value.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className={`text-base leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {value.desc}
                    </p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};


/* ------------------- LEADERSHIP ----------------------------------- */
interface TeamMember {
  name: string;
  role: string;
  image?: string;
  club?: string;
}

interface TeamData {
  core_members?: TeamMember[];
  ps_tl_members?: TeamMember[];
  e_cell_members?: TeamMember[];
  bec_members?: TeamMember[];
}

const TeamSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";
  const { content, loading, error } = useContent();
  const [activeClub, setActiveClub] = useState("core");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize active club once data is loaded
  useEffect(() => {
    if (!loading && content.full_team && !isInitialized) {
      const teamData = content.full_team as TeamData;
      const clubs = [
        { key: "core", members: teamData.core_members },
        { key: "ps_tl", members: teamData.ps_tl_members },
        { key: "e_cell", members: teamData.e_cell_members },
        { key: "bec", members: teamData.bec_members },
      ];

      const firstValidClub = clubs.find(
        (club) => club.members && club.members.length > 0
      );
      if (firstValidClub && firstValidClub.key !== activeClub) {
        setActiveClub(firstValidClub.key);
      }
      setIsInitialized(true);
    }
  }, [loading, content.full_team, activeClub, isInitialized]);

  // Safe data access with fallbacks
  const teamData = useMemo(
    () => (content.full_team as TeamData) || {},
    [content.full_team]
  );

  const core_members = teamData.core_members || [];
  const ps_tl_members = teamData.ps_tl_members || [];
  const e_cell_members = teamData.e_cell_members || [];
  const bec_members = teamData.bec_members || [];

  const hasNoData = useMemo(
    () =>
      core_members.length === 0 &&
      ps_tl_members.length === 0 &&
      e_cell_members.length === 0 &&
      bec_members.length === 0,
    [core_members, ps_tl_members, e_cell_members, bec_members]
  );

  // Club configuration
  const clubConfig = useMemo(
    () => ({
      core: {
        gradient: "from-cyan-500 to-blue-600",
        displayName: "I2EDC Core Team",
        tabLabel: "I2EDC Core",
        members: core_members,
      },
      ps_tl: {
        gradient: "from-purple-500 to-pink-600",
        displayName: "ProtoSpace & Tinkering Lab",
        tabLabel: "ProtoSpace & TL",
        members: ps_tl_members,
      },
      e_cell: {
        gradient: "from-green-500 to-emerald-600",
        displayName: "Entrepreneurship Cell",
        tabLabel: "E-Cell",
        members: e_cell_members,
      },
      bec: {
        gradient: "from-orange-500 to-red-600",
        displayName: "Budding Entrepreneur Club",
        tabLabel: "BEC",
        members: bec_members,
      },
    }),
    [core_members, ps_tl_members, e_cell_members, bec_members]
  );

  // Available tabs with members
  const clubTabs = useMemo(
    () =>
      Object.entries(clubConfig)
        .filter(([_, config]) => config.members.length > 0)
        .map(([key, config]) => ({
          key,
          label: config.tabLabel,
          members: config.members,
          gradient: config.gradient,
          displayName: config.displayName,
        })),
    [clubConfig]
  );

  // Current team members
  const currentTeam = useMemo(
    () => clubConfig[activeClub as keyof typeof clubConfig]?.members || [],
    [activeClub, clubConfig]
  );

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";

    const parent = target.parentElement;
    if (parent && !parent.querySelector(".fallback-avatar")) {
      const fallback = document.createElement("div");
      fallback.className =
        "fallback-avatar w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg";
      fallback.textContent = target.alt?.charAt(0) || "?";
      parent.appendChild(fallback);
    }
  };

  const renderTeam = (members: TeamMember[], gradient?: string, delayBase = 0) => {
    if (!members || members.length === 0) {
      return (
        <div className="text-center py-8">
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            No members found for this team
          </p>
        </div>
      );
    }

    // Derive spotlight color
    let spotlightColor = "rgba(6, 182, 212, 0.25)"; // Default Cyan
    if (gradient?.includes("purple")) spotlightColor = "rgba(168, 85, 247, 0.25)"; // Purple
    else if (gradient?.includes("green")) spotlightColor = "rgba(16, 185, 129, 0.25)"; // Emerald/Green
    else if (gradient?.includes("orange")) spotlightColor = "rgba(249, 115, 22, 0.25)"; // Orange

    return (
      <motion.div 
        key={members[0]?.name || "empty"} // Force re-render on team change to trigger animation
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-wrap justify-center gap-6 mb-8"
      >
        {members.map((member, index) => (
          <motion.div
            key={`${member.name}-${index}-${member.role}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            <SpotlightCard
              className="w-64 p-6 flex flex-col items-center h-full"
              spotlightColor={spotlightColor}
            >
              <div className={`w-32 h-32 mb-4 overflow-hidden rounded-full border-2 ${isDark ? "border-white/20" : "border-black/10"} relative group-hover:border-transparent transition-colors duration-300`}>
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={handleImageError}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient || "from-cyan-500 to-blue-600"} flex items-center justify-center text-white font-bold text-2xl`}>
                    {member.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              <h3
                className={`text-lg font-bold text-center ${
                  isDark ? "text-white" : "text-gray-900"
                } mb-1`}
              >
                {member.name || "Unknown Member"}
              </h3>

              <div className="text-center mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full bg-opacity-20 ${
                    gradient?.includes("purple") ? "bg-purple-500 text-purple-600 dark:text-purple-300" :
                    gradient?.includes("green") ? "bg-emerald-500 text-emerald-600 dark:text-emerald-300" :
                    gradient?.includes("orange") ? "bg-orange-500 text-orange-600 dark:text-orange-300" :
                    "bg-cyan-500 text-cyan-600 dark:text-cyan-300"
                  }`}
                >
                  {member.club || "I2EDC"}
                </span>
              </div>

              <p
                className={`${
                  isDark ? "text-slate-300" : "text-gray-600"
                } text-sm text-center`}
              >
                {member.role || "Team Member"}
              </p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Loading state
  if (loading && !content.full_team) {
    return <LoadingState isDark={isDark} message="Loading team..." />;
  }

  // Error state
  if (error && !content.full_team) {
    return (
      <ErrorState isDark={isDark} onRetry={() => window.location.reload()} />
    );
  }

  // No data state
  if (hasNoData) {
    return (
      <NoDataState isDark={isDark} onRetry={() => window.location.reload()} />
    );
  }

  // No tabs available
  if (clubTabs.length === 0) {
    return (
      <NoDataState isDark={isDark} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <section className="relative mb-8 lg:py-24 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Meet Our Team
          </motion.h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dedicated individuals driving innovation forward
          </p>
        </div>

        {/* Tabs for Club Navigation */}
        <Tabs defaultValue={activeClub} onValueChange={setActiveClub} className="w-full flex flex-col items-center">
          {clubTabs.length > 1 && (
            <TabsList className={`mb-12 h-auto p-1 backdrop-blur-sm border rounded-xl ${
              isDark ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"
            }`}>
              {clubTabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="px-6 py-3 rounded-lg font-semibold relative z-0 transition-colors duration-300 data-[state=active]:text-white text-muted-foreground hover:text-foreground"
                >
                  {/* Sliding Background Indicator */}
                  {activeClub === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg -z-10 bg-gradient-to-r ${tab.gradient} shadow-lg`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Tab Text */}
                  <span className={`relative z-10 flex items-center ${activeClub === tab.key ? "text-white" : ""}`}>
                    {tab.label} 
                    <span className={`ml-2 text-xs ${activeClub === tab.key ? "opacity-80" : "opacity-50"}`}>
                      ({tab.members.length})
                    </span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {/* Active Club Title */}
          <motion.h3
            key={activeClub}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center bg-gradient-to-r ${
              clubConfig[activeClub as keyof typeof clubConfig]?.gradient ||
              "from-gray-500 to-gray-600"
            } bg-clip-text text-transparent`}
          >
            {clubConfig[activeClub as keyof typeof clubConfig]?.displayName ||
              "Team"}
          </motion.h3>

          {/* Team Members Grid within TabsContent */}
          <div className="w-full">
            {clubTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-0 focus-visible:outline-none">
                {renderTeam(tab.members, tab.gradient)}
              </TabsContent>
            ))}
          </div>
        </Tabs>


        {/* Club Statistics - Modern with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`mt-12 p-8 rounded-2xl backdrop-blur-sm ${
            isDark
              ? "bg-gradient-to-br from-white/5 to-white/10 border-white/10"
              : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
          } border shadow-xl`}
        >
          <h4
            className={`text-2xl font-bold mb-8 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Team Overview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {clubTabs.map((tab, index) => (
              <motion.div 
                key={tab.key} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`text-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? "bg-white/5 hover:bg-white/10" 
                    : "bg-white hover:shadow-lg"
                }`}
              >
                <div
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent mb-2`}
                >
                  <AnimatedCounter target={tab.members.length} duration={2} />
                </div>
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {tab.label}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Members
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Extracted components for better organization
const LoadingState = ({
  isDark,
  message,
}: {
  isDark: boolean;
  message: string;
}) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-32">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
      <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {message}
      </p>
    </div>
  </section>
);

const ErrorState = ({
  isDark,
  onRetry,
}: {
  isDark: boolean;
  onRetry: () => void;
}) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-32">
    <div className="text-center">
      <p className="text-lg text-red-500 mb-4">Error loading team content</p>
      <button
        onClick={onRetry}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isDark
            ? "bg-white/10 text-white border border-white/30"
            : "bg-gray-100 text-gray-800 border border-gray-300"
        }`}
      >
        Retry
      </button>
    </div>
  </section>
);

const NoDataState = ({
  isDark,
  onRetry,
}: {
  isDark: boolean;
  onRetry: () => void;
}) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-32">
    <div className="text-center">
      <p
        className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"} mb-4`}
      >
        No team data available
      </p>
      <button
        onClick={onRetry}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isDark
            ? "bg-white/10 text-white border border-white/30"
            : "bg-gray-100 text-gray-800 border border-gray-300"
        }`}
      >
        Retry
      </button>
    </div>
  </section>
);