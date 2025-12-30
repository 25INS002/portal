"use client";

import { useState, useRef, useEffect } from "react";
import { parseRemarks, Remark } from "@/utils/parseRemarks";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Send, Paperclip, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function ServiceRequestRemarks({
  requestId,
  rawRemark,
  onNewRemark,
}: {
  requestId: number;
  rawRemark?: string;
  onNewRemark?: (remark: Remark) => void;
}) {
  const { user } = useAuth();
  const remarks = parseRemarks(rawRemark);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [remarks]);

  const sendRemark = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/services/requests/${requestId}/remarks/`, {
        message,
      });

      onNewRemark?.(res.data.remark);
      setMessage("");
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Failed to send remark:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRemark();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Remarks
          </h3>
          <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
            {remarks.length} messages
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Messages Container */}
      {isExpanded && (
        <div
          className={clsx(
            "flex-1 overflow-y-auto p-4 space-y-3",
            "min-h-[300px]",
            isExpanded ? "h-[calc(100vh-200px)]" : "h-[250px] md:h-[300px]"
          )}
        >
          {remarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Send className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1 text-center">
                Start the conversation by sending a message
              </p>
            </div>
          ) : (
            <>
              {remarks.map((r, i) => {
                const isMine = r.user_id === user?.id;
                const isAdmin = r.by === "admin";
                const isSystem = r.by === "system";

                return (
                  <div
                    key={i}
                    className={clsx(
                      "flex flex-col max-w-[85%] md:max-w-[75%]",
                      isMine ? "ml-auto items-end" : "mr-auto"
                    )}
                  >
                    {/* Sender info */}
                    <div
                      className={clsx(
                        "flex items-center gap-2 mb-1 px-1 text-xs",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMine && (
                        <div
                          className={clsx(
                            "w-2 h-2 rounded-full",
                            isAdmin
                              ? "bg-emerald-500"
                              : isSystem
                              ? "bg-gray-500"
                              : "bg-blue-500"
                          )}
                        />
                      )}
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {r.username}
                      </span>
                      {isMine && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={clsx(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                        "break-words whitespace-pre-wrap",
                        isMine
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                          : isAdmin
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-gray-900 dark:text-emerald-100 rounded-bl-none"
                          : isSystem
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-bl-none"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                      )}
                    >
                      <div className="mb-1 text-xs opacity-80">
                        {new Date(r.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="leading-relaxed">{r.message}</div>
                    </div>

                    {/* Date for first message of the day or new day */}
                    {(i === 0 ||
                      new Date(r.timestamp).toDateString() !==
                        new Date(remarks[i - 1].timestamp).toDateString()) && (
                      <div className="text-center my-4">
                        <span className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                          {new Date(r.timestamp).toLocaleDateString([], {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-4">
          <div className="flex gap-2">
            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Remark"
                className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 pr-20 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  {message.length}/500
                </span>
              </div>
            </div>

            {/* Send button */}
            <button
              disabled={loading || !message.trim()}
              onClick={sendRemark}
              className={clsx(
                "p-2 rounded-lg flex-shrink-0 transition-all duration-200",
                message.trim() && !loading
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              )}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
