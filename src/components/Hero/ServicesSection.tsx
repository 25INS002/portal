"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMounted } from "@/hooks/useMounted";
import SpotlightCard from "@/components/ui/SpotlightCard";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

import { Printer, Scissors, Settings, Lightbulb } from "lucide-react";

interface Service {
  title: string;
  description: string;
  color: string;
  Icon: any;
}

const ServicesSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { content } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const servicesData: Service[] = [
    {
      title: "3D Printing",
      description:
        "High-precision additive manufacturing for prototypes and production parts",
      color: "from-blue-500 to-cyan-400",
      Icon: Printer
    },
    {
      title: "Laser Cutting",
      description:
        "Precision laser cutting services for various materials with clean edges",
      color: "from-purple-500 to-pink-500",
      Icon: Scissors
    },
    {
      title: "CNC Machining",
      description:
        "Computer-controlled machining for high-accuracy parts and components",
      color: "from-amber-500 to-orange-500",
      Icon: Settings
    },
    {
      title: "Design Consultation",
      description: "Expert guidance to optimize your designs for manufacturing",
      color: "from-green-500 to-emerald-400",
      Icon: Lightbulb
    },
  ];

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".service-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={sectionRef} className="relative w-full bg-background overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className={`
            inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6
            ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}
          `}>
            Manufacturing Excellence
          </span>
          <h2 className="h2 mb-4">
            Advanced Manufacturing Services
          </h2>
          <p className="p max-w-3xl mx-auto">
            From prototyping to production, we provide cutting-edge manufacturing
            solutions with state-of-the-art equipment and expert guidance.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {servicesData.map((service, index) => (
            <SpotlightCard
              key={index}
              className="service-card p-6 h-full flex flex-col"
              spotlightColor={isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.08)"}
            >
              <div
                className={`
                  mb-5
                  inline-flex
                  h-14 w-14
                  items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br ${service.color}
                  text-white
                  shadow-lg
                  transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                `}
              >
                <service.Icon className="w-7 h-7" />
              </div>

              <h3 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                {service.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                {service.description}
              </p>
            </SpotlightCard>
          ))}
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className={`
            rounded-2xl p-10 max-w-3xl mx-auto text-center border relative overflow-hidden
            ${isDark ? "bg-slate-900/50 border-white/[0.08]" : "bg-white border-slate-200"}
          `}
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <h3 className="h3 mb-4 relative z-10">Ready to Bring Your Ideas to Life?</h3>
          <p className="text-muted-foreground mb-8 relative z-10">
            Get a free consultation and quote for your project today.
          </p>

          <Link href="/pages/contact#form" className="relative z-10">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="
                px-8 py-4 rounded-full font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                hover:from-indigo-500 hover:to-purple-500 
                transition-all duration-300
                shadow-lg shadow-indigo-500/25
              "
            >
              Get a Free Quote
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
