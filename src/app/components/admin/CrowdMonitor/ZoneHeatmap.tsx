import { useState } from "react";
import type { Temple } from "../../../lib/api";

interface ZoneHeatmapProps {
  zones: any[];
  statusColor: Record<string, string>;
  selectedTemple: Temple | null;
}

export function ZoneHeatmap({ zones, statusColor, selectedTemple }: ZoneHeatmapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const hovered = zones.find((z) => z.id === hoveredZone);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>
          Interactive Zone Heatmap
        </h3>
        <div className="flex items-center gap-3">
          {[["Low", "#22C55E"], ["Moderate", "#F59E0B"], ["High", "#EF4444"]].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px", position: "relative" }}>
        <svg viewBox="0 0 560 340" style={{ width: "100%", height: "280px", cursor: "pointer" }}>
          <defs>
            <pattern id="adminGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45, 66, 56,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="560" height="340" fill="#F5F0E6" rx="12" />
          <rect width="560" height="340" fill="url(#adminGrid)" rx="12" />

          {/* Temple boundary */}
          <rect
            x="40" y="50" width="480" height="270" rx="14"
            fill="white" stroke="rgba(45, 66, 56,0.1)" strokeWidth="1.5" strokeDasharray="8 5"
          />
          <text
            x="280" y="36" textAnchor="middle"
            fill="#9ca3af" fontSize="11" fontWeight="600" fontFamily="Poppins, sans-serif"
          >
            {(selectedTemple?.name ?? "TEMPLE").toUpperCase()} COMPLEX
          </text>

          {zones.map((zone) => {
            const isHovered = hoveredZone === zone.id;
            const color = statusColor[zone.status];
            const opacity = zone.density / 100;
            return (
              <g
                key={zone.id}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx="10"
                  fill={color}
                  fillOpacity={0.15 + opacity * 0.65}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    filter: isHovered ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none",
                    transition: "all 0.15s",
                  }}
                />
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + zone.h / 2 - 6}
                  textAnchor="middle"
                  fill={color}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Poppins, sans-serif"
                >
                  {zone.label.length > 14 ? zone.label.slice(0, 13) + "…" : zone.label}
                </text>
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + zone.h / 2 + 10}
                  textAnchor="middle"
                  fill={color}
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="Poppins, sans-serif"
                >
                  {zone.density}%
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {hovered && (
            <g>
              <rect x="160" y="10" width="240" height="56" rx="10" fill="#2D4238" />
              <text
                x="180" y="32"
                fill="#fff" fontSize="12" fontWeight="700" fontFamily="Poppins, sans-serif"
              >
                {hovered.label}
              </text>
              <text
                x="180" y="48"
                fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Poppins, sans-serif"
              >
                {hovered.density}% · {Math.round(hovered.density * hovered.capacity / 100)}/{hovered.capacity} people
              </text>
              <rect
                x="340" y="35" width="50" height="16" rx="4"
                fill={statusColor[hovered.status]} fillOpacity="0.2"
              />
              <text
                x="365" y="47" textAnchor="middle"
                fill={statusColor[hovered.status]} fontSize="9" fontWeight="800" fontFamily="Poppins, sans-serif"
              >
                {hovered.status.toUpperCase()}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
