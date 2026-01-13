"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Edit,
  Eye,
  ArrowLeft,
  Filter,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  AlertCircle
} from "lucide-react";
import clsx from "clsx";

// Type definitions
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  cost_discount: Array<{
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  }>;
  admin: User;
}

interface ServiceRequest {
  id: number;
  requested_by: User;
  service: Service;
  plan: {
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  };
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  request_msg: {
    subject: string;
    body: string;
  };
  media_url?: string;
  remark?: string;
  requested_at: string;
  updated_at: string;
  final_price: number;
  plan_name: string;
  can_be_cancelled: boolean;
}

interface ServiceStatistics {
  total_requests: number;
  pending_requests: number;
  completed_requests: number;
  popular_plans: Array<{
    plan__plan: string;
    count: number;
  }>;
}

type StatusFilter =
  | "all"
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const ServiceRequestsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ServiceStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [updating, setUpdating] = useState<boolean>(false);
  const [remark, setRemark] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch service details and requests on component mount
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
      fetchServiceRequests();
      fetchServiceStats();
    }
  }, [serviceId]);

  const fetchServiceDetails = async (): Promise<void> => {
    try {
      const response = await api.get(`/services/${serviceId}/`);
      setService(response.data);
    } catch (error: unknown) {
      console.error("Error fetching service details:", error);
      toast.error("Failed to load service details");
    }
  };

  const fetchServiceRequests = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/services/admin/requests/");
      // Filter requests for this specific service
      const serviceRequests = response.data.filter(
        (request: ServiceRequest) => request.service.id.toString() === serviceId
      );
      setRequests(serviceRequests);
    } catch (error: unknown) {
      console.error("Error fetching service requests:", error);
      toast.error("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStats = async (): Promise<void> => {
    try {
      const response = await api.get(`/services/${serviceId}/statistics/`);
      setStats(response.data);
    } catch (error: unknown) {
      console.error("Error fetching service stats:", error);
    }
  };

  const handleStatusUpdate = async (): Promise<void> => {
    if (!selectedRequest || !newStatus) return;

    try {
      setUpdating(true);
      await api.patch(
        `/services/admin/requests/${selectedRequest.id}/update/`,
        {
          status: newStatus,
          remark: remark || undefined,
        }
      );

      toast.success("Request status updated successfully");
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setRemark("");
      setNewStatus("");

      // Refresh data
      fetchServiceRequests();
      fetchServiceStats();
    } catch (error: unknown) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateClick = (request: ServiceRequest): void => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setRemark(request.remark || "");
    setUpdateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        icon: Clock,
        className: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        icon: RefreshCw,
        className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      },
      COMPLETED: {
        variant: "default" as const,
        icon: CheckCircle,
        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      CANCELLED: {
        variant: "destructive" as const,
        icon: XCircle,
        className: "text-red-400 bg-red-500/10 border-red-500/20",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <IconComponent className="w-3.5 h-3.5" />
        <span className="capitalize">{status.toLowerCase().replace("_", " ")}</span>
      </div>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.requested_by.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requested_by.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.request_msg.subject
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.plan.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPlanCost = (request: ServiceRequest): string => {
    const cost = request.plan.cost || 0;
    const discount = request.plan.discount || 0;
    const finalPrice = cost - discount;
    return `$${finalPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-white">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-12 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center text-muted-foreground hover:text-gray-900 dark:hover:text-white pl-0 mb-2 hover:bg-transparent"
             >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
             </Button>
             <motion.h1 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="text-4xl font-bold text-gray-900 dark:text-white mb-1"
             >
               Service Requests
             </motion.h1>
             {service && (
                <motion.p 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                   className="text-muted-foreground text-lg"
                >
                   Managing requests for <span className="text-gray-900 dark:text-white font-medium">{service.name}</span>
                </motion.p>
             )}
          </div>

          <div className="flex items-center gap-3">
             <Button variant="outline" className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white">
                <Download className="h-4 w-4 mr-2" />
                Export
             </Button>
             <Button asChild className="bg-white text-black hover:bg-white/90">
               <Link href={`/pages/admin/services/${serviceId}`}>
                 <Eye className="h-4 w-4 mr-2" />
                 View Service
               </Link>
             </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
               { 
                  label: "Total Requests", 
                  value: stats.total_requests, 
                  icon: BarChart3, 
                  color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" 
               },
               { 
                  label: "Pending", 
                  value: stats.pending_requests, 
                  icon: Clock, 
                  color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" 
               },
               { 
                  label: "Completed", 
                  value: stats.completed_requests, 
                  icon: CheckCircle, 
                  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" 
               },
               { 
                  label: "Popular Plan", 
                  value: stats.popular_plans?.[0]?.plan__plan || "N/A", 
                  icon: DollarSign, 
                  color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
                  isText: true
               }
            ].map((stat, i) => (
              <SpotlightCard key={i} className="p-6 relative overflow-hidden bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 h-full shadow-sm dark:shadow-none" spotlightColor="rgba(255,255,255,0.05)">
                 <div className="flex flex-col h-full justify-between relative z-10 gap-6">
                    <div className="flex justify-between items-start">
                       <div className="text-[11px] font-semibold text-gray-500 dark:text-muted-foreground/70 uppercase tracking-wider">{stat.label}</div>
                       <div className={`h-10 w-10 flex items-center justify-center rounded-xl border ${stat.bg} ${stat.border} ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                       </div>
                    </div>
                    <div className={`font-bold text-gray-900 dark:text-white tracking-tight ${stat.isText ? 'text-3xl capitalize' : 'text-4xl'}`}>
                       {stat.value}
                    </div>
                 </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="p-1 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-none">
           <div className="flex flex-col md:flex-row items-center p-4 gap-4">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted-foreground h-4 w-4" />
                 <Input
                   placeholder="Search by user, email, subject, or plan..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-muted-foreground/50"
                 />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                       <SelectTrigger className="bg-transparent border-none p-0 h-auto w-[130px] text-sm focus:ring-0 [&>svg]:hidden text-gray-900 dark:text-white">
                          <SelectValue placeholder="All Status" />
                       </SelectTrigger>
                       <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 
                 <div className="px-3 py-2 bg-gray-100 dark:bg-white/10 rounded-md text-sm text-muted-foreground whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{filteredRequests.length}</span> of {requests.length} requests
                 </div>
              </div>
           </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 overflow-hidden shadow-sm dark:shadow-none">
           <Table>
              <TableHeader className="bg-gray-50 dark:bg-white/5">
                 <TableRow className="border-gray-200 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4 pl-6">User</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4">Plan</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4">Subject</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4">Price</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4">Requested</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredRequests.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No requests found</p>
                          <p className="text-sm">Try adjusting your filters or search terms</p>
                       </TableCell>
                    </TableRow>
                 ) : (
                    filteredRequests.map((request) => (
                       <TableRow key={request.id} className="border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <TableCell className="pl-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                                   {request.requested_by.first_name[0]}{request.requested_by.last_name[0]}
                                </div>
                                <div>
                                   <div className="font-medium text-gray-900 dark:text-white">
                                      {request.requested_by.first_name} {request.requested_by.last_name}
                                   </div>
                                   <div className="text-xs text-muted-foreground">
                                      {request.requested_by.email}
                                   </div>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 capitalize text-gray-700 dark:text-gray-300 font-normal">
                                {request.plan.plan}
                             </Badge>
                          </TableCell>
                          <TableCell>
                             <div className="max-w-[200px]">
                                <div className="font-medium text-gray-900 dark:text-white truncate mb-0.5">
                                   {request.request_msg.subject}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                   {request.request_msg.body}
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                             {getPlanCost(request)}
                          </TableCell>
                          <TableCell>
                             {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                             {formatDate(request.requested_at)}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                             <div className="flex items-center justify-end gap-1">
                                <Button
                                   size="icon"
                                   variant="ghost"
                                   className="h-8 w-8 text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                                   onClick={() => handleUpdateClick(request)}
                                >
                                   <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                   asChild
                                   size="icon"
                                   variant="ghost"
                                   className="h-8 w-8 text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                                >
                                   <Link href={`/pages/admin/services/${service?.id}/requests/${request.id}`}>
                                      <Eye className="h-4 w-4" />
                                   </Link>
                                </Button>
                             </div>
                          </TableCell>
                       </TableRow>
                    ))
                 )}
              </TableBody>
           </Table>
        </div>

        {/* Update Status Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>

          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit className="h-5 w-5 text-primary" />
                Update Request Status
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update the status and add remarks for this service request.
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4 py-4">
                {/* Request Info */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {selectedRequest.request_msg.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {selectedRequest.requested_by.first_name}{" "}
                        {selectedRequest.requested_by.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-white/10">
                    <div className="text-muted-foreground">Current Status:</div>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                {/* Status Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Remark Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Remarks (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any remarks or notes..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                    className="bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setUpdateDialogOpen(false)}
                disabled={updating}
                className="flex-1 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ServiceRequestsPage;
