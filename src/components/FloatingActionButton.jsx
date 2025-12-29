"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, History, X, LogIn, LogOut } from "lucide-react";
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

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push("/pages/user/profile");
  };

  const handleHistoryClick = () => {
    setIsOpen(false);
    router.push("/pages/user/history");
  };

  const handleLoginClick = () => {
    setIsOpen(false);
    router.push("/auth");
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Main Floating Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative">
          {/* Menu Items */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Profile Button */}
                <motion.button
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, y: -90 }}
                  exit={{ scale: 0, opacity: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleProfileClick}
                  className="absolute -top-24 -right-2 w-12 h-12 rounded-full 
                    bg-gradient-to-r from-indigo-500 to-purple-500 
                    flex items-center justify-center 
                    shadow-lg hover:shadow-xl hover:scale-110
                    transition-all duration-200 cursor-pointer
                    border-2 border-white dark:border-gray-800"
                >
                  <User className="w-5 h-5 text-white" />
                </motion.button>

                {/* History Button */}
                <motion.button
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, y: -45 }}
                  exit={{ scale: 0, opacity: 0, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={handleHistoryClick}
                  className="absolute -top-12 -right-2 w-12 h-12 rounded-full 
                    bg-gradient-to-r from-blue-500 to-cyan-500 
                    flex items-center justify-center 
                    shadow-lg hover:shadow-xl hover:scale-110
                    transition-all duration-200 cursor-pointer
                    border-2 border-white dark:border-gray-800"
                >
                  <History className="w-5 h-5 text-white" />
                </motion.button>

                {/* Logout/Login Button */}
                {isAuthenticated ? (
                  <motion.button
                    initial={{ scale: 0, opacity: 0, x: 0 }}
                    animate={{ scale: 1, opacity: 1, x: -90 }}
                    exit={{ scale: 0, opacity: 0, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    onClick={handleLogout}
                    className="absolute -top-2 -left-24 w-12 h-12 rounded-full 
                      bg-gradient-to-r from-red-500 to-pink-500 
                      flex items-center justify-center 
                      shadow-lg hover:shadow-xl hover:scale-110
                      transition-all duration-200 cursor-pointer
                      border-2 border-white dark:border-gray-800"
                  >
                    <LogOut className="w-5 h-5 text-white" />
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ scale: 0, opacity: 0, x: 0 }}
                    animate={{ scale: 1, opacity: 1, x: -90 }}
                    exit={{ scale: 0, opacity: 0, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    onClick={handleLoginClick}
                    className="absolute -top-2 -left-24 w-12 h-12 rounded-full 
                      bg-gradient-to-r from-green-500 to-emerald-500 
                      flex items-center justify-center 
                      shadow-lg hover:shadow-xl hover:scale-110
                      transition-all duration-200 cursor-pointer
                      border-2 border-white dark:border-gray-800"
                  >
                    <LogIn className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Main Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full 
              bg-gradient-to-r from-indigo-600 to-purple-600
              flex items-center justify-center 
              shadow-2xl hover:shadow-3xl
              transition-all duration-300 cursor-pointer
              border-2 border-white/30 dark:border-gray-700"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </motion.div>

            {/* User Initial Badge */}
            {isAuthenticated && user?.username && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                  bg-gradient-to-r from-green-500 to-emerald-500 
                  flex items-center justify-center 
                  border border-white dark:border-gray-800"
              >
                <span className="text-[10px] font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.button>

          {/* Pulse Animation */}
          {isAuthenticated && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Backdrop */}
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