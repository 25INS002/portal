"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";
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

// Icons
import {
  Search,
  Clock,
  Filter,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Users,
  Rocket,
  AlertTriangle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  BarChart3,
  X,
  FileDown,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";

/* ============================================================
   TYPES
============================================================ */
interface PigaApplication {
  id: number;
  applicant: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  project_title: string;
  date: string;
  full_name: string;
  email: string;
  phone: string;
  organisation: string;
  elevator_pitch: string;
  team: string;
  problem_opportunity: string;
  solution_technology: string;
  current_status: string;
  unique_value_proposition: string;
  cost_budget: string;
  key_metrics: string;
  customer_segments: string;
  twelve_month_plan: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REVIEW_BACK";
  status_display: string;
  review_feedback: string;
  remark: string | null;
  submitted_at: string;
  updated_at: string;
  applicant_name?: string;
}

interface PigaStats {
  total: number;
  pending: number;
  under_review: number;
  review_back: number;
  approved: number;
  rejected: number;
}

/* ============================================================
   STATUS CONFIG
============================================================ */
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    icon: Eye,
  },
  APPROVED: {
    label: "Approved",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
  REVIEW_BACK: {
    label: "Sent Back",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    icon: RotateCcw,
  },
};

/* ============================================================
   MAIN COMPONENT
============================================================ */
const AdminPigaPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  const [applications, setApplications] = useState<PigaApplication[]>([]);
  const [stats, setStats] = useState<PigaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Detail modal
  const [selectedApp, setSelectedApp] = useState<PigaApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Action modal
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/piga/admin/applications/");
      setApplications(res.data);
    } catch (err: any) {
      console.error("Error fetching PIGA applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/piga/admin/statistics/");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApp || !actionType) return;
    if ((actionType === "REJECTED" || actionType === "REVIEW_BACK") && !actionFeedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/piga/admin/applications/${selectedApp.id}/update/`, {
        status: actionType,
        ...(actionFeedback.trim() && { review_feedback: actionFeedback }),
      });
      toast.success(`Application ${actionType === "APPROVED" ? "approved" : actionType === "REJECTED" ? "rejected" : actionType === "UNDER_REVIEW" ? "moved to review" : "sent back"} successfully`);
      setActionOpen(false);
      setActionFeedback("");
      setDetailOpen(false);
      fetchApplications();
      fetchStats();
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (type: string) => {
    setActionType(type);
    setActionFeedback("");
    setActionOpen(true);
  };

  // Filtered list by search term, status, and date range
  const filtered = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (app.project_title || "").toLowerCase().includes(term) ||
      (app.full_name || app.applicant_name || "").toLowerCase().includes(term) ||
      (app.email || "").toLowerCase().includes(term) ||
      (app.organisation || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    // Date range filter (checks submitted_at or date)
    let matchesDate = true;
    if (startDate || endDate) {
      const dateString = app.submitted_at || app.date;
      if (dateString) {
        const itemDate = new Date(dateString);
        if (!isNaN(itemDate.getTime())) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) matchesDate = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) matchesDate = false;
          }
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  /* --------------------------------------------------------
     EXPORT TO PDF (All Filtered Applications)
  -------------------------------------------------------- */
  const exportPDF = async () => {
    if (filtered.length === 0) {
      toast.error("No applications to export");
      return;
    }

    try {
      toast.info("Generating PDF report...");
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 16;

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("I2EDC — PIGA Applications Report", margin + 6, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      const dateRangeStr =
        startDate || endDate
          ? `Date: ${startDate || "Earliest"} to ${endDate || "Latest"}`
          : "Date: All Time";
      const summaryText = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}  |  Status: ${statusFilter === "all" ? "All" : statusFilter}  |  ${dateRangeStr}  |  Total: ${filtered.length}`;
      doc.text(summaryText, margin + 6, y + 17);

      y += 28;

      // Entries list
      filtered.forEach((app, idx) => {
        const entryHeight = 26;
        if (y + entryHeight > pageHeight - 16) {
          doc.addPage();
          y = 16;
        }

        // Row Card Background
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, pageWidth - margin * 2, entryHeight, 1.5, 1.5, "FD");

        // Index & Project Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        const title = `${idx + 1}. ${app.project_title || "(Untitled Project)"}`;
        const titleLines = doc.splitTextToSize(title, pageWidth - margin * 2 - 45);
        doc.text(titleLines[0] || title, margin + 4, y + 6);

        // Status Tag
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        let statusColor: [number, number, number] = [100, 116, 139];
        if (app.status === "APPROVED") statusColor = [16, 185, 129];
        else if (app.status === "REJECTED") statusColor = [239, 68, 68];
        else if (app.status === "UNDER_REVIEW") statusColor = [59, 130, 246];
        else if (app.status === "PENDING") statusColor = [234, 179, 8];
        else if (app.status === "REVIEW_BACK") statusColor = [249, 115, 22];

        doc.setTextColor(...statusColor);
        doc.text(`[${app.status}]`, pageWidth - margin - 4, y + 6, { align: "right" });

        // Metadata line 1: Applicant, Org, Date
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Applicant: ${app.full_name || app.applicant_name || "N/A"}   |   Organisation: ${app.organisation || "N/A"}   |   Submitted: ${formatDate(app.submitted_at || app.date)}`,
          margin + 4,
          y + 12
        );

        // Metadata line 2: Email, Phone, Budget
        doc.text(
          `Email: ${app.email || "N/A"}   |   Phone: ${app.phone || "N/A"}   |   Budget: ${app.cost_budget ? app.cost_budget.slice(0, 40) : "N/A"}`,
          margin + 4,
          y + 18
        );

        // Metadata line 3: Pitch Snippet
        if (app.elevator_pitch) {
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          const pitch = `Pitch: ${app.elevator_pitch.replace(/\s+/g, " ").slice(0, 130)}${app.elevator_pitch.length > 130 ? "..." : ""}`;
          doc.text(pitch, margin + 4, y + 23);
        }

        y += entryHeight + 3;
      });

      // Page numbers footer
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(
          `I2EDC Portal  •  Page ${p} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`piga-applications-report-${dateStr}.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF report");
    }
  };

  /* --------------------------------------------------------
     EXPORT TO EXCEL (CSV with UTF-8 BOM)
  -------------------------------------------------------- */
  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.error("No applications to export");
      return;
    }

    try {
      const headers = [
        "Application ID",
        "Project Title",
        "Applicant Full Name",
        "Email",
        "Phone",
        "Organisation",
        "Status",
        "Date",
        "Submitted At",
        "Last Updated",
        "Elevator Pitch",
        "Team",
        "Problem / Opportunity",
        "Solution / Technology",
        "Current Status",
        "Unique Value Proposition",
        "Cost & Budget",
        "Key Metrics",
        "Customer Segments",
        "12-Month Plan",
        "Review Feedback",
      ];

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = filtered.map((app) => [
        app.id,
        app.project_title || "",
        app.full_name || app.applicant_name || "",
        app.email || "",
        app.phone || "",
        app.organisation || "",
        app.status || "",
        app.date || "",
        app.submitted_at || "",
        app.updated_at || "",
        app.elevator_pitch || "",
        app.team || "",
        app.problem_opportunity || "",
        app.solution_technology || "",
        app.current_status || "",
        app.unique_value_proposition || "",
        app.cost_budget || "",
        app.key_metrics || "",
        app.customer_segments || "",
        app.twelve_month_plan || "",
        app.review_feedback || "",
      ]);

      const csvContent =
        headers.map(escapeCSV).join(",") +
        "\r\n" +
        rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");

      // UTF-8 BOM so Microsoft Excel correctly reads non-ASCII characters
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute("download", `piga-applications-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Excel/CSV file downloaded successfully!");
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      toast.error("Failed to export Excel file");
    }
  };

  /* --------------------------------------------------------
     EXPORT SINGLE APPLICATION DOSSIER TO PDF
  -------------------------------------------------------- */
  const exportSingleAppPDF = async (app: PigaApplication) => {
    try {
      toast.info("Generating Application Dossier...");
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 16;

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("PIGA Application Dossier", margin + 6, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Application ID: #${app.id}   |   Status: ${app.status}   |   Submitted: ${formatDate(app.submitted_at || app.date)}`,
        margin + 6,
        y + 17
      );

      y += 28;

      // Project Title Banner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const splitTitle = doc.splitTextToSize(app.project_title || "(Untitled Project)", pageWidth - margin * 2);
      splitTitle.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 6;
      });
      y += 2;

      // Summary Details Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Applicant: ${app.full_name || "N/A"}`, margin + 4, y + 6);
      doc.text(`Email: ${app.email || "N/A"}`, margin + 4, y + 12);
      doc.text(`Phone: ${app.phone || "N/A"}`, margin + 4, y + 18);

      doc.text(`Organisation: ${app.organisation || "N/A"}`, pageWidth / 2, y + 6);
      doc.text(`Date: ${formatDate(app.date)}`, pageWidth / 2, y + 12);
      doc.text(`Status: ${app.status}`, pageWidth / 2, y + 18);

      y += 30;

      // Sections
      const sections = [
        { title: "Elevator Pitch", text: app.elevator_pitch },
        { title: "Team", text: app.team },
        { title: "Problem / Opportunity", text: app.problem_opportunity },
        { title: "Solution / Technology", text: app.solution_technology },
        { title: "Current Status", text: app.current_status },
        { title: "Unique Value Proposition", text: app.unique_value_proposition },
        { title: "Cost & Budget", text: app.cost_budget },
        { title: "Key Metrics & Validation", text: app.key_metrics },
        { title: "Customer Segments & Market Size", text: app.customer_segments },
        { title: "12-Month Plan", text: app.twelve_month_plan },
        ...(app.review_feedback ? [{ title: "Review Feedback", text: app.review_feedback }] : []),
      ];

      sections.forEach((sec) => {
        if (!sec.text) return;

        if (y > pageHeight - 30) {
          doc.addPage();
          y = 16;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(sec.title, margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(sec.text, pageWidth - margin * 2);

        splitText.forEach((line: string) => {
          if (y > pageHeight - 16) {
            doc.addPage();
            y = 16;
          }
          doc.text(line, margin, y);
          y += 4.5;
        });

        y += 4;
      });

      // Page numbers footer
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" });
      }

      const safeTitle = (app.project_title || "application")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);
      doc.save(`piga-${app.id}-${safeTitle}.pdf`);
      toast.success("Application PDF downloaded successfully!");
    } catch (err) {
      console.error("Error generating single PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "N/A";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const cfg = statusConfig[status] || { label: status, color: "text-gray-400 bg-gray-400/10 border-gray-400/20" };
    return (
      <Badge variant="outline" className={`${cfg.color} border py-0.5 px-3 uppercase text-[10px] tracking-wider font-semibold rounded-full`}>
        {cfg.label}
      </Badge>
    );
  };

  /* --------------------------------------------------------
     PITCH SECTIONS (for detail modal)
  -------------------------------------------------------- */
  const pitchSections = selectedApp
    ? [
        { label: "Elevator Pitch", value: selectedApp.elevator_pitch },
        { label: "Team", value: selectedApp.team },
        { label: "Problem / Opportunity", value: selectedApp.problem_opportunity },
        { label: "Solution / Technology", value: selectedApp.solution_technology },
        { label: "Current Status", value: selectedApp.current_status },
        { label: "Unique Value Proposition", value: selectedApp.unique_value_proposition },
        { label: "Cost & Budget", value: selectedApp.cost_budget },
        { label: "Key Metrics & Validation", value: selectedApp.key_metrics },
        { label: "Customer Segments & Market Size", value: selectedApp.customer_segments },
        { label: "12-Month Plan", value: selectedApp.twelve_month_plan },
      ]
    : [];

  return (
    <div className="min-h-screen w-full bg-background relative">
      {/* Ambient BG */}
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
              PIGA Applications
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-muted-foreground mt-1"
            >
              Review and manage Pre-Incubation Grant Applications
            </motion.p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={exportPDF}
              variant="outline"
              disabled={filtered.length === 0}
              className="rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 shadow-sm transition-all"
            >
              <FileDown className="w-4 h-4 mr-2 text-rose-500" />
              Download PDF ({filtered.length})
            </Button>
            <Button
              onClick={exportExcel}
              variant="outline"
              disabled={filtered.length === 0}
              className="rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
              Download Excel ({filtered.length})
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total", value: stats.total, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { label: "Under Review", value: stats.under_review, icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Sent Back", value: stats.review_back, icon: RotateCcw, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            ].map((stat, i) => (
              <SpotlightCard key={i} className="p-5 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none" spotlightColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.05)"}>
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-muted-foreground/70 uppercase tracking-wider">{stat.label}</div>
                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg border ${stat.bg} ${stat.border} ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by title, name, email, or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:border-gray-300 dark:focus:border-white/20 focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-muted-foreground/60 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.07]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.07] text-sm text-gray-700 dark:text-white focus:ring-0 w-[180px] flex items-center gap-2 transition-all">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="REVIEW_BACK">Sent Back</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="px-3 py-2 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-muted-foreground flex items-center h-12">
                <span><strong className="text-gray-900 dark:text-white">{filtered.length}</strong> results</span>
              </div>
            </div>
          </div>

          {/* Date Range Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-primary" /> Filter by Date:
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-muted-foreground">From</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-auto text-xs rounded-lg bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-muted-foreground">To</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-auto text-xs rounded-lg bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-0"
              />
            </div>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="h-8 px-2.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear Dates
              </Button>
            )}

            <div className="ml-auto text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
              <span>Date range filters by submission date</span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
            <Rocket className="w-12 h-12 mx-auto text-gray-400 dark:text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "No PIGA applications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((app, i) => {
                const cfg = statusConfig[app.status];
                const StatusIcon = cfg?.icon || Clock;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <SpotlightCard
                      className="p-5 cursor-pointer bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none"
                      spotlightColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.05)"}
                      onClick={async () => {
                        // Fetch full detail (list endpoint doesn't include pitch fields)
                        try {
                          const res = await api.get(`/piga/admin/applications/${app.id}/`);
                          setSelectedApp(res.data);
                        } catch {
                          setSelectedApp(app);
                        }
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Left: Project info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                              {app.project_title || "(Untitled)"}
                            </h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {app.full_name || "N/A"}
                            </span>
                            <span>{app.email || "N/A"}</span>
                            <span>{app.organisation || "N/A"}</span>
                          </div>
                        </div>

                        {/* Right: Date & arrow */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(app.submitted_at)}
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ============================================================
         DETAIL MODAL
      ============================================================ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] backdrop-blur-xl p-0">
          {selectedApp && (
            <>
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-white/10 px-6 py-5">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedApp.project_title}
                      </DialogTitle>
                      <DialogDescription className="text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                        <span>{selectedApp.full_name || "N/A"}</span> • <span>{selectedApp.email || "N/A"}</span>
                      </DialogDescription>
                    </div>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                </DialogHeader>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Phone", value: selectedApp.phone || "N/A" },
                    { label: "Organisation", value: selectedApp.organisation || "N/A" },
                    { label: "Date", value: formatDate(selectedApp.date) },
                    { label: "Submitted", value: formatDate(selectedApp.submitted_at) },
                    { label: "Last Updated", value: formatDate(selectedApp.updated_at) },
                    { label: "Applicant User", value: selectedApp.applicant?.username || "N/A" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground font-semibold mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.value || "N/A"}</p>
                    </div>
                  ))}
                </div>

                {/* Review Feedback (if any) */}
                {selectedApp.review_feedback && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Review Feedback
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">{selectedApp.review_feedback}</p>
                  </div>
                )}

                {/* Pitch Sections */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Pitch Details</h3>
                  {pitchSections.map((sec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-muted-foreground font-semibold mb-2">{sec.label}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {sec.value || "(Not provided)"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                  {selectedApp.status === "PENDING" && (
                    <Button
                      onClick={() => openAction("UNDER_REVIEW")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Move to Review
                    </Button>
                  )}
                  {(selectedApp.status === "PENDING" || selectedApp.status === "UNDER_REVIEW") && (
                    <>
                      <Button
                        onClick={() => openAction("APPROVED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        onClick={() => openAction("REJECTED")}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button
                        onClick={() => openAction("REVIEW_BACK")}
                        variant="outline"
                        className="border-orange-300 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Send Back
                      </Button>
                    </>
                  )}
                  {selectedApp.status === "REVIEW_BACK" && (
                    <>
                      <Button onClick={() => openAction("UNDER_REVIEW")} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Eye className="w-4 h-4 mr-2" /> Move to Review
                      </Button>
                      <Button onClick={() => openAction("APPROVED")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => exportSingleAppPDF(selectedApp)}
                    variant="outline"
                    className="ml-auto rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                  >
                    <FileDown className="w-4 h-4 mr-2 text-rose-500" />
                    Download Dossier (PDF)
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================
         ACTION CONFIRMATION MODAL
      ============================================================ */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-md border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className={clsx("flex items-center gap-2", {
              "text-emerald-500": actionType === "APPROVED",
              "text-red-500": actionType === "REJECTED",
              "text-orange-500": actionType === "REVIEW_BACK",
              "text-blue-500": actionType === "UNDER_REVIEW",
            })}>
              {actionType === "APPROVED" && <><CheckCircle2 className="w-5 h-5" /> Approve Application</>}
              {actionType === "REJECTED" && <><XCircle className="w-5 h-5" /> Reject Application</>}
              {actionType === "REVIEW_BACK" && <><RotateCcw className="w-5 h-5" /> Send Back for Revision</>}
              {actionType === "UNDER_REVIEW" && <><Eye className="w-5 h-5" /> Move to Under Review</>}
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500 dark:text-muted-foreground">
              {actionType === "APPROVED" && "This will approve the application and notify the applicant."}
              {actionType === "REJECTED" && "Please provide a reason for rejection."}
              {actionType === "REVIEW_BACK" && "Please provide feedback on what needs to be revised."}
              {actionType === "UNDER_REVIEW" && "This will move the application to under review status."}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "REJECTED" || actionType === "REVIEW_BACK" || actionType === "APPROVED") && (
            <div className="py-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Feedback {(actionType === "REJECTED" || actionType === "REVIEW_BACK") ? "(required)" : "(optional)"}
              </label>
              <textarea
                rows={4}
                value={actionFeedback}
                onChange={(e) => setActionFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                className="w-full px-4 py-3 rounded-xl text-sm border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-muted-foreground/60 focus:border-gray-300 dark:focus:border-white/20 focus:ring-0 resize-none outline-none"
              />
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setActionOpen(false)}
              disabled={actionLoading}
              className="flex-1 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className={clsx("flex-1", {
                "bg-emerald-600 hover:bg-emerald-700": actionType === "APPROVED",
                "bg-red-600 hover:bg-red-700": actionType === "REJECTED",
                "bg-orange-600 hover:bg-orange-700": actionType === "REVIEW_BACK",
                "bg-blue-600 hover:bg-blue-700": actionType === "UNDER_REVIEW",
              })}
            >
              {actionLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPigaPage;
