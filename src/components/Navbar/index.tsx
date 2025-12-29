"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/pages/about" },
  { label: "Services", href: "/pages/services" },
  { label: "Events", href: "/pages/events" },
  { label: "Prototypes", href: "/pages/prototypes" },
  { label: "Contact", href: "/pages/contact" },
  { label: "Login", href: "/auth?action=login" },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------- FIX: wait for theme ---------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    document.documentElement.classList.add("no-transitions");
    setTheme(isDark ? "light" : "dark");
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.documentElement.classList.remove("no-transitions")
      )
    );
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500
          ${scrolled ? "w-[90%] max-w-6xl" : "w-[92%] max-w-7xl"}
        `}
      >
        <div
          className={`
    relative rounded-full px-4 md:px-6
    border
    backdrop-blur-1xl
    transition-all duration-500
    ${
      isDark
        ? `
          bg-slate-900/40
          border-white/15
          shadow-[0_8px_40px_rgba(0,0,0,0.45)]
        `
        : `
          bg-white/45
          border-white/30
          shadow-[0_8px_40px_rgba(0,0,0,0.12)]
        `
    }
    ${scrolled ? "py-4" : "py-5"}
  `}
        >
          {/* glass highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-30" />

          {/* glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            {/* LOGO */}
            {/* Logo Section - Replace in your Header component */}
            <a href="/" className="flex items-center gap-2 font-bold group">
              {/* Logo Container */}
              <div className="relative">
                {/* Logo with next/image for optimization */}
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                  <Image
                    src="/logo.png"
                    alt="I2EDC Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain p-1"
                    priority
                  />
                </div>

                {/* Logo Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>

              {/* Logo Text */}
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  I2EDC
                </span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  IIT Jammu
                </span>
              </div>
            </a>

            {/* DESKTOP NAV */}
            <div
              className="
    hidden md:flex absolute left-1/2 -translate-x-1/2
    rounded-full px-1 py-1
    backdrop-blur-md border
    bg-white/40 dark:bg-white/5
    border-black/10 dark:border-white/10
  "
            >
              {navItems.map((item) => {
                if (item.label !== "Login")
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="
        px-5 py-2 rounded-full
        text-[11px] uppercase tracking-widest font-semibold
        transition-colors duration-200
        text-gray-800 hover:text-gray-950 hover:bg-black/5
        dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10
      "
                    >
                      {item.label}
                    </a>
                  );
              })}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-6">
              {/* THEME TOGGLE (FIXED CENTERING) */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="
                  w-4 h-4 rounded-full
                  flex items-center justify-center
                  hover:bg-white/10 transition
                "
              >
                <div className="relative w-4 h-4 px-5 mb-2">
                  <Sun
                    className={`absolute inset-0 transition-all duration-500 ${
                      isDark
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    }`}
                  />
                  <Moon
                    className={`absolute inset-0 transition-all duration-500 ${
                      !isDark
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                    }`}
                  />
                </div>
              </button>

              {/* CTA */}
              {!isAuthenticated && (
                <a
                  href="/auth?action=login"
                  className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest
                    bg-primary text-background hover:scale-105 hover:shadow-lg transition"
                >
                  Get Started <ArrowRight className="w-3 h-3" />
                </a>
              )}

              {/* MOBILE TOGGLE */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`
        fixed inset-0 z-40
        flex flex-col items-center justify-center gap-8

        backdrop-blur-2xl
        transition-colors duration-300

        /* 🌞 Light glass */
        bg-white/70 border border-black/10

        /* 🌙 Dark glass */
        dark:bg-slate-900/70 dark:border-white/10

        /* ✨ Glow layer */
        before:content-['']
        before:absolute before:inset-0
        before:bg-gradient-to-b
        before:from-white/10 before:to-transparent
        dark:before:from-white/5
        before:pointer-events-none
      `}
          >
            {navItems.map((item) => {
              if (item.label === "Login" && isAuthenticated) return null;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="
            text-3xl font-bold tracking-tight
            transition-colors duration-200

            text-gray-900 hover:text-primary
            dark:text-white dark:hover:text-primary
          "
                >
                  {item.label}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
