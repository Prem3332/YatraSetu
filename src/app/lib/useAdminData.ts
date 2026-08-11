import { useState, useEffect, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import {
  fetchAdminBookings,
  fetchAdminStatistics,
  updateSlotStatus,
  deleteAdminSlot,
  type AdminBooking,
  type AdminBookingsPagination,
  type AdminStatistics,
  type BookingFilters,
} from "./api";

export function useAdminData(templeId?: string) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<AdminBookingsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);

  const [filters, setFiltersState] = useState<BookingFilters>({
    status: "All",
    search: "",
    page: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const activeFilters: BookingFilters = {
        ...filters,
        temple: templeId,
      };

      const [bookingsRes, statsRes] = await Promise.all([
        fetchAdminBookings(activeFilters),
        fetchAdminStatistics(templeId),
      ]);

      setBookings(bookingsRes.bookings);
      setPagination(bookingsRes.pagination);
      setStatistics(statsRes);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, templeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!templeId) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const SOCKET_URL = API_BASE_URL.replace("/api", "");

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to Real-Time Queue Updates");
    });

    socket.on("QUEUE_UPDATED", (data) => {
      if (data.templeId === templeId) {
        console.log("⚡ Real-time update received, refreshing data silently...");
        loadData(true);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from Real-Time Updates");
    });

    return () => {
      socket.disconnect();
    };
  }, [templeId, loadData]);

  const setFilter = useCallback((key: keyof BookingFilters, value: any) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // Reset to page 1 unless paginating
    }));
  }, []);

  const changePage = useCallback((newPage: number) => {
    setFiltersState((prev) => ({ ...prev, page: newPage }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setFiltersState((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const handleUpdateStatus = useCallback(
    async (slotId: string, newStatus: "booked" | "serving" | "completed" | "cancelled") => {
      try {
        setUpdatingId(slotId);
        await updateSlotStatus(slotId, newStatus);
        await loadData();
      } catch (err: any) {
        console.error("Failed to update status:", err);
        alert(`Failed to update status: ${err.message || "Server error"}`);
      } finally {
        setUpdatingId(null);
      }
    },
    [loadData]
  );

  const handleDeleteBooking = useCallback(
    async (slotId: string) => {
      if (!window.confirm("Are you sure you want to completely delete this booking? This action cannot be undone.")) return;
      try {
        setUpdatingId(slotId);
        await deleteAdminSlot(slotId);
        await loadData();
      } catch (err: any) {
        console.error("Failed to delete booking:", err);
        alert(`Failed to delete booking: ${err.message || "Server error"}`);
      } finally {
        setUpdatingId(null);
      }
    },
    [loadData]
  );

  return {
    bookings,
    pagination,
    statistics,
    filters,
    loading,
    error,
    updatingId,
    setFilter,
    changePage,
    changeLimit,
    updateStatus: handleUpdateStatus,
    deleteBooking: handleDeleteBooking,
    refresh: loadData,
  };
}
