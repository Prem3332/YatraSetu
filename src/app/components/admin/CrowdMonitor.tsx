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

// ── Temple Selector Dropdown ────────────────────────────────

function TempleSelector() {
  const {
    temples,
    selectedTemple,
    setSelectedTemple,
    refreshTemples,
    loading,
    error,
    isTempleAssigned,
  } = useTemple();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = "temple-selector-listbox";

  // ── Filtered temples ──────────────────────────────────────

  const filteredTemples = temples.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.city && t.city.toLowerCase().includes(q)) ||
      (t.state && t.state.toLowerCase().includes(q))
    );
  });

  // ── Click outside to close ────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Focus search on open ──────────────────────────────────

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // ── Keyboard navigation ───────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          if (!isTempleAssigned) setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredTemples.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredTemples.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredTemples.length) {
            handleSelect(filteredTemples[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, filteredTemples, highlightedIndex, isTempleAssigned]
  );

  // ── Select handler ────────────────────────────────────────

  const handleSelect = (temple: Temple) => {
    setSelectedTemple(temple);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  // ── Toggle ────────────────────────────────────────────────

  const toggleDropdown = () => {
    if (isTempleAssigned) return;
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  };

  // ── Format temple subtitle ────────────────────────────────

  const getSubtitle = (temple: Temple): string => {
    const parts: string[] = [];
    if (temple.city) parts.push(temple.city);
    if (temple.state) parts.push(temple.state);
    return parts.join(", ");
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative" }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        id="temple-selector-trigger"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={selectedTemple ? `Selected temple: ${selectedTemple.name}` : "Select a temple"}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2"
        style={{
          background: "#FFF3E8",
          border: "1px solid #FED7AA",
          cursor: isTempleAssigned ? "default" : "pointer",
          opacity: isTempleAssigned ? 0.85 : 1,
          transition: "all 0.15s",
          position: "relative",
        }}
        title={isTempleAssigned ? "Temple assigned by system administrator" : undefined}
      >
        {loading ? (
          <>
            <Loader2
              size={14}
              color="#C84B31"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31" }}>
              Loading…
            </span>
          </>
        ) : error ? (
          <>
            <AlertCircle size={14} color="#EF4444" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#EF4444" }}>
              Error
            </span>
          </>
        ) : selectedTemple ? (
          <>
            <span style={{ fontSize: "12px" }}>🛕</span>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31", display: "block", lineHeight: 1.2 }}>
                {selectedTemple.name}
              </span>
              {getSubtitle(selectedTemple) && (
                <span style={{ fontSize: "9px", color: "#9ca3af", display: "block", lineHeight: 1.2 }}>
                  {getSubtitle(selectedTemple)}
                </span>
              )}
            </div>
            {isTempleAssigned ? (
              <Lock size={12} color="#9ca3af" />
            ) : (
              <ChevronDown
                size={14}
                color="#C84B31"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            )}
          </>
        ) : (
          <>
            <span style={{ fontSize: "12px" }}>🛕</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31" }}>
              No Temple
            </span>
            <ChevronDown size={14} color="#C84B31" />
          </>
        )}
      </button>

      {/* Tooltip for assigned temple */}
      {isTempleAssigned && (
        <style>{`
          #temple-selector-trigger:hover::after {
            content: "Temple assigned by system administrator";
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #2D4238;
            color: #fff;
            font-size: 10px;
            font-family: Poppins, sans-serif;
            padding: 4px 10px;
            border-radius: 6px;
            white-space: nowrap;
            z-index: 9999;
            pointer-events: none;
          }
        `}</style>
      )}

      {/* Spin keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "300px",
            maxHeight: "360px",
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(45, 66, 56,0.08)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "dropdownFadeIn 0.15s ease-out",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Search */}
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid rgba(45, 66, 56, 0.08)",
            }}
          >
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: "#F5F0E6",
                border: "1px solid rgba(45, 66, 56, 0.08)",
              }}
            >
              <Search size={14} color="#9ca3af" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search temple..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search temples"
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "12px",
                  color: "#2D4238",
                  fontFamily: "Poppins, sans-serif",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Temple list */}
          <div
            id={listboxId}
            role="listbox"
            aria-label="Temple list"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px",
            }}
          >
            {error ? (
              /* Error state */
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <AlertCircle
                  size={28}
                  color="#EF4444"
                  style={{ margin: "0 auto 8px" }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#EF4444",
                    margin: "0 0 4px 0",
                  }}
                >
                  Unable to load temples
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    margin: "0 0 12px 0",
                  }}
                >
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => refreshTemples()}
                  className="flex items-center gap-1.5"
                  style={{
                    margin: "0 auto",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "#FEE2E2",
                    color: "#EF4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : loading ? (
              /* Loading state */
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                }}
              >
                <Loader2
                  size={24}
                  color="#C84B31"
                  style={{ margin: "0 auto", animation: "spin 1s linear infinite" }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    margin: "8px 0 0 0",
                  }}
                >
                  Loading temples…
                </p>
              </div>
            ) : filteredTemples.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>
                  🛕
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2D4238",
                    margin: "0 0 4px 0",
                  }}
                >
                  {searchQuery.trim()
                    ? "No temples found"
                    : "No temples exist"}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    margin: 0,
                  }}
                >
                  {searchQuery.trim()
                    ? `No results for "${searchQuery}"`
                    : "Add a temple from Manage Temples"}
                </p>
              </div>
            ) : (
              /* Temple options */
              filteredTemples.map((temple, index) => {
                const isSelected = selectedTemple?._id === temple._id;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={temple._id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`temple-option-${temple._id}`}
                    onClick={() => handleSelect(temple)}
                    className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-2.5"
                    style={{
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Poppins, sans-serif",
                      background: isSelected
                        ? "rgba(200, 75, 49, 0.08)"
                        : isHighlighted
                        ? "rgba(45, 66, 56, 0.05)"
                        : "transparent",
                      borderLeft: isSelected
                        ? "3px solid #C84B31"
                        : "3px solid transparent",
                      transition: "all 0.1s",
                      marginBottom: "2px",
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isSelected
                          ? "linear-gradient(135deg, #FFF3E8, #FED7AA)"
                          : "#F5F0E6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      🛕
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? "#C84B31" : "#2D4238",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {temple.name}
                      </p>
                      {getSubtitle(temple) && (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#9ca3af",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSubtitle(temple)}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#C84B31",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function CrowdMonitor() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const hovered = zones.find((z) => z.id === hoveredZone);
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