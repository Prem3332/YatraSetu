import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, ChevronDown, Users, AlertCircle, Car, TrendingUp, Search, Loader2, RefreshCw, Lock } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTemple } from "../../context/TempleContext";
import { TempleSelector } from "./TempleSelector";
import { ZoneHeatmap } from "./CrowdMonitor/ZoneHeatmap";
import type { Temple } from "../../lib/api";

// TODO: Replace static chart data with API data filtered by selectedTemple._id
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

// TODO: Replace static zones with API data filtered by selectedTemple._id
const zones = [
  { id: "entry",     label: "Entry Gate",      x: 60,  y: 260, w: 120, h: 60,  density: 28, capacity: 200, status: "low"      },
  { id: "shrine",    label: "Main Shrine",      x: 220, y: 130, w: 160, h: 120, density: 64, capacity: 500, status: "moderate" },
  { id: "prasad",    label: "Prasad Counter",   x: 400, y: 180, w: 110, h: 80,  density: 89, capacity: 150, status: "high"     },
  { id: "corridor1", label: "East Corridor",    x: 220, y: 270, w: 160, h: 60,  density: 58, capacity: 300, status: "moderate" },
  { id: "restroom",  label: "Restrooms",        x: 60,  y: 170, w: 90,  h: 60,  density: 20, capacity: 80,  status: "low"      },
  { id: "parking",   label: "Parking Zone",     x: 60,  y: 350, w: 180, h: 80,  density: 78, capacity: 400, status: "moderate" },
  { id: "firstaid",  label: "First Aid Post",   x: 400, y: 80,  w: 90,  h: 60,  density: 10, capacity: 30,  status: "low"      },
];

// TODO: Replace static alerts with API data filtered by selectedTemple._id
const alerts = [
  { zone: "Prasad Counter", density: 89, status: "high",     time: "2 mins ago"  },
  { zone: "Main Shrine",    density: 64, status: "moderate", time: "8 mins ago"  },
  { zone: "Parking Zone",   density: 78, status: "moderate", time: "15 mins ago" },
];

const statusColor: Record<string, string> = {
  low:      "#22C55E",
  moderate: "#F59E0B",
  high:     "#EF4444",
};

const statusBg: Record<string, string> = {
  low:      "#DCFCE7",
  moderate: "#FEF3C7",
  high:     "#FEE2E2",
};



// ── Main Component ──────────────────────────────────────────

export function CrowdMonitor() {
  const { selectedTemple } = useTemple();

  // TODO: Fetch crowd data filtered by selectedTemple._id
  // TODO: Fetch zone data filtered by selectedTemple._id
  // TODO: Fetch alert data filtered by selectedTemple._id

  const templeName = selectedTemple?.name ?? "No Temple Selected";

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
            {templeName} · Last updated: 2 seconds ago
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TempleSelector />
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#f0ede8" }}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span style={{ fontSize: "11px", color: "#374151", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {" · "}
              {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
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
          <ZoneHeatmap 
            zones={zones} 
            statusColor={statusColor} 
            selectedTemple={selectedTemple} 
          />

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
                <Tooltip
                  contentStyle={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(45, 66, 56,0.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v) => [(v as number).toLocaleString(), "Visitors"]}
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