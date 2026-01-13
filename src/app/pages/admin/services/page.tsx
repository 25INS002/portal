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
  Activity,
  Grid,
  List,
  Eye,
  Edit
} from "lucide-react";
import clsx from "clsx";
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
    description?: string;
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    <div className="min-h-screen w-full bg-background relative">
       {/* Ambient Background - localized to this section content area if needed, or rely on layout */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 space-y-8 p-6 md:p-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/60"
            >
              Services Management
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-muted-foreground mt-1"
            >
              Manage all your services, pricing plans, and monitor performance metrics
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Button asChild size="lg" className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg shadow-black/5 dark:shadow-white/10">
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
              color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" 
            },
            { 
              label: "Total Plans", 
              value: services.reduce((t, s) => t + getPlanCount(s), 0), 
              icon: DollarSign, 
              color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" 
            },
            { 
              label: "Active Requests", 
              value: Object.values(stats).reduce((t, s) => t + (s?.pending_requests || 0), 0), 
              icon: Clock, 
              color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" 
            },
            { 
              label: "Total Requests", 
              value: Object.values(stats).reduce((t, s) => t + (s?.total_requests || 0), 0), 
              icon: TrendingUp, 
              color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" 
            },
          ].map((stat, i) => (
             <SpotlightCard key={i} className="p-6 relative overflow-hidden bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 h-full shadow-sm dark:shadow-none" spotlightColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(99, 102, 241, 0.05)"}>
               <div className="flex flex-col h-full justify-between relative z-10 gap-6">
                 <div className="flex justify-between items-start">
                   <div className="text-[11px] font-semibold text-gray-500 dark:text-muted-foreground/70 uppercase tracking-wider">{stat.label}</div>
                   <div className={`h-10 w-10 flex items-center justify-center rounded-xl border ${stat.bg} ${stat.border} ${stat.color}`}>
                     <stat.icon className="h-5 w-5" />
                   </div>
                 </div>
                 <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                   {stat.value}
                 </div>
               </div>
             </SpotlightCard>
           ))}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-gray-300 dark:focus:border-white/20 focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-muted-foreground/60 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.07]"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.07] text-sm text-gray-700 dark:text-white focus:ring-0 w-[160px] flex items-center gap-2 transition-all">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="active">With Requests</SelectItem>
                  <SelectItem value="no-requests">No Requests</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="px-3 py-2 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md text-sm text-muted-foreground mr-2">
                 <span className="font-semibold text-gray-900 dark:text-white">{filteredServices.length}</span> results
              </div>

               {/* View Toggle */}
              <div className="flex bg-white dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                {((["grid", "list"] as const)).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={clsx(
                      "relative p-2 rounded-lg transition-colors duration-300 z-0",
                      viewMode === mode ? "text-primary" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {viewMode === mode && (
                      <motion.div
                        layoutId="active-view-mode-services"
                        className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* List View Header */}
        {viewMode === 'list' && !loading && filteredServices.length > 0 && (
           <div className="grid grid-cols-[1.5fr_1.5fr_0.6fr_1fr_1.2fr_0.8fr_1fr_100px] gap-4 px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden md:grid">
             <div>Service Name</div>
             <div>Description</div>
             <div>Plans</div>
             <div>Requests</div>
             <div>Completion</div>
             <div>Price</div>
             <div>Created</div>
             <div className="text-right">Actions</div>
           </div>
        )}

        {/* Services List */}
        {loading ? (
           <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
        ) : filteredServices.length === 0 ? (
           <div className="text-center py-24 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
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
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-2"}>
             <AnimatePresence mode="popLayout">
               {filteredServices.map((service, i) => {
                 const serviceStats = stats[service.id];
                 const completionRateString = getCompletionRate(service.id);
                 const popularPlan = getPopularPlan(service.id);
                 
                 // Clean percentage string for width
                 const completionRateValue = parseInt(completionRateString.replace('%', '')) || 0;

                 return (
                   <SpotlightCard 
                      key={service.id}
                      className={clsx(
                        "group cursor-pointer bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none",
                        viewMode === 'list' ? 'p-4' : ''
                      )}
                      spotlightColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(99, 102, 241, 0.05)"}
                      onClick={() => router.push(`/pages/admin/services/${service.id}/requests`)}
                      disableAnimations={viewMode === 'list'}
                   >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Header */}
                          <div className="p-6 pb-2">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-2">
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
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
                                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}`) }}>
                                       View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}/edit`) }}>
                                       Edit Service
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />
                                    <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteClick(service); }}>
                                       Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                             </div>

                             {/* Pricing */}
                             <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{getStartingPrice(service)}</span>
                                <span className="text-xs text-muted-foreground">starting price</span>
                             </div>
                          </div>

                          {/* Stats Area */}
                          <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                      <Users className="w-3 h-3" /> Total Requests
                                   </div>
                                   <div className="text-lg font-semibold text-gray-900 dark:text-white">{serviceStats?.total_requests || 0}</div>
                                </div>
                                <div>
                                   <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                      <Activity className="w-3 h-3" /> Completion
                                   </div>
                                   <div className="text-lg font-semibold text-emerald-400">{completionRateString}</div>
                                </div>
                             </div>
                             
                             {popularPlan !== "N/A" && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-dashed border-gray-200 dark:border-white/10">
                                  <Sparkles className="w-3 h-3 text-yellow-500" />
                                  Most Popular:
                                  <span className="text-gray-900 dark:text-white font-medium">{popularPlan}</span>
                                </div>
                             )}
                          </div>

                          {/* Footer */}
                          <div className="px-6 py-3 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                             <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {formatDate(service.created_at)}
                             </div>
                             <div className="flex items-center gap-1.5 group-hover:text-purple-400 transition-colors">
                                Manage Requests <ChevronRight className="w-3 h-3" />
                             </div>
                          </div>
                        </>
                      ) : (
                        // Table List View Layout
                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_0.6fr_1fr_1.2fr_0.8fr_1fr_100px] gap-4 items-center w-full">
                           {/* Service Name */}
                           <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 shrink-0">
                                 <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white truncate">{service.name}</span>
                           </div>

                           {/* Description */}
                           <div className="text-sm text-muted-foreground truncate hidden md:block">{service.description}</div>

                           {/* Plans */}
                           <div className="hidden md:block">
                             <Badge variant="secondary" className="w-fit bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 font-normal">
                                <Layers className="w-3 h-3 mr-1" /> {getPlanCount(service)}
                             </Badge>
                           </div>

                           {/* Requests */}
                           <div className="flex flex-col items-start gap-1 hidden md:flex">
                              <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                                 <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                 {serviceStats?.total_requests || 0}
                              </div>
                              {(serviceStats?.pending_requests || 0) > 0 && (
                                 <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 rounded-sm">
                                    {serviceStats.pending_requests} pending
                                 </span>
                              )}
                           </div>

                           {/* Completion */}
                           <div className="flex items-center gap-3 hidden md:flex">
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden w-20">
                                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: completionRateString }} />
                              </div>
                              <span className="text-xs font-medium text-emerald-400 w-8 text-right">{completionRateString}</span>
                           </div>

                           {/* Price */}
                           <div className="font-semibold text-emerald-400 hidden md:block">{getStartingPrice(service)}</div>

                           {/* Created */}
                           <div className="text-sm text-muted-foreground hidden md:block">{formatDate(service.created_at)}</div>

                           {/* Actions */}
                           <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}`) }}>
                                 <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-400" onClick={(e) => { e.stopPropagation(); router.push(`/pages/admin/services/${service.id}/edit`) }}>
                                 <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteClick(service); }}>
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                      )}
                   </SpotlightCard>
                 );
               })}
             </AnimatePresence>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/95 backdrop-blur-xl">
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
                  Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{serviceToDelete?.name}"</strong>? 
                  All associated data including pricing plans and request history will be permanently removed.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-white"
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
