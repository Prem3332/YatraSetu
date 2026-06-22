import { useState } from "react";
import { Bell, ChevronDown, Search, CheckCircle, SkipForward, Volume2 } from "lucide-react";

const allTokens = [
  { id: "A240", name: "Priya Mehta", booked: "10:30 AM", slot: "Morning · 11:00 AM", status: "Completed" },
  { id: "A241", name: "Ramesh Sharma", booked: "11:15 AM", slot: "Morning · 11:00 AM", status: "Completed" },
  { id: "A242", name: "Kavita Patel", booked: "11:20 AM", slot: "Morning · 11:00 AM", status: "Completed" },
  { id: "A243", name: "Mohan Das", booked: "12:00 PM", slot: "Afternoon · 12:00 PM", status: "Completed" },
  { id: "A244", name: "Sunita Gupta", booked: "12:10 PM", slot: "Afternoon · 12:00 PM", status: "Called" },
  { id: "A245", name: "Deepak Joshi", booked: "12:15 PM", slot: "Afternoon · 12:00 PM", status: "Called" },
  { id: "A246", name: "Anita Verma", booked: "12:20 PM", slot: "Afternoon · 1:00 PM", status: "Called" },
  { id: "A247", name: "Ramesh Patel", booked: "12:30 PM", slot: "Afternoon · 1:00 PM", status: "Waiting" },
  { id: "A248", name: "Lata Desai", booked: "12:35 PM", slot: "Afternoon · 1:00 PM", status: "Waiting" },
  { id: "A249", name: "Vijay Rao", booked: "12:40 PM", slot: "Afternoon · 2:00 PM", status: "Waiting" },
  { id: "A250", name: "Neha Singh", booked: "12:45 PM", slot: "Afternoon · 2:00 PM", status: "Waiting" },
  { id: "A251", name: "Arun Kumar", booked: "12:50 PM", slot: "Afternoon · 2:00 PM", status: "Waiting" },
];

const statusColor: Record<string, string> = {
  Waiting: "#C84B31",
  Called: "#3B82F6",
  Completed: "#22C55E",
};
const statusBg: Record<string, string> = {
  Waiting: "#FFF3E8",
  Called: "#EFF6FF",
  Completed: "#F0FDF4",
};

