"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ServiceRequestRemarks from "@/components/ServiceManager/Chat";
import { parseRemarks } from "@/utils/parseRemarks";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  AlertCircle,
  Package,
  Users,
  IndianRupee,
  Download,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ServiceRequest {
  id: number;
  service: {
    id: number;
    name: string;
    description: string;
  };
  plan: {
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  };
  status:
    | "PENDING"
    | "APPROVED"
    | "IN_QUEUE"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  request_msg: {
    subject: string;
    body: string;
  };
  media_url: string | null;
  remark: string | null;
  requested_at: string;
  updated_at: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  duration: string;
  description: string;
  long_description: string;
  media: string | null;
  media_url: string;
  participants: number[];
  participants_usernames: string[];
  admin: number;
  reg_end_date: string;
}

interface EventParticipation {
  is_participating: boolean;
}

const HistoryPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventParticipations, setEventParticipations] = useState<
    Record<number, EventParticipation>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("services");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch service requests
      const serviceResponse = await api.get<ServiceRequest[]>(
        "/services/requests/my-requests/"
      );
      setServiceRequests(serviceResponse.data);

      // Fetch events and check participation
      await fetchEventsWithParticipation();

      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to load history."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsWithParticipation = async () => {
    try {
      // First, get list of events where user is participating
      const participatingEvents: Event[] = [];
      const participationMap: Record<number, EventParticipation> = {};

      // Get all events and check participation for each
      const eventsListResponse = await api.get<Event[]>("/events/list/");
      const allEvents = eventsListResponse.data;

      for (const event of allEvents) {
        try {
          // Check if user is participating in this event
          const participationResponse = await api.get<EventParticipation>(
            `/events/events/${event.id}/participants/me/`
          );

          if (participationResponse.data.is_participating) {
            // Fetch detailed event information
            const eventDetailResponse = await api.get<Event>(
              `/events/retrieve/${event.id}/`
            );
            participatingEvents.push(eventDetailResponse.data);
            participationMap[event.id] = participationResponse.data;
          }
        } catch (error) {
          console.log(
            `User is not participating in event ${event.id} or event not found`
          );
        }
      }

      setEvents(participatingEvents);
      setEventParticipations(participationMap);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setEventParticipations({});
    }
  };

  // Get events where user is participating
  const getParticipatingEvents = (): Event[] => {
    return events.filter(
      (event) => eventParticipations[event.id]?.is_participating
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "Pending",
        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      },
      IN_QUEUE: {
        variant: "secondary" as const,
        label: "In Queue",
        color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        label: "In Progress",
        color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      },
      COMPLETED: {
        variant: "default" as const,
        label: "Completed",
        color: "text-green-400 bg-green-400/10 border-green-400/20",
      },
      REJECTED: {
        variant: "destructive" as const,
        label: "Rejected",
        color: "text-red-400 bg-red-400/10 border-red-400/20",
      },
      CANCELLED: {
        variant: "destructive" as const,
        label: "Cancelled",
        color: "text-red-400 bg-red-400/10 border-red-400/20",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      label: status,
      color: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    };
    return (
      <Badge variant="outline" className={`${config.color} border py-0.5 px-3 uppercase text-[10px] tracking-wider font-semibold rounded-full`}>
        {config.label}
      </Badge>
    );
  };

  const getEventStatus = (event: Event): string => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const regEndDate = new Date(event.reg_end_date);

    if (now > eventDate) return "COMPLETED";
    if (now > regEndDate) return "REGISTRATION_CLOSED";
    if (now >= new Date(eventDate.getTime() - 24 * 60 * 60 * 1000))
      return "UPCOMING_SOON";
    return "UPCOMING";
  };

  const getEventStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    const statusConfig = {
      COMPLETED: {
        variant: "default" as const,
        label: "Completed",
        color: "text-gray-400 bg-gray-400/10 border-gray-400/20",
      },
      REGISTRATION_CLOSED: {
        variant: "secondary" as const,
        label: "Registration Closed",
        color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      },
      UPCOMING_SOON: {
        variant: "default" as const,
        label: "Upcoming Soon",
        color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      },
      UPCOMING: {
        variant: "secondary" as const,
        label: "Upcoming",
        color: "text-green-400 bg-green-400/10 border-green-400/20",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      label: status,
      color: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    };
    return (
      <Badge variant="outline" className={`${config.color} border py-0.5 px-3 uppercase text-[10px] tracking-wider font-semibold rounded-full`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPDFReceipt = async (request: ServiceRequest) => {
    try {
      // Generate PDF content
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("I2EDC SERVICES", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("SERVICE REQUEST RECEIPT", pageWidth / 2, 30, {
        align: "center",
      });

      // Add receipt details
      doc.setFontSize(10);
      let yPosition = 50;

      const details = [
        `Receipt ID: SR-${request.id}`,
        `Date: ${formatDate(request.requested_at)}`,
        `Status: ${request.status}`,
        "",
        `Service: ${request.service.name}`,
        `Plan: ${request.plan.plan}`,
        `Original Cost: ₹${request.plan.cost}`,
        `Discount: ${request.plan.discount}%`,
        `Final Amount: ₹${
          request.plan.cost * (1 - request.plan.discount / 100)
        }`,
        "",
        `Subject: ${request.request_msg.subject}`,
        "Description:",
      ];

      details.forEach((line) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add description with word wrap
      const descriptionLines = doc.splitTextToSize(
        request.request_msg.body,
        pageWidth - 40
      );
      descriptionLines.forEach((line: string) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add footer
      yPosition += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Thank you for choosing I2EDC Services. For any queries, contact us at support@i2edc.com",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save(`receipt-${request.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to text download
      downloadTextReceipt(request);
    }
  };

  const downloadTextReceipt = (request: ServiceRequest) => {
    const receiptContent = `
I2EDC SERVICES - SERVICE REQUEST RECEIPT
=========================================

Receipt ID: SR-${request.id}
Date: ${formatDate(request.requested_at)}
Status: ${request.status}

SERVICE DETAILS:
----------------
Service: ${request.service.name}
Plan: ${request.plan.plan}
Original Cost: ₹${request.plan.cost}
Discount: ${request.plan.discount}%
Final Amount: ₹${request.plan.cost * (1 - request.plan.discount / 100)}

REQUEST DETAILS:
----------------
Subject: ${request.request_msg.subject}
Description: ${request.request_msg.body}

${request.remark ? `Admin Remark: ${request.remark}` : ""}

Thank you for choosing I2EDC Services.
For any queries, contact us at support@i2edc.com
        `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${request.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadEventTicket = async (event: Event) => {
    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("I2EDC EVENTS", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("EVENT TICKET", pageWidth / 2, 30, { align: "center" });

      // Add event details
      doc.setFontSize(10);
      let yPosition = 50;

      const details = [
        `Event: ${event.name}`,
        `Date: ${formatEventDate(event.date)}`,
        `Duration: ${event.duration}`,
        `Registration Ends: ${formatDate(event.reg_end_date)}`,
        `Ticket: E-${event.id}-${user?.id || "USER"}`,
        `Status: ${getEventStatus(event)}`,
        "",
        "Participant Information:",
        `Name: ${user?.first_name || ""} ${user?.last_name || ""}`,
        `Email: ${user?.email || ""}`,
        `Username: ${user?.username || ""}`,
        "",
        "Event Description:",
      ];

      details.forEach((line) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add description with word wrap
      const descriptionLines = doc.splitTextToSize(
        event.description,
        pageWidth - 40
      );
      descriptionLines.forEach((line: string) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add terms and conditions
      yPosition += 10;
      const terms = [
        "Terms & Conditions:",
        "- Please bring this ticket to the event",
        "- Ticket is non-transferable",
        "- Valid for the registered participant only",
        "- Registration ends on: " + formatDate(event.reg_end_date),
      ];

      terms.forEach((line) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Present this ticket at the event entrance for scanning • events@i2edc.com",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save(`ticket-${event.id}.pdf`);
    } catch (error) {
      console.error("Error generating ticket PDF:", error);
      downloadTextTicket(event);
    }
  };

  const downloadTextTicket = (event: Event) => {
    const ticketContent = `
I2EDC EVENTS - EVENT TICKET
============================

Event: ${event.name}
Date: ${formatEventDate(event.date)}
Duration: ${event.duration}
Registration Ends: ${formatDate(event.reg_end_date)}
Ticket: E-${event.id}-${user?.id || "USER"}
Status: ${getEventStatus(event)}

PARTICIPANT INFORMATION:
------------------------
Name: ${user?.first_name || ""} ${user?.last_name || ""}
Email: ${user?.email || ""}
Username: ${user?.username || ""}

EVENT DESCRIPTION:
------------------
${event.description}

IMPORTANT NOTES:
----------------
- Please bring this ticket to the event
- Ticket is non-transferable
- Valid for the registered participant only
- Registration ends on: ${formatDate(event.reg_end_date)}
- Present at event entrance for scanning

For queries: events@i2edc.com
        `.trim();

    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${event.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const participatingEvents = getParticipatingEvents();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br mt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in to view your history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-8">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <Skeleton className="h-12 w-64 bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full bg-white/5" />
              ))}
            </div>
        </div>
      </div>
    );
  }

  // Dialog Content Components
  const RequestDetailsContent = ({ request }: { request: ServiceRequest }) => (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-4">
          <div>
             <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Service</h4>
             <p className="text-white font-medium">{request.service.name}</p>
          </div>
          <div>
             <h4 className="text-xs uppercase text-gray-500 dark:text-muted-foreground font-semibold mb-1">Plan</h4>
             <p className="text-gray-900 dark:text-white font-medium">{request.plan.plan}</p>
          </div>
          <div>
             <h4 className="text-xs uppercase text-gray-500 dark:text-muted-foreground font-semibold mb-1">Cost</h4>
             <p className="text-gray-900 dark:text-white font-medium">₹{request.plan.cost} {request.plan.discount > 0 && <span className="text-green-600 dark:text-green-400 text-xs">(-{request.plan.discount}%)</span>}</p>
          </div>
          <div>
             <h4 className="text-xs uppercase text-gray-500 dark:text-muted-foreground font-semibold mb-1">Status</h4>
             {getStatusBadge(request.status)}
          </div>
       </div>
       
       <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 transition-colors">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Subject</h4>
          <p className="text-sm text-gray-700 dark:text-muted-foreground mb-4">{request.request_msg.subject}</p>
          
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Message</h4>
          <p className="text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap">{request.request_msg.body}</p>
       </div>
    </div>
  );

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-[#020202] text-gray-900 dark:text-white pt-24 px-4 md:px-8 pb-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My History</h1>
           <p className="text-gray-500 dark:text-muted-foreground">Manage your service requests and event registrations</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
           <div className="flex bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none mb-6">
              {[
                { id: "services", label: "Services", icon: Package, count: serviceRequests.length },
                { id: "events", label: "Events", icon: Calendar, count: participatingEvents.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "relative flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 z-0",
                    activeTab === tab.id
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="history-active-tab"
                      className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-lg -z-10 border border-gray-200 dark:border-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4" />
                  {tab.label} ({tab.count})
                </button>
              ))}
           </div>

           <TabsContent value="services" className="space-y-4">
              {serviceRequests.length === 0 ? (
                 <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white">No history yet</h3>
                    <p className="text-sm text-muted-foreground">You haven't made any requests.</p>
                 </div>
              ) : (
                 serviceRequests.map(request => (
                    <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                       key={request.id}
                    >
                    <Card className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none">
                       <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5 mb-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">{request.service.name}</CardTitle>
                               <CardDescription className="text-gray-500 dark:text-muted-foreground mt-1 flex items-center gap-2">
                                 <Clock className="w-3 h-3" /> {formatDate(request.requested_at)}
                               </CardDescription>
                            </div>
                            {getStatusBadge(request.status)}
                         </div>
                       </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Subject</p>
                               <p className="text-sm font-medium">{request.request_msg.subject}</p>
                            </div>
                            <div>
                               <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Plan</p>
                               <p className="text-sm font-medium">{request.plan.plan} Plan</p>
                            </div>
                         </div>
                         <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Message</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{request.request_msg.body}</p>
                         </div>
                         
                         {/* Remarks Section */}
                         <div className="mt-4 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Remarks</h4>
                            <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-muted-foreground">
                               <ServiceRequestRemarks 
                                  requestId={request.id} 
                                  rawRemark={request.remark ?? undefined} 
                                  onNewRemark={(newRemark) => {
                                      // Optimistic update
                                      request.remark = request.remark ? request.remark + "\n" + JSON.stringify(newRemark) : JSON.stringify(newRemark);
                                  }} 
                               />
                            </div>
                         </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-4 border-t border-white/5 bg-white/[0.02]">
                         <div className="flex flex-col">
                             <span className="text-2xl font-bold text-green-400">₹{request.plan.cost * (1 - request.plan.discount / 100)}</span>
                             {request.plan.discount > 0 && <span className="text-xs text-muted-foreground line-through">₹{request.plan.cost}</span>}
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => downloadPDFReceipt(request)} className="border-white/10 bg-black/20 hover:bg-white/10 text-white h-9">
                                <Download className="w-3 h-3 mr-2" /> Receipt
                             </Button>
                             <Button size="sm" onClick={() => { setSelectedRequest(request); setDetailsOpen(true); }} className="bg-white text-black hover:bg-white/90 h-9">
                                <Eye className="w-3 h-3 mr-2" /> Details
                             </Button>
                         </div>
                      </CardFooter>
                   </Card>
                   </motion.div>
                ))
              )}
           </TabsContent>

           <TabsContent value="events" className="space-y-4">
              {participatingEvents.length === 0 ? (
                 <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white">No events joined</h3>
                    <p className="text-sm text-muted-foreground">Join an event to see it here.</p>
                 </div>
              ) : (
                 participatingEvents.map(event => (
                    <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                       key={event.id}
                    >
                    <Card className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none">
                       <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5 mb-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">{event.name}</CardTitle>
                              <CardDescription className="text-gray-500 dark:text-muted-foreground mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> {formatEventDate(event.date)}
                              </CardDescription>
                           </div>
                           {getEventStatusBadge(event)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-3">
                            <p className="text-emerald-500 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                               <Users className="w-3 h-3" /> Registration Confirmed • Ticket E-{event.id}-{user?.id}
                            </p>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase mb-1">Duration</p>
                               <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-gray-400" /> {event.duration}
                               </p>
                            </div>
                            <div>
                               <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase mb-1">Participants</p>
                               <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <Users className="w-3 h-3 text-gray-400" /> {event.participants.length} joined
                               </p>
                            </div>
                         </div>

                         <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase mb-1">Description</p>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground">{event.description}</p>
                         </div>
                      </CardContent>
                       <CardFooter className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/[0.5] dark:bg-white/[0.02]">
                          <div className="text-xs text-gray-500 dark:text-muted-foreground">
                             Reg ends: {formatDate(event.reg_end_date)}
                          </div>
                          <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => downloadEventTicket(event)} className="border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white h-9">
                                 <Download className="w-3 h-3 mr-2" /> Ticket
                              </Button>
                              <Button size="sm" onClick={() => { setSelectedEvent(event); setEventDetailsOpen(true); }} className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 h-9">
                                 <Eye className="w-3 h-3 mr-2" /> Details
                              </Button>
                          </div>
                       </CardFooter>
                    </Card>
                    </motion.div>
                 ))
              )}
           </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
           <DialogContent className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-w-2xl">
              <DialogHeader>
                 <DialogTitle>Service Request Details</DialogTitle>
                 <DialogDescription className="text-gray-500 dark:text-muted-foreground">
                    Full details of your service request #{selectedRequest?.id}
                 </DialogDescription>
              </DialogHeader>
{selectedRequest && <RequestDetailsContent request={selectedRequest} />}
           </DialogContent>
        </Dialog>

        <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
           <DialogContent className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-w-2xl">
               <DialogHeader>
                 <DialogTitle>Event Details</DialogTitle>
                 <DialogDescription className="text-gray-500 dark:text-muted-foreground">
                    Information about the event
                 </DialogDescription>
              </DialogHeader>
              {selectedEvent && (
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <h3 className="text-xl font-bold">{selectedEvent.name}</h3>
                       <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" /> {formatEventDate(selectedEvent.date)}
                       </div>
                    </div>
                     <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 transition-colors">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                     </div>
                     {selectedEvent.long_description && (
                         <div>
                            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-muted-foreground mb-2">About Event</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.long_description}</p>
                         </div>
                     )}
                 </div>
              )}
           </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default HistoryPage;
