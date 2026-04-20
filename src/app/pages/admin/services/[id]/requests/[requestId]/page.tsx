"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ServiceRequestRemarks from "@/components/ServiceManager/Chat";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  File,
  Image,
  Video,
} from "lucide-react";

interface UserType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface ServiceType {
  id: number;
  name: string;
  description: string;
  admin: UserType;
}

interface ServiceRequestType {
  id: number;
  requested_by: UserType;
  service: ServiceType;
  plan: {
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  };
  status: "AWAITING_PAYMENT" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  request_msg: {
    subject: string;
    body: string;
  };
  media_url?: string;
  remark?: string;
  requested_at: string;
  updated_at: string;
  final_price: number;
  payment_id?: string;
  payment_status?: string;
}

const ServiceRequestDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;
  const requestId = params.requestId;

  const [request, setRequest] = useState<ServiceRequestType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (requestId) fetchRequestDetail();
  }, [requestId]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/admin/requests/${requestId}/`);
      setRequest(response.data);
      setNewStatus(response.data.status);
      setRemark(response.data.remark || "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!request) return;
    try {
      setUpdating(true);
      await api.patch(`/services/admin/requests/${request.id}/update/`, {
        status: newStatus,
        remark: remark || undefined,
      });
      toast.success("Request updated successfully");
      fetchRequestDetail();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadMedia = async () => {
    if (!request?.media_url) return;

    try {
      setDownloading(true);

      // Fetch the media file
      const response = await fetch(request.media_url);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from URL or create one
      const filename =
        request.media_url.split("/").pop() ||
        `service-request-${request.id}-media`;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);
      toast.success("Media downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download media");

      // Fallback: open in new tab if download fails
      window.open(request.media_url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const downloadPDFInvoice = async () => {
    if (!request) return;
    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("I2EDC SERVICES", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("SERVICE INVOICE", pageWidth / 2, 30, { align: "center" });

      doc.setFontSize(10);
      let yPosition = 50;

      const details = [
        `Invoice ID: INV-${request.id}`,
        `Date: ${formatDate(request.requested_at)}`,
        `Status: ${request.status}`,
        ...(request.payment_id ? [`Transaction ID: ${request.payment_id}`] : []),
        "",
        `Customer: ${request.requested_by.first_name} ${request.requested_by.last_name}`,
        `Username: ${request.requested_by.username}`,
        `Email: ${request.requested_by.email}`,
        "",
        `Service: ${request.service.name}`,
        `Plan: ${request.plan.plan}`,
        `Original Cost: INR ${request.plan.cost}`,
        `Discount: ${request.plan.discount}%`,
        `Final Amount: INR ${request.final_price}`,
        "",
        `Subject: ${request.request_msg.subject}`
      ];

      details.forEach((line) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "I2EDC Services Official Invoice",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      doc.save(`invoice-${request.id}.pdf`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      toast.error("Failed to generate invoice PDF");
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
      extension || ""
    );
    const isVideo = ["mp4", "avi", "mov", "wmv", "flv"].includes(
      extension || ""
    );

    if (isImage) return <Image className="h-5 w-5" />;
    if (isVideo) return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "Download File";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AWAITING_PAYMENT: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-orange-600",
      },
      PENDING: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      APPROVED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-emerald-600",
      },
      IN_QUEUE: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-blue-500",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        icon: RefreshCw,
        color: "text-blue-600",
      },
      REJECTED: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-500",
      },
      COMPLETED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      CANCELLED: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;
    return (
      <Badge
        variant={config.variant}
        className="flex items-center space-x-1 w-fit"
      >
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        <span className="capitalize">
          {status.toLowerCase().replace("_", " ")}
        </span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-foreground">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background py-8 px-4 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Service Request Detail
            </h1>
            <p className="text-muted-foreground mt-1">
              Request ID: <span className="text-gray-900 dark:text-white">{request.id}</span> • Service: <span className="text-gray-900 dark:text-white">{request.service.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {request.status !== "AWAITING_PAYMENT" && (
            <Button
              onClick={downloadPDFInvoice}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          )}
          {request.media_url && (
              <Button
                onClick={handleDownloadMedia}
                disabled={downloading}
                className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-sm"
              >
                {downloading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                <span>{downloading ? "Downloading..." : "Download Media"}</span>
              </Button>
          )}
        </div>
      </div>

      {/* User & Service Information */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">User & Service Information</h2>
        <p className="text-sm text-muted-foreground mb-8">Details about the user and requested service</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          {/* Row 1 */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">User</p>
            <div className="text-gray-900 dark:text-white font-medium">{request.requested_by.first_name} {request.requested_by.last_name}</div>
            <div className="text-sm text-muted-foreground">{request.requested_by.email}</div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Service</p>
            <div className="text-gray-900 dark:text-white font-bold text-lg">{request.service.name}</div>
            <div className="text-sm text-muted-foreground">{request.service.description}</div>
          </div>

          {/* Row 2 */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plan</p>
            <div className="text-gray-900 dark:text-white font-bold text-lg capitalize">{request.plan.plan}</div>
            <div className="text-sm text-muted-foreground">
               ${request.plan.cost} {request.plan.discount > 0 && <span className="text-emerald-600 dark:text-green-400">(-${request.plan.discount} discount)</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Final Price</p>
            <div className="text-2xl font-bold text-emerald-600 dark:text-green-400">
               ${request.final_price}
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
             {getStatusBadge(request.status)}
          </div>
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requested At</p>
             <p className="text-gray-900 dark:text-white font-medium">{formatDate(request.requested_at)}</p>
          </div>
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Last Updated</p>
             <p className="text-gray-900 dark:text-white font-medium">{formatDate(request.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Request Message */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Request Message</h2>
        <p className="text-sm text-muted-foreground mb-6">Message submitted by the user</p>

        <div className="space-y-6">
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject</p>
             <p className="text-gray-900 dark:text-white font-medium text-lg">{request.request_msg.subject}</p>
          </div>
          <div>
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message</p>
             <p className="text-gray-700 dark:text-white/90 leading-relaxed whitespace-pre-wrap">{request.request_msg.body}</p>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Remarks</h2>
         <div className="bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
            <ServiceRequestRemarks
              requestId={request.id}
              rawRemark={request.remark}
              onNewRemark={(newRemark) => {
                request.remark = request.remark
                  ? request.remark + "\n" + JSON.stringify(newRemark)
                  : JSON.stringify(newRemark);
              }}
            />
         </div>
      </div>

      {/* Update Request */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Update Request</h2>
         <p className="text-sm text-muted-foreground mb-6">Update the status and add remarks for this request</p>

         <div className="space-y-4">
             <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full md:w-[200px] h-11 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:ring-0 focus:border-gray-300 dark:focus:border-white/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                    <SelectItem value="AWAITING_PAYMENT">Awaiting Payment</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="IN_QUEUE">In Queue</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 px-6 font-medium"
             >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
             </Button>
         </div>
      </div>

      {/* Attachment */}
      {request.media_url && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Attachment</h2>
           <p className="text-sm text-muted-foreground mb-6">Media file attached to this request</p>

           <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl">
             <div className="flex items-center space-x-4">
                <div className="p-3 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                   {getFileIcon(request.media_url)}
                </div>
                <div>
                   <p className="font-semibold text-gray-900 dark:text-white">{getFileName(request.media_url)}</p>
                   <p className="text-xs text-muted-foreground">Click to download or view</p>
                </div>
             </div>
             <div className="flex space-x-2">
                <Button
                    onClick={handleDownloadMedia}
                    disabled={downloading}
                    variant="outline"
                    className="h-9 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                >
                    {downloading ? "Downloading" : "Download"}
                </Button>
                <Button
                    onClick={() => window.open(request.media_url, "_blank")}
                    variant="ghost"
                    className="h-9 text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                >
                    View
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestDetailPage;
