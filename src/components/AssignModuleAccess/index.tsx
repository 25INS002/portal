"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpotlightCard from "@/components/ui/SpotlightCard";
import {
  Trash2,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  RefreshCw,
  MoreVertical,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Grid,
  List
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  last_login?: string;
}

const AssignAccess: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToModify, setUserToModify] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    is_staff: false,
    is_superuser: false,
  });
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    is_staff: false,
    is_superuser: false,
  });
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<User[]>("/adminpanel/list-users/");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query and role filter
  useEffect(() => {
    let result = users;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      if (roleFilter === "superadmin") {
        result = result.filter((user) => user.is_superuser);
      } else if (roleFilter === "admin") {
        result = result.filter((user) => user.is_staff && !user.is_superuser);
      } else if (roleFilter === "user") {
        result = result.filter((user) => !user.is_staff && !user.is_superuser);
      }
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // Handle edit form input
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
    };

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  // Create Admin
  const handleCreateAdmin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post("/adminpanel/create-admin/", form);
      toast.success("Admin created successfully");
      setForm({
        username: "",
        email: "",
        password: "",
        is_staff: false,
        is_superuser: false,
      });
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to create admin";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a user
  const startEditing = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({
      is_staff: false,
      is_superuser: false,
    });
  };

  // Save edited user
  const saveEditedUser = async (userId: number) => {
    setLoading(true);
    try {
      await api.patch(`/adminpanel/update-user/${userId}/`, editForm);
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.error || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Admin Access
  const handleToggleAdmin = async (user: User) => {
    setUserToModify(user);
    setAdminDialogOpen(true);
  };

  const confirmToggleAdmin = async () => {
    if (!userToModify) return;

    setLoading(true);
    try {
      await api.patch(`/adminpanel/update-user/${userToModify.id}/`, {
        is_staff: !userToModify.is_staff,
        is_superuser: userToModify.is_superuser,
      });
      toast.success(
        `User ${!userToModify.is_staff ? "promoted to admin" : "demoted to regular user"} successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user status");
    } finally {
      setLoading(false);
      setAdminDialogOpen(false);
      setUserToModify(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await api.delete(`/adminpanel/delete-user/${userToDelete.id}/`);
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getUserRole = (user: User) => {
    if (user.is_superuser) return "Superadmin";
    if (user.is_staff) return "Admin";
    return "User";
  };

  const getRoleVariant = (user: User) => {
    if (user.is_superuser) return "destructive"; // Or a custom color
    if (user.is_staff) return "default";
    return "secondary";
  };
  
  const getRoleColor = (user: User) => {
    if (user.is_superuser) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (user.is_staff) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <div className="w-full relative min-h-screen bg-background pt-32 pb-12 px-6">
       {/* Ambient Highlights */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
       
       <div className="max-w-7xl mx-auto space-y-8 z-10 relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400"
                >
                  Access Management
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-muted-foreground mt-1"
                >
                  Manage system administrators, user roles, and permissions
                </motion.p>
             </div>
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Button 
                   onClick={fetchUsers} disabled={loading}
                   className="rounded-full bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white backdrop-blur-md shadow-sm dark:shadow-none"
                >
                   <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                   Refresh List
                </Button>
             </motion.div>
          </div>

          {/* Create Admin Card */}
          <SpotlightCard className="p-8 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none" spotlightColor="rgba(255,255,255,0.05)">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner shadow-indigo-500/10">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Admin</h2>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Grant system access to new administrators</p>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground ml-1">Username</Label>
                    <div className="relative">
                       <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                       <Input 
                          name="username" value={form.username} onChange={handleChange} 
                          className={`pl-9 bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 focus:border-indigo-500/50 text-gray-900 dark:text-white ${formErrors.username ? "border-red-500/50" : ""}`}
                          placeholder="e.g. admin_jane"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground ml-1">Email Address</Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                       <Input 
                          name="email" value={form.email} onChange={handleChange} 
                          className={`pl-9 bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 focus:border-indigo-500/50 text-gray-900 dark:text-white ${formErrors.email ? "border-red-500/50" : ""}`}
                          placeholder="jane@company.com"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground ml-1">Password</Label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                       <Input 
                          type="password" name="password" value={form.password} onChange={handleChange} 
                          className={`pl-9 bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 focus:border-indigo-500/50 text-gray-900 dark:text-white ${formErrors.password ? "border-red-500/50" : ""}`}
                          placeholder="••••••••"
                       />
                    </div>
                 </div>
             </div>
             
             <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6">
                 <div className="flex items-center gap-6">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                           <input type="checkbox" name="is_staff" checked={form.is_staff} onChange={handleChange} 
                             className="peer h-4 w-4 appearance-none rounded border border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-black/20 checked:border-indigo-500 checked:bg-indigo-500 transition-all"
                           />
                           <ShieldCheck className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white w-3 h-3 left-0.5" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">Grant Staff Access</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                           <input type="checkbox" name="is_superuser" checked={form.is_superuser} onChange={handleChange} 
                             className="peer h-4 w-4 appearance-none rounded border border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-black/20 checked:border-red-500 checked:bg-red-500 transition-all"
                           />
                           <ShieldAlert className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white w-3 h-3 left-0.5" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">Grant Superuser</span>
                     </label>
                 </div>

                 <Button onClick={handleCreateAdmin} disabled={loading} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                 </Button>
             </div>
          </SpotlightCard>

          {/* Users List */}
           <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl backdrop-blur-md shadow-sm dark:shadow-none">
                 <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg">
                       <Search className="w-4 h-4 text-gray-500 dark:text-white" />
                    </div>
                    <Input 
                       placeholder="Search users..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="bg-transparent border-none focus:ring-0 w-full md:w-[300px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                    />
                 </div>
                
                <div className="flex items-center gap-3">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                       <SelectTrigger className="w-[140px] bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 h-9 text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-muted-foreground text-xs uppercase font-semibold">
                             <Filter className="w-3 h-3" />
                             <SelectValue />
                          </div>
                       </SelectTrigger>
                       <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                         <SelectItem value="all">All Roles</SelectItem>
                         <SelectItem value="superadmin">Superadmin</SelectItem>
                         <SelectItem value="admin">Admin</SelectItem>
                         <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 mx-1" />
                   <span className="text-xs text-muted-foreground"><strong className="text-gray-900 dark:text-white">{filteredUsers.length}</strong> Users</span>
                 </div>
                 
                  {/* View Toggle */}
                   <div className="flex bg-white dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    {(["grid", "list"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={clsx(
                          "relative p-2 rounded-lg transition-colors duration-300 z-0",
                          viewMode === mode ? "text-primary" : "text-muted-foreground hover:text-white"
                        )}
                      >
                         {viewMode === mode && (
                           <motion.div
                             layoutId="active-view-mode"
                             className="absolute inset-0 bg-gray-100 dark:bg-primary/20 rounded-lg -z-10"
                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                           />
                         )}
                        {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
             </div>

             <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                <AnimatePresence mode="popLayout">
                   {filteredUsers.map((user) => (
                      <motion.div 
                         key={user.id}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className={viewMode === 'list' ? "w-full" : "h-full"}
                      >
                        {viewMode === 'grid' ? (
                             <SpotlightCard className="h-full bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 flex flex-col p-6 items-center text-center group relative overflow-hidden shadow-sm dark:shadow-none" disableAnimations>
                                 {/* Role Badge Absolute */}
                                <div className="absolute top-4 right-4">
                                     <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 border-0 ${getRoleColor(user)}`}>
                                         {getUserRole(user)}
                                     </Badge>
                                </div>

                                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner mb-4 ${user.is_superuser ? "bg-gradient-to-br from-red-500 to-orange-500 text-white" : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300"}`}>
                                    {user.username.charAt(0).toUpperCase()}
                                 </div>
                                 
                                 <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{user.username}</h3>
                                 <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">{user.email}</p>
                                
                                 <div className="text-xs text-muted-foreground mb-6 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/5">
                                     Joined {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                                 </div>
                                 
                                 <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-white/10 flex justify-center gap-2">
                                     <Button 
                                       size="sm" 
                                       variant="ghost" 
                                       onClick={() => startEditing(user)}
                                       className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                       title="Edit Permissions"
                                    >
                                       <Edit className="w-4 h-4" />
                                    </Button>

                                    {!user.is_superuser && (
                                       <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleToggleAdmin(user)}
                                          className={`h-8 w-8 ${user.is_staff ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10"}`}
                                          title={user.is_staff ? "Revoke Admin Access" : "Grant Admin Access"}
                                       >
                                          {user.is_staff ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                       </Button>
                                    )}

                                    <Button 
                                       size="sm" 
                                       variant="ghost" 
                                       onClick={() => handleDeleteUser(user)}
                                       className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                       title="Delete User"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </SpotlightCard>
                         ) : (
                           <SpotlightCard className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none" disableAnimations>
                              <div className="flex flex-row items-center justify-between w-full gap-4">
                               <div className="flex items-center gap-4 min-w-0">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0 ${user.is_superuser ? "bg-gradient-to-br from-red-500 to-orange-500 text-white" : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300"}`}>
                                      {user.username.charAt(0).toUpperCase()}
                                   </div>
                                   <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                         <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.username}</h3>
                                         <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 border-0 ${getRoleColor(user)} shrink-0`}>
                                           {getUserRole(user)}
                                        </Badge>
                                     </div>
                                     <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6 shrink-0">
                                   <div className="text-xs text-muted-foreground flex flex-col items-end hidden sm:flex">
                                      <span>Joined</span>
                                      <span className="text-gray-400">{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</span>
                                   </div>

                                   {editingUser === user.id ? (
                                      <div className="flex items-center gap-2">
                                         <div className="flex flex-col gap-1 mr-4">
                                            <label className="flex items-center gap-2 text-xs">
                                               <input type="checkbox" name="is_staff" checked={editForm.is_staff} onChange={handleEditChange} /> Staff
                                            </label>
                                            <label className="flex items-center gap-2 text-xs">
                                               <input type="checkbox" name="is_superuser" checked={editForm.is_superuser} onChange={handleEditChange} /> SA
                                            </label>
                                         </div>
                                         <Button size="sm" onClick={() => saveEditedUser(user.id)} className="h-8 bg-green-600/20 text-green-400 hover:bg-green-600/30">
                                            <Save className="w-3 h-3 mr-1" /> Save
                                         </Button>
                                         <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8">
                                            <X className="w-3 h-3" />
                                         </Button>
                                      </div>
                                   ) : (
                                      <div className="flex items-center gap-1">
                                          <Button 
                                             size="icon" 
                                             variant="ghost" 
                                             onClick={() => startEditing(user)}
                                             className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                             title="Edit Permissions"
                                          >
                                             <Edit className="w-4 h-4" />
                                          </Button>

                                          {!user.is_superuser && (
                                             <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleToggleAdmin(user)}
                                                className={`h-8 w-8 ${user.is_staff ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10"}`}
                                                title={user.is_staff ? "Revoke Admin Access" : "Grant Admin Access"}
                                             >
                                                {user.is_staff ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                             </Button>
                                          )}

                                          <Button 
                                             size="icon" 
                                             variant="ghost" 
                                             onClick={() => handleDeleteUser(user)}
                                             className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                             title="Delete User"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                          </Button>
                                       </div>
                                   )}
                               </div>
                             </div>
                          </SpotlightCard>
                        )}
                      </motion.div>
                   ))}
                </AnimatePresence>
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-white dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                       No users found matching your search.
                    </div>
                )}
             </div>
          </div>
       </div>

       {/* Dialogs */}
       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{userToDelete?.username}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={loading}>
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
           <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                 {userToModify?.is_staff 
                    ? `Revoke administrative privileges from ${userToModify?.username}?`
                    : `Promote ${userToModify?.username} to Administrator?`
                 }
              </DialogDescription>
           </DialogHeader>
           <DialogFooter>
              <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmToggleAdmin} disabled={loading} className="bg-white text-black hover:bg-white/90">
                 Confirm Update
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AssignAccess;

