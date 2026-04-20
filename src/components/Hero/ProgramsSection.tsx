"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "@/context/ContentContext";
import api from "@/lib/api";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { X, ArrowRight, ExternalLink, Plus } from "lucide-react";

/* ── types ─────────────────────────────────────── */
interface Program {
  id: number | string;
  title: string;
  image: string;
  short_description: string;
  description: string;
  apply_url?: string;
}

/* ── helpers ────────────────────────────────────── */
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const resolveImage = (src?: string) => {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/media/")) return `${backendUrl}${src}`;
  if (src.startsWith("/")) return src;
  return `http://${src}`;
};

/* ── fallback data ──────────────────────────────── */
const FALLBACK: Program[] = [
  {
    id: 1,
    title: "Startup Incubation",
    image: "/WhatsApp Image 2026-03-28 at 1.03.38 PM.jpeg",
    short_description:
      "Launch your startup with mentorship, workspace, and seed funding support.",
    description:
      "Our Startup Incubation programme provides end-to-end support for early-stage ventures — from ideation workshops and mentor matching to co-working space and micro-grants. Join a cohort of ambitious founders at IIT Jammu.",
    apply_url: "#",
  },
  {
    id: 2,
    title: "Innovation Challenge",
    image: "/Prototyping-Lab.webp",
    short_description:
      "Compete in our flagship challenge and win prizes worth ₹5 Lakhs.",
    description:
      "The I2EDC Innovation Challenge is a semester-long competition where student teams solve real-world problems. Finalists pitch to an industry jury and winners receive prizes, media exposure, and incubation slots.",
    apply_url: "#",
  },
  {
    id: 3,
    title: "Workshop Series",
    image: "/Tl_lab.webp",
    short_description:
      "Hands-on workshops on IoT, AI/ML, 3D printing, and more.",
    description:
      "A curated calendar of weekend workshops covering trending technologies. Each session is led by industry professionals and includes a take-home project kit.",
    apply_url: "#",
  },
  {
    id: 4,
    title: "Industry Connect",
    image: "/equipment.webp",
    short_description:
      "Bridge the gap between academia and industry through visits & talks.",
    description:
      "Industry Connect pairs student teams with corporate R&D labs for short-term residencies. Participants gain real-world exposure, professional networking, and potential pre-placement offers.",
    apply_url: "#",
  },
  {
    id: 5,
    title: "Fellowship Program",
    image: "/Prototyping-Lab.webp",
    short_description:
      "A 6-month fellowship for deep-tech research and entrepreneurship.",
    description:
      "Selected fellows receive a monthly stipend, dedicated lab access, and one-on-one mentoring from IIT faculty and alumni entrepreneurs. The programme culminates in a demo day.",
    apply_url: "#",
  },
];

/* ================================================================
   PROGRAMS SECTION
   ================================================================ */
