"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundVideo from "../animations/BackgroundVideo/BackgroundVideo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Github,
  Users,
  Tag,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Wrench,
  Rocket,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import SectionDivider from "../SectionDivider";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

export default function PrototypesPage() {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <section className="relative py-32 px-6 bg-background flex justify-center">
        <div className="max-w-7xl w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prototypes...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-32 px-6 bg-background flex justify-center">
        <div className="max-w-7xl w-full text-center">
          <p className="text-lg text-red-600 mb-4">Error loading content</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </section>
    );
  }

  return (
    <div className="relative w-full overflow-x-hidden">
      <PrototypesHeroSection />
      <SectionDivider />
      <FeaturedPrototypesSection />
      <SectionDivider />
      <CategoriesSection />
      <SectionDivider />
      <ShowcaseSection />
      <SectionDivider />
      <GetInvolvedSection />
    </div>
  );
}

/* --------------------------------------------------
   HERO SECTION — PROTOTYPES
-------------------------------------------------- */

/* --------------------------------------------------
   HERO SECTION — PROTOTYPES
-------------------------------------------------- */

const PrototypesHeroSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const { content } = useContent();

  const containerRef = useRef<HTMLDivElement>(null);

  const heroContent = content?.all_prototypes?.hero || {};
  const title = heroContent.title || ["Student", "Prototypes"];
  const subtitle =
    heroContent.subtitle ||
    "Explore innovative prototypes developed by our student community.";
  const cta = heroContent.cta || {};

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-text-reveal", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      })
      .from(".hero-subtext", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      }, "-=0.6")
      .from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden pt-32 md:pt-40">
      {/* 🎥 VIDEO — always rendered (hydration-safe) */}
      <div className="absolute inset-0 z-0">
        <BackgroundVideo videoPath="/Videos/background.mp4" opacity={isDark ? 0.3 : 0.1} />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="overflow-hidden mb-2">
            <p className="hero-text-reveal text-sm md:text-base font-bold tracking-[0.2em] text-indigo-500 uppercase mb-6">
              Innovation Showcase · I2EDC
            </p>
          </div>

          <div className="overflow-hidden">
            <h1 className="hero-text-reveal text-6xl md:text-8xl font-black tracking-tight mb-2 text-foreground">
              {title[0]}
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="hero-text-reveal text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-4">
              {title[1]}
            </h1>
          </div>

          <p className="hero-subtext text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            {subtitle}
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() =>
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="
                px-8 py-4 rounded-full font-bold text-lg
                bg-foreground text-background
                hover:opacity-90 transition-all transform hover:scale-105
                shadow-xl shadow-indigo-500/20
              "
            >
              {cta.primary?.label || "Explore Projects"}
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("stats")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="
                px-8 py-4 rounded-full font-bold text-lg
                border border-input bg-background/50 backdrop-blur-sm
                hover:bg-accent hover:text-accent-foreground
                transition-all
              "
            >
              {cta.secondary?.label || "Our Impact"}
            </button>
          </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   FEATURED PROTOTYPES SECTION
-------------------------------------------------- */

const FeaturedPrototypesSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const { content } = useContent();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrototype, setSelectedPrototype] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Safe data access
  const featuredContent = content?.all_prototypes?.featured || {};
  const prototypes = useMemo(
    () =>
      Array.isArray(featuredContent.prototypes)
        ? featuredContent.prototypes
        : [],
    [featuredContent.prototypes]
  );

  // Use statusMap from content or fallback
  const statusColors = featuredContent.statusMap || {
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "in-progress":
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    planning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };

  // Categories based on actual prototype categories
  const categories = useMemo(() => {
    const allCategories = [
      { id: "all", name: "All Projects", count: prototypes.length },
    ];

    // Extract unique categories from prototypes
    const uniqueCategories = [
      ...new Set(prototypes.map((p) => p?.category).filter(Boolean)),
    ];

    // Create category entries
    const categoryEntries = uniqueCategories.map((category) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: prototypes.filter((p) => p?.category === category).length,
    }));

    return [...allCategories, ...categoryEntries];
  }, [prototypes]);

  // Filtered prototypes with safe access
  const filteredPrototypes = useMemo(
    () =>
      prototypes.filter((prototype) => {
        if (!prototype) return false;

        const matchesSearch =
          prototype.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prototype.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || prototype.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [prototypes, searchTerm, selectedCategory]
  );

  const openOverlay = (prototype) => {
    setSelectedPrototype(prototype);
    setIsOverlayOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    setTimeout(() => setSelectedPrototype(null), 300);
    document.body.style.overflow = "unset";
  };

  // No data state
  if (prototypes.length === 0) {
    return (
      <section id="projects" className="relative py-32 px-6 bg-background flex justify-center">
        <div className="max-w-7xl w-full text-center">
          <p className="text-muted-foreground">
            No projects available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-end justify-between mb-12">
            <div>
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold mb-4"
                >
                    {featuredContent.heading || "Featured Projects"}
                </motion.h2>
                <div className="h-1 w-20 bg-indigo-500 rounded-full" />
            </div>

            {/* Premium Search Bar */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="relative w-full md:w-96 group"
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                    type="text"
                    placeholder="Search prototypes..."
                    className="
                        pl-12 pr-4 py-6 rounded-xl
                        bg-secondary/30 backdrop-blur-sm border-2 border-transparent
                        focus:border-indigo-500/50 focus:bg-secondary/50 focus:ring-0
                        transition-all duration-300
                        text-lg placeholder:text-muted-foreground/50
                    "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>
        </div>

        {/* Premium Tab Switching */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16 overflow-x-auto pb-4 hide-scrollbar"
        >
            <div className="flex gap-2">
                {categories.map((category) => {
                    const isActive = selectedCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`
                                relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                                flex items-center gap-3 whitespace-nowrap
                                ${isActive ? "text-white" : "text-muted-foreground hover:text-foreground"}
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-black dark:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{category.name}</span>
                            <span className={`
                                relative z-10 px-2 py-0.5 rounded-md text-xs font-bold
                                ${isActive ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10 text-muted-foreground"}
                            `}>
                                {category.count}
                            </span>
                        </button>
                    )
                })}
            </div>
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrototypes.map((prototype, index) => (
                <motion.div
                    layout
                    key={prototype.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                <SpotlightCard
                    className="h-full group border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-500 overflow-hidden"
                    spotlightColor="rgba(99, 102, 241, 0.15)"
                    onClick={() => openOverlay(prototype)}
                >
                    {/* Status Badge - Floating */}
                    <div className="absolute top-4 right-4 z-20">
                         <div className={`
                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-xl
                            ${prototype.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              prototype.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                        `}>
                            {prototype.status?.replace("-", " ") || "Unknown"}
                        </div>
                    </div>

                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden rounded-t-xl bg-black/5">
                        <img
                            src={prototype.images?.[0]}
                            alt={prototype.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Content */}
                    <div className="p-8 relative -mt-12 z-10">
                        {/* Title & Desc */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold mb-3 text-foreground leading-tight group-hover:text-indigo-400 transition-colors">
                                {prototype.title || "Untitled"}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                {prototype.description}
                            </p>
                        </div>

                        {/* Authors */}
                        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="p-2 rounded-full bg-background border border-border">
                                <Users className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <span className="block font-semibold text-foreground">Innovators</span>
                                {prototype.team?.slice(0, 2).join(", ") || "Students"}
                                {prototype.team?.length > 2 && ` +${prototype.team.length - 2} more`}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {prototype.technologies?.slice(0, 3).map((tech) => (
                                <span key={tech} className="px-3 py-1.5 rounded-md bg-secondary text-[11px] font-semibold text-secondary-foreground border border-border/50">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Footer Link */}
                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                            <span className="text-sm font-semibold text-indigo-500 group-hover:text-indigo-400 transition-colors">View Details</span>
                            <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </SpotlightCard>
                </motion.div>
            ))}
            </div>
        </AnimatePresence>

        {filteredPrototypes.length === 0 && prototypes.length > 0 && (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>

{/* Modern Overlay - Fixed Scroll Issue */}
      <AnimatePresence>
        {isOverlayOpen && selectedPrototype && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOverlay}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              className="
                relative w-full max-w-5xl bg-background border border-border/50 
                rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto
              "
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Floats over image */}
              <button
                onClick={closeOverlay}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content Area */}
              <div 
                className="overflow-y-auto flex-1 custom-scrollbar w-full"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                
                {/* Hero Image Section */}
                <div className="relative h-64 md:h-96 w-full shrink-0 group">
                    <img
                        src={selectedPrototype.images?.[0]}
                        alt={selectedPrototype.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Gradient Overlay - Always Dark for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                    
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                         <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={`
                                backdrop-blur-md border border-white/20 shadow-lg text-xs font-bold uppercase tracking-wider
                                ${selectedPrototype.status === 'completed' ? 'bg-emerald-500 text-white' : 
                                  selectedPrototype.status === 'in-progress' ? 'bg-blue-500 text-white' : 
                                  'bg-amber-500 text-white'}
                            `}>
                                {selectedPrototype.status?.replace("-", " ") || "Unknown"}
                            </Badge>
                             {selectedPrototype.category && (
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20">
                                    {selectedPrototype.category}
                                </Badge>
                             )}
                         </div>
                         <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-xl">
                            {selectedPrototype.title}
                         </h2>
                    </div>
                </div>

                <div className="p-8 md:p-10 bg-background">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                        
                        {/* Left Column: Description & Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    Project Overview
                                </h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {selectedPrototype.description}
                                </p>
                            </div>

                            {/* Detailed Markdown Content */}
                             <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                        h2: ({ node, ...props }) => <h4 className="text-lg font-bold mt-5 mb-2" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                        li: ({ node, ...props }) => <li className="" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                    }}
                                >
                                    {selectedPrototype.longDescription || 
                                     selectedPrototype.long_description || 
                                     "No further details provided."}
                                </ReactMarkdown>
                            </div>

                            {/* Image Grid (if more than 1 image) */}
                            {selectedPrototype.images?.length > 1 && (
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    {selectedPrototype.images.slice(1).map((img, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                            <img src={img} alt="" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sidebar Meta */}
                        <div className="space-y-6">
                            {/* Team Card */}
                            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    Innovators
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {selectedPrototype.team?.map((member, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">
                                                {member.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{member}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
                                    <Tag className="w-4 h-4 text-emerald-500" />
                                    Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPrototype.technologies?.map((tech, i) => (
                                        <Badge key={i} variant="secondary" className="bg-background hover:bg-background/80 border border-border/50 text-foreground font-normal px-3 py-1">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col gap-3 pt-4">
                                {selectedPrototype.demo && (
                                    <Button className="w-full rounded-xl py-6 font-bold text-base" onClick={() => window.open(selectedPrototype.demo, "_blank")}>
                                        <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                                    </Button>
                                )}
                                {selectedPrototype.github && (
                                    <Button variant="outline" className="w-full rounded-xl py-6 font-semibold" onClick={() => window.open(selectedPrototype.github, "_blank")}>
                                        <Github className="w-4 h-4 mr-2" /> View Source
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

/* --------------------------------------------------
   CATEGORIES SECTION
-------------------------------------------------- */

const CategoriesSection = () => {
  const { content } = useContent();

  const categoriesContent = content?.all_prototypes?.categories || {};
  // Fallback categories if none exist, with fixed colors for visual impact
  const categories = [
    { title: "Healthcare", count: 7, icon: <div className="text-pink-500"><Target /></div>, gradient: "from-pink-500 to-rose-600", spotlight: "rgba(236, 72, 153, 0.25)" },
    { title: "Electronics", count: 3, icon: <div className="text-blue-500"><Zap /></div>, gradient: "from-blue-500 to-indigo-600", spotlight: "rgba(59, 130, 246, 0.25)" },
    { title: "Mechanical Design", count: 4, icon: <div className="text-emerald-500"><Wrench /></div>, gradient: "from-emerald-500 to-green-600", spotlight: "rgba(16, 185, 129, 0.25)" },
    { title: "Safety & Assistive Tech", count: 2, icon: <div className="text-orange-500"><Users /></div>, gradient: "from-orange-500 to-amber-600", spotlight: "rgba(249, 115, 22, 0.25)" },
    { title: "Education & Training", count: 1, icon: <div className="text-purple-500"><Sparkles /></div>, gradient: "from-purple-500 to-violet-600", spotlight: "rgba(168, 85, 247, 0.25)" },
  ];

  return (
    <section className="relative py-32 px-6 bg-black/[0.02] dark:bg-black/[0.2] flex justify-center border-y border-black/5 dark:border-white/5">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {categoriesContent.heading || "Prototype Categories"}
          </motion.h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover projects across various domains and technologies
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <SpotlightCard
                className="p-8 h-full text-left"
                spotlightColor={category.spotlight}
              >
                <div
                  className={`
                    mb-6
                    inline-flex
                    h-14 w-14
                    items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br ${category.gradient}
                    text-white
                    shadow-lg
                  `}
                >
                  {/* Clone element to force white color within the gradient box if needed, or just standard icon */}
                  {React.cloneElement(category.icon as React.ReactElement, { className: "text-white w-7 h-7" })}
                </div>

                <h3 className="text-2xl font-bold mb-2">{category.title}</h3>

                <p className="text-sm text-muted-foreground mb-6">
                  {category.description || "Innovative solutions and prototypes."}
                </p>

                <Badge variant="secondary" className="px-3 py-1 bg-white/10 text-foreground border border-white/10">
                  {category.count || "0"} Projects
                </Badge>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   SHOWCASE SECTION
-------------------------------------------------- */

const ShowcaseSection = () => {
  const stats = [
    { number: "20+", label: "Prototypes Built", color: "text-indigo-500" },
    { number: "50+", label: "Student Innovators", color: "text-blue-500" },
    { number: "10+", label: "Technologies Used", color: "text-purple-500" },
    { number: "5+", label: "Partner Programs", color: "text-emerald-500" },
  ];

  return (
    <section id="stats" className="relative py-32 px-6 bg-black/[0.04] dark:bg-white/[0.02] flex justify-center border-y border-black/5 dark:border-white/5">
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
        >
          Innovation Showcase
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-20">
          Our impact and achievements in student innovation
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`text-5xl md:text-6xl font-black mb-2 ${stat.color}`}>
                {stat.number}
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-foreground transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
           <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
             Through Invention Factory and InventX, IIT Jammu students continue to develop impactful solutions to real-world challenges in healthcare, safety, and sustainability.
           </p>
           <div className="mt-8">
              <Button variant="outline" className="rounded-full px-8 border-gray-300 dark:border-white/20">
                View All Projects <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
           </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   GET INVOLVED SECTION
-------------------------------------------------- */

const GetInvolvedSection = () => {
  return (
    <section className="relative py-32 px-6 bg-background flex justify-center">
       <div className="max-w-7xl w-full">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              Get Involved
            </motion.h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your innovation journey with I2EDC
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Submit Your Idea",
                desc: "Pitch your concept to our innovation cell",
                icon: <Target className="w-6 h-6" />,
                gradient: "from-yellow-400 to-orange-500",
                spotlight: "rgba(245, 158, 11, 0.15)"
              },
              {
                step: "02",
                title: "Collaborate & Design",
                desc: "Form a team and plan your prototype",
                icon: <Users className="w-6 h-6" />,
                gradient: "from-pink-500 to-rose-500",
                spotlight: "rgba(236, 72, 153, 0.15)"
              },
              {
                step: "03",
                title: "Build & Test",
                desc: "Use campus labs to create your working model",
                icon: <Wrench className="w-6 h-6" />,
                gradient: "from-cyan-500 to-blue-500",
                spotlight: "rgba(6, 182, 212, 0.15)"
              },
              {
                step: "04",
                title: "Showcase & Scale",
                desc: "Demonstrate your innovation at InventX or IF",
                icon: <Rocket className="w-6 h-6" />,
                gradient: "from-purple-500 to-indigo-500",
                spotlight: "rgba(99, 102, 241, 0.15)"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="h-full"
              >
                <SpotlightCard
                  className="h-full border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-md"
                  spotlightColor={item.spotlight}
                >
                  <div className="p-8 h-full flex flex-col relative overflow-hidden">
                     {/* Step Number Background */}
                     <div className="absolute -right-4 -top-4 text-[8rem] font-black text-black/5 dark:text-white/5 leading-none select-none">
                       {item.step}
                     </div>

                     <div className="relative z-10">
                        <div className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg
                          bg-gradient-to-br ${item.gradient} text-white
                        `}>
                          {item.icon}
                        </div>
                        
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          Step {item.step}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 dark:text-white text-gray-900 leading-tight">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {item.desc}
                        </p>
                     </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center flex justify-center gap-4">
             <Button size="lg" className="rounded-full px-8 font-bold">Start a Project</Button>
             <Button size="lg" variant="outline" className="rounded-full px-8">Mentor a Team</Button>
          </div>
       </div>
    </section>
  );
};