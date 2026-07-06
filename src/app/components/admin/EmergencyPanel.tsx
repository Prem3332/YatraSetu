import { useState } from "react";
import { Bell, Phone, AlertTriangle, Flame, Activity, Info, CheckCircle, X, Send } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  time: string;
  zone: string;
  status: "Active" | "Resolved";
  color: string;
}

const initialAlerts: Alert[] = [
  { id: "1", type: "Stampede Alert", time: "2:34 PM", zone: "Main Shrine — Gate 1", status: "Active", color: "#EF4444" },
  { id: "2", type: "Medical Emergency", time: "1:15 PM", zone: "Prasad Counter", status: "Resolved", color: "#C84B31" },
];

const alertTypes = [
  { id: "stampede", label: "Stampede Alert", icon: AlertTriangle, color: "#EF4444", bg: "#FEE2E2" },
  { id: "medical", label: "Medical Emergency", icon: Activity, color: "#C84B31", bg: "#FFF3E8" },
  { id: "fire", label: "Fire Alert", icon: Flame, color: "#DC2626", bg: "#FEF2F2" },
  { id: "advisory", label: "General Advisory", icon: Info, color: "#3B82F6", bg: "#EFF6FF" },
];

const emergencyContacts = [
  { label: "Police Control Room", number: "100", icon: "🚔" },
  { label: "Medical Emergency", number: "108", icon: "🚑" },
  { label: "Fire Department", number: "101", icon: "🚒" },
  { label: "Temple Helpline", number: "1800-XXX", icon: "🛕" },
  { label: "District Collector", number: "+91-279-XXXXXX", icon: "🏛️" },
];

