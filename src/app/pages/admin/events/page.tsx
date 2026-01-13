"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { 
  Calendar, Clock, User, Plus, Search, Users, 
  Filter, ChevronLeft, ChevronRight, SlidersHorizontal,
  LayoutGrid, List as ListIcon, MoreVertical,
  CalendarDays, MapPin, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

interface Event {
  id: number;
  name: string;
  date: string;
  duration: string;
  reg_end_date: string;
  description: string;
  long_description: string;
  admin: number;
  participants: number[];
  participants_usernames?: string[];
  admin_username?: string;
  created_at?: string;
  updated_at?: string;
  location?: string;
}

interface EventFilters {
  search: string;
  status: "all" | "upcoming" | "ongoing" | "past" | "registration-open";
  sort: "newest" | "oldest" | "name" | "participants";
}

export default function EventLists() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    status: "all",
    sort: "newest"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events/admin-list/");
      setEvents(response.data);
    } catch (err: any) {
      toast.error("Failed to load events", {
        description: err?.response?.data?.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.date);
    const endDate = new Date(event.duration);
    const regEndDate = new Date(event.reg_end_date);

    if (endDate < now) return "past";
    if (startDate <= now && endDate >= now) return "ongoing";
    if (regEndDate < now) return "registration-closed";
    return "upcoming";
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const status = getEventStatus(event);
    const matchesStatus = filters.status === "all" || 
      (filters.status === "registration-open" 
        ? new Date(event.reg_end_date) >= new Date() 
        : status === filters.status);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (filters.sort) {
      case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "name": return a.name.localeCompare(b.name);
      case "participants": return (b.participants?.length || 0) - (a.participants?.length || 0);
      default: return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "ongoing": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "past": return "text-slate-500 bg-slate-500/10 border-slate-500/20";
      default: return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-12 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[500px] bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400"
            >
              Event Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2 text-lg"
            >
              Overview of all scheduled events and activities
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={() => router.push("/pages/admin/events/create")}
              className="h-12 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </motion.div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: events.length, icon: CalendarDays, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
            { label: "Upcoming", value: events.filter(e => getEventStatus(e) === 'upcoming').length, icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Active Now", value: events.filter(e => getEventStatus(e) === 'ongoing').length, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Reg. Open", value: events.filter(e => new Date(e.reg_end_date) >= new Date()).length, icon: Users, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
          ].map((stat, i) => (
            <SpotlightCard key={i} className="p-6 relative overflow-hidden bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 h-full shadow-sm dark:shadow-none" spotlightColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(99, 102, 241, 0.05)"}>
              <div className="flex flex-col h-full justify-between relative z-10 gap-6">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-muted-foreground/70 uppercase tracking-wider">{stat.label}</div>
                  <div className={`h-10 w-10 flex items-center justify-center rounded-xl border ${stat.bg} ${stat.border} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
              </div>
            </SpotlightCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* FILTERS SIDEBAR */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 backdrop-blur-xl sticky top-8 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-6 text-foreground font-semibold">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Find events..." 
                      className="pl-9 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select value={filters.status} onValueChange={(v: any) => setFilters(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="past">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort</label>
                  <Select value={filters.sort} onValueChange={(v: any) => setFilters(prev => ({ ...prev, sort: v }))}>
                    <SelectTrigger className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* EVENT GRID */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                 <div className="flex justify-center py-20">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 </div>
              ) : currentEvents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
                >
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-medium">No events found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentEvents.map((event, i) => {
                    const status = getEventStatus(event);
                    const date = new Date(event.date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();

                    return (
                      <SpotlightCard
                        key={event.id}
                        onClick={() => router.push(`/pages/admin/events/view/${event.id}`)}
                        className="flex flex-col h-full cursor-pointer group bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-white/20 transition-all duration-300 shadow-sm dark:shadow-none"
                        spotlightColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(99, 102, 241, 0.05)"}
                      >
                         <div className="p-6 flex-1">
                           <div className="flex justify-between items-start mb-4">
                             <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)} backdrop-blur-sm`}>
                               {status.charAt(0).toUpperCase() + status.slice(1)}
                             </div>
                             {/* Date Block */}
                             <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl backdrop-blur-sm group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
                               <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-muted-foreground">{month}</span>
                               <span className="text-lg font-bold leading-none text-gray-900 dark:text-foreground">{day}</span>
                             </div>
                           </div>

                           <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                             {event.name}
                           </h3>
                           
                           <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
                             <div className="flex items-center gap-1.5">
                               <Clock className="w-3.5 h-3.5" />
                               {date.toLocaleTimeString(undefined, { hour: '2-digit', minute:'2-digit' })}
                             </div>
                             <div className="flex items-center gap-1.5">
                               <Users className="w-3.5 h-3.5" />
                               {event.participants?.length || 0} joined
                             </div>
                           </div>

                           <p className="text-sm text-muted-foreground/80 line-clamp-2 h-10">
                             {event.description}
                           </p>
                         </div>

                         <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white shadow-sm">
                                {event.admin_username?.[0]?.toUpperCase() || "A"}
                              </div>
                              <span className="group-hover:text-foreground transition-colors">{event.admin_username || "Admin"}</span>
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              Manage <ChevronRight className="w-3 h-3" />
                            </span>
                         </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                <Button 
                  variant="outline" size="icon" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full w-10 h-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center px-4 font-mono text-sm">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" size="icon" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full w-10 h-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}