"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Rocket, Lightbulb, Building2, GraduationCap, Banknote, Globe,
  BookOpen, ClipboardList, Search, CheckCircle2, Shield, Clock,
  Mail, ChevronDown, ChevronUp, ArrowRight, Wrench, Users,
  Target, Award, FileText, IndianRupee, HelpCircle, AlertTriangle,
  Receipt, Scale, Phone, X, Send
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ================================================================
   PIGA PAGE — Pre-Incubation Program
================================================================ */
export default function PigaPage() {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error("Please login first to apply");
      router.push("/auth?action=login");
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      <PigaHero onApply={handleApply} />
      <ObjectivesSection />
      <FacilitiesSection />
      <ProcessSection />
      <IPRSection />
      <FundingSection />
      <DurationSection />
      <FAQSection />

      {/* Application Form Modal */}
      <AnimatePresence>
        {showForm && <PigaApplicationForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------
   HERO SECTION
---------------------------------------------------------------- */
const PigaHero = ({ onApply }: { onApply: () => void }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleMyStatus = () => {
    if (!isAuthenticated) {
      toast.error("Please login first to view your status");
      router.push("/auth?action=login");
      return;
    }
    router.push("/pages/user/history");
  };

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    if (!mounted) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".piga-hero-content > *",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }
      );
    }, heroRef);
    return () => ctx.revert();
  }, [mounted]);

  return (
  <section
  ref={heroRef}
  className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black"
>
  {/* Background */}
  <div className="absolute inset-0 
    bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 
    dark:bg-gradient-to-br dark:from-black dark:via-[#050505] dark:to-black" 
  />

  {/* Floating Orbs */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {mounted && [...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-3xl 
          bg-indigo-400/20 dark:bg-indigo-500/20"
        style={{
          width: `${200 + i * 60}px`,
          height: `${200 + i * 60}px`,
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 12 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>

  {/* Grid */}
  <div
    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}
  />

  <div className="piga-hero-content relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
    
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 
      text-gray-900 dark:text-white">
      Pre-Incubation{" "}
      <span className="bg-gradient-to-r 
        from-indigo-500 via-purple-500 to-pink-500 
        dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400
        bg-clip-text text-transparent">
        Program
      </span>
    </h1>

    {/* Tagline */}
    <p className="text-xl sm:text-2xl md:text-3xl font-light mb-6 
      text-indigo-600 dark:text-indigo-300">
      Think. Build. Grow.
    </p>

    {/* Description */}
    <p className="max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-10 
      text-gray-600 dark:text-gray-400">
      Empowering innovators to transform ideas into impactful technologies and startups through mentorship, funding, and world-class infrastructure.
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onApply}
        className="px-8 py-4 rounded-full font-semibold 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          dark:from-indigo-500 dark:to-purple-500
          text-white 
          shadow-lg dark:shadow-[0_0_40px_rgba(99,102,241,0.25)]
          hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        Apply Now <ArrowRight className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleMyStatus}
        className="px-8 py-4 rounded-full font-semibold 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          dark:from-indigo-500 dark:to-purple-500
          text-white 
          shadow-lg dark:shadow-[0_0_40px_rgba(99,102,241,0.25)]
          hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        My Status <ArrowRight className="w-4 h-4" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          document
            .getElementById("goals")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="px-8 py-4 rounded-full font-semibold border transition-all duration-300
          border-gray-300 text-gray-900 hover:bg-gray-50
          dark:border-white/10 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/30"
      >
       Brochure
       
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          document
            .getElementById("goals")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="px-8 py-4 rounded-full font-semibold border transition-all duration-300
          border-gray-300 text-gray-900 hover:bg-gray-50
          dark:border-white/10 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/30"
      >
       Learn More
       
      </motion.button>
    </div>
  </div>

  {/* Scroll Indicator */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.5 }}
    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center 
      text-gray-400 dark:text-gray-500"
  >
    <span className="text-[10px] tracking-widest uppercase mb-2">Scroll</span>
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="w-5 h-8 border rounded-full flex justify-center 
        border-gray-300 dark:border-white/20"
    >
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-1 h-2 rounded-full mt-1.5 
          bg-gray-400 dark:bg-gray-400"
      />
    </motion.div>
  </motion.div>
</section>
  )
}



/* ----------------------------------------------------------------
   OBJECTIVES
---------------------------------------------------------------- */
const objectives = [
  { icon: Lightbulb, text: "Encourage innovative ideas from within and outside IIT Jammu", gradient: "from-amber-400 to-orange-500" },
  { icon: Target, text: "Convert research into impactful and socially beneficial solutions", gradient: "from-cyan-400 to-blue-500" },
  { icon: Rocket, text: "Promote entrepreneurship and technology transfer", gradient: "from-pink-500 to-rose-600" },
  { icon: Users, text: "Support startups through structured mentorship and funding", gradient: "from-emerald-400 to-green-600" },
];

const ObjectivesSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background  " id="goals">
      <div className="max-w-6xl mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-600"}`}>
            Goals
          </span>
          <h2 className="h2">
            Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Objectives</span>
          </h2>
        </motion.div>

        <div ref={cardsRef} className="grid sm:grid-cols-2 gap-6">
          {objectives.map((obj, i) => {
            const Icon = obj.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard className="p-8 flex items-start gap-5 h-full">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${obj.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className={`text-base sm:text-lg font-medium leading-relaxed ${isDark ? "text-slate-200" : "text-gray-800"}`}>
                    {obj.text}
                  </p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   FACILITIES & SUPPORT
---------------------------------------------------------------- */
const facilities = [
  { icon: Wrench, title: "Prototyping Support", desc: "Access to Tinkerer's Lab, Protospace, and workshops for design and fabrication.", gradient: "from-orange-500 to-red-500" },
  { icon: Building2, title: "Infrastructure Access", desc: "Shared workspaces, internet, and administrative support.", gradient: "from-blue-500 to-indigo-600" },
  { icon: GraduationCap, title: "Mentorship & Evaluation", desc: "Guidance from faculty, industry experts, and entrepreneurs.", gradient: "from-purple-500 to-pink-600" },
  { icon: Banknote, title: "Funding Assistance", desc: "Up to ₹3 lakh for prototype and proof-of-concept development.", gradient: "from-emerald-500 to-green-600" },
  { icon: Globe, title: "Networking Opportunities", desc: "Connections with I3C, venture capitalists, and industry leaders.", gradient: "from-cyan-500 to-blue-500" },
  { icon: BookOpen, title: "Skill Development", desc: "Workshops on Lean Startup, Design Thinking, Business Models, and Pitching.", gradient: "from-amber-500 to-orange-600" },
];

const FacilitiesSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
            Support
          </span>
          <h2 className="h2">
            What We{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Offer</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, i) => {
            const Icon = fac.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <SpotlightCard className="p-8 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fac.gradient} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {fac.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                    {fac.desc}
                  </p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   PRE-INCUBATION PROCESS (Tabbed: Who Can Apply / How to Apply / Selection / After Selection)
---------------------------------------------------------------- */
const ProcessSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  const tabs = [
    {
      label: "Who Can Apply",
      icon: Users,
      gradient: "from-indigo-500 to-blue-600",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Eligibility</h4>
            <ul className={`space-y-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Students, faculty, or staff of IIT Jammu
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                External applicants (must include at least 1 IIT Jammu student + 1 faculty)
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Requirements</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Technical feasibility", "Innovation potential", "Startup mindset", "Societal/industrial relevance", "Clear milestones and development plan"].map((req, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                  <Target className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "How to Apply",
      icon: FileText,
      gradient: "from-purple-500 to-pink-600",
      content: (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-indigo-50 border-indigo-100"}`}>
            <h4 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Submit Proposal via SARAL Portal or I2EDC Website
            </h4>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>Your proposal should include:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Concept summary", "Objectives", "Budget", "Expected outcomes"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <Mail className="w-5 h-5 text-indigo-500" />
              <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>i2edc@iitjammu.ac.in</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Selection",
      icon: Search,
      gradient: "from-cyan-500 to-teal-600",
      content: (
        <div className="space-y-4">
          {[
            { icon: Search, text: "Evaluated by Internal Project Committee" },
            { icon: Scale, text: "Based on feasibility and impact" },
            { icon: Clock, text: "Results shared within a few days" },
          ].map((step, i) => {
            const SIcon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-4 p-5 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <SIcon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-base font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{step.text}</span>
              </motion.div>
            );
          })}
        </div>
      ),
    },
    {
      label: "After Selection",
      icon: Award,
      gradient: "from-green-500 to-emerald-600",
      content: (
        <div className="space-y-4">
          <h4 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Project Benefits</h4>
          {[
            "Official project registration",
            "Access to labs and facilities",
            "Mentorship support",
            "Regular progress evaluation",
            "Opportunity to move to I3C incubation",
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{benefit}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
            Process
          </span>
          <h2 className="h2">
            Pre-Incubation{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Process</span>
          </h2>
        </motion.div>

        {/* Tab Navigation */}
        <div className={`flex flex-wrap justify-center gap-2 mb-10 p-1.5 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
          {tabs.map((tab, i) => {
            const TIcon = tab.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === i
                    ? "text-white shadow-lg"
                    : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {activeTab === i && (
                  <motion.div
                    layoutId="processTab"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient} shadow-lg`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SpotlightCard className="p-8 sm:p-10">
              <h3 className={`text-2xl font-bold mb-6 bg-gradient-to-r ${tabs[activeTab].gradient} bg-clip-text text-transparent`}>
                {tabs[activeTab].label}
              </h3>
              {tabs[activeTab].content}
            </SpotlightCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   IPR SECTION
---------------------------------------------------------------- */
const IPRSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  const iprPoints = [
    { icon: Shield, text: "IP is shared between inventors and IIT Jammu" },
    { icon: Scale, text: "Governed by IIT Jammu IPR policy" },
    { icon: Rocket, text: "Supports commercialization pathways" },
  ];

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
            Legal
          </span>
          <h2 className="h2">
            Intellectual Property{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">(IPR)</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {iprPoints.map((point, i) => {
            const PIcon = point.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard className="p-8 text-center h-full flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-5">
                    <PIcon className="w-7 h-7 text-white" />
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    {point.text}
                  </p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   FUNDING DETAILS
---------------------------------------------------------------- */
const FundingSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-100 text-green-600"}`}>
            Funding
          </span>
          <h2 className="h2">
            Funding{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Details</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Main funding card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard className="p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <IndianRupee className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₹3,00,000</h3>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>For prototype development</p>
                </div>
              </div>

              <p className={`text-sm mb-6 px-4 py-3 rounded-xl ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                ⚠️ No direct cash — reimbursement-based only
              </p>

              <h4 className={`text-base font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Allowed Usage</h4>
              <ul className="space-y-2">
                {["Materials and components", "Lab/testing services", "Travel (approved cases)"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </motion.div>

          {/* Additional allocations */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₹50,000</h4>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>Entrepreneurship training</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₹50,000</h4>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>Branding, travel, customer discovery</p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   DURATION
---------------------------------------------------------------- */
const DurationSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section className="relative py-16 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SpotlightCard className="p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Pre-Incubation Duration
            </h3>
            <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-3">
              6–12 Months
            </p>
            <p className={`text-base ${isDark ? "text-slate-400" : "text-gray-600"}`}>
              Based on project progress and evaluation
            </p>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   FAQ SECTION
---------------------------------------------------------------- */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: any;
  gradient: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: "General",
    icon: HelpCircle,
    gradient: "from-indigo-500 to-blue-600",
    items: [
      { question: "Is there any application fee?", answer: "No." },
      { question: "Is personal funding required?", answer: "No." },
      { question: "Can external collaboration be included?", answer: "Yes (with approval)." },
    ],
  },
  {
    title: "Program",
    icon: Rocket,
    gradient: "from-purple-500 to-pink-600",
    items: [
      { question: "What is the duration?", answer: "6–12 months." },
      { question: "What happens after completion?", answer: "Eligible projects move to I3C incubation (TRL 4+)." },
    ],
  },
  {
    title: "Funding & Expenses",
    icon: Banknote,
    gradient: "from-green-500 to-emerald-600",
    items: [
      { question: "What is reimbursable?", answer: "Prototype components, fabrication/testing, and approved travel." },
      { question: "What is NOT allowed?", answer: "Hiring interns, general tools, courses/certifications, and events (without approval)." },
    ],
  },
  {
    title: "Reimbursement",
    icon: Receipt,
    gradient: "from-cyan-500 to-teal-600",
    items: [
      { question: "How does the reimbursement process work?", answer: "Submit invoice + payment proof via email to i2edc@iitjammu.ac.in. Must match approved budget." },
      { question: "What are the invoice requirements?", answer: "Invoice label, seller details + GST/PAN, buyer details, unique invoice number, item description + cost, and payment details." },
    ],
  },
  {
    title: "Important Rules",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-600",
    items: [
      { question: "Do I need prior approval before spending?", answer: "Yes, prior approval is required before spending." },
      { question: "Are budget limits strict?", answer: "Yes, budget limits are strictly followed." },
      { question: "Is accommodation provided?", answer: "No accommodation is provided." },
    ],
  },
];

const FAQSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openCategory, setOpenCategory] = useState(0);
  const [openItem, setOpenItem] = useState<string | null>(null);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 ${isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-100 text-rose-600"}`}>
            Help
          </span>
          <h2 className="h2">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {faqData.map((cat, i) => {
            const CIcon = cat.icon;
            return (
              <button
                key={i}
                onClick={() => { setOpenCategory(i); setOpenItem(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  openCategory === i
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                    : isDark
                      ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      : "bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <CIcon className="w-4 h-4" />
                {cat.title}
              </button>
            );
          })}
        </div>

        {/* FAQ items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={openCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {faqData[openCategory].items.map((item, i) => {
              const isOpen = openItem === `${openCategory}-${i}`;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <SpotlightCard
                    className="overflow-hidden cursor-pointer"
                    onClick={() => setOpenItem(isOpen ? null : `${openCategory}-${i}`)}
                    disableAnimations
                  >
                    <div className="p-5 flex items-center justify-between">
                      <span className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className={`px-5 pb-5 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------
   PIGA APPLICATION FORM MODAL
---------------------------------------------------------------- */
interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "textarea";
  placeholder: string;
  helper?: string;
  required?: boolean;
  rows?: number;
}

const basicFields: FormField[] = [
  { id: "project_title", label: "Project Title", type: "text", placeholder: "Enter your project title", required: true },
  { id: "date", label: "Date", type: "date", placeholder: "", required: true },
  { id: "full_name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
  { id: "phone", label: "Phone", type: "tel", placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "organisation", label: "Organisation", type: "text", placeholder: "IIT Jammu / Other", required: true },
];

const pitchSections: FormField[] = [
  {
    id: "elevator_pitch",
    label: "Elevator Pitch",
    type: "textarea",
    placeholder: "Describe your product/process/service and its value proposition...",
    helper: "Describe the product/process/service you are developing and its value proposition in under 50 words.",
    required: true,
    rows: 3,
  },
  {
    id: "team",
    label: "Team",
    type: "textarea",
    placeholder: "Founding team details, advisors, qualifications, key skills...",
    helper: "Provide details of the founding team, advisors/mentors, qualifications, experience, key skills, and commitment (part-time/full-time).",
    required: true,
    rows: 4,
  },
  {
    id: "problem_opportunity",
    label: "Problem / Opportunity",
    type: "textarea",
    placeholder: "Existing alternatives, main competitors, limitations, top problems or opportunities...",
    helper: "Identify existing alternatives, main competitors and their limitations. State the top problems or new opportunities identified.",
    required: true,
    rows: 4,
  },
  {
    id: "solution_technology",
    label: "Solution / Technology",
    type: "textarea",
    placeholder: "Top features of your solution that address the listed problems...",
    helper: "List the top features of your solution that address the listed problems.",
    required: true,
    rows: 4,
  },
  {
    id: "current_status",
    label: "Current Status / Stage",
    type: "textarea",
    placeholder: "Idea / Prototype / Product / Revenue-generating...",
    helper: "Indicate whether it is an idea, prototype, product, or revenue-generating stage. Briefly mention the current status of your technology/product.",
    required: true,
    rows: 3,
  },
  {
    id: "unique_value_proposition",
    label: "Unique Value Proposition",
    type: "textarea",
    placeholder: "Key benefits your product/service provides to customers...",
    helper: "Summarize the key benefits your product/service provides to customers.",
    required: true,
    rows: 3,
  },
  {
    id: "cost_budget",
    label: "Cost & Budget Bifurcation",
    type: "textarea",
    placeholder: "Cost of key activities, fixed and variable costs, product development, personnel...",
    helper: "Provide the cost of key activities linked to value propositions, considering fixed and variable costs, product development, customer acquisition, personnel, etc.",
    required: true,
    rows: 4,
  },
  {
    id: "key_metrics",
    label: "Key Metrics & Validation",
    type: "textarea",
    placeholder: "Metrics to validate hypotheses and measure progress...",
    helper: "Describe what metrics will be used to validate hypotheses and measure progress. Mention what has been done to validate assumptions.",
    required: true,
    rows: 4,
  },
  {
    id: "customer_segments",
    label: "Customer Segments & Market Size",
    type: "textarea",
    placeholder: "Target customers, segments based on needs, estimated market size...",
    helper: "Define for whom you are creating value. Segment customers based on needs or behaviors, and estimate the market size.",
    required: true,
    rows: 4,
  },
  {
    id: "twelve_month_plan",
    label: "12-Month Plan",
    type: "textarea",
    placeholder: "Goals and milestones for the next 12 months...",
    helper: "Outline the goals and milestones for the next 12 months.",
    required: true,
    rows: 4,
  },
];

const PigaApplicationForm = ({ onClose }: { onClose: () => void }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    const missing = basicFields.filter(f => f.required && !formData[f.id]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    setCurrentStep(1);
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(0);
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    // Validate all pitch fields
    const missingPitch = pitchSections.filter(f => f.required && !formData[f.id]?.trim());
    if (missingPitch.length > 0) {
      toast.error(`Please fill: ${missingPitch.map(f => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/piga/submit/", formData);
      toast.success("Application submitted successfully! 🎉");
      onClose();
    } catch (err: any) {
      console.error("PIGA submission error:", err);
      const msg = err.response?.data?.error 
        || err.response?.data?.detail 
        || (typeof err.response?.data === "object" ? Object.values(err.response.data).flat().join(", ") : "")
        || "Failed to submit application";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPitchFields = pitchSections.length;
  const filledPitchFields = pitchSections.filter(f => formData[f.id]?.trim()).length;
  const progress = currentStep === 0 ? 0 : Math.round((filledPitchFields / totalPitchFields) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark
            ? "bg-slate-900 border-white/10 shadow-indigo-500/10"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div className={`flex-shrink-0 px-6 sm:px-8 py-5 border-b flex items-center justify-between ${
          isDark ? "border-white/10" : "border-gray-200"
        }`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {currentStep === 0 ? "Applicant Details" : "Pitch Template"}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              {currentStep === 0
                ? "Pre-Incubation Grant Application"
                : `${filledPitchFields}/${totalPitchFields} sections completed`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? "hover:bg-white/10 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar (step 1 only) */}
        {currentStep === 1 && (
          <div className={`flex-shrink-0 h-1 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        )}

        {/* Scrollable content */}
        <div ref={formRef} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          {/* Info banner */}
          {currentStep === 1 && (
            <div className={`mb-6 p-4 rounded-xl text-sm leading-relaxed ${
              isDark
                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
            }`}>
              <strong>Note:</strong> Keep your messages short and clear. Avoid confidential information but provide enough non-confidential details to describe your idea.
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 0 ? (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {basicFields.map((field, i) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-gray-800"}`}>
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none border ${
                        isDark
                          ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/30"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {pitchSections.map((field, i) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={`p-5 rounded-2xl border transition-colors ${
                      isDark
                        ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                        : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <label className={`block text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.helper && (
                      <p className={`text-xs mb-3 leading-relaxed ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                        {field.helper}
                      </p>
                    )}
                    <textarea
                      rows={field.rows || 3}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 outline-none border ${
                        isDark
                          ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/30"
                          : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 px-6 sm:px-8 py-4 border-t flex items-center justify-between ${
          isDark ? "border-white/10 bg-slate-900/80" : "border-gray-200 bg-gray-50/80"
        } backdrop-blur-sm`}>
          {currentStep === 0 ? (
            <>
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all flex items-center gap-2"
              >
                Next: Pitch Details <ArrowRight className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Submit Application <Send className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
