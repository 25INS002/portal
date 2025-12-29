// services.tsx – Matching homepage theme exactly
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import api from "@/lib/api";
import SectionDivider from "@/components/SectionDivider";
import { motion } from "framer-motion";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
                Professional Services · I2EDC · IIT Jammu
              </p>

              <h1
                className={`
                  text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-8
                  ${isDark ? "text-white" : "text-gray-900"}
                `}
              >
                Expert
                <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Services.
                </span>
              </h1>

              <p
                className={`
                  text-lg md:text-xl mb-10
                  ${isDark ? "text-slate-300" : "text-gray-600"}
                `}
              >
                Access professional services with expert guidance, state-of-the-art facilities, and dedicated support to bring your innovative ideas to life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("services-grid")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
                    px-8 py-4 rounded-full font-semibold
                    bg-black text-white
                    hover:bg-gray-800 transition
                  "
                >
                  Explore Services
                </button>

                <button
                  className={`
                    px-8 py-4 rounded-full font-semibold border transition
                    ${
                      isDark
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-gray-300 text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  <a href="#features" className="flex items-center gap-2">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* HERO → SERVICES TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
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
              >
                <Card
                  className="glass glass-hover p-6 text-left cursor-pointer group"
                  onClick={() => openDetailsOverlay(service)}
                >
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {service.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                      >
                        Available
                      </Badge>
                    </div>
                    <CardDescription className="text-base text-muted-foreground line-clamp-2">
                      {service.description || "No description available."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{availability}</span>
                    </div>

                    {discounts.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold">
                          {startingPrice}
                        </span>
                        {hasAnyDiscount && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          >
                            {discounts[0].discount}% OFF
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IndianRupee className="w-4 h-4" />
                        <span>Contact for pricing</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-0 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailsOverlay(service);
                      }}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
<div
  className="
    relative p-6
    bg-white/80 text-gray-900
    dark:bg-white/10 dark:text-white
    backdrop-blur-xl
    border border-black/10 dark:border-white/10
    transition-all duration-500 ease-in-out
  "
>



          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-12">
            <h2 className="text-3xl font-bold mb-2">{service.name}</h2>
            <p className="text-lg">
              {service.description || "Professional service offering"}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
          {getMediaUrl(service) ? (
            <div className="mb-8">
              <img
                src={getMediaUrl(service)!}
                alt={service.name}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="mb-8 flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2" />
                <p>No media available</p>
              </div>
            </div>
          )}

          {service.availability_map &&
            Object.keys(service.availability_map).length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-2xl mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  Availability Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(service.availability_map).map(([day, time]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="font-medium capitalize">{day.toLowerCase()}</span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mb-4 mt-6 border-b pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {getLongDescription(service)}
            </ReactMarkdown>
          </div>

          {getCostDiscounts(service).length > 0 ? (
            <div className="mb-8">
              <h3 className="font-semibold text-2xl mb-6 flex items-center gap-2">
                <IndianRupee className="w-6 h-6 text-green-600" />
                Pricing Plans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCostDiscounts(service).map((plan, index) => {
                  const cost = plan.cost || 0;
                  const discount = plan.discount || 0;
                  const originalPrice = discount > 0 ? cost / (1 - discount / 100) : cost;

                  return (
                    <motion.div
                      key={plan.plan}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-lg group glass-hover"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {plan.plan}
                              </h4>
                              {plan.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {plan.description}
                                </p>
                              )}
                            </div>
                            {discount > 0 && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm">
                                {discount}% OFF
                              </Badge>
                            )}
                          </div>

                          <div className="mb-4">
                            {discount > 0 && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                                  ₹{Math.round(originalPrice)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-5 h-5 text-green-600" />
                              <span className="text-3xl font-bold">
                                {Math.round(cost)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-black hover:bg-gray-800 text-white shadow-lg"
                          onClick={() => onOpenBooking(plan)}
                          disabled={!isAuthenticated}
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          {isAuthenticated ? `Select ${plan.plan}` : "Login to Select"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center glass">
              <IndianRupee className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Custom Pricing</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Contact us for personalized pricing
              </p>
              <Button
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => onOpenBooking()}
                disabled={!isAuthenticated}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {isAuthenticated ? "Request Quote" : "Login to Request"}
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Professional service with guaranteed quality
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="min-w-24 border-gray-300 dark:border-gray-600"
              >
                Close
              </Button>
              {getCostDiscounts(service).length > 0 && (
                <Button
                  className="min-w-24 bg-black hover:bg-gray-800 text-white shadow-lg"
                  onClick={() => onOpenBooking()}
                  disabled={!isAuthenticated}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isAuthenticated ? "Book Now" : "Login to Book"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              title: "Quality Assurance",
              description: "Guaranteed quality standards and professional execution",
              icon: <Shield className="w-6 h-6" />,
              gradient: "from-green-500 to-emerald-500"
            },
            {
              title: "Quick Turnaround",
              description: "Efficient processes ensuring timely delivery",
              icon: <Clock className="w-6 h-6" />,
              gradient: "from-yellow-500 to-orange-500"
            },
            {
              title: "Custom Solutions",
              description: "Tailored services for your specific project needs",
              icon: <Target className="w-6 h-6" />,
              gradient: "from-purple-500 to-pink-500"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass glass-hover p-6 text-left"
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
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>

              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;