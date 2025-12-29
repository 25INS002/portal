"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Key,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
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
      : user?.email;

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
    <div className="min-h-screen mt-24 max-w-6xl mx-auto p-8 space-y-8">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <CardTitle className="mt-3">{displayName}</CardTitle>
            <CardDescription>@{user?.username}</CardDescription>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {user?.is_superuser && <Badge variant="destructive">Superuser</Badge>}
              {user?.is_staff && <Badge>Staff</Badge>}
              <Badge variant="outline">Verified</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* CONTENT */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Edit your details</CardDescription>
                  </div>
                  <Button variant={isEditing ? "outline" : "default"} onClick={handleEditToggle}>
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={editForm.first_name}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={editForm.last_name}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      disabled={!isEditing}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Username</Label>
                    <Input value={user?.username} disabled />
                  </div>
                </CardContent>

                {isEditing && (
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <Info icon={<Calendar />} label="Joined" value={formatDate(user?.date_joined)} />
                  <Info icon={<Clock />} label="Last Login" value={formatDate(user?.last_login)} />
                  <Info icon={<UserCheck />} label="Status" value={user?.is_active ? "Active" : "Inactive"} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Use the <strong>Forgot Password</strong> option on login to reset your password.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

const Info = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border">
    {icon}
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  </div>
);
