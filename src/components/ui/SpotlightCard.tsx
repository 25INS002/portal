"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  onClick,
  spotlightColor = "rgba(99, 102, 241, 0.25)", // Default indigo
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border transition-colors duration-300
        ${
          isDark
            ? "bg-slate-900/50 border-slate-800"
            : "bg-white border-slate-200"
        }
        ${className}
      `}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      
      <div className="relative h-full text-left">
        {children}
      </div>
      
      {/* Inner border for subtlety */}
      <div 
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ${
          isDark ? "ring-white/10" : "ring-black/5"
        }`} 
      />
    </motion.div>
  );
}
