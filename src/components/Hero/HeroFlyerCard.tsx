'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroFlyerCard() {
  return (
    <motion.div
      animate={{
        y: [-8, 8, -8],
        rotate: [-0.5, 0.5, -0.5],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-full flex justify-end"
    >
      <motion.a
        href="/flyer.pdf"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="block w-full max-w-[340px] bg-card/90 backdrop-blur-md text-foreground rounded-2xl shadow-2xl overflow-hidden border border-border text-left cursor-pointer group"
      >
        {/* Flyer Image Preview */}
        <div className="relative w-full h-72 bg-muted overflow-hidden">
          <Image
            src="/flyer.png"
            alt="Turning Ideas Into Reality Flyer"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center z-10">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide">
              Click to view PDF ↗
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 mb-2">
            Latest Updates
          </span>

          <h3 className="text-base font-bold text-foreground group-hover:text-indigo-500 transition-colors">
            Turning Ideas Into Reality
          </h3>
        </div>
      </motion.a>
    </motion.div>
  );
}
