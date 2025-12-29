"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";

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

const ServicesSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { content } = useContent();

  const servicesData = content.services?.services ?? [
    {
      title: "3D Printing",
      description:
        "High-precision additive manufacturing for prototypes and production parts",
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Laser Cutting",
      description:
        "Precision laser cutting services for various materials with clean edges",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "CNC Machining",
      description:
        "Computer-controlled machining for high-accuracy parts and components",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Design Consultation",
      description: "Expert guidance to optimize your designs for manufacturing",
      color: "from-green-500 to-emerald-400",
    },
  ];

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* ABOUT → SERVICES TRANSITION */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-b from-background to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 pt-40 pb-32">
        {/* SECTION HEADER */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h2 text-center mb-6"
        >
          Advanced Manufacturing Services
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          viewport={{ once: true }}
          className="p text-center max-w-3xl mx-auto mb-20"
        >
          From prototyping to production, we provide cutting-edge manufacturing
          solutions.
        </motion.p>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="glass glass-hover p-6"
            >
              <div
                className={`
    mb-4
    inline-flex
    h-12 w-12
    items-center justify-center
    rounded-xl
    bg-gradient-to-r ${service.color}
    shadow-lg
  `}
              >
                {service.icon && renderSVG(service.icon)}
              </div>

              <h3 className="h4 mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass p-10 max-w-2xl mx-auto text-center"
        >
          <h3 className="h3 mb-4">Ready to Bring Your Ideas to Life?</h3>
          <p className="text-muted-foreground mb-8">
            Get a free consultation and quote for your project today.
          </p>

          <Link href="/pages/contact#form">
            <motion.button whileHover={{ scale: 1.05 }} className="btn-primary">
              Get a Free Quote
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
