// about.tsx – null-proof, type-safe with consistent homepage theme
"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import { useState, useEffect, useMemo } from "react";
import SectionDivider from "../SectionDivider";

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
      <HistorySection {...(about.timeline ?? {})} />
      <SectionDivider />
      <TeamSection />
    </div>
  );
}

/* --------------------- HERO --------------------------------------- */
const AboutHeroSection = ({ title, subtitle, cta }: Hero) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";

  const titleSafe = safeArr(title);
  const subSafe = safeStr(subtitle);
  const primary = cta?.primary;
  const secondary = cta?.secondary;

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* 🌈 Gradient background matching homepage */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)]"
          }
        `}
      />

      {/* CONTENT - Matching homepage layout */}
      <div className="relative z-10 min-h-screen flex items-end">
        <div className="w-full pb-[20vh]">
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
              {/* Small header like homepage */}
              <p
                className={`
                  uppercase tracking-widest text-xs mb-6
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                About · I2EDC · IIT Jammu
              </p>

              {/* Title with gradient like homepage */}
              {!!titleSafe.length && (
                <h1
                  className={`
                    text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-8
                    ${isDark ? "text-white" : "text-gray-900"}
                  `}
                >
                  {titleSafe.map((chunk, i) => (
                    <span key={i}>
                      {chunk.includes("Innovation") || chunk.includes("Journey") ? (
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          {chunk}
                        </span>
                      ) : (
                        chunk
                      )}
                      {i < titleSafe.length - 1 && " "}
                    </span>
                  ))}
                </h1>
              )}

              {/* Subtitle with proper spacing */}
              {!!subSafe && (
                <p
                  className={`
                    text-lg md:text-xl mb-10 max-w-3xl
                    ${isDark ? "text-slate-300" : "text-gray-600"}
                  `}
                >
                  {subSafe}
                </p>
              )}

              {/* CTA Buttons matching homepage */}
              {(primary?.label || secondary?.label) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {primary?.label && (
                    <Link href={primary.href ?? "#"}>
                      <button
                        className="
                          px-8 py-4 rounded-full font-semibold
                          bg-black text-white
                          hover:bg-gray-800 transition
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
                          px-8 py-4 rounded-full font-semibold border transition
                          ${
                            isDark
                              ? "border-white/30 text-white hover:bg-white/10"
                              : "border-gray-300 text-gray-900 hover:bg-gray-100"
                          }
                        `}
                      >
                        {secondary.label}
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center ${
          isDark ? "text-white" : "text-gray-600"
        }`}
      >
        <span className="text-xs tracking-widest mb-2">SCROLL DOWN</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            isDark ? "border-white/50" : "border-gray-400"
          }`}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            className={`w-1 h-3 rounded-full mt-2 ${
              isDark ? "bg-white/70" : "bg-gray-600"
            }`}
          />
        </motion.div>
      </motion.div>

      {/* HERO → NEXT SECTION TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
      </div>
    </section>
  );
};

/* ------------------- MISSION -------------------------------------- */
const MissionSection = ({ heading, paragraphs, pillars }: Mission) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
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
      icon: "💡",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Collaboration",
      desc: "Building interdisciplinary teams and partnerships",
      icon: "🤝",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Impact",
      desc: "Creating solutions with real-world applications",
      icon: "⚡",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section
      id="mission"
      className="relative py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {headingSafe}
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          {paraSafe[0]}
        </p>

        {/* Pillars as cards matching homepage style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillarSafe.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass glass-hover p-6 text-left"
            >
              {/* ICON BADGE matching homepage */}
              <div
                className={`
                  mb-4
                  inline-flex
                  h-11 w-11
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-r ${item.gradient || "from-indigo-500 to-purple-500"}
                  shadow-lg
                `}
              >
                <span className="text-lg">{item.icon || "✨"}</span>
              </div>

              {/* TITLE */}
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional paragraphs */}
        {paraSafe.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
      icon: "🔒",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Excellence",
      desc: "Striving for the highest quality in innovation and execution",
      icon: "⭐",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Inclusivity",
      desc: "Creating opportunities for all students regardless of background",
      icon: "🌍",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Resilience",
      desc: "Persevering through challenges and learning from failures",
      icon: "🛡️",
      gradient: "from-red-500 to-pink-500"
    }
  ];

  return (
    <section className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {headingSafe}
          </motion.h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {summarySafe}
          </p>
        </div>

        {/* Cards grid matching homepage */}
        <div className="grid sm:grid-cols-2 gap-6">
          {cardsSafe.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass glass-hover p-8 text-left"
            >
              {/* ICON BADGE */}
              <div
                className={`
                  mb-6
                  inline-flex
                  h-14 w-14
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-r ${value.gradient || "from-indigo-500 to-purple-500"}
                  shadow-lg
                `}
              >
                <span className="text-2xl">{value.icon || "✨"}</span>
              </div>

              {/* TITLE */}
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>

              {/* DESCRIPTION */}
              <p className="text-muted-foreground">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------- TIMELINE ------------------------------------- */
const HistorySection = ({ heading, milestones }: Timeline) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";

  const headingSafe = safeStr(heading) || "Our Journey";
  const milestonesSafe = safeArr(milestones) || [
    { year: "2018", event: "Foundation of I2EDC at IIT Jammu" },
    { year: "2019", event: "First Innovation Challenge & Prototype Exhibition" },
    { year: "2020", event: "Launch of Tinkering Lab & Digital Initiatives" },
    { year: "2021", event: "Partnerships with Industry Leaders Established" },
    { year: "2022", event: "Expansion of Protospace Facilities" },
    { year: "2023", event: "100+ Student Projects Supported" },
    { year: "2024", event: "National Recognition for Innovation Programs" }
  ];

  return (
    <section className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {headingSafe}
          </motion.h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A timeline of key milestones in our innovation journey
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-indigo-500/30 via-purple-500/30 to-transparent" />
          
          {milestonesSafe.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`
                relative flex items-center mb-12
                ${index % 2 === 0 ? 'flex-row-reverse' : ''}
              `}
            >
              {/* Content */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                <div className="glass glass-hover p-6">
                  <h3 className={`
                    text-2xl font-bold mb-2
                    ${isDark ? 'text-indigo-300' : 'text-indigo-600'}
                  `}>
                    {milestone.year}
                  </h3>
                  <p className="text-muted-foreground">
                    {milestone.event}
                  </p>
                </div>
              </div>
              
              {/* Center dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className={`
                  w-4 h-4 rounded-full
                  bg-gradient-to-r from-indigo-500 to-purple-500
                  ring-4 ${isDark ? 'ring-gray-900' : 'ring-white'}
                `} />
              </div>
              
              {/* Spacer */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pl-12' : 'pr-12'}`} />
            </motion.div>
          ))}
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

  const renderTeam = (members: TeamMember[], delayBase = 0) => {
    if (!members || members.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-8"
        >
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            No members found for this team
          </p>
        </motion.div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {members.map((member, index) => (
          <motion.div
            key={`${member.name}-${index}-${member.role}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delayBase + index * 0.1 }}
            className={`${
              isDark
                ? "bg-white/10 border-white/20 hover:border-cyan-400/40"
                : "bg-black/5 border-black/10 hover:border-cyan-600/40"
            } backdrop-blur-md p-6 rounded-xl border flex flex-col items-center group w-64 transition-all duration-300 hover:shadow-lg`}
          >
            <div className="w-32 h-32 mb-4 overflow-hidden rounded-full border-2 border-white/30 relative">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
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
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-cyan-500/20 text-cyan-700"
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
          </motion.div>
        ))}
      </div>
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
    <section className="relative py-32 px-6 bg-background flex justify-center">
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

        {/* Club Navigation Tabs */}
        {clubTabs.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {clubTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveClub(tab.key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeClub === tab.key
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : isDark
                    ? "bg-white/10 text-white/70 hover:bg-white/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.members.length})
              </button>
            ))}
          </motion.div>
        )}

        {/* Active Club Title */}
        <motion.h3
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

        {/* Team Members Grid */}
        <motion.div
          key={activeClub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderTeam(currentTeam)}
        </motion.div>

        {/* Club Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`mt-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark
              ? "bg-white/10 border-white/20"
              : "bg-black/5 border-black/10"
          } border`}
        >
          <h4
            className={`text-xl font-bold mb-4 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Team Overview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clubTabs.map((tab) => (
              <div key={tab.key} className="text-center">
                <div
                  className={`text-2xl font-bold bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent`}
                >
                  {tab.members.length}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {tab.label} Members
                </div>
              </div>
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