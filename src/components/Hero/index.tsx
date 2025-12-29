"use client";
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
   HERO SECTION — AMBIENT VIDEO + ANIMATED GRADIENT
-------------------------------------------------- */

export const HeroSection = () => {
  const { content } = useContent();
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";

  const heroData = content.hero ?? {
    description:
      "The Institute Innovation Entrepreneurship Development Cell (I2EDC), IIT Jammu is a hub for student innovators and entrepreneurs. We provide resources, mentorship, and a vibrant community to help bring ideas to life.",
  };

  return (
    <section
      className="
    relative w-full overflow-hidden
    min-h-[calc(100svh-64px)]
    pt-[64px]
  "
    >
      {/* 🎥 VIDEO — always rendered (hydration-safe) */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${isDark ? "opacity-100" : "opacity-0"}
        `}
      >
        <BackgroundVideo videoPath="/Videos/background.mp4" opacity={0.22} />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* 🌈 Gradient background (both themes) */}
      <div
        className={`
          absolute inset-0
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)]"
          }
        `}
      />

      {/* CONTENT */}
      <div className="relative z-10 h-screen flex items-center sm:items-end">
        <div className="w-full pb-10 sm:pb-[14vh]">
          <div
            className="
              max-w-7xl
              pl-10
              sm:pl-16
              md:pl-24
              lg:pl-32
              pr-8
            "
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <p
                className={`
                  uppercase tracking-widest text-xs mb-6
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                Institute Innovation Cell · IIT Jammu
              </p>

              <h1
                className={`
                  text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-8
                  ${isDark ? "text-white" : "text-gray-900"}
                `}
              >
                Innovate. Create.
                <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Transform.
                </span>
              </h1>

              <p
                className={`
                  text-lg md:text-xl mb-10
                  ${isDark ? "text-slate-300" : "text-gray-600"}
                `}
              >
                {heroData.description}
              </p>

             <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <button
                  onClick={() =>
                    document
                      .getElementById("explore")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
                    px-8 py-4 rounded-full font-semibold
                    bg-black text-white
                    hover:bg-gray-800 transition
                  "
                >
                  Explore I2EDC
                </button>

                <Link href="/auth">
                  <button
                    className={`
                      px-8 py-4 rounded-full font-semibold border transition
                      ${
                        isDark
                          ? "border-white/30 text-white hover:bg-white/10"
                          : "border-gray-300 text-gray-900 hover:bg-gray-100"
                      }
                    `}
                  >
                    Join Community
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HERO → ABOUT TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
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
   ABOUT / EXPLORE SECTION
-------------------------------------------------- */
const AboutSection = () => {
  const { content } = useContent();

  const about = content.about ?? {
    title: "Explore I2EDC",
    subtitle: "Spaces · Tools · Mentorship",
    offerings: [
      {
        title: "Protospace",
        description: "Collaborative prototyping & fabrication environment.",
      },
      {
        title: "Tinkering Lab",
        description: "Hands-on electronics, robotics & IoT workspace.",
      },
      {
        title: "Machine Services",
        description: "Access to precision manufacturing tools.",
      },
      {
        title: "Innovation Support",
        description: "Mentorship, funding & startup guidance.",
      },
    ],
  };

  return (
    <section
      id="explore"
      className="relative py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h2 mb-4"
        >
          {about.title}
        </motion.h2>

        <p className="p max-w-2xl mx-auto mb-16">{about.subtitle}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {about.offerings.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass glass-hover p-6 text-left"
            >
              {/* ICON BADGE */}
              <div
                className={`
          mb-4
          inline-flex
          h-11 w-11
          items-center justify-center
          rounded-xl
          bg-gradient-to-r ${item.gradient}
          shadow-lg
        `}
              >
                {renderSVG(item.icon)}
              </div>

              {/* TITLE */}
              <h3 className="h4 mb-2">{item.title}</h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
