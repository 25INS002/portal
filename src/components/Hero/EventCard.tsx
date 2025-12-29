"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface EventCardProps {
  name: string;
  date: string;
  duration: string;
  description: string;
  media?: string | null;
}

export default function EventCard({
  name,
  date,
  duration,
  description,
  media,
}: EventCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isImage =
    media &&
    (media.endsWith(".jpg") ||
      media.endsWith(".jpeg") ||
      media.endsWith(".png") ||
      media.endsWith(".gif"));

  const isVideo = media && media.endsWith(".mp4");

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={`
          h-full
          rounded-2xl
          overflow-hidden
          border
          backdrop-blur-xl
          transition-all
          duration-500
          ${
            isDark
              ? `
                bg-white/[0.06]
                border-white/[0.12]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                hover:bg-white/[0.09]
                hover:border-white/[0.18]
              `
              : `
                bg-white/[0.75]
                border-black/[0.08]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]
                hover:bg-white/[0.9]
                hover:border-black/[0.12]
              `
          }
        `}
      >
        {/* MEDIA */}
        {(isImage || isVideo) && (
          <div className="relative w-full h-56 overflow-hidden">
            {isImage && (
              <Image
                src={media!}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            )}

            {isVideo && (
              <video
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              >
                <source src={media!} type="video/mp4" />
              </video>
            )}

            {/* GLASS OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
          </div>
        )}

        {/* CONTENT */}
        <CardHeader className="pb-2">
          <CardTitle
            className={`text-lg md:text-xl font-semibold leading-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {name}
          </CardTitle>

          <p className="text-xs text-muted-foreground mt-1">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {new Date(duration).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </CardHeader>

        <CardContent>
          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-slate-300" : "text-gray-700"
            }`}
          >
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
