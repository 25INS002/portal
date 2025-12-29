"use client";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { FaHistory } from "react-icons/fa";
import { MdTimeline } from "react-icons/md";
import { TbRoute } from "react-icons/tb";

import { useContent } from "@/context/ContentContext";

const HistorySection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { content } = useContent();

  const historyData = content.history?.timeline ?? [
    {
      year: "2019",
      event: "Founding of I2EDC",
      description:
        "Established the innovation cell to foster student entrepreneurship",
    },
    {
      year: "2020",
      event: "Launch of Protospace",
      description:
        "Opened our state-of-the-art prototyping facility",
    },
    {
      year: "2022",
      event: "Annual Innovation Summit",
      description:
        "Hosted our first major innovation conference",
    },
    {
      year: "2023",
      event: "Expanded Labs",
      description:
        "Added AI, Robotics, and IoT labs for students",
    },
    {
      year: "2024",
      event: "National Collaboration",
      description:
        "Partnered with institutes for nationwide innovation programs",
    },
  ];

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* SERVICES → HISTORY TRANSITION */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-b from-background to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-20 pt-40 pb-32">
        {/* SECTION TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h2 text-center mb-20"
        >
          Our{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Journey
          </span>
        </motion.h2>

        {/* TIMELINE */}
        <VerticalTimeline
          lineColor={isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb"}
        >
          {historyData.map((milestone, index) => (
            <VerticalTimelineElement
              key={index}
              date={milestone.year}
              icon={<TbRoute />}
              iconStyle={{
                background: isDark ? "#6366f1" : "#3b82f6",
                color: "#fff",
                boxShadow: "none",
              }}
              contentStyle={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
              contentArrowStyle={{ display: "none" }}
            >
              {/* GLASS CARD */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass glass-hover p-6"
              >
                <h3 className="h4 mb-1">{milestone.event}</h3>
                <p className="text-sm text-muted-foreground">
                  {milestone.description}
                </p>
              </motion.div>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};

export default HistorySection;
