"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarDaysIcon, 
  Loader2, 
  UsersIcon, 
  ArrowLeftIcon, 
  EditIcon, 
  SaveIcon, 
  XIcon,
  DownloadIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Sparkles,
  Trash2,
  Mail,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superadmin: boolean;
  first_name?: string;
  last_name?: string;
}

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
  created_at?: string;
  updated_at?: string;
}

interface Participant {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function ViewEventPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Event | null>(null);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch event data and staff users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEvent(true);
        
        const currentUserResponse = await api.get("/accounts/me/");
        setCurrentUser(currentUserResponse.data);
        
        const staffResponse = await api.get("/adminpanel/get-staffs/");
        setStaffUsers(staffResponse.data);
        
        const eventResponse = await api.get(`/events/retrieve/${eventId}/`);
        setEvent(eventResponse.data);
        setFormData(eventResponse.data);
        
        await fetchParticipants();
        
      } catch (err: any) {
        toast.error("Failed to load event data", {
          description: err?.response?.data?.message || "Please try again later",
        });
        router.push("/pages/admin/events");
      } finally {
        setLoadingEvent(false);
        setLoadingStaff(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, router]);

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await api.get(`/events/events/${eventId}/participants/`);
      setParticipants(response.data);
    } catch (err: any) {
      console.error("Failed to fetch participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdminChange = (value: string) => {
    if (formData) {
      setFormData({ ...formData, admin: parseInt(value) });
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.slice(0, 16);
  };

  const ensureDateTimeFormat = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.length === 10) return `${dateString}T00:00:00`;
    if (dateString.length === 16) return `${dateString}:00`;
    return dateString;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(event);
      setIsEditing(false);
      toast.info("Edit cancelled");
    } else {
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.name || !formData.date || !formData.duration || !formData.reg_end_date || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.admin || formData.admin === 0) {
      toast.error("Please select an admin");
      return;
    }

    const submissionData = {
      ...formData,
      date: ensureDateTimeFormat(formData.date),
      duration: ensureDateTimeFormat(formData.duration),
      reg_end_date: ensureDateTimeFormat(formData.reg_end_date),
    };

    setLoading(true);
    const toastId = toast.loading("Updating event...");

    try {
      const res = await api.put(`/events/update/${eventId}/`, submissionData);
      setEvent(res.data);
      setFormData(res.data);
      setIsEditing(false);
      toast.success("Event updated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error("Failed to update event", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    toast("Delete this event?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const toastId = toast.loading("Deleting event...");
          try {
            await api.delete(`/events/delete/${eventId}/`);
            toast.success("Event deleted", { id: toastId });
            router.push("/pages/admin/events");
          } catch (err: any) {
            toast.error("Failed to delete", { id: toastId });
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const downloadCSV = () => {
    if (participants.length === 0) {
      toast.error("No participants to download");
      return;
    }
    const headers = ['Name', 'Username', 'Email', 'Registered'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => [
        `"${p.first_name} ${p.last_name}"`,
        `"${p.username}"`,
        `"${p.email}"`,
        `"${new Date(p.registered_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.name}-participants.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  const filteredParticipants = participants.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const currentParticipants = filteredParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return user.username;
  };

  const getEventStatus = () => {
    if (!event) return "unknown";
    const now = new Date();
    const start = new Date(event.date);
    const end = new Date(event.duration);
    if (end < now) return "completed";
    if (start <= now && end >= now) return "ongoing";
    return "upcoming";
  };

  const status = getEventStatus();
  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    upcoming: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Upcoming" },
    ongoing: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Live Now" },
    completed: { color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", label: "Completed" },
    unknown: { color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", label: "Unknown" },
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Event not found</p>
          <Button onClick={() => router.push("/pages/admin/events")}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-background py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/pages/admin/events")}
              className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {event.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={`${statusConfig[status].bg} ${statusConfig[status].color} border`}>
                  {status === "ongoing" && <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />}
                  {statusConfig[status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {participants.length} participants
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant={isEditing ? "outline" : "default"}
              onClick={handleEditToggle}
              disabled={loading}
              className={isEditing ? "border-white/10" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"}
            >
              {isEditing ? <><XIcon className="h-4 w-4 mr-2" /> Cancel</> : <><EditIcon className="h-4 w-4 mr-2" /> Edit</>}
            </Button>
            
            {isEditing && (
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
            
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <SpotlightCard 
              className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none" 
              spotlightColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)"}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center border border-indigo-100 dark:border-white/10">
                    <CalendarDaysIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h2>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">
                      {event.created_at && !isNaN(new Date(event.created_at).getTime()) 
                        ? `Created ${new Date(event.created_at).toLocaleDateString()}` 
                        : "Event details"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Name <span className="text-red-500 dark:text-red-400">*</span>
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500/50 h-11"
                    />
                  </div>

                  {/* Admin Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Admin <span className="text-red-500 dark:text-red-400">*</span>
                    </Label>
                    <Select 
                      value={formData.admin.toString()} 
                      onValueChange={handleAdminChange}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11">
                        <SelectValue placeholder="Select admin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10">
                        {staffUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10">
                            {getUserDisplayName(user)} {user.is_superadmin && "👑"} {user.id === currentUser?.id && "(You)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                      <Input
                        type="datetime-local"
                        name="date"
                        value={formatDateForInput(formData.date)}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                      <Input
                        type="datetime-local"
                        name="duration"
                        value={formatDateForInput(formData.duration)}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Registration Deadline</Label>
                    <Input
                      type="datetime-local"
                      name="reg_end_date"
                      value={formatDateForInput(formData.reg_end_date)}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white min-h-[80px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Description</Label>
                    <Textarea
                      name="long_description"
                      value={formData.long_description}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white min-h-[120px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                </form>
              </div>
            </SpotlightCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Duration", value: calculateDuration(event.date, event.duration), icon: ClockIcon, color: "text-blue-500 dark:text-blue-400" },
                { label: "Reg. Ends", value: new Date(event.reg_end_date).toLocaleDateString(), icon: CalendarIcon, color: "text-orange-500 dark:text-orange-400" },
                { label: "Participants", value: participants.length, icon: UsersIcon, color: "text-emerald-500 dark:text-emerald-400" },
              ].map((stat, i) => (
                <SpotlightCard key={i} className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 p-4 shadow-sm dark:shadow-none" spotlightColor={isDark ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.05)"}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <SpotlightCard 
              className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 backdrop-blur-xl sticky top-8 shadow-sm dark:shadow-none" 
              spotlightColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)"}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 flex items-center justify-center border border-emerald-100 dark:border-white/10">
                      <UsersIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Participants</h3>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{participants.length} registered</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadCSV}
                    disabled={participants.length === 0}
                    className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white text-xs"
                  >
                    <DownloadIcon className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-9"
                  />
                </div>

                {/* Participants List */}
                {loadingParticipants ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No participants found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {currentParticipants.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {(p.first_name?.[0] || p.username[0]).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {p.first_name} {p.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                              @{p.username}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-muted-foreground border-0 shrink-0 max-w-[100px] truncate" title={p.email}>
                            {p.email.split('@')[0]}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-xs text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredParticipants.length)} of {filteredParticipants.length}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-7 w-7"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 w-7"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}