"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Lock,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_staff: boolean;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string | null;
}

interface EditFormData {
  first_name: string;
  last_name: string;
  email: string;
}

/* ---------------- PAGE ---------------- */

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const [editForm, setEditForm] = useState<EditFormData>({
    first_name: "",
    last_name: "",
    email: "",
  });

  /* ---------------- FETCH USER ---------------- */

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUser();
    }
  }, [authLoading, isAuthenticated]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get<UserProfile>("/accounts/me/");
      setUser(res.data);
      setEditForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
      });
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEditToggle = () => {
    if (isEditing && user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
  };

  const handleChange = (field: keyof EditFormData, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put("/accounts/update-profile/", editForm);
      setUser(res.data.user);
      setSuccess(res.data.message || "Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const initials =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email?.split("@")[0] || "User";

  /* ---------------- GUARDS ---------------- */

  if (authLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-24 max-w-4xl mx-auto p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-24 max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020202] text-gray-900 dark:text-white pt-24 px-4 md:px-8 pb-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4 stroke-green-600 dark:stroke-green-400" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 text-center shadow-lg dark:shadow-none sticky top-24">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {displayName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">
                {user?.email}
              </p>
              <p className="text-xs font-mono bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400 py-1 px-3 rounded-full inline-block mb-4">
                @{user?.username}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {user?.is_superuser && (
                  <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20">
                    Superuser
                  </Badge>
                )}
                {user?.is_staff && (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                    Staff
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                >
                  Verified
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* Custom Tabs */}
            <div className="w-fit bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 flex gap-1">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "security", label: "Security", icon: Lock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    activeTab === tab.id
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="profile-tab"
                      className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-lg -z-10 border border-gray-200 dark:border-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Personal Information
                        </h3>
                        <p className="text-gray-500 dark:text-muted-foreground text-sm">
                          Edit your personal details
                        </p>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        size="sm"
                        onClick={handleEditToggle}
                        className={clsx(isEditing && "text-red-500 hover:text-red-600")}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={editForm.first_name}
                          disabled={!isEditing}
                          onChange={(e) => handleChange("first_name", e.target.value)}
                          className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={editForm.last_name}
                          disabled={!isEditing}
                          onChange={(e) => handleChange("last_name", e.target.value)}
                          className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={editForm.email}
                          disabled={!isEditing}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Username</Label>
                        <Input
                          value={user?.username}
                          disabled
                          className="bg-gray-100 dark:bg-black/40 border-gray-200 dark:border-white/5 opacity-70"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 flex justify-end"
                      >
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  {/* Account Info */}
                  <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Account Info
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoBlock
                        icon={<Calendar className="w-5 h-5 text-indigo-500" />}
                        label="Member Since"
                        value={formatDate(user?.date_joined)}
                      />
                      <InfoBlock
                        icon={<Clock className="w-5 h-5 text-purple-500" />}
                        label="Last Login"
                        value={formatDate(user?.last_login)}
                      />
                      <InfoBlock
                        icon={<UserCheck className="w-5 h-5 text-emerald-500" />}
                        label="Account Status"
                        value={user?.is_active ? "Active" : "Inactive"}
                        className="md:col-span-2"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Security Settings
                        </h3>
                        <p className="text-gray-500 dark:text-muted-foreground text-sm">
                          Manage your password and security preferences
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-800 dark:text-orange-200 text-sm">
                      <p className="font-medium mb-1 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Change Password
                      </p>
                      <p>
                        To ensure account security, please use the{" "}
                        <span className="font-bold underline">Forgot Password</span>{" "}
                        option on the login page to reset your password. We do not support
                        direct password changes from the profile dashboard at this time.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

const InfoBlock = ({ icon, label, value, className }: any) => (
  <div
    className={clsx(
      "flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5",
      className
    )}
  >
    <div className="bg-white dark:bg-white/10 p-2 rounded-lg shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400 dark:text-muted-foreground tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);
