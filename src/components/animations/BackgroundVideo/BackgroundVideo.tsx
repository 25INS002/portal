"use client";

import { useRef, useEffect } from "react";

interface BackgroundVideoProps {
  videoPath: string;
  opacity?: number;
}

export default function BackgroundVideo({
  videoPath,
  opacity = 0.35,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        style={{
          opacity,
          filter: "brightness(0.7) contrast(1.15) saturate(0.8)",
        }}
      >
        <source src={videoPath} type="video/mp4" />
      </video>
    </div>
  );
}
