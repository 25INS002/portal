"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import api from "@/lib/api";
import SectionDivider from "@/components/SectionDivider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  UsersIcon, 
  SearchIcon, 
  FilterIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  XIcon,
  MenuIcon,
  CheckCircle,
  Sparkles,
  Trophy,
  Award,
  CalendarDays,
  Rocket,
  Lightbulb,
  PenTool,
  Hammer,
  Zap,
  Cpu,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  reg_end_date: string;
  location: string;
  participants: { id: number; username: string }[];
  admin: { id: number; username: string };
};

interface EventParticipation {
  is_participating: boolean;
}

interface EventFilters {
  search: string;
  status: "all" | "upcoming" | "ongoing" | "past" | "registration-open";
  sort: "newest" | "oldest" | "name" | "participants";
  location: string;
}

export default function EventsListPage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <EventsHeroSection />
      <SectionDivider />
      <EventsGridSection />
      <SectionDivider />
      <EventsFeaturesSection />
    </div>
  );
}

/* --------------------------------------------------
   HERO SECTION — EVENTS
-------------------------------------------------- */

const EventsHeroSection = () => {
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
      {/* 🌈 Gradient background (both themes) */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-500
          ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]"
          }
        `}
      />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center">
         <div ref={textRef} className="max-w-4xl mx-auto">
            <div className="overflow-hidden mb-2">
              <p
                className={`
                  hero-text-reveal uppercase tracking-[0.2em] text-sm font-semibold mb-6 inline-block
                  ${isDark ? "text-indigo-400" : "text-indigo-600"}
                `}
              >
                Events & Workshops · I2EDC · IIT Jammu
              </p>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              <div className="overflow-hidden inline-block mr-4">
                <span className={`hero-text-reveal inline-block ${isDark ? "text-white" : "text-gray-900"}`}>
                  Discover
                </span>
              </div>
              <div className="overflow-hidden inline-block pb-2">
                <span className="hero-text-reveal inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Events.
                </span>
              </div>
            </h1>

            <p
              className={`
                hero-subtext text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed
                ${isDark ? "text-slate-300" : "text-gray-600"}
              `}
            >
              Join our community of innovators through workshops, hackathons, and networking events designed to inspire, educate, and connect.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() =>
                  document
                    .getElementById("events-grid")
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
                Browse Events
              </button>

              <button
                className={`
                  px-8 py-6 rounded-full font-semibold text-base border-2 transition-all duration-300 hover:scale-105
                  ${
                    isDark
                      ? "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                      : "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                <a href="#features" className="flex items-center gap-2">
                  <span>Learn More</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </button>
            </div>
         </div>
      </div>

      {/* HERO → EVENTS TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 block dark:hidden bg-gradient-to-t from-background to-background" />
      </div>
    </section>
  );
};

/* --------------------------------------------------
   EVENTS GRID SECTION
-------------------------------------------------- */

const EventsGridSection = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventParticipations, setEventParticipations] = useState<Record<number, EventParticipation>>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    status: "all",
    sort: "newest",
    location: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events/list/");
      const eventsData = Array.isArray(response.data) ? response.data : [];
      setEvents(eventsData);

      // Check participation for each event
      await checkEventParticipations(eventsData);
    } catch (err: any) {
      toast.error("Failed to load events", {
        description: err?.response?.data?.message || "Please try again later",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const checkEventParticipations = async (eventsData: Event[]) => {
    const participationMap: Record<number, EventParticipation> = {};
    
    for (const event of eventsData) {
      try {
        const participationResponse = await api.get<EventParticipation>(`/events/events/${event.id}/participants/me/`);
        participationMap[event.id] = participationResponse.data;
      } catch (error) {
        // If endpoint returns 404 or error, user is not participating
        participationMap[event.id] = { is_participating: false };
      }
    }
    
    setEventParticipations(participationMap);
  };

  // Safe value getter with defaults
  const getSafeString = (value: any, defaultValue: string = ""): string => {
    return value ? String(value).toLowerCase() : defaultValue;
  };

  // Safe date parser
  const getSafeDate = (dateString: any): Date => {
    try {
      return dateString ? new Date(dateString) : new Date(0);
    } catch {
      return new Date(0);
    }
  };

  // Filter and sort events with proper error handling
  const filteredEvents = events.filter(event => {
    if (!event) return false;

    const safeTitle = getSafeString(event.name);
    const safeDescription = getSafeString(event.description);
    const safeLocation = getSafeString(event.location);
    const safeSearch = getSafeString(filters.search);

    const matchesSearch = safeTitle.includes(safeSearch) ||
                         safeDescription.includes(safeSearch);
    
    const matchesLocation = filters.location === "" || 
                           safeLocation.includes(getSafeString(filters.location));
    
    const now = new Date();
    const eventDate = getSafeDate(event.date);
    const regEndDate = getSafeDate(event.reg_end_date);

    // Skip events with invalid dates
    if (isNaN(eventDate.getTime()) || isNaN(regEndDate.getTime())) {
      return false;
    }

    const matchesStatus = (() => {
      switch (filters.status) {
        case "upcoming":
          return eventDate > now;
        case "ongoing":
          // For simplicity, considering events as ongoing on their date
          const isSameDay = eventDate.toDateString() === now.toDateString();
          return isSameDay || (eventDate <= now && regEndDate >= now);
        case "past":
          return eventDate < now;
        case "registration-open":
          return regEndDate >= now;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesLocation;
  }).sort((a, b) => {
    if (!a || !b) return 0;

    const dateA = getSafeDate(a.date);
    const dateB = getSafeDate(b.date);
    const participantsA = Array.isArray(a.participants) ? a.participants.length : 0;
    const participantsB = Array.isArray(b.participants) ? b.participants.length : 0;
    const titleA = getSafeString(a.name);
    const titleB = getSafeString(b.name);

    switch (filters.sort) {
      case "oldest":
        return dateA.getTime() - dateB.getTime();
      case "name":
        return titleA.localeCompare(titleB);
      case "participants":
        return participantsB - participantsA;
      default: // newest
        return dateB.getTime() - dateA.getTime();
    }
  });

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getEventStatus = (event: Event) => {
    if (!event) return "past";

    const now = new Date();
    const eventDate = getSafeDate(event.date);
    const regEndDate = getSafeDate(event.reg_end_date);

    if (isNaN(eventDate.getTime()) || isNaN(regEndDate.getTime())) {
      return "past";
    }

    if (eventDate < now) return "past";
    
    const isSameDay = eventDate.toDateString() === now.toDateString();
    if (isSameDay || (eventDate <= now && regEndDate >= now)) return "ongoing";
    
    if (regEndDate < now) return "registration-closed";
    return "upcoming";
  };

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    const variants = {
      upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" },
      ongoing: { label: "Happening Now", color: "bg-green-100 text-green-800 border-green-200" },
      past: { label: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200" },
      "registration-closed": { label: "Registration Closed", color: "bg-orange-100 text-orange-800 border-orange-200" }
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[status]?.color || variants.past.color}`}>
        {variants[status]?.label || "Completed"}
      </Badge>
    );
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/pages/events/${eventId}/`);
  };

  const handleRegisterClick = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/pages/events/${eventId}/`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Time";
    }
  };

  const getSafeParticipantCount = (event: Event) => {
    return Array.isArray(event.participants) ? event.participants.length : 0;
  };

  const getSafeAdminName = (event: Event) => {
    return event?.admin?.username || "I2EDC Team";
  };

  const getSafeLocation = (event: Event) => {
    return event?.location || "IIT Jammu Campus";
  };

  // Check if user is registered for an event
  const isUserRegistered = (eventId: number): boolean => {
    return eventParticipations[eventId]?.is_participating || false;
  };

  // Check if registration is open for an event
  const canRegister = (event: Event): boolean => {
    try {
      return new Date(event.reg_end_date) >= new Date();
    } catch {
      return false;
    }
  };

  // Filter component to avoid duplication
  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Events</label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setCurrentPage(1);
            }}
            className="pl-10 glass"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Input
          placeholder="Filter by location..."
          value={filters.location}
          onChange={(e) => {
            setFilters({ ...filters, location: e.target.value });
            setCurrentPage(1);
          }}
          className="glass"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Status</label>
        <Select
          value={filters.status}
          onValueChange={(value: EventFilters["status"]) => {
            setFilters({ ...filters, status: value });
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="glass">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Happening Now</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
            <SelectItem value="registration-open">Registration Open</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select
          value={filters.sort}
          onValueChange={(value: EventFilters["sort"]) => {
            setFilters({ ...filters, sort: value });
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="glass">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Title (A-Z)</SelectItem>
            <SelectItem value="participants">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-sm text-muted-foreground">
          Showing {currentEvents.length} of {filteredEvents.length} events
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Quick Stats */}
      {events.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-dashed border-gray-200 dark:border-white/10 mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Event Overview</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none mb-1">{events.length}</div>
              <div className="text-[10px] uppercase font-bold text-indigo-600/70 dark:text-indigo-400/70">Total</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none mb-1">
                {events.filter(e => getEventStatus(e) === 'upcoming').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-blue-600/70 dark:text-blue-400/70">Upcoming</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">
                {events.filter(e => getEventStatus(e) === 'ongoing').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-400/70">Now</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 leading-none mb-1">
                {events.filter(e => {
                  try {
                    return new Date(e.reg_end_date) >= new Date();
                  } catch {
                    return false;
                  }
                }).length}
              </div>
              <div className="text-[10px] uppercase font-bold text-orange-600/70 dark:text-orange-400/70">Open</div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {(filters.search || filters.status !== "all" || filters.location) && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 border-gray-300 dark:border-gray-600"
          onClick={() => {
            setFilters({ search: "", status: "all", sort: "newest", location: "" });
            setCurrentPage(1);
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <section id="events-grid" className="relative py-32 px-6 bg-background flex justify-center">
        <div className="max-w-7xl w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="events-grid" className="relative py-32 px-6 bg-background flex justify-center">
      <div className="max-w-7xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        >
          All Events
        </motion.h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 text-center">
          Discover and join amazing events in our innovation community. Register now to secure your spot!
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <SpotlightCard className="h-fit sticky top-6 bg-white/50 dark:bg-black/20 border-white/20 backdrop-blur-md" spotlightColor="rgba(99, 102, 241, 0.15)">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FilterIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Find Events</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Filter events by your preferences
                </p>
                <FilterContent />
              </div>
            </SpotlightCard>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 glass">
                    <FilterIcon className="h-4 w-4" />
                    Filters & Search
                    {(filters.search || filters.status !== "all" || filters.location) && (
                      <Badge variant="secondary" className="ml-auto">
                        Active
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto px-4">
                  <SheetHeader className="text-left">
                    <SheetTitle className="flex items-center gap-2">
                      <FilterIcon className="h-5 w-5" />
                      Find Events
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters Display - Mobile */}
            <div className="lg:hidden mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, search: "" })}
                    />
                  </Badge>
                )}
                {filters.status !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, status: "all" })}
                    />
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, location: "" })}
                    />
                  </Badge>
                )}
                {(filters.search || filters.status !== "all" || filters.location) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => setFilters({ search: "", status: "all", sort: "newest", location: "" })}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <Card className="glass">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {filters.search || filters.status !== "all" || filters.location
                      ? "No events match your current filters. Try adjusting your search criteria." 
                      : "There are no events available at the moment. Please check back later!"
                    }
                  </p>
                  {(filters.search || filters.status !== "all" || filters.location) ? (
                    <Button 
                      variant="default" 
                      className="bg-black hover:bg-gray-800"
                      onClick={() => setFilters({ search: "", status: "all", sort: "newest", location: "" })}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={fetchEvents}>
                      Refresh Events
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentEvents.map((event, i) => {
                    if (!event) return null;

                    const userRegistered = isUserRegistered(event.id);
                    const registrationOpen = canRegister(event);
                    const status = getEventStatus(event);

                    let spotlightColor = "rgba(100, 116, 139, 0.25)"; // Default gray (past)
                    if (status === "ongoing") spotlightColor = "rgba(16, 185, 129, 0.25)"; // Emerald
                    else if (status === "upcoming") spotlightColor = "rgba(99, 102, 241, 0.25)"; // Indigo
                    else if (status === "registration-closed") spotlightColor = "rgba(249, 115, 22, 0.25)"; // Orange

                    const eventDateObj = getSafeDate(event.date);
                    const month = eventDateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = eventDateObj.getDate();
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full"
                      >
                        <SpotlightCard 
                          className="cursor-pointer group h-full flex flex-col overflow-hidden border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-md"
                          spotlightColor={spotlightColor}
                          onClick={() => handleEventClick(event.id)}
                        >
                           <div className="flex h-full flex-col">
                              {/* Top Section: Date + Main Info */}
                              <div className="flex p-6 gap-5 items-start">
                                {/* Calendar Date Block */}
                                <div className={`
                                  flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center
                                  shadow-lg border border-white/20
                                  ${
                                    status === "ongoing" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                    status === "upcoming" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" :
                                    status === "registration-closed" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" :
                                    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                  }
                                `}>
                                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{month}</span>
                                  <span className="text-2xl font-black leading-none">{day}</span>
                                </div>

                                {/* Title & Status */}
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start gap-2 mb-2">
                                      <div className="flex flex-wrap gap-2">
                                        {getStatusBadge(event)}
                                      </div>
                                   </div>
                                   <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors dark:text-white text-gray-900 line-clamp-2 mb-2">
                                      {event.name || "Untitled Event"}
                                   </h3>
                                </div>
                              </div>

                              {/* Description - Middle */}
                              <div className="px-6 pb-2 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
                                {event.description || "No description available."}
                              </div>

                              {/* Metadata Strip */}
                              <div className="px-6 py-4 mt-auto space-y-3">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground/80">
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 opacity-70" />
                                    <span>{formatTime(event.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 opacity-70" />
                                    <span className="truncate max-w-[150px]">{getSafeLocation(event)}</span>
                                  </div>
                                   <div className="flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4 opacity-70" />
                                    <span>{getSafeParticipantCount(event)} registered</span>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Actions */}
                              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                  <UserIcon className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">By {getSafeAdminName(event)}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                   {userRegistered ? (
                                     <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                                       <CheckCircle className="h-4 w-4" />
                                       Registered
                                     </span>
                                   ) : registrationOpen ? (
                                     <Button 
                                      size="sm"
                                      onClick={(e) => handleRegisterClick(event.id, e)}
                                      className="rounded-full px-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                     >
                                      Register
                                     </Button>
                                   ) : (
                                     <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
                                      Closed
                                     </span>
                                   )}
                                </div>
                              </div>
                           </div>
                        </SpotlightCard>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${currentPage === pageNum ? 'bg-black hover:bg-gray-800 text-white' : 'border-gray-300 dark:border-gray-600'}`}
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   EVENTS FEATURES SECTION
-------------------------------------------------- */

const EventsFeaturesSection = () => {
  return (
    <div className="flex flex-col">
      {/* SECTION 1: INNOVATION SHOWCASE (STATS) */}
      <section className="relative py-24 bg-black/[0.04] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
            >
              Innovation Showcase
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our impact and achievements in student innovation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {[
               { label: "Prototypes Built", value: "20+", icon: <Cpu className="w-6 h-6" />, color: "text-indigo-500" },
               { label: "Student Innovators", value: "50+", icon: <UsersIcon className="w-6 h-6" />, color: "text-blue-500" },
               { label: "Technologies Used", value: "10+", icon: <Zap className="w-6 h-6" />, color: "text-purple-500" },
               { label: "Partner Programs", value: "5+", icon: <Globe className="w-6 h-6" />, color: "text-emerald-500" }
             ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="text-center group cursor-default"
                >
                   <div className={`mb-4 mx-auto w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      {stat.icon}
                   </div>
                   <div className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>
                     {stat.value}
                   </div>
                   <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                     {stat.label}
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: GET INVOLVED (PROCESS STEPS) */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              Get Involved
            </motion.h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your innovation journey with I2EDC
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Submit Your Idea",
                desc: "Pitch your concept to our innovation cell",
                icon: <Lightbulb className="w-6 h-6" />,
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                step: "02",
                title: "Collaborate & Design",
                desc: "Form a team and plan your prototype",
                icon: <PenTool className="w-6 h-6" />,
                gradient: "from-pink-500 to-rose-500"
              },
              {
                step: "03",
                title: "Build & Test",
                desc: "Use campus labs to create your working model",
                icon: <Hammer className="w-6 h-6" />,
                gradient: "from-cyan-500 to-blue-500"
              },
              {
                step: "04",
                title: "Showcase & Scale",
                desc: "Demonstrate your innovation at InventX or IF",
                icon: <Rocket className="w-6 h-6" />,
                gradient: "from-purple-500 to-indigo-500"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="h-full"
              >
                <SpotlightCard
                  className="h-full border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-md"
                  spotlightColor={`rgba(${
                    i === 0 ? "245, 158, 11" : 
                    i === 1 ? "236, 72, 153" : 
                    i === 2 ? "6, 182, 212" : 
                    "99, 102, 241"
                  }, 0.15)`}
                >
                  <div className="p-8 h-full flex flex-col relative overflow-hidden">
                     {/* Step Number Background */}
                     <div className="absolute -right-4 -top-4 text-[8rem] font-black text-black/5 dark:text-white/5 leading-none select-none">
                       {item.step}
                     </div>

                     <div className="relative z-10">
                        <div className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg
                          bg-gradient-to-br ${item.gradient} text-white
                        `}>
                          {item.icon}
                        </div>
                        
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          Step {item.step}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 dark:text-white text-gray-900 leading-tight">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {item.desc}
                        </p>
                     </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Have an idea that can make a difference? Get mentorship, resources, and lab access.</p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-bold">
                Start a Project
              </Button>
               <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5">
                Mentor a Team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};