// services.tsx – Matching homepage theme exactly
"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import api from "@/lib/api";
import SectionDivider from "@/components/SectionDivider";
import { motion, AnimatePresence } from "framer-motion"; // Keeping for overlays/interactions
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "@/components/ui/SpotlightCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  AlertCircle,
  Info,
  X,
  Bookmark,
  CheckCircle2,
  IndianRupee,
  Upload,
  Image,
  FileQuestion,
  MapPin,
  Users,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Briefcase,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CostDiscount {
  plan: string;
  cost: number;
  discount: number;
  description?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  long_description: string;
  media: string | null;
  availability_map: Record<string, string>;
  cost_discount: CostDiscount[];
  created_at: string;
  updated_at: string;
  admin: number;
}

interface BookingFormData {
  subject: string;
  body: string;
  files: FileList | null;
  selectedPlan: CostDiscount | null;
}

const ServicesPage: React.FC = () => {
  return (
    <div className="relative w-full overflow-x-hidden">
      <ServicesHeroSection />
      <SectionDivider />
      <ServicesGridSection />
      <SectionDivider />
      <ServicesFeaturesSection />
    </div>
  );
};

/* --------------------------------------------------
   HERO SECTION — SERVICES
-------------------------------------------------- */

const ServicesHeroSection = () => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !heroRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      // Title reveal animation
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
      }, "-=0.5")
      .from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4");



    }, heroRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={heroRef} className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-20">
      {/* 🌈 Gradient background */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]"
          }
        `}
      />

      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center">
         <div ref={textRef} className="max-w-4xl mx-auto">
            <div className="overflow-hidden mb-2">
              <p
                className={`
                  hero-text-reveal uppercase tracking-[0.2em] text-sm font-semibold mb-6 inline-block
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                Professional Services · I2EDC
              </p>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              <div className="overflow-hidden">
                <span className={`hero-text-reveal inline-block ${isDark ? "text-white" : "text-gray-900"}`}>
                  Expert
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="hero-text-reveal inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2">
                  Solutions.
                </span>
              </div>
            </h1>

            <p
              className={`
                hero-subtext text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed
                ${isDark ? "text-slate-300" : "text-gray-600"}
              `}
            >
              Access state-of-the-art facilities, expert mentorship, and premium services designed to accelerate your innovation journey.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() =>
                  document
                    .getElementById("services-grid")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="
                  px-8 py-6 rounded-full font-semibold text-base
                  bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                  hover:from-indigo-500 hover:to-purple-500
                  shadow-lg shadow-indigo-500/25
                  transition-all duration-300 hover:scale-105
                "
              >
                Explore Services
              </Button>

              <Button
                variant="outline"
                className={`
                  px-8 py-6 rounded-full font-semibold text-base border-2 transition-all duration-300 hover:scale-105
                  ${
                    isDark
                      ? "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                      : "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Why Choose Us <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
         </div>
      </div>

    </section>
  );
};

/* --------------------------------------------------
   SERVICES GRID SECTION
-------------------------------------------------- */

const ServicesGridSection = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<
    "details" | "booking" | null
  >(null);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    subject: "",
    body: "",
    files: null,
    selectedPlan: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get<Service[]>("/services/list/");
      
      const parsedServices = response.data.map((service) => ({
        ...service,
        cost_discount: parseCostDiscount(service.cost_discount),
        availability_map: parseAvailabilityMap(service.availability_map),
      }));

      setServices(parsedServices);
      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  const parseCostDiscount = (costDiscount: any): CostDiscount[] => {
    if (!costDiscount) return [];

    try {
      if (Array.isArray(costDiscount)) {
        return costDiscount.map((plan) => ({
          plan: plan.plan || "Standard",
          cost:
            typeof plan.cost === "string"
              ? parseFloat(plan.cost)
              : plan.cost || 0,
          discount:
            typeof plan.discount === "string"
              ? parseFloat(plan.discount)
              : plan.discount || 0,
          description: plan.description,
        }));
      }

      if (typeof costDiscount === "string") {
        const cleanString = costDiscount
          .replace(/^"+|"+$/g, "")
          .replace(/\\"/g, '"');
        const parsed = JSON.parse(cleanString);
        return Array.isArray(parsed)
          ? parsed.map((plan) => ({
              plan: plan.plan || "Standard",
              cost:
                typeof plan.cost === "string"
                  ? parseFloat(plan.cost)
                  : plan.cost || 0,
              discount:
                typeof plan.discount === "string"
                  ? parseFloat(plan.discount)
                  : plan.discount || 0,
              description: plan.description,
            }))
          : [];
      }

      return [];
    } catch (error) {
      console.error("Error parsing cost_discount:", error);
      return [];
    }
  };

  const parseAvailabilityMap = (
    availabilityMap: any
  ): Record<string, string> => {
    if (!availabilityMap) return {};

    try {
      if (typeof availabilityMap === "string") {
        const cleanString = availabilityMap
          .replace(/^"+|"+$/g, "")
          .replace(/\\"/g, '"');
        return JSON.parse(cleanString);
      }
      return availabilityMap;
    } catch (error) {
      console.error("Error parsing availability_map:", error);
      return {};
    }
  };

  const getCostDiscounts = (service: Service): CostDiscount[] => {
    return service.cost_discount || [];
  };

  const getLongDescription = (service: Service): string => {
    if (service.long_description && service.long_description.trim()) {
      return service.long_description;
    }
    return service.description || "Detailed description coming soon.";
  };

  const getMediaUrl = (service: Service): string | null => {
    if (!service.media) return null;

    if (service.media.startsWith("http")) {
      return service.media;
    }

    return `${api.defaults.baseURL}${service.media.startsWith("/") ? "" : "/"}${
      service.media
    }`;
  };

  const getStartingPrice = (service: Service): string => {
    const discounts = getCostDiscounts(service);
    if (discounts.length === 0) return "Contact for pricing";

    const firstPlan = discounts[0];
    const cost = firstPlan.cost || 0;
    return `Starting at ₹${Math.round(cost)}`;
  };

  const hasDiscount = (service: Service): boolean => {
    const discounts = getCostDiscounts(service);
    return discounts.length > 0 && (discounts[0].discount || 0) > 0;
  };

  const formatAvailability = (service: Service): string => {
    const availabilityMap = service.availability_map || {};
    if (Object.keys(availabilityMap).length === 0) {
      return "Flexible scheduling available";
    }

    const days = Object.entries(availabilityMap)
      .map(([day, time]) => `${day}: ${time}`)
      .join(", ");

    return days || "Flexible scheduling available";
  };

  const openDetailsOverlay = (service: Service) => {
    setSelectedService(service);
    setActiveOverlay("details");
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
    setTimeout(() => {
      setSelectedService(null);
      setBookingFormData({
        subject: "",
        body: "",
        files: null,
        selectedPlan: null,
      });
      setError("");
    }, 300);
    document.body.style.overflow = "unset";
  };

  const openBookingOverlay = (plan?: CostDiscount) => {
    if (!isAuthenticated) {
      alert("You must be logged in to request this service");
      return;
    }

    if (!selectedService) return;

    const discounts = getCostDiscounts(selectedService);
    const defaultPlan = discounts.length > 0 ? discounts[0] : null;

    setBookingFormData({
      subject: `Inquiry about ${selectedService.name}${
        plan ? ` - ${plan.plan} plan` : ""
      }`,
      body: "",
      files: null,
      selectedPlan: plan || defaultPlan,
    });

    setActiveOverlay("booking");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      setError("No service selected");
      return;
    }

    if (!bookingFormData.selectedPlan) {
      setError("Please select a plan");
      return;
    }

    if (!bookingFormData.subject.trim() || !bookingFormData.body.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("service", selectedService.id.toString());
      formData.append("plan", JSON.stringify(bookingFormData.selectedPlan));
      formData.append(
        "request_msg",
        JSON.stringify({
          subject: bookingFormData.subject.trim(),
          body: bookingFormData.body.trim(),
        })
      );

      if (bookingFormData.files) {
        for (let i = 0; i < bookingFormData.files.length; i++) {
          formData.append("media_url", bookingFormData.files[i]);
        }
      }
      formData.append("service_id", String(selectedService.id));

      await api.post("/services/requests/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        `Service request submitted for ${selectedService.name}! We'll contact you soon.`
      );
      closeOverlay();
    } catch (err: any) {
      console.error("Service request error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to submit service request. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setBookingFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeOverlay();
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section
        id="services-grid"
        className="relative py-32 px-6 bg-background flex justify-center"
      >
        <div className="max-w-7xl w-full text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-16" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && !selectedService) {
    return (
      <section className="relative py-32 px-6 bg-background flex justify-center">
        <div className="max-w-7xl w-full text-center">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchServices} className="mt-4">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="services-grid"
      className="relative py-32 px-6 bg-background flex justify-center"
    >
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Our Services
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Professional solutions tailored to your innovation needs
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const discounts = getCostDiscounts(service);
            const hasAnyDiscount = hasDiscount(service);
            const startingPrice = getStartingPrice(service);
            const availability = formatAvailability(service);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="h-full"
              >
                <SpotlightCard
                  className="p-0 overflow-hidden cursor-pointer group h-full border border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-all rounded-3xl"
                  onClick={() => openDetailsOverlay(service)}
                >
                  {/* Image / Thumbnail Area */}
                  <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
                    {getMediaUrl(service) ? (
                      <img
                        src={getMediaUrl(service)!}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                        <Briefcase className="w-12 h-12 text-indigo-500/20" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="backdrop-blur-md bg-black/60 text-white border-white/10 shadow-sm hover:bg-black/70">
                        Available
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {service.description || "Professional service tailored to your needs."}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4">
                      {/* Price & Discount */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Pricing
                          </span>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                            {startingPrice.includes("Starting") ? (
                                <>
                                <IndianRupee className="w-3.5 h-3.5" />
                                <span className="text-lg">{startingPrice.replace(/[^0-9]/g, '')}</span>
                                </>
                            ) : (
                                <span className="text-sm font-medium">{startingPrice}</span>
                            )}
                          </div>
                        </div>
                        {hasAnyDiscount && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            {discounts[0].discount}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">
                            {availability === "Flexible scheduling available" ? "Flexible Schedule" : availability}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-foreground group-hover:translate-x-1 transition-transform">
                          Details <ArrowRight className="w-4 h-4 ml-1 text-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {services.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileQuestion className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Services Available
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Check back later for our service offerings.
            </p>
          </motion.div>
        )}
      </div>

      {/* Service Details Overlay */}
      {selectedService && activeOverlay === "details" && (
        <ServiceDetailsOverlay
          service={selectedService}
          isAuthenticated={isAuthenticated}
          onClose={closeOverlay}
          onBackdropClick={handleBackdropClick}
          onOpenBooking={openBookingOverlay}
          getCostDiscounts={getCostDiscounts}
          getMediaUrl={getMediaUrl}
          getLongDescription={getLongDescription}
        />
      )}

      {/* Booking Overlay */}
      {selectedService && activeOverlay === "booking" && (
        <BookingOverlay
          service={selectedService}
          formData={bookingFormData}
          onSubmit={handleBookingSubmit}
          onClose={closeOverlay}
          onBackdropClick={handleBackdropClick}
          onInputChange={handleInputChange}
          submitting={submitting}
          error={error}
        />
      )}
    </section>
  );
};

/* --------------------------------------------------
   SERVICE DETAILS OVERLAY COMPONENT
-------------------------------------------------- */

interface ServiceDetailsOverlayProps {
  service: Service;
  isAuthenticated: boolean;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onOpenBooking: (plan?: CostDiscount) => void;
  getCostDiscounts: (service: Service) => CostDiscount[];
  getMediaUrl: (service: Service) => string | null;
  getLongDescription: (service: Service) => string;
}

const ServiceDetailsOverlay: React.FC<ServiceDetailsOverlayProps> = ({
  service,
  isAuthenticated,
  onClose,
  onBackdropClick,
  onOpenBooking,
  getCostDiscounts,
  getMediaUrl,
  getLongDescription,
}) => {
  const { theme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onBackdropClick}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          layoutId={`service-${service.id}`}
          className="
            relative w-full max-w-5xl bg-background border border-border/50 
            rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto
          "
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors border border-white/10"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content */}
            <div 
                className="overflow-y-auto flex-1 custom-scrollbar w-full"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {/* Hero Section */}
                <div className="relative h-64 md:h-80 w-full shrink-0">
                    {getMediaUrl(service) ? (
                        <img
                            src={getMediaUrl(service)!}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                            <Briefcase className="w-20 h-20 text-white/20" />
                        </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex gap-2 mb-3">
                             <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none backdrop-blur-md shadow-lg">
                                Available
                             </Badge>
                             <Badge variant="outline" className="text-white border-white/20 bg-black/20 backdrop-blur-sm">
                                Professional Service
                             </Badge>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-xl">
                            {service.name}
                        </h2>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* LEFT COLUMN: Details */}
                        <div className="lg:col-span-2 space-y-10">
                            
                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    About this Service
                                </h3>
                                <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {getLongDescription(service)}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Availability Schedule */}
                            {service.availability_map && Object.keys(service.availability_map).length > 0 && (
                                <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                        Availability Schedule
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(service.availability_map).map(([day, time]) => (
                                            <div key={day} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/50 shadow-sm">
                                                <span className="font-semibold capitalize text-sm">{day}</span>
                                                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                                    {time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Pricing & Actions */}
                        <div className="space-y-6">
                            <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 sticky top-0">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-green-500" />
                                    Pricing Plans
                                </h3>
                                
                                <div className="space-y-4">
                                    {getCostDiscounts(service).length > 0 ? (
                                        getCostDiscounts(service).map((plan, index) => {
                                            const cost = plan.cost || 0;
                                            const discount = plan.discount || 0;
                                            return (
                                                <motion.div
                                                    key={plan.plan}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="
                                                        relative p-5 rounded-xl border-2 border-transparent 
                                                        bg-background shadow-sm hover:shadow-md transition-all duration-300
                                                        hover:border-indigo-500/30 group overflow-hidden
                                                    "
                                                >
                                                    {/* Discount Badge */}
                                                    {discount > 0 && (
                                                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                                            {discount}% OFF
                                                        </div>
                                                    )}

                                                    <div className="mb-2">
                                                        <h4 className="font-bold text-lg group-hover:text-indigo-500 transition-colors">
                                                            {plan.plan}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {plan.description || "Standard plan features included."}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-end justify-between mt-4">
                                                        <div className="flex items-center gap-1">
                                                            <div className="flex flex-col">
                                                                {discount > 0 && (
                                                                    <span className="text-xs line-through text-muted-foreground">₹{Math.round(cost / (1 - discount/100))}</span>
                                                                )}
                                                                <span className="text-2xl font-black text-foreground">₹{Math.round(cost)}</span>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => onOpenBooking(plan)}
                                                            className="rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold"
                                                        >
                                                            Select
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center p-8 bg-background rounded-xl border border-dashed border-border">
                                            <p className="text-muted-foreground mb-4">Contact us for custom pricing details.</p>
                                            <Button onClick={() => onOpenBooking()} className="w-full">
                                                Request Quote
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                        Secure Payment & Verified Service
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* --------------------------------------------------
   BOOKING OVERLAY COMPONENT
-------------------------------------------------- */

interface BookingOverlayProps {
  service: Service;
  formData: BookingFormData;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onInputChange: (field: keyof BookingFormData, value: any) => void;
  submitting: boolean;
  error: string;
}

const BookingOverlay: React.FC<BookingOverlayProps> = ({
  service,
  formData,
  onSubmit,
  onClose,
  onBackdropClick,
  onInputChange,
  submitting,
  error,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-12">
            <h2 className="text-2xl font-bold mb-2">
              Request {service.name}
              {formData.selectedPlan && ` - ${formData.selectedPlan.plan} Plan`}
            </h2>
            <p className="text-indigo-100">Please provide your project details</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {formData.selectedPlan ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 glass">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                Selected Plan
              </h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{formData.selectedPlan.plan}</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-300">
                    ₹{Math.round(formData.selectedPlan.cost || 0)}
                    {formData.selectedPlan.discount > 0 && (
                      <span className="ml-2 line-through text-indigo-400">
                        ₹
                        {Math.round(
                          (formData.selectedPlan.cost || 0) /
                            (1 - (formData.selectedPlan.discount || 0) / 100)
                        )}
                      </span>
                    )}
                  </p>
                </div>
                {(formData.selectedPlan.discount || 0) > 0 && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {formData.selectedPlan.discount}% OFF
                  </Badge>
                )}
              </div>
              {formData.selectedPlan.description && (
                <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2">
                  {formData.selectedPlan.description}
                </p>
              )}
            </div>
          ) : (
            <Alert className="glass">
              <Info className="h-4 w-4" />
              <AlertTitle>No Plan Selected</AlertTitle>
              <AlertDescription>
                Please go back and select a pricing plan first.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <Input
              type="text"
              placeholder="Brief subject for your request..."
              value={formData.subject}
              onChange={(e) => onInputChange("subject", e.target.value)}
              className="w-full glass"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Details *</label>
            <Textarea
              placeholder="Describe your project requirements, goals, timeline, and any specific details..."
              value={formData.body}
              onChange={(e) => onInputChange("body", e.target.value)}
              className="w-full min-h-[120px] glass"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Supporting Files (Optional)
            </label>
            <Input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
              onChange={(e) => onInputChange("files", e.target.files)}
              className="w-full glass"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: JPG, PNG, PDF, DOC, ZIP (Max 10MB per file)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 dark:border-gray-600"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black hover:bg-gray-800 text-white shadow-lg"
              disabled={submitting || !formData.selectedPlan}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --------------------------------------------------
   SERVICES FEATURES SECTION
-------------------------------------------------- */

const ServicesFeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Why Choose Our Services
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Excellence in every aspect of service delivery
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Expert Guidance",
              description: "Professional mentorship from experienced innovators and industry experts",
              icon: <Users className="w-6 h-6" />,
              gradient: "from-blue-500 to-cyan-500",
              spotlight: "rgba(6, 182, 212, 0.25)" // Cyan
            },
            {
              title: "Quality Assurance",
              description: "Guaranteed quality standards and professional execution",
              icon: <Shield className="w-6 h-6" />,
              gradient: "from-green-500 to-emerald-500",
              spotlight: "rgba(16, 185, 129, 0.25)" // Emerald
            },
            {
              title: "Quick Turnaround",
              description: "Efficient processes ensuring timely delivery",
              icon: <Clock className="w-6 h-6" />,
              gradient: "from-yellow-500 to-orange-500",
              spotlight: "rgba(245, 158, 11, 0.25)" // Amber
            },
            {
              title: "Custom Solutions",
              description: "Tailored services for your specific project needs",
              icon: <Target className="w-6 h-6" />,
              gradient: "from-purple-500 to-pink-500",
              spotlight: "rgba(236, 72, 153, 0.25)" // Pink
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <SpotlightCard
                className="p-6 h-full text-left"
                spotlightColor={feature.spotlight}
              >
                <div
                  className={`
                    mb-4
                    inline-flex
                    h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-r ${feature.gradient}
                    shadow-lg
                  `}
                >
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>

                <p className="text-sm text-muted-foreground group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;