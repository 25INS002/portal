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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SpotlightCard from "@/components/ui/SpotlightCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import {
  Plus,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Users,
  Rocket,
  AlertTriangle,
  AlertCircle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BarChart3,
  MessageSquare,
  X,
  Edit,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";

// Remarks
import ServiceRequestRemarks from "@/components/ServiceManager/Chat";

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
  review_feedback: string;
  remark: string | null;
  submitted_at: string;
  updated_at: string;
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
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Eye },
  APPROVED: { label: "Approved", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  REVIEW_BACK: { label: "Revision Needed", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: RotateCcw },
};

/* ============================================================
   FORM FIELDS CONFIG
============================================================ */
interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "textarea";
  placeholder: string;
  required?: boolean;
  helper?: string;
  rows?: number;
}

const basicFields: FormField[] = [
  { id: "project_title", label: "Project Title", type: "text", placeholder: "Enter your project title", required: true },
  { id: "date", label: "Date", type: "date", placeholder: "", required: true },
  { id: "full_name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
  { id: "phone", label: "Phone", type: "tel", placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "organisation", label: "Organisation", type: "text", placeholder: "IIT Jammu / Other", required: true },
];

const pitchFields: FormField[] = [
  { id: "elevator_pitch", label: "Elevator Pitch", type: "textarea", placeholder: "Describe your product/process/service and its value proposition...", helper: "Under 50 words.", rows: 3 },
  { id: "team", label: "Team", type: "textarea", placeholder: "Founding team, advisors, qualifications, key skills...", helper: "Include commitment (part-time/full-time).", rows: 4 },
  { id: "problem_opportunity", label: "Problem / Opportunity", type: "textarea", placeholder: "Existing alternatives, competitors, limitations...", rows: 4 },
  { id: "solution_technology", label: "Solution / Technology", type: "textarea", placeholder: "Top features of your solution...", rows: 4 },
  { id: "current_status", label: "Current Status / Stage", type: "textarea", placeholder: "Idea / Prototype / Product / Revenue-generating...", rows: 3 },
  { id: "unique_value_proposition", label: "Unique Value Proposition", type: "textarea", placeholder: "Key benefits your product provides...", rows: 3 },
  { id: "cost_budget", label: "Cost & Budget Bifurcation", type: "textarea", placeholder: "Cost of key activities, fixed/variable costs...", rows: 4 },
  { id: "key_metrics", label: "Key Metrics & Validation", type: "textarea", placeholder: "Metrics to validate hypotheses...", rows: 4 },
  { id: "customer_segments", label: "Customer Segments & Market Size", type: "textarea", placeholder: "Target customers, market size...", rows: 4 },
  { id: "twelve_month_plan", label: "12-Month Plan", type: "textarea", placeholder: "Goals and milestones...", rows: 4 },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */
const UserPigaPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [applications, setApplications] = useState<PigaApplication[]>([]);
  const [stats, setStats] = useState<PigaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");

  // Detail modal
  const [selectedApp, setSelectedApp] = useState<PigaApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // New application form
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formStep, setFormStep] = useState(0); // 0=basic, 1=pitch
  const [submitting, setSubmitting] = useState(false);

  // Edit mode (for PENDING or REVIEW_BACK)
  const [editMode, setEditMode] = useState(false);
  const [editAppId, setEditAppId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, statsRes] = await Promise.all([
        api.get("/piga/my-applications/"),
        api.get("/piga/my-statistics/"),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("Error fetching PIGA data:", err);
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------
     SUBMIT / UPDATE
  -------------------------------------------------------- */
  const handleSubmitApplication = async () => {
    // Validate basic fields
    const missingBasic = basicFields.filter(f => f.required && !formData[f.id]?.trim());
    if (missingBasic.length > 0) {
      toast.error(`Please fill: ${missingBasic.map(f => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      if (editMode && editAppId) {
        await api.patch(`/piga/my-applications/${editAppId}/update/`, formData);
        toast.success("Application updated successfully!");
      } else {
        await api.post("/piga/submit/", formData);
        toast.success("Application submitted successfully!");
      }
      setFormOpen(false);
      setFormData({});
      setFormStep(0);
      setEditMode(false);
      setEditAppId(null);
      fetchData();
    } catch (err: any) {
      console.error("Error submitting:", err);
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditForm = (app: PigaApplication) => {
    const data: Record<string, string> = {};
    [...basicFields, ...pitchFields].forEach(f => {
      data[f.id] = (app as any)[f.id] || "";
    });
    setFormData(data);
    setEditMode(true);
    setEditAppId(app.id);
    setFormStep(0);
    setFormOpen(true);
  };

  const openNewForm = () => {
    setFormData({});
    setEditMode(false);
    setEditAppId(null);
    setFormStep(0);
    setFormOpen(true);
  };

  /* --------------------------------------------------------
     HELPERS
  -------------------------------------------------------- */
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

  const pitchSections = selectedApp
    ? [
        { label: "Elevator Pitch", value: selectedApp.elevator_pitch },
        { label: "Team", value: selectedApp.team },
        { label: "Problem / Opportunity", value: selectedApp.problem_opportunity },
        { label: "Solution / Technology", value: selectedApp.solution_technology },
        { label: "Current Status", value: selectedApp.current_status },
        { label: "Unique Value Proposition", value: selectedApp.unique_value_proposition },
        { label: "Cost & Budget", value: selectedApp.cost_budget },
        { label: "Key Metrics", value: selectedApp.key_metrics },
        { label: "Customer Segments", value: selectedApp.customer_segments },
        { label: "12-Month Plan", value: selectedApp.twelve_month_plan },
      ]
    : [];

  /* --------------------------------------------------------
     AUTH GUARDS
  -------------------------------------------------------- */
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#020202] pt-24 px-8">
        <div className="max-w-4xl mx-auto p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>Please log in to view your PIGA applications.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#020202] text-gray-900 dark:text-white pt-24 px-8">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          <Skeleton className="h-12 w-64 bg-gray-200 dark:bg-white/10" />
          <Skeleton className="h-10 w-full bg-gray-200 dark:bg-white/10" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020202] text-gray-900 dark:text-white pt-24 px-4 md:px-8 pb-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My PIGA Applications</h1>
            <p className="text-gray-500 dark:text-muted-foreground">Track your Pre-Incubation Grant Applications</p>
          </div>
          <Button onClick={openNewForm} className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg">
            <Plus className="h-5 w-5 mr-2" /> New Application
          </Button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-blue-400" },
              { label: "Pending", value: stats.pending, color: "text-yellow-400" },
              { label: "Reviewing", value: stats.under_review, color: "text-blue-400" },
              { label: "Sent Back", value: stats.review_back, color: "text-orange-400" },
              { label: "Approved", value: stats.approved, color: "text-emerald-400" },
              { label: "Rejected", value: stats.rejected, color: "text-red-400" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
            <Rocket className="w-12 h-12 mx-auto text-gray-400 dark:text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Submit your first Pre-Incubation Grant Application</p>
            <Button onClick={openNewForm} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" /> New Application
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div
                  className="p-5 rounded-2xl cursor-pointer bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none"
                  onClick={() => { setSelectedApp(app); setDetailOpen(true); }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{app.project_title}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-1">
                        {app.elevator_pitch || "No pitch yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(app.submitted_at)}
                      </span>
                      {(app.status === "PENDING" || app.status === "REVIEW_BACK") && (
                        <Button
                          size="sm" variant="outline"
                          className="h-8 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-white"
                          onClick={(e) => { e.stopPropagation(); openEditForm(app); }}
                        >
                          <Edit className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Review feedback banner */}
                  {app.status === "REVIEW_BACK" && app.review_feedback && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                      <p className="text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{app.review_feedback}</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
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
                      <DialogDescription className="text-gray-500 dark:text-muted-foreground">
                        Submitted {formatDate(selectedApp.submitted_at)}
                      </DialogDescription>
                    </div>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                </DialogHeader>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Basic info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Name", value: selectedApp.full_name },
                    { label: "Email", value: selectedApp.email },
                    { label: "Phone", value: selectedApp.phone },
                    { label: "Organisation", value: selectedApp.organisation },
                    { label: "Date", value: formatDate(selectedApp.date) },
                    { label: "Last Updated", value: formatDate(selectedApp.updated_at) },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground font-semibold mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.value || "N/A"}</p>
                    </div>
                  ))}
                </div>

                {/* Review feedback */}
                {selectedApp.review_feedback && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Review Feedback
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">{selectedApp.review_feedback}</p>
                  </div>
                )}

                {/* Pitch sections */}
                <div className="space-y-3">
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

                {/* Remarks / Chat */}
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Remarks</h3>
                  <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                    <PigaRemarks
                      applicationId={selectedApp.id}
                      rawRemark={selectedApp.remark ?? undefined}
                      onNewRemark={(newRemark) => {
                        selectedApp.remark = selectedApp.remark
                          ? selectedApp.remark + "\n" + JSON.stringify(newRemark)
                          : JSON.stringify(newRemark);
                      }}
                    />
                  </div>
                </div>

                {/* Edit button */}
                {(selectedApp.status === "PENDING" || selectedApp.status === "REVIEW_BACK") && (
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <Button
                      onClick={() => { setDetailOpen(false); openEditForm(selectedApp); }}
                      className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Edit Application
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================
         NEW / EDIT FORM MODAL
      ============================================================ */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setFormOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
                isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              {/* Header */}
              <div className={`flex-shrink-0 px-6 sm:px-8 py-5 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {editMode ? "Edit Application" : formStep === 0 ? "Applicant Details" : "Pitch Template"}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {formStep === 0 ? "Step 1 of 2 — Basic Information" : "Step 2 of 2 — Pitch Details"}
                  </p>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              {formStep === 1 && (
                <div className={`flex-shrink-0 h-1 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((pitchFields.filter(f => formData[f.id]?.trim()).length / pitchFields.length) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                {formStep === 1 && (
                  <div className={`mb-6 p-4 rounded-xl text-sm leading-relaxed ${
                    isDark ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}>
                    <strong>Note:</strong> Keep messages short and clear. Avoid confidential info but provide enough detail.
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {formStep === 0 ? (
                    <motion.div key="s0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                      {basicFields.map((field, i) => (
                        <motion.div key={field.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-gray-800"}`}>
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </label>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                              isDark
                                ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-white/10"
                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      {pitchFields.map((field, i) => (
                        <motion.div key={field.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className={`p-4 rounded-2xl border transition-colors ${isDark ? "bg-white/[0.02] border-white/5 hover:border-white/10" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"}`}
                        >
                          <label className={`block text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{field.label}</label>
                          {field.helper && <p className={`text-xs mb-2 ${isDark ? "text-slate-500" : "text-gray-400"}`}>{field.helper}</p>}
                          <textarea
                            rows={field.rows || 3}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                            className={`w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border transition-all ${
                              isDark
                                ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/10"
                                : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className={`flex-shrink-0 px-6 sm:px-8 py-4 border-t flex items-center justify-between ${
                isDark ? "border-white/10 bg-slate-900/80" : "border-gray-200 bg-gray-50/80"
              } backdrop-blur-sm`}>
                {formStep === 0 ? (
                  <>
                    <Button variant="outline" onClick={() => setFormOpen(false)}
                      className={`${isDark ? "border-white/10 text-gray-400 hover:text-white hover:bg-white/10" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      const missing = basicFields.filter(f => f.required && !formData[f.id]?.trim());
                      if (missing.length) { toast.error(`Fill required: ${missing.map(f => f.label).join(", ")}`); return; }
                      setFormStep(1);
                    }} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      Next: Pitch Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setFormStep(0)}
                      className={`${isDark ? "border-white/10 text-gray-400 hover:text-white hover:bg-white/10" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}
                    >
                      ← Back
                    </Button>
                    <Button onClick={handleSubmitApplication} disabled={submitting}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> {editMode ? "Update" : "Submit"} Application</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================
   PIGA REMARKS (adapted from ServiceRequestRemarks)
============================================================ */
function PigaRemarks({
  applicationId,
  rawRemark,
  onNewRemark,
}: {
  applicationId: number;
  rawRemark?: string;
  onNewRemark?: (remark: any) => void;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Parse remarks from raw string
  const remarks = React.useMemo(() => {
    if (!rawRemark) return [];
    return rawRemark.split("\n").map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  }, [rawRemark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [remarks]);

  const sendRemark = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/piga/${applicationId}/remarks/`, { message });
      onNewRemark?.(res.data.remark);
      setMessage("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Failed to send remark:", err);
      toast.error("Failed to send remark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Remarks</h3>
          <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 rounded-full">{remarks.length}</span>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {remarks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-muted-foreground py-8">
                <Send className="w-6 h-6 text-gray-400 dark:text-white/20 mb-2" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              remarks.map((r: any, i: number) => {
                const isMine = r.user_id === user?.id;
                return (
                  <div key={i} className={clsx("flex flex-col max-w-[80%]", isMine ? "ml-auto items-end" : "mr-auto")}>
                    <div className={clsx("flex items-center gap-2 mb-1 px-1 text-xs", isMine ? "justify-end" : "justify-start")}>
                      <span className="font-medium text-gray-600 dark:text-gray-300">{r.username}</span>
                    </div>
                    <div className={clsx(
                      "rounded-2xl px-4 py-3 text-sm break-words whitespace-pre-wrap",
                      isMine
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-white/5"
                    )}>
                      <div className="mb-1 text-xs opacity-80">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="leading-relaxed">{r.message}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendRemark(); } }}
                placeholder="Type here..."
                className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5 text-sm bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-white/30"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                disabled={loading || !message.trim()}
                onClick={sendRemark}
                className={clsx(
                  "p-2 rounded-lg flex-shrink-0 transition-all",
                  message.trim() && !loading
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/20"
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserPigaPage;
