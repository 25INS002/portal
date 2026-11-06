'use client';
import { Megaphone } from "lucide-react";

export default function LatestUpdatesBar() {
  const updates = [
    "I2EDC Student PIGA and Curiosity Project Applications Open"
  ];

  return (
    <div className="w-full bg-background/90 dark:bg-card/90 backdrop-blur-md border-b border-border text-foreground flex items-center overflow-hidden z-50 relative shadow-sm">
      {/* Pinned Badge */}
      <div className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 font-semibold text-xs md:text-sm tracking-wide z-10 flex-shrink-0 shadow-md">
        <Megaphone className="w-4 h-4 animate-pulse text-amber-300" />
        <span className="uppercase">Latest Updates</span>
      </div>

      {/* Scrolling Ticker */}
      <div className="flex overflow-x-hidden relative w-full whitespace-nowrap py-2">
        <div className="flex space-x-12 animate-marquee items-center text-xs md:text-sm font-medium text-muted-foreground hover:[animation-play-state:paused]">
          {updates.concat(updates).map((update, index) => (
            <a
              key={index}
              href="/flyer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block flex-shrink-0"></span>
              <span>{update}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
