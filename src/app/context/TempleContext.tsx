import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { fetchTemples, type Temple } from "../lib/api";
import { getSelectedTempleId, setStoredTempleId } from "../lib/templeUtils";
import { useAuth } from "./AuthContext";

interface TempleContextType {
  temples: Temple[];
  selectedTemple: Temple | null;
  setSelectedTemple: (temple: Temple) => void;
  refreshTemples: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isTempleAssigned: boolean;
}

const TempleContext = createContext<TempleContextType | undefined>(undefined);

export function TempleProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTemple, setSelectedTempleState] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTempleAssigned, setIsTempleAssigned] = useState(false);

  const hasFetched = useRef(false);

  const loadTemples = useCallback(async (): Promise<Temple[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTemples();
      setTemples(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load temples";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveSelection = useCallback((templeList: Temple[], user: typeof currentUser): Temple | null => {
    if (user && user.role === "temple_admin" && user.templeAssigned) {
      const assigned = templeList.find((t) => t._id === user.templeAssigned);
      if (assigned) {
        setIsTempleAssigned(true);
        return assigned;
      }
    }

    setIsTempleAssigned(false);
    const storedId = getSelectedTempleId();
    if (storedId) {
      const stored = templeList.find((t) => t._id === storedId);
      if (stored) return stored;
    }

    return templeList.length > 0 ? templeList[0] : null;
  }, []);

  const setSelectedTemple = useCallback((temple: Temple) => {
    if (isTempleAssigned) return;
    setSelectedTempleState(temple);
    setStoredTempleId(temple._id);
  }, [isTempleAssigned]);

  const refreshTemples = useCallback(async () => {
    const data = await loadTemples();
    const resolved = resolveSelection(data, currentUser);
    setSelectedTempleState(resolved);
    if (resolved) {
      setStoredTempleId(resolved._id);
    }
  }, [loadTemples, resolveSelection, currentUser]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const init = async () => {
      const templeList = await loadTemples();
      const resolved = resolveSelection(templeList, currentUser);
      setSelectedTempleState(resolved);
      if (resolved) {
        setStoredTempleId(resolved._id);
      }
    };

    init();
  }, [loadTemples, resolveSelection, currentUser]);

  // Re-resolve selection if currentUser changes (e.g. login/logout)
  useEffect(() => {
    if (!hasFetched.current || temples.length === 0) return;
    const resolved = resolveSelection(temples, currentUser);
    setSelectedTempleState(resolved);
    if (resolved) {
      setStoredTempleId(resolved._id);
    }
  }, [currentUser, temples, resolveSelection]);

  const contextValue: TempleContextType = {
    temples,
    selectedTemple,
    setSelectedTemple,
    refreshTemples,
    loading,
    error,
    isTempleAssigned,
  };

  return (
    <TempleContext.Provider value={contextValue}>
      {children}
    </TempleContext.Provider>
  );
}

export function useTemple(): TempleContextType {
  const context = useContext(TempleContext);
  if (!context) {
    throw new Error("useTemple must be used within a TempleProvider");
  }
  return context;
}
