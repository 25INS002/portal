"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { useState, useMemo } from "react";
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

const PrototypesHeroSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const { content } = useContent();

  const heroContent = content?.all_prototypes?.hero || {};
  const title = heroContent.title || ["Student", "Prototypes"];
  const subtitle =
    heroContent.subtitle ||
    "Explore innovative prototypes developed by our student community.";
  const cta = heroContent.cta || {};

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
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
              <p
                className={`
                  uppercase tracking-widest text-xs mb-6
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                Innovation Showcase · I2EDC · IIT Jammu
              </p>

              <h1
                className={`
                  text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-8
                  ${isDark ? "text-white" : "text-gray-900"}
                `}
              >
                {title[0]}
                <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {title[1]}
                </span>
              </h1>

              <p
                className={`
                  text-lg md:text-xl mb-10
                  ${isDark ? "text-slate-300" : "text-gray-600"}
                `}
              >
                {subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("projects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
                    px-8 py-4 rounded-full font-semibold
                    bg-black text-white
                    hover:bg-gray-800 transition
                  "
                >
                  {cta.primary?.label || "View Projects"}
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("stats")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`
                    px-8 py-4 rounded-full font-semibold border transition
                    ${
                      isDark
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-gray-300 text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  {cta.secondary?.label || "Our Track Record"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HERO → NEXT SECTION TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
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
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        >
          {featuredContent.heading || "Featured Projects"}
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 text-center">
          {featuredContent.subheading ||
            "Explore groundbreaking prototypes developed by our talented student innovators"}
        </p>

        {/* Search and Filter Bar */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                featuredContent.searchPlaceholder || "Search projects..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap ${selectedCategory === category.id ? 'bg-black hover:bg-gray-800 text-white' : 'border-gray-300 dark:border-gray-600'}`}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrototypes.map((prototype, index) => (
            <motion.div
              key={prototype.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card
                className="glass glass-hover h-full cursor-pointer group"
                onClick={() => openOverlay(prototype)}
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={prototype.images?.[0]}
                    alt={prototype.title || "Project image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        statusColors[prototype.status] || statusColors.planning
                      }
                    >
                      {prototype.status?.replace("-", " ") || "Unknown"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {prototype.title || "Untitled Project"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {prototype.description || "No description available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  {/* Team Members */}
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {prototype.team?.join(", ") || "No team members"}
                    </span>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {prototype.technologies?.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                        <Tag className="w-3 h-3 mr-1" />
                        {tech}
                      </Badge>
                    )) || (
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                        No technologies listed
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {prototype.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(prototype.github, "_blank");
                      }}
                    >
                      <Github className="w-4 h-4 mr-1" />
                      Code
                    </Button>
                  )}
                  {prototype.demo && (
                    <Button
                      size="sm"
                      className="flex-1 bg-black hover:bg-gray-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(prototype.demo, "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Demo
                    </Button>
                  )}
                  {!prototype.demo && !prototype.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-gray-600"
                      disabled
                    >
                      Details Coming Soon
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      openOverlay(prototype);
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPrototypes.length === 0 && prototypes.length > 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground">
              {featuredContent.noResults ||
                "No projects found matching your criteria. Try adjusting your search filters."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Project Detail Overlay */}
      {selectedPrototype && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
            isOverlayOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeOverlay}
        >
          <div
            className={`bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ${
              isOverlayOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
              <button
                onClick={closeOverlay}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12">
                <h2 className="text-3xl font-bold mb-2">
                  {selectedPrototype.title || "Untitled Project"}
                </h2>
                <p className="text-indigo-100 text-lg">
                  {selectedPrototype.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-8">
                {/* Image Gallery */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPrototype.images?.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${selectedPrototype.title || "Project"} - Image ${index + 1}`}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )) || (
                      <div className="col-span-3 text-center py-8">
                        <p className="text-muted-foreground">No images available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-2xl font-bold mb-4 mt-6 border-b pb-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-4 leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          {...props}
                        />
                      ),
                      img: ({ node, ...props }) => (
                        <img className="rounded-lg shadow-lg my-4" {...props} />
                      ),
                    }}
                  >
                    {selectedPrototype.longDescription ||
                      selectedPrototype.long_description ||
                      "No detailed description available."}
                  </ReactMarkdown>
                </div>

                {/* Project Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 glass">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Team Members
                    </h3>
                    <div className="space-y-2">
                      {selectedPrototype.team?.map((member, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-muted-foreground">
                            {member}
                          </span>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">No team members listed</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 glass">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-green-600" />
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrototype.technologies?.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      )) || (
                        <Badge variant="secondary">
                          No technologies listed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                  {selectedPrototype.github && (
                    <Button
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600"
                      onClick={() =>
                        window.open(selectedPrototype.github, "_blank")
                      }
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  )}
                  {selectedPrototype.demo && (
                    <Button
                      className="bg-black hover:bg-gray-800 text-white"
                      onClick={() =>
                        window.open(selectedPrototype.demo, "_blank")
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeOverlay} className="border-gray-300 dark:border-gray-600">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* --------------------------------------------------
   CATEGORIES SECTION
-------------------------------------------------- */

const CategoriesSection = () => {
  const { content } = useContent();

  const categoriesContent = content?.all_prototypes?.categories || {};
  const categories = categoriesContent.cards || [];

  return (
    <section className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {categoriesContent.heading || "Project Categories"}
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Discover projects across various domains and technologies
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass glass-hover p-6 text-left"
            >
              <div
                className={`
                  mb-4
                  inline-flex
                  h-11 w-11
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-r ${category.gradient || "from-indigo-500 to-purple-500"}
                  shadow-lg
                `}
              >
                {category.icon}
              </div>

              <h3 className="text-xl font-bold mb-2">{category.title}</h3>

              <p className="text-sm text-muted-foreground mb-3">
                {category.description}
              </p>

              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {category.count || "0"} projects
              </Badge>
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
  const { content } = useContent();

  const showcaseContent = content?.all_prototypes?.showcase || {};
  const stats = showcaseContent.stats || [];
  const summary = showcaseContent.summary || "";

  return (
    <section id="stats" className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Innovation Showcase
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Our impact and achievements in student innovation
        </p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            {summary}
          </p>
          {showcaseContent.cta && (
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
              <Link href={showcaseContent.cta.href || "#"} className="flex items-center">
                {showcaseContent.cta.label || "View All Projects"}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   GET INVOLVED SECTION
-------------------------------------------------- */

const GetInvolvedSection = () => {
  const { content } = useContent();

  const getInvolvedContent = content?.all_prototypes?.getInvolved || {};
  const steps = getInvolvedContent.steps || [];
  const summary = getInvolvedContent.summary || "";

  return (
    <section className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Get Involved
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Start your innovation journey with I2EDC
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="glass glass-hover p-6 text-left"
            >
              <div className="text-3xl mb-4">{step.icon}</div>
              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                STEP {step.step}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            {summary}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {getInvolvedContent.primaryCta && (
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Link href={getInvolvedContent.primaryCta.href || "#"}>
                  {getInvolvedContent.primaryCta.label || "Start Your Project"}
                </Link>
              </Button>
            )}
            {getInvolvedContent.secondaryCta && (
              <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-600">
                <Link href={getInvolvedContent.secondaryCta.href || "#"}>
                  {getInvolvedContent.secondaryCta.label || "Join as Mentor"}
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};