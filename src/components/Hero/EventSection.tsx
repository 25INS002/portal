"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMounted } from "@/hooks/useMounted";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Calendar } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    if (!mounted || !cardsRef.current || loading) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".event-card");

      if (cards && cards.length > 0) {
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
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted, loading, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/list/");
      const allEvents = Array.isArray(res.data) ? res.data : [];

      // Filter for upcoming events
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = allEvents.filter((event: Event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });

      // Sort by date (nearest first)
      upcomingEvents.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(upcomingEvents);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error("Failed to load events", {
        description: error?.response?.data?.message || "Please try again later",
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

  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative w-full bg-background overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-24 lg:py-32">
        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className={`
            inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6
            ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"}
          `}>
            Stay Updated
          </span>
          <h2 className="h2">
            Upcoming{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Events
            </span>
          </h2>
        </motion.div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <SpotlightCard
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="event-card p-6 h-full flex flex-col"
                spotlightColor={isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.08)"}
              >
                {/* ICON */}
                <div className="
                    w-14 h-14
                    rounded-2xl
                    bg-gradient-to-br from-blue-500 to-purple-600
                    flex items-center justify-center
                    mb-5
                    shadow-lg
                    text-white
                    transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                  "
                >
                  <Calendar className="w-6 h-6" />
                </div>

                {/* DATE */}
                <p className={`text-sm font-semibold mb-2 ${isDark ? "text-cyan-400" : "text-blue-600"}`}>
                  {formatDate(event.date)}
                </p>

                {/* TITLE */}
                <h3 className={`text-lg font-bold mb-3 line-clamp-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {event.name}
                </h3>

                {/* DESCRIPTION */}
                <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                  {event.description}
                </p>

                {/* Arrow */}
                <div className={`mt-auto flex items-center text-sm font-medium transition-colors ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                  View Details
                  <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