export default function ProgramsSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const mounted = useMounted();
  const { content } = useContent();

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [programs, setPrograms] = useState<Program[]>(FALLBACK);
  const [selected, setSelected] = useState<Program | null>(null);

  useEffect(() => {
    const handleData = (data: any) => {
      const extracted = Array.isArray(data) ? data : data?.programs;
      if (extracted && Array.isArray(extracted) && extracted.length > 0) {
        setPrograms(extracted);
        return true;
      }
      return false;
    };

    if (content.programs && handleData(content.programs)) return;

    const fetchPrograms = async () => {
      try {
        const res = await api.get("/content/read/", {
          params: { category: "home", file: "programs.json" },
        });
        handleData(res.data?.content);
      } catch (err) {
        // Fallback already set
      }
    };
    fetchPrograms();
  }, [content.programs]);

  useEffect(() => {
    if (!mounted || !titleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [mounted]);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 px-6 bg-background overflow-hidden"
    >
      <div ref={titleRef} className="max-w-7xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="h2 mb-4"
        >
          Our Flagship Programs
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="p max-w-2xl mx-auto text-muted-foreground"
        >
          Discover opportunities to innovate, learn and grow at IIT Jammu.
        </motion.p>
      </div>

      <InfiniteCardScroller
        items={programs}
        onCardClick={setSelected}
        isDark={isDark}
      />

      <AnimatePresence>
        {selected && (
          <ProgramPopup
            program={selected}
            isDark={isDark}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ================================================================
   INFINITE CARD SCROLLER
   ================================================================ */
interface ScrollerProps {
  items: Program[];
  onCardClick: (p: Program) => void;
  isDark: boolean;
}

function InfiniteCardScroller({ items, onCardClick, isDark }: ScrollerProps) {
  if (items.length === 0) return null;

  return (
    <div className="relative z-10 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
      <div
        className="flex w-max gap-8 py-8 animate-scroll hover:[animation-play-state:paused]"
        style={
          {
            "--animation-duration": "60s",
            "--animation-direction": "forwards",
          } as React.CSSProperties
        }
      >
        {[...items, ...items].map((program, idx) => (
          <div key={`program-${program.id}-${idx}`} className="flex-shrink-0">
            <ProgramCard
              program={program}
              isDark={isDark}
              onViewClick={() => onCardClick(program)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   SINGLE PROGRAM CARD
   ================================================================ */
function ProgramCard({ 
  program, 
  isDark, 
  onViewClick 
}: { 
  program: Program; 
  isDark: boolean; 
  onViewClick: () => void 
}) {
  return (
    <div className="w-[300px] md:w-[350px]">
      <SpotlightCard
        className="h-[430px] p-0 flex flex-col group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 shadow-md hover:shadow-xl transition-all duration-500 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md"
        spotlightColor={isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)"}
      >
        {/* image area */}
        <div className="relative w-full h-52 shrink-0 overflow-hidden bg-gray-100 dark:bg-slate-800/80" onClick={onViewClick}>
          <img
            src={resolveImage(program.image)}
            alt={program.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* content area */}
        <div className="relative p-7 flex flex-col flex-1 overflow-hidden" onClick={onViewClick}>
          <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? "text-white" : "text-gray-900 group-hover:text-indigo-600"
          }`}>
            {program.title}
          </h3>
          <p className="text-sm line-clamp-3 text-muted-foreground mb-6 leading-relaxed">
            {program.short_description}
          </p>

          {/* Know More link (hover only) */}
          <div className={`mt-auto flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 ${program.apply_url ? 'group-hover:-translate-y-8' : 'group-hover:translate-y-0'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onViewClick(); }}
              className="text-xs font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-2 group/btn"
            >
              Know More <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </button>
            
            <div className="h-8 w-8 rounded-full border border-indigo-500/20 flex items-center justify-center transition-all group-hover:bg-indigo-500/10 text-indigo-500 group-hover:scale-110">
              <Plus size={16} />
            </div>
          </div>

          {/* Apply Now button — slides up on hover */}
          {program.apply_url && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none group-hover:pointer-events-auto z-10">
              <a 
                href={program.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/30"
              >
                Apply Now <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}

/* ================================================================
   POPUP MODAL
   ================================================================ */
function ProgramPopup({ program, isDark, onClose }: { program: Program; isDark: boolean; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden glass-soft border border-white/10
          ${isDark ? "bg-slate-900/40 shadow-2xl shadow-black/50" : "bg-white/40 shadow-xl shadow-indigo-500/10"}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[70] h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all shadow-lg"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto flex-1 w-full custom-scrollbar">
          <div className="relative w-full h-[300px] sm:h-[450px] shrink-0 bg-white/10 dark:bg-slate-900/50">
            <img
              src={resolveImage(program.image)}
              alt={program.title}
              className="w-full h-full object-contain p-4 sm:p-8"
            />
          </div>

          <div className="p-8 sm:p-10">
            <h3 className={`text-2xl sm:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              {program.title}
            </h3>
            <p className={`text-base sm:text-lg leading-relaxed mb-10 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {program.description}
            </p>

            <footer className="flex flex-col sm:flex-row gap-6 items-center justify-center border-t border-white/10 pt-8 mt-4">
              {program.apply_url && (
                <a
                  href={program.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 px-16 py-4 rounded-full font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-xl shadow-indigo-500/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative">Apply Now</span>
                  <ExternalLink size={20} className="relative transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-indigo-400 opacity-20 animate-pulse" />
                </a>
              )}
              <button onClick={onClose} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2">
                Cancel & Return
              </button>
            </footer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