export function EmergencyPanel() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcast, setBroadcast] = useState(false);

  // TODO: Filter emergency data by selectedTemple._id — import useTemple and use selectedTemple._id for API calls

  const confirmAlert = confirmModal ? alertTypes.find((a) => a.id === confirmModal) : null;

  const triggerAlert = () => {
    if (!confirmAlert) return;
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: confirmAlert.label,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      zone: "All Zones",
      status: "Active",
      color: confirmAlert.color,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setConfirmModal(null);
  };

  const resolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a)));
  };

  const sendBroadcast = () => {
    setBroadcast(true);
    setTimeout(() => setBroadcast(false), 3000);
    setBroadcastMsg("");
  };

  const activeCount = alerts.filter((a) => a.status === "Active").length;

  return (
    <div className="flex flex-col h-full" style={{ background: "#F5F0E6", fontFamily: "Poppins, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "#fff", borderBottom: "1px solid rgba(45, 66, 56,0.08)", flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#2D4238", margin: 0 }}>Emergency Control Center</h1>
          <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: activeCount > 0 ? "#FEE2E2" : "#F0FDF4" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: activeCount > 0 ? "#EF4444" : "#22C55E", animation: activeCount > 0 ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: activeCount > 0 ? "#DC2626" : "#16A34A" }}>
              {activeCount > 0 ? `${activeCount} Active Alert` : "All Clear"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>June 11, 2026 · 4:34 PM</span>
          <div className="relative">
            <Bell size={20} color="#2D4238" style={{ cursor: "pointer" }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#EF4444", fontSize: "9px", color: "#fff", fontWeight: 700 }}>3</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Alert trigger grid */}
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: "0 0 12px 0" }}>Trigger Emergency Alert</h3>
          <div className="grid grid-cols-4 gap-4">
            {alertTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setConfirmModal(type.id)}
                className="rounded-2xl p-5 flex flex-col items-center gap-3"
                style={{ background: "#fff", border: `2px solid ${type.color}25`, boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)", cursor: "pointer", fontFamily: "Poppins, sans-serif", transition: "all 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = type.bg; (e.currentTarget as HTMLButtonElement).style.borderColor = type.color; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = `${type.color}25`; }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: type.bg }}>
                  <type.icon size={28} color={type.color} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#2D4238", textAlign: "center" }}>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Active alerts */}
            <div className="rounded-2xl" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>Alert History</h3>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>{alerts.length} total</span>
              </div>
              <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-4 rounded-xl p-4"
                    style={{ background: alert.status === "Active" ? `${alert.color}08` : "#F5F0E6", border: `1.5px solid ${alert.status === "Active" ? `${alert.color}30` : "rgba(45, 66, 56,0.06)"}` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: alert.status === "Active" ? `${alert.color}15` : "#f0ede8" }}>
                      <AlertTriangle size={20} color={alert.status === "Active" ? alert.color : "#9ca3af"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#2D4238" }}>{alert.type}</span>
                        <span className="rounded-full px-2 py-0.5" style={{ background: alert.status === "Active" ? `${alert.color}15` : "#f0ede8", color: alert.status === "Active" ? alert.color : "#9ca3af", fontSize: "10px", fontWeight: 800 }}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>🕐 {alert.time}</span>
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>📍 {alert.zone}</span>
                      </div>
                    </div>
                    {alert.status === "Active" && (
                      <button
                        onClick={() => resolve(alert.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2"
                        style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "12px", fontWeight: 700, color: "#16A34A" }}
                      >
                        <CheckCircle size={14} /> Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evacuation map */}
            <div className="rounded-2xl" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>Evacuation Route Map</h3>
              </div>
              <div style={{ height: "180px", background: "#1a2e4a", borderRadius: "0 0 16px 16px", position: "relative", overflow: "hidden" }}>
                <svg viewBox="0 0 600 180" style={{ width: "100%", height: "100%" }}>
                  <rect width="600" height="180" fill="#1a2e4a" />
                  <rect x="50" y="20" width="500" height="140" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <rect x="150" y="50" width="200" height="80" rx="10" fill="rgba(200, 75, 49,0.3)" stroke="#C84B31" strokeWidth="1.5" />
                  <text x="250" y="95" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Poppins, sans-serif">Main Shrine</text>
                  {/* Evacuation routes */}
                  <path d="M 150 90 L 80 90" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="8 5" markerEnd="url(#arrow1)" />
                  <path d="M 250 130 L 250 160" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="8 5" />
                  <path d="M 350 90 L 520 90" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="8 5" />
                  {/* Gates */}
                  {[{ x: 55, y: 80, label: "Gate 1" }, { x: 220, y: 155, label: "Gate 2" }, { x: 495, y: 80, label: "Gate 3" }].map((g) => (
                    <g key={g.label}>
                      <circle cx={g.x} cy={g.y} r="14" fill="#22C55E" opacity="0.9" />
                      <text x={g.x} y={g.y + 4} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800" fontFamily="Poppins, sans-serif">EXIT</text>
                      <text x={g.x} y={g.y + 22} textAnchor="middle" fill="#22C55E" fontSize="9" fontWeight="700" fontFamily="Poppins, sans-serif">{g.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Broadcast */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: "0 0 12px 0" }}>Broadcast Message to All Devotees</h3>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Type your message here... (will be sent via SMS + App notification)"
                rows={3}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#374151", background: "#F5F0E6", outline: "none", resize: "none", boxSizing: "border-box", marginBottom: "12px" }}
              />
              {broadcast && (
                <div className="rounded-xl p-3 mb-3 flex items-center gap-2" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <CheckCircle size={16} color="#22C55E" />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>Broadcast sent to 12,450 registered devotees</span>
                </div>
              )}
              <button
                onClick={sendBroadcast}
                disabled={!broadcastMsg.trim()}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5"
                style={{ background: broadcastMsg.trim() ? "#2D4238" : "#d1d5db", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 700, border: "none", cursor: broadcastMsg.trim() ? "pointer" : "not-allowed" }}
              >
                <Send size={16} /> Broadcast to All Devotees
              </button>
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="rounded-2xl" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)", alignSelf: "start" }}>
            <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>Emergency Contacts</h3>
            </div>
            <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {emergencyContacts.map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#F5F0E6" }}>
                  <span style={{ fontSize: "20px" }}>{c.icon}</span>
                  <div className="flex-1">
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#374151", margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: "12px", fontWeight: 800, color: "#2D4238", margin: 0 }}>{c.number}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF", border: "none", cursor: "pointer" }}>
                    <Phone size={14} color="#3B82F6" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmModal && confirmAlert && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 100 }}>
          <div className="rounded-3xl p-6 flex flex-col items-center gap-4" style={{ background: "#fff", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: confirmAlert.bg }}>
              <confirmAlert.icon size={32} color={confirmAlert.color} />
            </div>
            <div className="text-center">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#2D4238", margin: "0 0 6px" }}>Confirm Alert</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                This will immediately broadcast a <strong style={{ color: confirmAlert.color }}>{confirmAlert.label}</strong> to all 12,450 devotees. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmModal(null)} className="flex-1 rounded-xl py-3" style={{ background: "#f0ede8", color: "#374151", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 700 }}>
                Cancel
              </button>
              <button onClick={triggerAlert} className="flex-1 rounded-xl py-3" style={{ background: confirmAlert.color, color: "#fff", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 800 }}>
                Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
