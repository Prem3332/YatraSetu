import React from "react";
import { type TrafficInfo, getTrafficDotColor } from "./useMonthlyTraffic";

interface CalendarMonthProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  today: Date;
  dailyTraffic?: Record<string, TrafficInfo>;
}

export function CalendarMonth({
  year,
  month,
  selectedDate,
  onSelectDate,
  today,
  dailyTraffic,
}: CalendarMonthProps) {
  const monthName = new Date(year, month, 1).toLocaleString("en-IN", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <p style={{ textAlign: "center", fontWeight: 700, fontSize: "15px", color: "#2D4238", margin: "0 0 10px 0", fontFamily: "Georgia, serif" }}>
        {monthName} {year}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {dayLabels.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#9ca3af", fontFamily: "Poppins, sans-serif", padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} style={{ aspectRatio: "1" }} />;
          
          const cellDate = new Date(year, month, day);
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          
          const isPastOrToday = cellDate < tomorrow;
          const isUnavailable = isPastOrToday;
          const isSelected = selectedDate === dateStr;

          // Look up daily traffic info for this date
          const traffic = (!isUnavailable && dailyTraffic) ? dailyTraffic[dateStr] : undefined;
          const dotColor = traffic ? getTrafficDotColor(traffic.level) : undefined;

          let bg = "#ffffff";
          let color = "#374151";
          let border = "1.5px solid #e5e7eb";
          let boxShadow = "none";

          if (traffic && !isUnavailable) {
            border = `1.5px solid ${dotColor}33`; // subtle tinted border
          }
          if (isUnavailable) { bg = "#f3f4f6"; color = "#b0b7c3"; border = "1px solid transparent"; }
          if (isSelected) { bg = "#ea580c"; color = "#fff"; border = "2px solid #ea580c"; boxShadow = "0 3px 10px rgba(234, 88, 12, 0.35)"; }

          return (
            <button
              key={dateStr}
              disabled={isUnavailable}
              onClick={() => onSelectDate(dateStr)}
              style={{
                background: bg, border, borderRadius: "8px",
                cursor: isUnavailable ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", transition: "all 0.18s ease",
                aspectRatio: "1", padding: 0, gap: "3px",
                boxShadow,
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: isSelected ? 800 : 600, color, lineHeight: 1 }}>{day}</span>
              {dotColor && !isUnavailable && (
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: isSelected ? "#fff" : dotColor,
                  display: "inline-block",
                  transition: "background 0.15s ease",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
