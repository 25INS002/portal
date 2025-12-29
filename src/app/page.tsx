'use client';

import HeroPage from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden">
      {/* HERO OWNS ITS BACKGROUND */}
      <HeroPage />

      {/* Other sections come AFTER */}
      {/* 
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="h2">Workshops & Labs</h2>
      </section>
      */}
    </main>
  );
}
