"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";

const TeamSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { content, loading, error } = useContent();

  const teamData = content.team ?? {
    core_members: [
      {
        name: "Ashutosh Vishwakarma",
        role: "Founder & Lead Engineer",
        image:
          "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Ashutosh Vishwakarma",
        role: "AI & Robotics Specialist",
        image:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    club_heads: [
      {
        name: "Ashutosh Vishwakarma",
        role: "Full Stack Developer",
        image:
          "https://images.unsplash.com/photo-1603415526960-f8f0a7090f88?auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Ashutosh Vishwakarma",
        role: "Design & UI/UX",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
      },
    ],
  };

  const renderTeam = (members: any[], delayBase = 0) => (
    <div className="flex flex-wrap justify-center gap-10">
      {members.map((member, index) => (
        <motion.div
          key={`${member.name}-${index}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delayBase + index * 0.12 }}
          whileHover={{ y: -6 }}
          className={`
            w-64
            rounded-2xl
            p-6
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
                  bg-white/[0.9]
                  border-black/[0.08]
                  hover:bg-white
                  hover:border-black/[0.12]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]
                `
            }
          `}
        >
          {/* Avatar */}
          <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border border-white/20">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>

          {/* Name */}
          <h3
            className={`text-lg font-semibold text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {member.name}
          </h3>

          {/* Role */}
          <p
            className={`text-sm text-center mt-1 ${
              isDark ? "text-slate-300" : "text-gray-600"
            }`}
          >
            {member.role}
          </p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* PROTOTYPES → TEAM TRANSITION */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-b from-background to-background" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-20 lg:pt-40 pb-28 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h2 mb-16"
        >
          Meet the{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Team
          </span>
        </motion.h2>

        {/* Core Team */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-xl font-semibold mb-10 text-cyan-400"
        >
          Core Team
        </motion.h3>
        {renderTeam(teamData.core_members)}

        {/* Club Heads */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-xl font-semibold mt-20 mb-10 text-green-400"
        >
          Club Heads & Student Leaders
        </motion.h3>
        {renderTeam(teamData.club_heads, 0.2)}
      </div>
    </section>
  );
};

export default TeamSection;
