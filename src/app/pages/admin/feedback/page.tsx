"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mail, User, Clock, Search, RefreshCw, Save } from "lucide-react";
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

const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-800",
  READ: "bg-yellow-100 text-yellow-800",
  REPLIED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

export default function ContactAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const fetchMessages = async () => {
    setLoading(true);
    const res = await api.get("/query/admin/contact/", {
      params: { q: search || undefined, status: status || undefined },
    });
    setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */} 
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Contact Inbox
          </h1>
          <Button onClick={fetchMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search name, email, subject, message"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-black dark:bg-white dark:text-black"
          >
            <option value="">All</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <Button onClick={fetchMessages}>Apply</Button>
        </div>

        {/* Messages */}
        {loading ? (
          <p className="text-gray-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages found.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ContactCard key={msg.id} msg={msg} onUpdated={fetchMessages} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------
   MESSAGE CARD
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

  const saveChanges = async () => {
    setSaving(true);
    await api.patch(`/query/admin/contact/${msg.id}/`, {
      status,
      admin_note: note,
    });
    setSaving(false);
    onUpdated();
  };

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {msg.subject}
              <Badge className={clsx("text-xs", STATUS_COLORS[msg.status])}>
                {msg.status}
              </Badge>
            </CardTitle>

            <div className="text-sm text-muted-foreground flex flex-wrap gap-4 mt-1">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {msg.name} ({msg.email})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
          {msg.message}
        </div>

        {/* Admin controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            >
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Admin Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note (not visible to user)"
              className="mt-1"
            />
          </div>
        </div>

        <Button onClick={saveChanges} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}
