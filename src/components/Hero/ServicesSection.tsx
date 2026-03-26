"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMounted } from "@/hooks/useMounted";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { X } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Service {
  title: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  image: string;
}

const ServicesSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const servicesData: Service[] = [
    {
      title: "3D Printing",
      shortDesc: "High-precision additive manufacturing for prototypes.",
      fullDesc:
        "Our 3D printing service enables rapid prototyping and complex part production using advanced additive manufacturing technologies.",
      features: [
        "PLA, ABS, PETG and engineering materials",
        "Rapid prototyping and product iteration",
        "Complex geometry manufacturing",
        "High dimensional accuracy"
      ],
      image: "/3d_printing.webp"
    },
    {
      title: "Laser Cutting",
      shortDesc: "Precision laser cutting for multiple materials.",
      fullDesc:
        "Laser cutting provides highly accurate cutting for acrylic, wood, plastics and sheet metals with smooth and clean edges.",
      features: [
        "High precision edge finishing",
        "Works on acrylic, wood, leather and metals",
        "Minimal material wastage",
        "Fast turnaround time"
      ],
      image: "/lazer-cut.webp"
    },
    {
      title: "CNC Machining",
      shortDesc: "High-accuracy machining for engineering components.",
      fullDesc:
        "CNC machining delivers precision components with tight tolerances using computer-controlled milling and turning machines.",
      features: [
        "High precision industrial machining",
        "Aluminum, steel and plastic machining",
        "Tight tolerance manufacturing",
        "Complex mechanical part fabrication"
      ],
      image: "/cnc.webp"
    },
    {
      title: "Design Consultation",
      shortDesc: "Expert support to optimize product designs.",
      fullDesc:
        "Our design consultation helps convert your idea into a manufacturable product with improved efficiency and reduced production cost.",
      features: [
        "Product design optimization",
        "Material selection guidance",
        "Manufacturability analysis",
        "Cost-efficient production planning"
      ],
      image: "/design.webp"
    }
  ];

  // ESC key close
  useEffect(() => {
   
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // GSAP animation
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
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%"
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={sectionRef} className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Advanced Manufacturing Services
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground">
            From prototyping to production, we provide cutting-edge
            manufacturing solutions with expert guidance.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {servicesData.map((service, index) => (
            <SpotlightCard
              key={index}
              className="service-card p-6 flex flex-col group"
              spotlightColor={
                isDark
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(99,102,241,0.08)"
              }
            >
              <div className="relative w-full h-40 rounded-xl overflow-hidden mb-5">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="text-lg font-bold mb-2">{service.title}</h3>

              <p className="text-sm text-muted-foreground mb-4">
                {service.shortDesc}
              </p>

              <button
                onClick={() => setSelectedService(service)}
                className="mt-auto px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                View More
              </button>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-2xl p-6 relative"
            >
              {/* CLOSE BUTTON */}
             <button
  onClick={() => setSelectedService(null)}
  className="
    absolute top-4 right-4 z-20
    flex items-center justify-center
    w-10 h-10
    rounded-full
    bg-white dark:bg-slate-800
    shadow-md
    hover:bg-gray-100 dark:hover:bg-slate-700
    transition
  "
>
  <X size={18} />
</button>

              {/* IMAGE */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
                <Image
                  src={selectedService.image}
                  alt={selectedService.title}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-2xl font-bold mb-3">
                {selectedService.title}
              </h3>

              <p className="text-muted-foreground mb-6">
                {selectedService.fullDesc}
              </p>

              {/* FEATURES */}
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {selectedService.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;