export function QueueControl() {
  const [filter, setFilter] = useState("All");
  const [tokens, setTokens] = useState(allTokens);
  const [currentToken, setCurrentToken] = useState("A246");

  const filtered = filter === "All" ? tokens : tokens.filter((t) => t.status === filter);
  const waitingCount = tokens.filter((t) => t.status === "Waiting").length;
  const calledCount = tokens.filter((t) => t.status === "Called").length;
  const completedCount = tokens.filter((t) => t.status === "Completed").length;

  const nextWaiting = tokens.find((t) => t.status === "Waiting");

  const callNext = () => {
    if (!nextWaiting) return;
    setTokens((prev) =>
      prev.map((t) => (t.id === nextWaiting.id ? { ...t, status: "Called" } : t))
    );
    setCurrentToken(nextWaiting.id);
  };

  const markComplete = (id: string) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Completed" } : t)));
  };

  const skip = (id: string) => {
    setTokens((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#F5F0E6", fontFamily: "Poppins, sans-serif", overflow: "hidden" }}>
      {/* Announcement bar */}
      <div className="flex items-center justify-between px-6 py-2.5" style={{ background: "#2D4238", flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <Volume2 size={14} color="#C84B31" />
          <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>Currently serving: </span>
          <span style={{ fontSize: "12px", color: "#C84B31", fontWeight: 800 }}>{currentToken}</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}> at Main Entry Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Gate 1 Open</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "#fff", borderBottom: "1px solid rgba(45, 66, 56,0.08)", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#2D4238", margin: 0 }}>Queue Control Panel</h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Somnath Temple · Afternoon Session</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#f0ede8", border: "none" }}>
            <span style={{ fontSize: "12px" }}>🛕</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2D4238" }}>Somnath</span>
            <ChevronDown size={14} color="#9ca3af" />
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#f0ede8" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>June 11, 2026</span>
            <ChevronDown size={14} color="#9ca3af" />
          </div>
          <div className="relative">
            <Bell size={20} color="#2D4238" style={{ cursor: "pointer" }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#EF4444", fontSize: "9px", color: "#fff", fontWeight: 700 }}>3</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-5 p-5">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(45, 66, 56,0.06)" }}>
              {["All", "Waiting", "Called", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="rounded-lg px-3 py-1.5"
                  style={{
                    background: filter === f ? "#2D4238" : "transparent",
                    color: filter === f ? "#fff" : "#6b7280",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    fontWeight: filter === f ? 700 : 500,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                  {f === "Waiting" && ` (${waitingCount})`}
                  {f === "Called" && ` (${calledCount})`}
                  {f === "Completed" && ` (${completedCount})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(45, 66, 56,0.06)" }}>
              <Search size={14} color="#9ca3af" />
              <input placeholder="Search token or name..." style={{ border: "none", outline: "none", fontSize: "12px", color: "#374151", fontFamily: "Poppins, sans-serif", background: "transparent", width: "100%" }} />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden rounded-2xl" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <div className="overflow-auto h-full">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F0E6", position: "sticky", top: 0 }}>
                    {["Token #", "Name", "Booked Time", "Slot", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "Poppins, sans-serif", borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((token, i) => (
                    <tr
                      key={token.id}
                      style={{
                        background: token.id === currentToken ? "#FFF3E8" : i % 2 === 0 ? "#fff" : "#fafafa",
                        borderBottom: "1px solid rgba(45, 66, 56,0.04)",
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: token.id === currentToken ? "#C84B31" : "#2D4238", fontFamily: "Poppins, sans-serif" }}>{token.id}</span>
                        {token.id === currentToken && (
                          <span className="ml-2 rounded-full px-1.5 py-0.5" style={{ background: "#C84B31", color: "#fff", fontSize: "9px", fontWeight: 700 }}>NOW</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>{token.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9ca3af", fontFamily: "Poppins, sans-serif" }}>{token.booked}</td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6b7280", fontFamily: "Poppins, sans-serif" }}>{token.slot}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="rounded-full px-2.5 py-1" style={{ background: statusBg[token.status], color: statusColor[token.status], fontSize: "11px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>
                          {token.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-2">
                          {token.status === "Waiting" && (
                            <>
                              <button
                                onClick={() => skip(token.id)}
                                className="flex items-center gap-1 rounded-lg px-2 py-1"
                                style={{ background: "#f0ede8", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "11px", color: "#6b7280", fontWeight: 600 }}
                              >
                                <SkipForward size={11} /> Skip
                              </button>
                            </>
                          )}
                          {token.status === "Called" && (
                            <button
                              onClick={() => markComplete(token.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1"
                              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "11px", color: "#16A34A", fontWeight: 600 }}
                            >
                              <CheckCircle size={11} /> Complete
                            </button>
                          )}
                          {token.status === "Completed" && (
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4" style={{ width: "240px", flexShrink: 0 }}>
          {/* Call Next button */}
          <div className="rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Next Token</p>
            <div className="text-center">
              <p style={{ fontSize: "36px", fontWeight: 900, color: "#C84B31", margin: 0 }}>{nextWaiting?.id ?? "—"}</p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{nextWaiting?.name ?? "Queue empty"}</p>
            </div>
            <button
              onClick={callNext}
              className="w-full rounded-xl py-3 flex items-center justify-center gap-2"
              style={{ background: nextWaiting ? "#C84B31" : "#d1d5db", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 800, border: "none", cursor: nextWaiting ? "pointer" : "not-allowed", boxShadow: nextWaiting ? "0 4px 16px rgba(200, 75, 49,0.3)" : "none" }}
            >
              <Volume2 size={16} /> Call Next
            </button>
          </div>

          {/* Stats */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Queue Stats</p>
            {[
              { label: "Total in Queue", value: `${waitingCount + calledCount}`, color: "#2D4238" },
              { label: "Called Today", value: `${calledCount + completedCount}`, color: "#3B82F6" },
              { label: "Avg Wait Time", value: "23 min", color: "#C84B31" },
              { label: "Est. Clearance", value: "6:40 PM", color: "#22C55E" },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Gate status */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Gate Status</p>
            {[
              { gate: "Gate 1 — Main Entry", status: "Open", color: "#22C55E" },
              { gate: "Gate 2 — North Exit", status: "Open", color: "#22C55E" },
              { gate: "Gate 3 — South", status: "Closed", color: "#9ca3af" },
            ].map((g) => (
              <div key={g.gate} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.04)" }}>
                <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500 }}>{g.gate}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: g.color }}>{g.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
