import { useState, useEffect, useMemo } from "react";
import { fetchMonthlyAvailability, DailyTraffic } from "../../../lib/api";

export type TrafficLevel = "available" | "low" | "medium" | "high" | "full";

export interface TrafficInfo {
  level: TrafficLevel;
  label: string;
  color: string;
  bgColor: string;
}

export function getTrafficInfoFromOccupancy(capacity: number, booked: number, available: number): TrafficInfo {
  const occupancy = capacity > 0 ? (booked / capacity) * 100 : 100;

  if (occupancy >= 100 || available === 0) {
    return { level: "full", label: "Full", color: "#991B1B", bgColor: "rgba(239,68,68,0.15)" };
  }
  if (occupancy >= 75) {
    return { level: "high", label: "High Traffic", color: "#DC2626", bgColor: "rgba(239,68,68,0.10)" };
  }
  if (occupancy >= 50) {
    return { level: "medium", label: "Medium Traffic", color: "#D97706", bgColor: "rgba(245,158,11,0.12)" };
  }
  if (occupancy >= 25) {
    return { level: "low", label: "Low Traffic", color: "#16A34A", bgColor: "rgba(22,163,74,0.10)" };
  }
  return { level: "available", label: "Available", color: "#15803D", bgColor: "rgba(21,128,61,0.08)" };
}

export function getTrafficDotColor(level: TrafficLevel): string {
  switch (level) {
    case "available":
    case "low":
      return "#16A34A"; // green
    case "medium":
      return "#D97706"; // orange
    case "high":
    case "full":
      return "#DC2626"; // red
    default:
      return "#16A34A";
  }
}

// Global cache to persist across component mounts
const monthlyTrafficCache: Record<string, Record<string, DailyTraffic>> = {};

export function useMonthlyTraffic(templeId: string | null, year1: number, month1: number, year2: number, month2: number) {
  const [cacheTrigger, setCacheTrigger] = useState(0);

  useEffect(() => {
    if (!templeId) return;

    let mounted = true;
    const fetchMonth = async (year: number, month: number) => {
      const key = `${templeId}-${year}-${month}`;
      if (monthlyTrafficCache[key]) return;

      try {
        const data = await fetchMonthlyAvailability(templeId, year, month);
        if (mounted) {
          monthlyTrafficCache[key] = data;
          setCacheTrigger((c) => c + 1);
        }
      } catch (err) {
        console.error("Failed to fetch monthly traffic:", err);
      }
    };

    fetchMonth(year1, month1 + 1);
    fetchMonth(year2, month2 + 1);

    return () => {
      mounted = false;
    };
  }, [templeId, year1, month1, year2, month2]);

  const dailyTrafficMonth1 = useMemo(() => {
    if (!templeId) return undefined;
    const raw = monthlyTrafficCache[`${templeId}-${year1}-${month1 + 1}`];
    if (!raw) return undefined;
    const result: Record<string, TrafficInfo> = {};
    for (const [dateStr, dt] of Object.entries(raw)) {
      result[dateStr] = getTrafficInfoFromOccupancy(dt.totalCapacity, dt.totalBooked, dt.totalAvailable);
    }
    return result;
  }, [templeId, year1, month1, cacheTrigger]);

  const dailyTrafficMonth2 = useMemo(() => {
    if (!templeId) return undefined;
    const raw = monthlyTrafficCache[`${templeId}-${year2}-${month2 + 1}`];
    if (!raw) return undefined;
    const result: Record<string, TrafficInfo> = {};
    for (const [dateStr, dt] of Object.entries(raw)) {
      result[dateStr] = getTrafficInfoFromOccupancy(dt.totalCapacity, dt.totalBooked, dt.totalAvailable);
    }
    return result;
  }, [templeId, year2, month2, cacheTrigger]);

  return { dailyTrafficMonth1, dailyTrafficMonth2 };
}
