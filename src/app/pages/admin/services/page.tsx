"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

// Shadcn & UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Lucide Icons
import {
  Plus,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Clock,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Layers,
  Activity
} from "lucide-react";
import { useTheme } from "next-themes";

// Type definitions
interface Service {
  id: number;
  name: string;
  description: string;
  long_description?: string;
  media?: string;
  cost_discount: Array<{
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  }>;
  admin: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface ServiceStats {
  total_requests: number;
  pending_requests: number;
  completed_requests: number;
  popular_plans: Array<{
    plan__plan: string;
    count: number;
    description?: string; // Added to fix potential type error based on usage
  }>;
}

const AdminServicesPage: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [stats, setStats] = useState<{ [key: number]: ServiceStats }>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/services/admin/my-services/");
      setServices(response.data);

      // Fetch stats for each service
      response.data.forEach((service: Service) => {
        fetchServiceStats(service.id);
      });
    } catch (error: unknown) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStats = async (serviceId: number): Promise<void> => {
    try {
      const response = await api.get(`/services/${serviceId}/statistics/`);
      setStats((prev) => ({
        ...prev,
        [serviceId]: response.data,
      }));
    } catch (error: unknown) {
      console.error(`Error fetching stats for service ${serviceId}:`, error);
    }
  };

  const handleDeleteClick = (service: Service): void => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!serviceToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/services/${serviceToDelete.id}/delete/`);
      toast.success("Service deleted successfully");
      setServices(
        services.filter((service) => service.id !== serviceToDelete.id)
      );
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get plan count
  const getPlanCount = (service: Service): number => {
    return service.cost_discount?.length || 0;
  };

  // Get lowest price from plans
  const getStartingPrice = (service: Service): string => {
    if (!service.cost_discount?.length) return "N/A";

    const prices = service.cost_discount.map((plan) => {
      const cost = plan.cost || 0;
      const discount = plan.discount || 0;
      return cost - discount;
    });

    const minPrice = Math.min(...prices);
    return `$${minPrice.toFixed(2)}`;
  };

  // Get completion rate
  const getCompletionRate = (serviceId: number): string => {
    const serviceStats = stats[serviceId];
    if (!serviceStats?.total_requests) return "0%";

    const rate =
      (serviceStats.completed_requests / serviceStats.total_requests) * 100;
    return `${Math.round(rate)}%`;
  };

  // Get most popular plan
  const getPopularPlan = (serviceId: number): string => {
    const serviceStats = stats[serviceId];
    if (!serviceStats?.popular_plans?.length) return "N/A";

    return serviceStats.popular_plans[0].plan__plan || "N/A";
  };

  return (
    <div className="w-full relative">
       {/* Ambient Background - localized to this section content area if needed, or rely on layout */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            >
              Services Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Manage all your services, pricing plans, and monitor performance metrics
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10">
              <Link href="/pages/admin/services/create">
                <Plus className="h-5 w-5 mr-2" />
                Create New Service
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Total Services", 
              value: services.length, 
              icon: Package, 
              color: "text-blue-400 border-blue-500/20 bg-blue-500/10" 
            },
            { 
              label: "Total Plans", 
              value: services.reduce((t, s) => t + getPlanCount(s), 0), 
              icon: DollarSign, 
              color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" 
            },
            { 
              label: "Active Requests", 
              value: Object.values(stats).reduce((t, s) => t + (s?.pending_requests || 0), 0), 
              icon: Clock, 
              color: "text-orange-400 border-orange-500/20 bg-orange-500/10" 
            },
            { 
              label: "Total Requests", 
              value: Object.values(stats).reduce((t, s) => t + (s?.total_requests || 0), 0), 
              icon: TrendingUp, 
              color: "text-purple-400 border-purple-500/20 bg-purple-500/10" 
            },
          ].map((stat, i) => (
             <SpotlightCard key={i} className="p-5 flex items-center justify-between bg-white/5 border-white/10" spotlightColor="rgba(255,255,255,0.05)">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
               </div>
               <div className={`p-3 rounded-xl border ${stat.color}`}>
                   <stat.icon className="w-5 h-5" />
               </div>
             </SpotlightCard>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-white/10 focus:border-purple-500/50 transition-colors"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-black/20 border border-white/10 rounded-md">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="bg-transparent border-none text-sm text-muted-foreground focus:ring-0 p-0 h-auto w-[110px] [&>svg]:hidden">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="active">With Requests</SelectItem>
                    <SelectItem value="no-requests">No Requests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="px-3 py-2 bg-black/20 border border-white/10 rounded-md text-sm text-muted-foreground">
                 <span className="font-semibold text-white">{filteredServices.length}</span> results
              </div>
           </div>
        </div>

        {/* Services List */}
        {loading ? (
           <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
        ) : filteredServices.length === 0 ? (
           <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/5">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">No services found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first service"}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/pages/admin/services/create">Create Service</Link>
                </Button>
              )}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             <AnimatePresence mode="popLayout">
               {filteredServices.map((service, i) => {
                 const serviceStats = stats[service.id];
                 const completionRate = getCompletionRate(service.id);
                 const popularPlan = getPopularPlan(service.id);
                 
                 return (
                   <SpotlightCard 
                      key={service.id}
                      className="group cursor-pointer bg-black/20 border-white/10 hover:border-white/20"
                      spotlightColor="rgba(255,255,255,0.08)"
                      onClick={() => router.push(`/pages/admin/services/${service.id}/requests`)}
                   >
                      {/* Header */}
                      <div className="p-6 pb-2">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                    {service.name}
                                  </h3>
                                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0">
                                    {getPlanCount(service)} PLANS
                                  </Badge>
                               </div>
                               <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                  {service.description}
                               </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-white" onClick={e => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}`) }}>
                                   View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}/edit`) }}>
                                   Edit Service
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteClick(service); }}>
                                   Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                         </div>

                         {/* Pricing */}
                         <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-2xl font-bold text-white">{getStartingPrice(service)}</span>
                            <span className="text-xs text-muted-foreground">starting price</span>
                         </div>
                      </div>

                      {/* Stats Area */}
                      <div className="px-6 py-4 bg-white/5 border-t border-white/5 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Total Requests
                               </div>
                               <div className="text-lg font-semibold text-white">{serviceStats?.total_requests || 0}</div>
                            </div>
                            <div>
                               <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <Activity className="w-3 h-3" /> Completion
                               </div>
                               <div className="text-lg font-semibold text-emerald-400">{completionRate}</div>
                            </div>
                         </div>
                         
                         {popularPlan !== "N/A" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-dashed border-white/10">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              Most Popular:
                              <span className="text-white font-medium">{popularPlan}</span>
                            </div>
                         )}
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                         <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {formatDate(service.created_at)}
                         </div>
                         <div className="flex items-center gap-1.5 group-hover:text-purple-400 transition-colors">
                            Manage Requests <ChevronRight className="w-3 h-3" />
                         </div>
                      </div>
                   </SpotlightCard>
                 );
               })}
             </AnimatePresence>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md border-white/10 bg-gray-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-red-500">
                <Trash2 className="h-5 w-5" />
                <span>Delete Service</span>
              </DialogTitle>
              <DialogDescription className="pt-4 text-muted-foreground">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="text-red-500 font-medium">
                    This action cannot be undone
                  </p>
                </div>
                <p>
                  Are you sure you want to delete <strong className="text-white">"{serviceToDelete?.name}"</strong>? 
                  All associated data including pricing plans and request history will be permanently removed.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1 border-white/10 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete Service"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminServicesPage;
