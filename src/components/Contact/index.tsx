"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Icon } from "leaflet";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";
import SectionDivider from "../SectionDivider";

import { MapPin, Mail, Phone, Clock } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactPage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <ContactHeroSection />
      <SectionDivider />
      <ContactInfoSection />
    </div>
  );
}

/* --------------------------------------------------
   HERO SECTION
-------------------------------------------------- */

const ContactHeroSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-text-reveal", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
      }).from(
        ".hero-subtext",
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      );
    }, heroRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden pt-32 pb-20"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background"
              : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="overflow-hidden mb-2">
          <p className="hero-text-reveal text-sm md:text-base font-bold tracking-[0.2em] text-indigo-500 uppercase mb-6">
            Get In Touch · I2EDC
          </p>
        </div>

        <div className="overflow-hidden mb-6">
          <h1 className="hero-text-reveal text-6xl md:text-8xl font-black tracking-tight text-foreground">
            Contact{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
        </div>

        <p className="hero-subtext text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We'd love to hear from you! Reach out for inquiries, feedback, or
          collaborations.
        </p>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   CONTACT INFO SECTION
-------------------------------------------------- */

function ContactInfoSection() {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";

  const [glowIcon, setGlowIcon] = useState<Icon | null>(null);

  useEffect(() => {
    (async () => {
      const L = await import("leaflet");

      const icon = L.divIcon({
        className: "",
        html: `<div class="leaflet-glow-marker"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12],
      });

      setGlowIcon(icon);
    })();
  }, []);

  const position: [number, number] = [32.801135, 74.890469];

  const contactInfo = [
    {
      title: "Address",
      value:
        "I2EDC Office, Academic Block\nIndian Institute of Technology Jammu\nJagti, NH-44, Jammu & Kashmir – 181221",
      icon: <MapPin className="w-6 h-6" />,
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "Email",
      value: "i2edc@iitjammu.ac.in",
      icon: <Mail className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Phone",
      value: "+917259925490",
      icon: <Phone className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Office Hours",
      value: "Monday – Friday\n9:00 AM – 5:00 PM",
      icon: <Clock className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <section id="info" className="relative py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Find Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visit our campus office or reach out through any of the channels below.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contactInfo.map((item, i) => (
            <SpotlightCard key={i} className="p-6 text-center">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 mx-auto text-white`}
              >
                {item.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">{item.title}</h3>

              <p className="text-muted-foreground whitespace-pre-line text-sm">
                {item.value}
              </p>
            </SpotlightCard>
          ))}
        </div>

        {/* Map */}
        <div className="rounded-[2rem] overflow-hidden border border-border h-[500px]">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer url={tileUrl} />
            {glowIcon && (
              <Marker position={position} icon={glowIcon}>
                <Popup>
                  <strong>I2EDC Office</strong>
                  <br />
                  IIT Jammu Campus
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

      </div>
    </section>
  );
}