import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

import { fetchTemples, fetchCurrentUser, type Temple, type ApiUser } from "../lib/api";
import { getSelectedTempleId, setStoredTempleId } from "../lib/templeUtils";

// ── Context shape ──────────────────────────────────────────────

interface TempleContextType {
  /** All temples loaded from the API */
  temples: Temple[];
  /** Currently selected temple (null while loading or if none exist) */
  selectedTemple: Temple | null;
  /** Select a temple (no-op if temple is assigned by admin) */
  setSelectedTemple: (temple: Temple) => void;
  /** Re-fetch the temple list from the API */
  refreshTemples: () => Promise<void>;
  /** True while the initial temple fetch is in progress */
  loading: boolean;
  /** Error message if the API call failed */
  error: string | null;
  /** The currently logged-in user (null if not authenticated) */
  currentUser: ApiUser | null;
  /** True if the user is a temple_admin with an assigned temple (dropdown locked) */
  isTempleAssigned: boolean;
}

const TempleContext = createContext<TempleContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────

interface TempleProviderProps {
  children: ReactNode;
}

export function TempleProvider({ children }: TempleProviderProps) {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTemple, setSelectedTempleState] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [isTempleAssigned, setIsTempleAssigned] = useState(false);

  // Prevent double-fetching in React StrictMode
  const hasFetched = useRef(false);

  // ── Load temples ──────────────────────────────────────────

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

  // ── Resolve which temple to select ────────────────────────

  const resolveSelection = useCallback(
    (templeList: Temple[], user: ApiUser | null): Temple | null => {
      // Task 6: If user is a temple_admin with an assigned temple, force-select it
      if (
        user &&
        user.role === "temple_admin" &&
        user.templeAssigned
      ) {
        const assigned = templeList.find((t) => t._id === user.templeAssigned);
        if (assigned) {
          setIsTempleAssigned(true);
          return assigned;
        }
      }

      // Task 3: Try restoring from localStorage
      const storedId = getSelectedTempleId();
      if (storedId) {
        const stored = templeList.find((t) => t._id === storedId);
        if (stored) return stored;
      }

      // Fallback: select the first temple
      return templeList.length > 0 ? templeList[0] : null;
    },
    []
  );

  // ── Set selected temple (with persistence) ────────────────

  const setSelectedTemple = useCallback(
    (temple: Temple) => {
      // Task 6: Block changes if temple is assigned by admin
      if (isTempleAssigned) return;

      setSelectedTempleState(temple);
      setStoredTempleId(temple._id);
    },
    [isTempleAssigned]
  );

  // ── Refresh temples (public API) ──────────────────────────

  const refreshTemples = useCallback(async () => {
    const data = await loadTemples();
    const resolved = resolveSelection(data, currentUser);
    setSelectedTempleState(resolved);
    if (resolved) {
      setStoredTempleId(resolved._id);
    }
  }, [loadTemples, resolveSelection, currentUser]);

  // ── Initial fetch on mount ────────────────────────────────

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const init = async () => {
      // Fetch user (silently skip if not authenticated)
      let user: ApiUser | null = null;
      try {
        user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch {
        // Not logged in or no token — this is fine
      }

      // Fetch temples
      const templeList = await loadTemples();

      // Resolve selection
      const resolved = resolveSelection(templeList, user);
      setSelectedTempleState(resolved);
      if (resolved) {
        setStoredTempleId(resolved._id);
      }
    };

    init();
  }, [loadTemples, resolveSelection]);

  // ── Context value ─────────────────────────────────────────

  const contextValue: TempleContextType = {
    temples,
    selectedTemple,
    setSelectedTemple,
    refreshTemples,
    loading,
    error,
    currentUser,
    isTempleAssigned,
  };

  return (
    <TempleContext.Provider value={contextValue}>
      {children}
    </TempleContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useTemple(): TempleContextType {
  const context = useContext(TempleContext);
  if (!context) {
    throw new Error("useTemple must be used within a TempleProvider");
  }
  return context;
}
