"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api, { setAccessToken } from "@/lib/api";

// -----------------------------
// Types
// -----------------------------
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string | null;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------
  // Check auth (Bearer token)
  // -----------------------------
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);

    try {
      // 🔐 Read token directly (source of truth)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      // 🚫 No token → definitely not authenticated
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // ✅ Token exists → ask backend
      setAccessToken(token);
      const response = await api.get("/accounts/me/");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      // ❌ Token invalid / expired
      localStorage.removeItem("access_token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -----------------------------
  // Login
  // -----------------------------
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/accounts/login/", {
        email,
        password,
      });

      // 🔑 Store token in memory
      setAccessToken(response.data.access_token);

      // Fetch user
      await checkAuthStatus();
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // Logout (client-side)
  // -----------------------------
  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // -----------------------------
  // Initial auth check (optional)
  // -----------------------------
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        checkAuthStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
