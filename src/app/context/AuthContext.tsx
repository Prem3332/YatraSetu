import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchCurrentUser, type ApiUser } from "../lib/api";

interface AuthContextType {
  currentUser: ApiUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    const token = localStorage.getItem("yatrasetu_token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await fetchCurrentUser();
      setCurrentUser(user);
    } catch (err: unknown) {
      setCurrentUser(null);
      setError(err instanceof Error ? err.message : "Failed to load user");
      // Clean up invalid tokens
      localStorage.removeItem("yatrasetu_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refreshUser = async () => {
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("yatrasetu_token");
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === "temple_admin";

  const contextValue: AuthContextType = {
    currentUser,
    loading,
    error,
    isAdmin,
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
