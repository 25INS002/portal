"use client";
import { useEffect, useRef,useState } from "react";
import SectionDivider from "../SectionDivider";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import BackgroundVideo from "@/components/animations/BackgroundVideo/BackgroundVideo";
import { useTheme } from "next-themes";
import ServicesSection from "./ServicesSection";
// import PrototypesSection from "./PrototypesSection";
import ProgramsSection from "./ProgramsSection";
import TeamSection from "./TeamSection";
// import HistorySection from "./HistorySection";
import EventsSection from "./EventSection";
import { useMounted } from "@/hooks/useMounted";
import TextPressure from "@/components/ui/TextPressure";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Image from "next/image";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <HeroSection />
      <ProgramsSection />
      <SectionDivider />
      <AboutSection />
      <SectionDivider />
      <ServicesSection />
      <SectionDivider />
      <EventsSection />
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
              uppercase tracking-[0.2em] text-xs sm:text-sm mb-12 mt-10
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
  const [selectedOffering, setSelectedOffering] = useState<any>(null);

  const about = content.about ?? {
    title: "Explore I2EDC",
    subtitle: "Our Offerings",
    offerings: [
      {
        title: "Protospace",
        image: "/Prototyping-Lab.webp",
        description:
          "Protospace is a collaborative workspace designed for students, innovators, and entrepreneurs to build prototypes and transform ideas into functional products.",
        features: [
          "Rapid prototyping workspace",
          "Access to fabrication tools",
          "Collaboration with innovators",
          "Supports startup development",
        ],
      },
      {
        title: "Tinkering Lab",
        image: "/Tl_lab.webp",
        description:
          "The Tinkering Lab provides a hands-on environment where students can experiment with electronics, robotics, embedded systems, and IoT technologies.",
        features: [
          "Electronics experimentation",
          "Robotics development kits",
          "IoT project support",
          "Hands-on learning environment",
        ],
      },
      {
        title: "Machine Services",
        image: "/equipment.webp",
        description:
          "Machine Services provide access to advanced fabrication machines and tools that help in building mechanical components and manufacturing prototypes.",
        features: [
          "3D printing services",
          "Laser cutting facilities",
          "CNC machining access",
          "Precision manufacturing tools",
        ],
      },
      {
        title: "Lab Visit",
        image: "/equipment.webp",
        description:
          "Lab Visit allows students and visitors to explore our innovation labs, interact with mentors, and understand how ideas are transformed into prototypes.",
        features: [
          "Guided innovation lab tours",
          "Interaction with mentors",
          "Exposure to startup ecosystem",
          "Hands-on technology demonstrations",
        ],
      },
    ],
  };

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
          {about.offerings.map((item: any, i: number) => (
            <SpotlightCard
              key={i}
              className="offering-card text-left p-6 flex flex-col"
            >
              <div className="relative w-full h-36 rounded-lg overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {item.image ? (
                   <img
                    src={item.image.startsWith('http') ? item.image : item.image.startsWith('/') ? `http://localhost:8000${item.image}` : `http://${item.image}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : item.icon ? (
                  item.icon.trim().startsWith("<svg") ? (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                      {renderSVG(item.icon)}
                    </div>
                  ) : (
                    <img
                      src={item.icon.startsWith('http') ? item.icon : item.icon.startsWith('/') ? `http://localhost:8000${item.icon}` : `http://${item.icon}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                     <svg className="w-12 h-12 text-slate-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                  </div>
                )}
              </div>

              <h3
                className={`text-lg font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {item.title}
              </h3>

              <p
                className={`text-sm leading-relaxed mb-4 ${
                  isDark ? "text-slate-400" : "text-gray-600"
                }`}
              >
                {item.description.slice(0, 80)}...
              </p>

              <button
                onClick={() => setSelectedOffering(item)}
                className="mt-auto px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                View More
              </button>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {selectedOffering && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => setSelectedOffering(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >

            <button
  onClick={() => setSelectedOffering(null)}
  className="
    absolute top-4 right-4 z-50
    flex items-center justify-center
    w-10 h-10
    rounded-full
    bg-white dark:bg-slate-800
    text-gray-700 dark:text-white
    shadow-lg
    hover:bg-gray-100 dark:hover:bg-slate-700
    transition
  "
>
  ✕
</button>

            <div className="relative w-full h-60 rounded-lg overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {selectedOffering.image ? (
                 <img
                  src={selectedOffering.image.startsWith('http') ? selectedOffering.image : selectedOffering.image.startsWith('/') ? `http://localhost:8000${selectedOffering.image}` : `http://${selectedOffering.image}`}
                  alt={selectedOffering.title}
                  className="w-full h-full object-cover"
                />
              ) : selectedOffering.icon ? (
                 selectedOffering.icon.trim().startsWith("<svg") ? (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 scale-150">
                    {renderSVG(selectedOffering.icon)}
                  </div>
                 ) : (
                   <img
                    src={selectedOffering.icon.startsWith('http') ? selectedOffering.icon : selectedOffering.icon.startsWith('/') ? `http://localhost:8000${selectedOffering.icon}` : `http://${selectedOffering.icon}`}
                    alt={selectedOffering.title}
                    className="w-full h-full object-cover"
                  />
                 )
              ) : (
                 <svg className="w-20 h-20 text-slate-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
              )}
            </div>

            <h3 className="text-2xl font-bold mb-4">
              {selectedOffering.title}
            </h3>

            <p className="text-muted-foreground mb-6">
              {selectedOffering.description}
            </p>

            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {selectedOffering.features.map((f: string, index: number) => (
                  <li key={index}>• {f}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};  