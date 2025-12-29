"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  reg_end_date: string;
  location: string;
};

export default function EventsSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/list/");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error("Failed to load events", {
        description: err?.response?.data?.message || "Please try again later",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleEventClick = (id: number) => {
    router.push(`/pages/events/${id}`);
  };

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* HISTORY → EVENTS TRANSITION */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-b from-background to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 pt-32 pb-28">
        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="h2 text-center mb-16"
        >
          Upcoming{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Events
          </span>
        </motion.h2>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading events…
          </p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No events available right now. Check back later!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                onClick={() => handleEventClick(event.id)}
                className="
                  glass
                  glass-hover
                  p-6
                  cursor-pointer
                  group
                "
              >
                {/* ICON */}
                <div
                  className="
                    w-11 h-11
                    rounded-lg
                    bg-gradient-to-r from-blue-500 to-purple-500
                    flex items-center justify-center
                    mb-4
                    group-hover:scale-110
                    transition-transform
                  "
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10m-12 6h14m-14 4h14"
                    />
                  </svg>
                </div>

                {/* DATE */}
                <p className="text-sm font-semibold text-blue-500 dark:text-cyan-400 mb-1">
                  {formatDate(event.date)}
                </p>

                {/* TITLE */}
                <h3 className="h4 mb-2 line-clamp-1">
                  {event.name}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {event.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
