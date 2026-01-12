"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Icon } from "leaflet";
import api from "@/lib/api";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";

import { MapPin, Mail, Phone, Clock, Send, CheckCircle, ArrowRight, MessageSquare, User, FileText } from "lucide-react";
import SectionDivider from "../SectionDivider";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactPage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <ContactHeroSection />
      <SectionDivider />
      <ContactFormSection />
      <SectionDivider />
      <ContactInfoSection />
    </div>
  );
}

/* --------------------------------------------------
   HERO SECTION — CONTACT
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
      })
      .from(".hero-subtext", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5");
    }, heroRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={heroRef} className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${
            isDark 
            ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background"
            : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background"
        }`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="overflow-hidden mb-2">
                <p className="hero-text-reveal text-sm md:text-base font-bold tracking-[0.2em] text-indigo-500 uppercase mb-6">
                    Get In Touch · I2EDC
                </p>
            </div>
            
            <div className="overflow-hidden mb-6">
                 <h1 className="hero-text-reveal text-6xl md:text-8xl font-black tracking-tight text-foreground">
                    Contact <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Us</span>
                </h1>
            </div>

            <p className="hero-subtext text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We'd love to hear from you! Reach out for inquiries, feedback, or collaborations. Our team is here to help bring your innovative ideas to life.
            </p>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   CONTACT FORM SECTION
-------------------------------------------------- */

const ContactFormSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/query/contact/submit/", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form submission failed:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="form" className="relative py-24 px-6 bg-background flex justify-center">
        <div className="max-w-5xl w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-secondary/5 border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 md:p-14 backdrop-blur-md shadow-2xl overflow-hidden"
            >
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
                        <Send className="w-7 h-7" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Send us a Message</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have a project in mind or just want to say hi? Fill out the form below and we'll get back to you shortly.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                    <User className="w-4 h-4" />
                                </div>
                                Your Name
                            </label>
                            <Input
                                placeholder="Enter your full name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-base px-5"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                Email Address
                            </label>
                            <Input
                                placeholder="Enter your email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all duration-300 text-base px-5"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            Subject
                        </label>
                        <Input
                            placeholder="What is this regarding?"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className="h-14 rounded-2xl bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-base px-5"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            Message
                        </label>
                        <Textarea
                            placeholder="Tell us about your inquiry, project idea, or collaboration proposal..."
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            className="min-h-[180px] rounded-2xl bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 text-base p-5 resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Sending Message...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Send Message</span>
                                <Send className="w-5 h-5" />
                            </div>
                        )}
                    </Button>

                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-3 text-center"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <p className="font-semibold">Message sent! We'll get back to you soon.</p>
                        </motion.div>
                    )}
                </form>
            </motion.div>
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
        className: "", // important: avoid default styles
        html: `<div class="leaflet-glow-marker"></div>`, // Ensure you have css for this or use default
        iconSize: [22, 22],
        iconAnchor: [11, 11], // center
        popupAnchor: [0, -12],
      });

      setGlowIcon(icon);
    })();
  }, []);

  const position: [number, number] = [32.801135, 74.890469];
  const contactInfo = [
    {
      title: "Address",
      value: "I2EDC Office, Academic Block\nIndian Institute of Technology Jammu\nJagti, NH-44, Jammu & Kashmir – 181221",
      icon: <MapPin className="w-6 h-6" />,
      color: "rgba(239, 68, 68, 0.2)",
      gradient: "from-red-500 to-orange-500",
      iconColor: "text-red-100",
    },
    {
      title: "Email",
      value: "i2edc@iitjammu.ac.in",
      icon: <Mail className="w-6 h-6" />,
      color: "rgba(59, 130, 246, 0.2)",
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-100",
    },
    {
      title: "Phone",
      value: "+91 123 456 7890",
      icon: <Phone className="w-6 h-6" />,
      color: "rgba(34, 197, 94, 0.2)",
      gradient: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-100",
    },
    {
      title: "Office Hours",
      value: "Monday – Friday\n9:00 AM – 5:00 PM",
      icon: <Clock className="w-6 h-6" />,
      color: "rgba(168, 85, 247, 0.2)",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-100",
    },
  ];
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <SpotlightCard className="h-full p-1" spotlightColor={item.color}>
                  <div className="relative h-full bg-background/50 rounded-[0.9rem] p-6 flex flex-col items-center text-center overflow-hidden group">
                    {/* Hover Glow Background */}
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className={`
                        w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} 
                        flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300
                    `}>
                        <div className={`${item.iconColor}`}>
                            {item.icon}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm">
                      {item.value}
                    </p>
                  </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Map Container */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl h-[500px] w-full relative z-0"
        >
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full z-0"
          >
            <TileLayer attribution={attribution} url={tileUrl} />
            {glowIcon && (
              <Marker position={position} icon={glowIcon}>
                <Popup className="custom-popup">
                    <div className="p-2 text-center">
                        <strong className="text-indigo-600 block mb-1">I2EDC Office</strong>
                        <span className="text-xs text-gray-600">IIT Jammu Campus</span>
                    </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </motion.div>

      </div>
    </section>
  );
}
