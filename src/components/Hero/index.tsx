"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "../SectionDivider";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import BackgroundVideo from "@/components/animations/BackgroundVideo/BackgroundVideo";
import { useTheme } from "next-themes";
import ServicesSection from "./ServicesSection";
import PrototypesSection from "./PrototypesSection";
import TeamSection from "./TeamSection";
import HistorySection from "./HistorySection";
import EventsSection from "./EventSection";
import { useMounted } from "@/hooks/useMounted";
import TextPressure from "@/components/ui/TextPressure";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <SectionDivider />
      <ServicesSection />
      <SectionDivider />
      <HistorySection />
      <SectionDivider />
      <EventsSection />
      <SectionDivider />
      <PrototypesSection />
      <SectionDivider />
      <TeamSection />
    </div>
  );
}

/* --------------------------------------------------
   HERO SECTION — CLEAN DESIGN WITH TEXTPRESSURE
-------------------------------------------------- */

export const HeroSection = () => {
  const { content } = useContent();
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";

  const heroRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const heroData = content.hero ?? {
    description:
      "The Institute Innovation Entrepreneurship Development Cell (I2EDC), IIT Jammu is a hub for student innovators and entrepreneurs. We provide resources, mentorship, and a vibrant community to help bring ideas to life.",
  };

  // GSAP Animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex flex-col"
    >
      {/* 🎥 VIDEO — always rendered (hydration-safe) */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${isDark ? "opacity-100" : "opacity-0"}
        `}
      >
        <BackgroundVideo videoPath="/Videos/background.mp4" opacity={0.22} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 🌈 Gradient background (both themes) */}
      <div
        className={`
          absolute inset-0
          ${isDark
            ? "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),transparent_60%)]"
            : "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.1),transparent_60%)]"
          }
        `}
      />

      {/* ✨ Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${isDark ? "bg-indigo-400/15" : "bg-indigo-500/10"
              }`}
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${20 + (i * 8) % 60}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* CONTENT - Centered vertically with proper spacing */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-32 pb-40">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Subtitle - properly spaced from navbar */}
          <motion.p
            ref={subtitleRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`
              uppercase tracking-[0.2em] text-xs sm:text-sm mb-12
              ${isDark ? "text-indigo-400" : "text-indigo-600"}
            `}
          >
            Institute Innovation Cell · IIT Jammu
          </motion.p>

          {/* TextPressure Title - FIXED: Increased height to prevent overlap */}
          <div className="relative w-full py-2 mb-12" style={{ height: 'clamp(140px, 20vw, 300px)' }}>
            <TextPressure
              text={heroData.headline?.parts?.[0]?.text?.replace('.', '') || "INNOVATE"}
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor={isDark ? "#ffffff" : "#1a1a2e"}
              minFontSize={36}
              scale={false}
            />
          </div>

          {/* Gradient subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <span
              className={`
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold
                ${isDark ? "text-white" : "text-gray-900"}
              `}
            >
              {heroData.headline?.parts?.[1]?.text || "Create."}{" "}
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {heroData.headline?.parts?.[2]?.text || "Transform."}
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            ref={descRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`
              max-w-2xl mx-auto text-sm sm:text-base md:text-lg mb-12 leading-relaxed
              ${isDark ? "text-slate-300" : "text-gray-600"}
            `}
          >
            {heroData.description}
          </motion.p>

          {/* Buttons */}
          <motion.div
            ref={buttonsRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                document
                  .getElementById("explore")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="
                px-8 py-4 rounded-full font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                hover:from-indigo-500 hover:to-purple-500 
                transition-all duration-300
                shadow-lg shadow-indigo-500/25
              "
            >
              Explore I2EDC
            </motion.button>

            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-8 py-4 rounded-full font-semibold border-2 
                  transition-all duration-300
                  ${isDark
                    ? "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                    : "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                Join Community
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator - Positioned absolutely at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center ${isDark ? "text-white/50" : "text-gray-400"
            }`}
        >
          <span className="text-xs tracking-widest mb-3">SCROLL</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={`w-5 h-8 border-2 rounded-full flex justify-center ${isDark ? "border-white/25" : "border-gray-300"
              }`}
          >
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className={`w-1 h-2 rounded-full mt-1.5 ${isDark ? "bg-white/50" : "bg-gray-400"
                }`}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

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

/* --------------------------------------------------
   ABOUT / EXPLORE SECTION - SPOTLIGHT CARDS
-------------------------------------------------- */

const AboutSection = () => {
  const { content } = useContent();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const about = content.about ?? {
    title: "Explore I2EDC",
    subtitle: "Our Offerings",
    offerings: [
      {
        title: "Protospace",
        description: "A collaborative workspace equipped with tools and resources for prototyping and development.",
        gradient: "from-blue-500 to-cyan-400",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
      },
      {
        title: "Tinkering Lab",
        description: "A hands-on lab for experimenting with electronics, robotics, and IoT.",
        gradient: "from-pink-500 to-rose-400",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path><path d="M9 21h6"></path></svg>'
      },
      {
        title: "Machine Services",
        description: "Access to a range of specialized machines for fabrication and manufacturing.",
        gradient: "from-orange-500 to-amber-400",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>'
      },
      {
        title: "Lab Visit",
        description: "Book a guided visit to explore our innovation labs and interact with mentors.",
        gradient: "from-green-500 to-emerald-400",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
      },
    ],
  };

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".offering-card");

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
              start: "top 80%",
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
      id="explore"
      className="relative py-24 lg:py-32 px-6 bg-background"
    >
      <div className="max-w-7xl mx-auto w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="h2 mb-4"
        >
          {about.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="p max-w-2xl mx-auto mb-16"
        >
          {about.subtitle}
        </motion.p>

        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {about.offerings.map((item: { title: string; description: string; gradient?: string; icon?: string }, i: number) => (
            <SpotlightCard key={i} className="offering-card text-left p-6">
              {/* ICON BADGE */}
              <div
                className={`
                  mb-5
                  inline-flex
                  h-12 w-12
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br ${item.gradient || 'from-indigo-500 to-purple-500'}
                  shadow-lg
                  text-white
                  transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                `}
              >
                {renderSVG(item.icon)}
              </div>

              {/* TITLE */}
              <h3 className={`text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                {item.description}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};
