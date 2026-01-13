"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Label } from "@/components/ui/label";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarDays, 
  Loader2, 
  Users, 
  Info, 
  ShieldAlert, 
  Sparkles,
  Type,
  FileText,
  Clock, 
  Crown,
  Star,
  CalendarClock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  id?: number;
  name: string;
  date: string;
  duration: string;
  reg_end_date: string;
  description: string;
  long_description: string;
  admin: number;
  participants: number[];
  participants_usernames?: string[];
}

export default function CreateEventForm() {
  const [formData, setFormData] = useState<Event>({
    name: "",
    date: "",
    duration: "",
    reg_end_date: "",
    description: "",
    long_description: "",
    admin: 0, 
    participants: [],
  });

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const router = useRouter();


  // Fetch current user and staff users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingStaff(true);
        
        // Fetch current user (assuming there's an endpoint for current user)
        const currentUserResponse = await api.get("/accounts/me/");
        setCurrentUser(currentUserResponse.data);
        
        // Set current user as default admin if they are staff/superadmin
        if (currentUserResponse.data?.is_staff || currentUserResponse.data?.is_superadmin) {
          setFormData(prev => ({ ...prev, admin: currentUserResponse.data.id }));
        }
        
        // Fetch all staff users (is_staff=1 or superadmin=1)
        const staffResponse = await api.get("/adminpanel/get-staffs/");
        setStaffUsers(staffResponse.data);
        
      } catch (err: any) {
        toast.error("Failed to load user data", {
          description: "Please refresh the page to try again",
        });
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdminChange = (value: string) => {
    setFormData({ ...formData, admin: parseInt(value) });
  };

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.slice(0, 16);
  };

  // Helper function to ensure proper datetime format for API
  const ensureDateTimeFormat = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.length === 10) {
      return `${dateString}T00:00:00`;
    }
    if (dateString.length === 16) {
      return `${dateString}:00`;
    }
    return dateString;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.date || !formData.duration || !formData.reg_end_date || !formData.description) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields marked with *",
      });
      return;
    }

    // Admin validation
    if (!formData.admin || formData.admin === 0) {
      toast.error("Admin selection required", {
        description: "Please select an admin for this event",
      });
      return;
    }

    // Prepare data with proper datetime formatting
    const submissionData = {
      ...formData,
      date: ensureDateTimeFormat(formData.date),
      duration: ensureDateTimeFormat(formData.duration),
      reg_end_date: ensureDateTimeFormat(formData.reg_end_date),
    };

    // Date validation
    const startDate = new Date(submissionData.date);
    const endDate = new Date(submissionData.duration);
    const regEndDate = new Date(submissionData.reg_end_date);

    if (regEndDate > startDate) {
      toast.warning("Invalid date selection", {
        description: "Registration end date cannot be after event start date",
      });
      return;
    }

    if (endDate <= startDate) {
      toast.warning("Invalid date selection", {
        description: "Event end date must be after start date",
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your event...");

    try {
      const res = await api.post("/events/create/", submissionData);
      
      const selectedAdmin = staffUsers.find(user => user.id === formData.admin);
      
      toast.success("Event created successfully!", {
        id: toastId,
        description: `Event assigned to ${selectedAdmin?.username || 'selected admin'}`,
        action: {
          label: "View Event",
          onClick: () => {
            console.log("Navigate to event:", res.data.id);
          },
        },
      });
      
      
      // Reset form but keep the current user as admin if they are staff
      setFormData({
        name: "",
        date: "",
        duration: "",
        reg_end_date: "",
        description: "",
        long_description: "",
        admin: currentUser?.is_staff || currentUser?.is_superadmin ? currentUser.id : 0,
        participants: [],
      });
      router.push("/pages/admin/events");

    } catch (err: any) {
      toast.error("Failed to create event", {
        id: toastId,
        description: err?.response?.data?.message || "Please try again later",
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    toast("Clear form?", {
      description: "This will reset all entered data",
      action: {
        label: "Reset",
        onClick: () => {
          setFormData({
            name: "",
            date: "",
            duration: "",
            reg_end_date: "",
            description: "",
            long_description: "",
            admin: currentUser?.is_staff || currentUser?.is_superadmin ? currentUser.id : 0,
            participants: [],
          });
          toast.info("Form cleared", {
            description: "All fields have been reset",
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  // Get display name for user
  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name} (${user.username})`;
    }
    return user.username;
  };

  // Check if user is staff/superadmin
  const isUserStaff = (user: User) => {
    return user.is_staff || user.is_superadmin;
  };

  return (
    <div className="min-h-screen w-full bg-background py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <SpotlightCard className="border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-xl shadow-sm dark:shadow-2xl" disableAnimations>
          <div className="p-8">
            <div className="text-center mb-8">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-white/10 shadow-inner"
                >
                    <CalendarDays className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    Create New Event
                </h1>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    Fill in the details below to launch your event
                </p>
            </div>
          
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Name */}
              <div className="space-y-2 group">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                  <Type className="h-4 w-4" />
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter a catchy event name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all hover:bg-gray-100 dark:hover:bg-black/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              {/* Admin Selection */}
              <div className="space-y-2 group">
                <Label htmlFor="admin" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                  <ShieldAlert className="h-4 w-4" />
                  Event Admin <span className="text-destructive">*</span>
                </Label>
                {loadingStaff ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-black/20 p-3 rounded-md border border-white/5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading admin users...</span>
                  </div>
                ) : (
                  <Select value={formData.admin.toString()} onValueChange={handleAdminChange}>
                    <SelectTrigger className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all hover:bg-gray-100 dark:hover:bg-black/30 text-gray-900 dark:text-white">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Users className="h-4 w-4 text-gray-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <SelectValue placeholder="Select an admin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/10 backdrop-blur-xl text-gray-900 dark:text-white">
                      {/* Current user option */}
                      {currentUser && isUserStaff(currentUser) && (
                        <SelectItem value={currentUser.id.toString()} className="focus:bg-white/10 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <span>{getUserDisplayName(currentUser)} (You)</span>
                                {currentUser.is_superadmin && <Badge variant="secondary" className="h-5 px-1 bg-red-500/20 text-red-300 border-0 hover:bg-red-500/30">Superadmin</Badge>}
                                {currentUser.is_staff && !currentUser.is_superadmin && <Badge variant="secondary" className="h-5 px-1 bg-blue-500/20 text-blue-300 border-0 hover:bg-blue-500/30">Staff</Badge>}
                            </div>
                        </SelectItem>
                      )}
                      
                      {/* Other staff users */}
                      {staffUsers
                        .filter(user => user.id !== currentUser?.id)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()} className="focus:bg-gray-100 dark:focus:bg-white/10 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <span>{getUserDisplayName(user)}</span>
                                {user.is_superadmin && <Badge variant="secondary" className="h-5 px-1 bg-red-500/20 text-red-300 border-0 hover:bg-red-500/30">Superadmin</Badge>}
                                {user.is_staff && !user.is_superadmin && <Badge variant="secondary" className="h-5 px-1 bg-blue-500/20 text-blue-300 border-0 hover:bg-blue-500/30">Staff</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Current selection info */}
                {formData.admin > 0 && !loadingStaff && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Selected Admin</p>
                      <p className="font-medium text-foreground">
                        {getUserDisplayName(
                          staffUsers.find(u => u.id === formData.admin) || 
                          (currentUser?.id === formData.admin ? currentUser : {} as User)
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Date Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Start Date & Time */}
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                      <CalendarIcon className="h-4 w-4" />
                      Start Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={formatDateForInput(formData.date)}
                        onChange={handleChange}
                        className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all hover:bg-gray-100 dark:hover:bg-black/30 dark-calendar text-gray-900 dark:text-white"
                        required
                      />
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Event End Date & Time */}
                  <div className="space-y-2 group">
                    <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                      <Clock className="h-4 w-4" />
                      End Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        id="duration"
                        name="duration"
                        value={formatDateForInput(formData.duration)}
                        onChange={handleChange}
                        className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all hover:bg-gray-100 dark:hover:bg-black/30 dark-calendar text-gray-900 dark:text-white"
                        required
                      />
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Registration End Date */}
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="reg_end_date" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                      <CalendarClock className="h-4 w-4" />
                      Registration End <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        id="reg_end_date"
                        name="reg_end_date"
                        value={formData.reg_end_date}
                        onChange={handleChange}
                        className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all hover:bg-gray-100 dark:hover:bg-black/30 dark-calendar text-gray-900 dark:text-white"
                        required
                      />
                      <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">
                      Registration closes at 11:59 PM on this date
                    </p>
                  </div>

                  {/* Event Duration Display */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10 h-[calc(100%-24px)] flex flex-col justify-center">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground/80">
                        <Clock className="h-3 w-3" />
                        Duration Preview
                    </Label>
                    {formData.date && formData.duration ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                         <div className="flex justify-between">
                            <span>Starts:</span>
                            <span className="text-foreground">{new Date(formData.date).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between">
                            <span>Ends:</span>
                            <span className="text-foreground">{new Date(formData.duration).toLocaleDateString()}</span>
                         </div>
                        <div className="pt-2 mt-2 border-t border-white/10 text-xs font-medium text-primary flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          {calculateDuration(formData.date, formData.duration)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Select start and end dates to see duration</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2 group">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Short Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of your event (will be shown in listings)"
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[80px] resize-vertical bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all hover:bg-gray-100 dark:hover:bg-black/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  required
                />
                <p className="text-xs text-muted-foreground ml-1">
                  Keep it concise - this appears in event previews
                </p>
              </div>

              {/* Long Description */}
              <div className="space-y-2 group">
                <Label htmlFor="long_description" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Detailed Description
                </Label>
                <Textarea
                  id="long_description"
                  name="long_description"
                  placeholder="Comprehensive details about your event, schedule, requirements, etc."
                  value={formData.long_description}
                  onChange={handleChange}
                  className="min-h-[120px] resize-vertical bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all hover:bg-gray-100 dark:hover:bg-black/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || loadingStaff}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium h-12 rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Event
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={loading || loadingStaff}
                  className="h-12 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white"
                >
                  Clear Form
                </Button>
              </div>

               {/* Form Tips */}
               <Alert className="bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-200">
                 <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                 <AlertTitle className="text-blue-800 dark:text-blue-400 mb-2">Helpful Tips</AlertTitle>
                 <AlertDescription>
                     <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-200/70">
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" /> Fields marked with * are required</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" /> Only staff and superadmins can be assigned as event admins</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" /> Registration must close before the event starts</li>
                         <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" /> <span className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-500/20 px-1 rounded text-[10px]">Superadmin</span> has full control</li>
                     </ul>
                 </AlertDescription>
               </Alert>

            </form>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}

// Helper function to calculate duration between two dates
function calculateDuration(start: string, end: string): string {
  if (!start || !end) return "";
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  
  return parts.join(', ') || 'Less than 1 minute';
}
