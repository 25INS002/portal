"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Icon } from "leaflet";
import api from "@/lib/api";

import { MapPin, Mail, Phone, Clock, Send, CheckCircle } from "lucide-react";
import SectionDivider from "../SectionDivider";

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

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* 🌈 Gradient background (both themes) */}
      <div
        className={`
          absolute inset-0
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)]"
          }
        `}
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-end">
        <div className="w-full pb-[20vh]">
          <div
            className="
              max-w-7xl
              pl-10
              sm:pl-16
              md:pl-24
              lg:pl-32
              pr-8
            "
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <p
                className={`
                  uppercase tracking-widest text-xs mb-6
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                Get in Touch · I2EDC · IIT Jammu
              </p>

              <h1
                className={`
                  text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-8
                  ${isDark ? "text-white" : "text-gray-900"}
                `}
              >
                Contact
                <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Us
                </span>
              </h1>

              <p
                className={`
                  text-lg md:text-xl mb-10
                  ${isDark ? "text-slate-300" : "text-gray-600"}
                `}
              >
                We'd love to hear from you! Reach out for inquiries, feedback,
                or collaborations. Our team is here to help bring your
                innovative ideas to life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
                    px-8 py-4 rounded-full font-semibold
                    bg-black text-white
                    hover:bg-gray-800 transition
                  "
                >
                  Send Message
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("info")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`
                    px-8 py-4 rounded-full font-semibold border transition
                    ${
                      isDark
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-gray-300 text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  Find Us
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HERO → NEXT SECTION TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
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

  const handleChange = (e) =>
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
    <section
      id="form"
      className="relative py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-3xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        >
          Send Us a Message
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 text-center">
          Have questions or want to collaborate? Fill out the form below and
          we'll get back to you as soon as possible.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Contact Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Name *
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="glass"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email Address *
                    </label>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="glass"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject *
                  </label>
                  <Input
                    placeholder="What is this regarding?"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="glass"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Tell us about your inquiry, project idea, or collaboration proposal..."
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="glass min-h-[160px] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      Thank you! Your message has been sent successfully.
                    </p>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>
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
        html: `<div class="leaflet-glow-marker"></div>`,
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
      value:
        "I2EDC Office, Academic Block\nIndian Institute of Technology Jammu\nJagti, NH-44, Jammu & Kashmir – 181221",
      icon: <MapPin />,
    },
    {
      title: "Email",
      value: "i2edc@iitjammu.ac.in",
      icon: <Mail />,
    },
    {
      title: "Phone",
      value: "+91 123 456 7890",
      icon: <Phone />,
    },
    {
      title: "Office Hours",
      value: "Monday – Friday\n9:00 AM – 5:00 PM",
      icon: <Clock />,
    },
  ];
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  return (
    <section className="relative py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h2 text-center mb-4"
        >
          Find Us
        </motion.h2>

        <p className="p text-center max-w-2xl mx-auto mb-20">
          Visit our campus office or reach out through any of the channels
          below.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {contactInfo.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass glass-hover h-full">
                <CardContent className="p-6 flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {item.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Map Container */}
        <div className="rounded-xl overflow-hidden border border-white/10 glass">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            className="h-[420px] w-full"
          >
            <TileLayer attribution={attribution} url={tileUrl} />
            {glowIcon && (
              <Marker position={position} icon={glowIcon}>
                <Popup>
                  <strong>IIT Jammu Campus</strong>
                  <br />
                  I2EDC Office
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
