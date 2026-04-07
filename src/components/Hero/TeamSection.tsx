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

interface TeamMember {
  name: string;
  role: string;
  image: string;
  click_here?: string;
}

const TeamSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const mounted = useMounted();
  const { content } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const facultyCardsRef = useRef<HTMLDivElement>(null);
  const staffCardsRef = useRef<HTMLDivElement>(null);
  const clubCardsRef = useRef<HTMLDivElement>(null);

  const rawTeamData = content.team ?? {};
  const teamData = {
    faculty: rawTeamData.faculty ?? [
      {
        name: "Dr. Navneet Kumar",
        role: "PIC, I2EDC",
        image: "",
        click_here:"qwerty"
      },
      {
        name: "Dr. Arvind",
        role: "CIO, I2EDC",
        image: "",
        click_here:"qwerty"
      },
    ],
    staff: rawTeamData.staff ?? [
      {
        name: "Mohammad Israil",
        role: "OIC, ProtoSpace",
        image: "",
      },
      {
        name: "Namrit Bhardwaj",
        role: "Office Incharge",
        image: "",
      },
    ],
    club_heads: rawTeamData.club_heads ?? [
      {
        name: "Drish Mahajan",
        role: "Student Lead",
        image: "",
      },
    ],
  };

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      // Animate faculty cards
      const facultyCards = facultyCardsRef.current?.querySelectorAll(".team-card");
      if (facultyCards && facultyCards.length > 0) {
        gsap.fromTo(
          facultyCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Animate staff cards
      const staffCards = staffCardsRef.current?.querySelectorAll(".team-card");
      if (staffCards && staffCards.length > 0) {
        gsap.fromTo(
          staffCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: staffCardsRef.current,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Animate club cards
      const clubCards = clubCardsRef.current?.querySelectorAll(".team-card");
      if (clubCards && clubCards.length > 0) {
        gsap.fromTo(
          clubCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: clubCardsRef.current,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Refresh ScrollTrigger to ensure correct positioning
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  const renderTeam = (members: TeamMember[], ref: React.RefObject<HTMLDivElement | null>) => (
    <div ref={ref} className="flex flex-wrap justify-center gap-6">
      {members.map((member: TeamMember, index: number) => (
        <SpotlightCard
          key={`${member.name}-${index}`}
          className="team-card w-64 p-6 flex flex-col items-center"
          spotlightColor={isDark ? "rgba(34, 211, 238, 0.15)" : "rgba(34, 211, 238, 0.08)"}
        >
          {/* Avatar */}
          <div className={`
              w-24 h-24 mb-5 rounded-full overflow-hidden 
              border-2 ${isDark ? "border-white/10" : "border-gray-200"}
              flex items-center justify-center
              transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
              ${!member.image ? (isDark ? "bg-slate-800" : "bg-gray-100") : ""}
            `}
          >
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className={`text-xl font-bold ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className={`text-base font-bold text-center mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {member.name}
          </h3>

          {/* Role */}
          <p className={`text-sm text-center ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
            {member.role}
          </p>

          {/* Action Button (Faculty Only) */}
          {member.click_here && (
            <a 
              href={member.click_here.startsWith('http') ? member.click_here : `https://${member.click_here}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                mt-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide
                transition-all duration-300 border inline-block
                ${isDark 
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white" 
                  : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"}
              `}
            >
              Click Here
            </a>
          )}

          {/* Social Icons (Show on Hover) */}
          <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 0 10.212 5.957c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );

  return (
    <section ref={sectionRef} className="relative w-full bg-background overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 py-24 lg:py-32 text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className={`
            inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6
            ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-600"}
          `}>
            Our People
          </span>
          <h2 className="h2">
            Meet the{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Team
            </span>
          </h2>
        </motion.div>

        {/* Faculty */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-lg font-semibold mb-8 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
        >
          Faculty
        </motion.h3>
        {renderTeam(teamData.faculty, facultyCardsRef)}

        {/* Staff */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-lg font-semibold mt-16 mb-8 ${isDark ? "text-purple-400" : "text-purple-600"}`}
        >
          Staff
        </motion.h3>
        {renderTeam(teamData.staff, staffCardsRef)}

        {/* Club Heads & Student Leaders */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-lg font-semibold mt-16 mb-8 ${isDark ? "text-green-400" : "text-green-600"}`}
        >
          Club Heads & Student Leaders
        </motion.h3>
        {renderTeam(teamData.club_heads, clubCardsRef)}
      </div>
    </section>
  );
};

export default TeamSection;
