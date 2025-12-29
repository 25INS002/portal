"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  History,
  X,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function FloatingActionButton() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const closeAnd = (fn: () => void) => {
    setIsOpen(false);
    fn();
  };

  const isAdmin = !!(user?.is_superuser || user?.is_staff);

  return (
    <>
      {/* ================= FAB ================= */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative">
          {/* ================= MENU ITEMS ================= */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* PROFILE */}
                <GlassAction
                  y={-165}
                  delay={0}
                  onClick={() =>
                    closeAnd(() => router.push("/pages/user/profile"))
                  }
                >
                  <User className="w-5 h-5" />
                </GlassAction>

                {/* HISTORY */}
                <GlassAction
                  y={-110}
                  delay={0.08}
                  onClick={() =>
                    closeAnd(() => router.push("/pages/user/history"))
                  }
                >
                  <History className="w-5 h-5" />
                </GlassAction>

                {/* ADMIN (ONLY IF STAFF / SUPERUSER) */}
                {isAuthenticated && isAdmin && (
                  <GlassAction
                    y={-55}
                    delay={0.16}
                    onClick={() =>
                      closeAnd(() => router.push("/pages/admin"))
                    }
                  >
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </GlassAction>
                )}

                {/* LOGIN / LOGOUT */}
                {isAuthenticated ? (
                  <GlassAction
                    x={-55}
                    delay={0.24}
                    onClick={() => closeAnd(logout)}
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                  </GlassAction>
                ) : (
                  <GlassAction
                    x={-90}
                    delay={0.24}
                    onClick={() => closeAnd(() => router.push("/auth"))}
                  >
                    <LogIn className="w-5 h-5 text-green-600" />
                  </GlassAction>
                )}
              </>
            )}
          </AnimatePresence>

          {/* ================= MAIN BUTTON ================= */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="
              relative w-14 h-14 rounded-full
              backdrop-blur-xl
              border
              bg-white/40 dark:bg-slate-900/45
              border-black/10 dark:border-white/15
              shadow-[0_8px_30px_rgba(0,0,0,0.25)]
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
              transition-all duration-300
              flex items-center justify-center
            "
          >
            {/* glass highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-40" />

            {/* icon */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </motion.div>

            {/* user initial badge */}
            {isAuthenticated && user?.username && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 -right-1 w-5 h-5 rounded-full
                  backdrop-blur-md
                  bg-white/60 dark:bg-slate-900/60
                  border border-black/10 dark:border-white/15
                  flex items-center justify-center
                "
              >
                <span className="text-[10px] font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.button>

          {/* ================= SOFT GLOW ================= */}
          {isAuthenticated && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full
              bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </motion.div>

      {/* ================= BACKDROP ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ================= REUSABLE GLASS ACTION ================= */

function GlassAction({
  children,
  onClick,
  x = 0,
  y = 0,
  delay = 0,
}: {
  children: React.ReactNode;
  onClick: () => void;
  x?: number;
  y?: number;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x, y }}
      exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      transition={{ duration: 0.25, delay }}
      onClick={onClick}
      className="
        absolute w-12 h-12 rounded-full
        backdrop-blur-xl
        border
        bg-white/45 dark:bg-slate-900/45
        border-black/10 dark:border-white/15
        shadow-lg hover:shadow-xl
        hover:scale-110
        transition-all duration-200
        flex items-center justify-center
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-40" />
      <div className="relative z-10">{children}</div>
    </motion.button>
  );
}
