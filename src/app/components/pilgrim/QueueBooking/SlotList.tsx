import React from "react";
import { Loader2 } from "lucide-react";
import type { SlotAvailability } from "../../../lib/api";
import { type TrafficInfo } from "./useMonthlyTraffic";

interface SlotListProps {
  availableSlots: SlotAvailability[];
  loadingSlots: boolean;
  slotError: string | null;
  selectedSlot: string | null;
  setSelectedSlot: (time: string) => void;
  onRetry: () => void;
  title: string;
}

// We need getTrafficInfo locally for slots
function getTrafficInfo(slot: SlotAvailability): TrafficInfo {
  const occupancy = slot.capacity > 0 ? (slot.booked / slot.capacity) * 100 : 100;

  if (occupancy >= 100 || slot.status === "full" || slot.available === 0) {
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

export function SlotList({
  availableSlots,
  loadingSlots,
  slotError,
  selectedSlot,
  setSelectedSlot,
  onRetry,
  title
}: SlotListProps) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          {title}
        </p>
        {loadingSlots && <Loader2 size={14} color="#C84B31" style={{ animation: "spin 1s linear infinite" }} />}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {availableSlots.length > 0 ? availableSlots.map((slot) => {
          const isFull = slot.status === "full" || slot.available === 0;
          const isSelected = selectedSlot === slot.time;
          const traffic = getTrafficInfo(slot);
          return (
            <button
              key={slot.time}
              onClick={() => !isFull && setSelectedSlot(slot.time)}
              disabled={isFull}
              style={{
                background: isSelected ? "#C84B31" : isFull ? "#f4f2ee" : "#FFF3E8",
                border: isSelected ? "2px solid #C84B31" : isFull ? "2px solid #e5e7eb" : "2px solid #FED7AA",
                cursor: isFull ? "not-allowed" : "pointer",
                borderRadius: "12px", padding: "8px 4px",
                fontFamily: "Poppins, sans-serif", opacity: isFull ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, color: isSelected ? "#fff" : isFull ? "#9ca3af" : "#2D4238", margin: 0 }}>{slot.time}</p>
              <p style={{ fontSize: "9px", color: isSelected ? "rgba(255,255,255,0.8)" : isFull ? "#9ca3af" : "#C84B31", margin: 0, fontWeight: 600 }}>
                {isFull ? "FULL" : `${slot.available} Left`}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "3px",
                marginTop: "4px", padding: "1px 6px",
                borderRadius: "6px",
                background: isSelected ? "rgba(255,255,255,0.2)" : traffic.bgColor,
                transition: "all 0.15s",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: isSelected ? "#fff" : traffic.color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: "7px", fontWeight: 700, lineHeight: 1,
                  color: isSelected ? "rgba(255,255,255,0.9)" : traffic.color,
                  whiteSpace: "nowrap",
                }}>
                  {traffic.label}
                </span>
              </div>
            </button>
          );
        }) : !loadingSlots && (
          <div style={{ gridColumn: "span 3", textAlign: "center", padding: "16px 0" }}>
            {slotError ? (
              <>
                <p style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600, margin: "0 0 4px 0" }}>
                  ⚠️ {slotError}
                </p>
                <button
                  onClick={onRetry}
                  style={{
                    fontSize: "11px", fontWeight: 700, color: "#C84B31",
                    background: "rgba(200,75,49,0.1)", border: "1px solid rgba(200,75,49,0.2)",
                    borderRadius: "8px", padding: "6px 16px", cursor: "pointer",
                    fontFamily: "Poppins, sans-serif", marginTop: "6px",
                  }}
                >
                  Retry
                </button>
              </>
            ) : (
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                No slots configured for this date.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
