import { useState } from "react";
import { Bell, ChevronDown, Users, AlertCircle, Car, TrendingUp } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const chartData = [
  { time: "9 AM",  count: 1200  },
  { time: "10 AM", count: 2400  },
  { time: "11 AM", count: 3800  },
  { time: "12 PM", count: 5200  },
  { time: "1 PM",  count: 7100  },
  { time: "2 PM",  count: 8900  },
  { time: "3 PM",  count: 10200 },
  { time: "4 PM",  count: 11800 },
  { time: "Now",   count: 12450 },
];

const zones = [
  { id: "entry",     label: "Entry Gate",      x: 60,  y: 260, w: 120, h: 60,  density: 28, capacity: 200, status: "low"      },
  { id: "shrine",    label: "Main Shrine",      x: 220, y: 130, w: 160, h: 120, density: 64, capacity: 500, status: "moderate" },
  { id: "prasad",    label: "Prasad Counter",   x: 400, y: 180, w: 110, h: 80,  density: 89, capacity: 150, status: "high"     },
  { id: "corridor1", label: "East Corridor",    x: 220, y: 270, w: 160, h: 60,  density: 58, capacity: 300, status: "moderate" },
  { id: "restroom",  label: "Restrooms",        x: 60,  y: 170, w: 90,  h: 60,  density: 20, capacity: 80,  status: "low"      },
  { id: "parking",   label: "Parking Zone",     x: 60,  y: 350, w: 180, h: 80,  density: 78, capacity: 400, status: "moderate" },
  { id: "firstaid",  label: "First Aid Post",   x: 400, y: 80,  w: 90,  h: 60,  density: 10, capacity: 30,  status: "low"      },
];

const alerts = [
  { zone: "Prasad Counter", density: 89, status: "high",     time: "2 mins ago"  },
  { zone: "Main Shrine",    density: 64, status: "moderate", time: "8 mins ago"  },
  { zone: "Parking Zone",   density: 78, status: "moderate", time: "15 mins ago" },
];

// FIX 1 & 2: Removed TypeScript type annotations (Record<string, string>)
const statusColor = {
  low:      "#22C55E",
  moderate: "#F59E0B",
  high:     "#EF4444",
};

const statusBg = {
  low:      "#DCFCE7",
  moderate: "#FEF3C7",
  high:     "#FEE2E2",
};

export function CrowdMonitor() {
  const [hoveredZone, setHoveredZone] = useState(null); // FIX: removed <string | null> TS type
  const hovered = zones.find((z) => z.id === hoveredZone);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#F5F0E6", fontFamily: "Poppins, sans-serif", overflow: "hidden" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "#fff", borderBottom: "1px solid rgba(45, 66, 56,0.08)", flexShrink: 0 }}
      >
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#2D4238", margin: 0 }}>
            Live Crowd Monitor
          </h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
            Somnath Temple · Last updated: 2 seconds ago
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{ background: "#FFF3E8", border: "1px solid #FED7AA" }}
          >
            <span style={{ fontSize: "12px" }}>🛕</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31" }}>Somnath</span>
            <ChevronDown size={14} color="#C84B31" />
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#f0ede8" }}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span style={{ fontSize: "11px", color: "#374151", fontWeight: 600 }}>
              June 11, 2026 · 4:34 PM
            </span>
          </div>
          <div className="relative">
            <Bell size={20} color="#2D4238" style={{ cursor: "pointer" }} />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#EF4444", fontSize: "9px", color: "#fff", fontWeight: 700 }}
            >
              3
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Visitors Today",  value: "12,450", icon: Users,        color: "#2D4238", bg: "#EFF6FF",  delta: "+8%"           },
            { label: "Current Queue Length",  value: "387",    icon: TrendingUp,   color: "#C84B31", bg: "#FFF3E8",  delta: "+12 min ago"   },
            { label: "Active Alerts",         value: "1",      icon: AlertCircle,  color: "#EF4444", bg: "#FEE2E2",  badge: true            },
            { label: "Parking Occupancy",     value: "78%",    icon: Car,          color: "#F59E0B", bg: "#FEF3C7",  delta: "↑ 5% from 1hr" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4"
              style={{
                background: "#fff",
                boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)",
                border: "1px solid rgba(45, 66, 56,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <card.icon size={20} color={card.color} />
                </div>
                {card.badge ? (
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "11px", fontWeight: 800 }}
                  >
                    ● Active
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                    {card.delta}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "26px", fontWeight: 900, color: card.color, margin: "0 0 2px 0" }}>
                {card.value}
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontWeight: 500 }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Map + Alerts */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
          {/* Heatmap */}
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
                  SOMNATH TEMPLE COMPLEX
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

          {/* Zone Alerts */}
          <div
            className="rounded-2xl"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}
          >
            <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>
                Zone Alerts
              </h3>
            </div>
            <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {alerts.map((a) => (
                <div
                  key={a.zone}
                  className="rounded-xl p-3"
                  style={{
                    background: statusBg[a.status],
                    border: `1px solid ${statusColor[a.status]}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#2D4238" }}>
                      {a.zone}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{
                        background: statusColor[a.status],
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 rounded-full overflow-hidden"
                      style={{ height: "6px", background: "rgba(0,0,0,0.08)" }}
                    >
                      <div
                        style={{
                          width: `${a.density}%`,
                          height: "100%",
                          background: statusColor[a.status],
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: statusColor[a.status] }}>
                      {a.density}%
                    </span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#9ca3af" }}>{a.time}</span>
                </div>
              ))}
              <div
                className="rounded-xl p-3 flex flex-col items-center justify-center"
                style={{ background: "#f0ede8", minHeight: "80px" }}
              >
                <span style={{ fontSize: "22px" }}>✅</span>
                <span
                  style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500, textAlign: "center" }}
                >
                  4 zones within safe limits
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          className="rounded-2xl"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>
              Live Crowd Count — Last 6 Hours
            </h3>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "#FFF3E8" }}
            >
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span style={{ fontSize: "11px", color: "#C84B31", fontWeight: 600 }}>
                Peak: 12,450 visitors
              </span>
            </div>
          </div>
          <div style={{ height: "180px", padding: "16px 16px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C84B31" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C84B31" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 66, 56,0.06)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Poppins, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Poppins, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                {/* FIX 3: Removed TypeScript type annotation (v: number) → just (v) */}
                <Tooltip
                  contentStyle={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(45, 66, 56,0.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v) => [v.toLocaleString(), "Visitors"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#C84B31"
                  strokeWidth={2.5}
                  fill="url(#crowdGrad)"
                  dot={{ r: 4, fill: "#C84B31", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrowdMonitor;