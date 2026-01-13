"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { 
  Mail, 
  User, 
  Clock, 
  Search, 
  RefreshCw, 
  Save, 
  MessageSquare, 
  CheckCircle2, 
  Archive, 
  AlertCircle,
  Inbox,
  Send,
  Loader2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  admin_note: string;
  created_at: string;
};

const STATUS_CONFIG = {
  NEW: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: AlertCircle, label: "New" },
  READ: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: CheckCircle2, label: "Read" },
  REPLIED: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: Send, label: "Replied" },
  ARCHIVED: { color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: Archive, label: "Archived" },
};

export default function ContactAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // If "ALL", don't send status param. If specific tab, send that status.
      const statusParam = activeTab === "ALL" ? undefined : activeTab;
      
      const res = await api.get("/query/admin/contact/", {
        params: { q: search || undefined, status: statusParam },
      });
      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab]); // Refetch when tab changes

  // Debounced search could be added here, currently just triggers on enter or refresh button

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'NEW').length,
    read: messages.filter(m => m.status === 'READ').length,
    replied: messages.filter(m => m.status === 'REPLIED').length,
  };

  return (
    <div className="min-h-screen w-full bg-background py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Feedback Inbox
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage user inquiries, bug reports, and feedback.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-none">
            {["ALL", "NEW", "READ", "REPLIED", "ARCHIVED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 z-0",
                  activeTab === tab 
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-feedback"
                    className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-lg -z-10 border border-gray-200 dark:border-white/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab === "ALL" ? "All Messages" : STATUS_CONFIG[tab as keyof typeof STATUS_CONFIG]?.label || tab}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMessages()}
              className="pl-11 h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-black/30"
            />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <Button 
                onClick={fetchMessages}
                className="h-12 flex-1 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-foreground"
            >
                <RefreshCw className={clsx("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh
            </Button>
            <div className="h-12 w-24 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center bg-white dark:bg-transparent shadow-sm dark:shadow-none">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary leading-none">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
            >
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading inbox...</p>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-foreground">No messages found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    {search ? "Try adjusting your search terms." : "Your inbox is empty. Good job catching up!"}
                </p>
                {search && (
                    <Button 
                        variant="link" 
                        onClick={() => { setSearch(""); fetchMessages(); }}
                        className="mt-4 text-primary"
                    >
                        Clear Search
                    </Button>
                )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {messages.map((msg, index) => (
                <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <ContactCard msg={msg} onUpdated={fetchMessages} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   MESSAGE CARD COMPONENT
-------------------------------------------------- */

function ContactCard({
  msg,
  onUpdated,
}: {
  msg: ContactMessage;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(msg.status);
  const [note, setNote] = useState(msg.admin_note || "");
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = STATUS_CONFIG[msg.status as keyof typeof STATUS_CONFIG]?.icon || AlertCircle;
  const statusColor = STATUS_CONFIG[msg.status as keyof typeof STATUS_CONFIG]?.color || "bg-gray-500/20";
  const statusLabel = STATUS_CONFIG[msg.status as keyof typeof STATUS_CONFIG]?.label || msg.status;

  const saveChanges = async () => {
    setSaving(true);
    try {
        await api.patch(`/query/admin/contact/${msg.id}/`, {
        status,
        admin_note: note,
        });
        toast.success("Message updated");
        onUpdated();
    } catch (err) {
        toast.error("Failed to update message");
    } finally {
        setSaving(false);
    }
  };

  return (
    <SpotlightCard className="border-gray-200 dark:border-white/5 bg-white dark:bg-black/40 backdrop-blur-md shadow-sm dark:shadow-none" disableAnimations>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Info & Avatar */}
            <div className="md:w-64 flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-semibold text-gray-900 dark:text-foreground truncate" title={msg.name}>{msg.name}</h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 truncate" title={msg.email}>
                            <Mail className="w-3 h-3" />
                            {msg.email}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                     <Badge variant="outline" className={clsx("w-fit px-2 py-1 flex items-center gap-1.5 border", statusColor)}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabel}
                    </Badge>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Right Column: Content & Controls */}
            <div className="flex-1 flex flex-col gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">{msg.subject}</h2>
                    <div className={clsx(
                        "text-sm text-gray-600 dark:text-muted-foreground bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/5 leading-relaxed whitespace-pre-wrap transition-all duration-500",
                        !isExpanded && "line-clamp-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10"
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                    >
                        {msg.message}
                    </div>
                    {!isExpanded && msg.message.length > 150 && (
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="text-xs text-primary mt-2 hover:underline font-medium"
                        >
                            Read More
                        </button>
                    )}
                </div>

                {/* Interactive Admin Section */}
                <div className="grid md:grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Update Status</label>
                        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                            <SelectTrigger className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 h-9 text-sm text-gray-900 dark:text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/10 backdrop-blur-xl">
                                <SelectItem value="NEW">New</SelectItem>
                                <SelectItem value="READ">Read</SelectItem>
                                <SelectItem value="REPLIED">Replied</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Internal Note</label>
                         <div className="flex gap-2">
                            <Input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a note..."

                                className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 h-9 text-sm text-gray-900 dark:text-white focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                            {(status !== msg.status || note !== (msg.admin_note || "")) && (
                                <Button size="sm" onClick={saveChanges} disabled={saving} className="bg-primary h-9 px-3">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </Button>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
