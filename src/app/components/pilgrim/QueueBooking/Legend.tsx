import React from "react";

export function Legend({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        padding: isMobile ? "6px 10px 14px" : "6px 14px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "6px 12px",
      }}
    >
      {[
        { color: "#16A34A", label: "Available" },
        { color: "#D97706", label: "Medium" },
        { color: "#DC2626", label: "High" },
        { color: "#b0b7c3", label: "Not Available" },
        { color: "#ea580c", label: "Selected", isSelected: true as const },
      ].map(({ color, label, isSelected }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {isSelected ? (
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: color }} />
          ) : (
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
          )}
          <span style={{ fontSize: "9px", fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
