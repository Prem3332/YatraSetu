import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin, Bell, ChevronRight, Clock, AlertTriangle, User, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useLanguage } from "../../context/LanguageContext";
import { fetchCurrentUser, type ApiUser } from "../../lib/api";
import { useTemple } from "../../context/TempleContext";
import { fetchTodayTrafficForAll, type DailyTraffic } from "../../lib/api/queue";
import { getTrafficInfoFromOccupancy } from "./QueueBooking/useMonthlyTraffic";const quickActions = [
  { id: "queue", label: "Book Darshan Slot", icon: "🗓️", color: "#FFF3E8", border: "#FED7AA" },
  { id: "live", label: "Live Queue Status", icon: "🔴", color: "#FEF2F2", border: "#FECACA" },
  { id: "map", label: "Temple Map", icon: "🗺️", color: "#EFF6FF", border: "#BFDBFE" },
  { id: "sos", label: "Emergency SOS", icon: "🆘", color: "#FEF2F2", border: "#FCA5A5", sos: true },
];

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { temples, loading } = useTemple();
  const [todayTraffic, setTodayTraffic] = useState<Record<string, DailyTraffic>>({});

  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("yatrasetu_token");
    if (token) {
      fetchCurrentUser()
        .then(u => setUser(u))
        .catch(err => {
          console.error("Failed to fetch user:", err);
          localStorage.removeItem("yatrasetu_token");
        });
    }
  }, []);

  useEffect(() => {
    fetchTodayTrafficForAll()
      .then(data => setTodayTraffic(data))
      .catch(err => console.error("Failed to fetch today traffic:", err));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
      {/* Header */}
      <div style={{ background: "#2D4238", paddingTop: "52px", paddingBottom: "20px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", marginBottom: "2px" }}>{t("home.greeting")}</p>
            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>
              {user ? user.name : "Devotee"}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} color="#C84B31" />
              <span style={{ color: "#C84B31", fontSize: "11px", fontWeight: 500 }}>{t("home.templeLocation")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)", fontSize: "10px", fontWeight: 600 }}>
              {([
                ["en", "EN"],
                ["hi", "हिं"],
                ["gu", "ગુ"]
              ] as const).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  style={{
                    padding: "4px 7px",
                    background: language === code ? "#C84B31" : "transparent",
                    color: language === code ? "#fff" : "rgba(255,255,255,0.7)",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "10px",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Login / Profile Button */}
            {user ? (
              <button
                onClick={() => onNavigate("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  width: "28px",
                  height: "28px",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                }}
                title="Profile"
              >
                <User size={16} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#C84B31",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 10px",
                  height: "28px",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(200, 75, 49, 0.4)",
                }}
              >
                <User size={14} />
                <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>Login</span>
              </button>
            )}

            <div className="relative">
              <Bell size={20} color="rgba(255,255,255,0.8)" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center" style={{ fontSize: "9px", color: "#fff", fontWeight: 700 }}>2</span>
            </div>
          </div>
        </div>

      </div>

      <div className="flex-1 p-4" style={{ gap: "16px", display: "flex", flexDirection: "column" }}>
        {/* Temple selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2D4238", margin: 0 }}>{t("home.nearbyTemples")}</h3>
            <button style={{ color: "#C84B31", fontSize: "12px", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>{t("home.seeAll")}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {loading ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 size={24} color="#C84B31" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : temples.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8">
                <span style={{ fontSize: "12px", color: "#6b7280" }}>No temples available.</span>
              </div>
            ) : (
              temples.map((t) => {
                const img = "https://images.unsplash.com/photo-1570605505301-0f713202ca7a?w=200&h=130&fit=crop&auto=format";
                const subtitle = t.city || t.state || "Location";
                const dt = todayTraffic[t._id];
                const trafficInfo = dt ? getTrafficInfoFromOccupancy(dt.totalCapacity, dt.totalBooked, dt.totalAvailable) : null;
                
                const crowd = trafficInfo ? trafficInfo.label : "Loading...";
                const crowdColor = trafficInfo ? trafficInfo.color : "#9ca3af";
                const crowdBg = trafficInfo ? trafficInfo.bgColor : "#f3f4f6";

                const darshan = t.timings && t.timings.length > 0 ? `${t.timings[0].open} - ${t.timings[0].close}` : "6:00 AM - 9:00 PM";
                
                return (
                  <div
                    key={t._id}
                    className="flex-shrink-0 rounded-2xl overflow-hidden"
                    style={{ width: "155px", background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.08)", border: "1px solid rgba(45, 66, 56,0.06)", cursor: "pointer" }}
                    onClick={() => onNavigate("queue")}
                  >
                    <div className="relative" style={{ height: "90px", background: "#e5e7eb" }}>
                      <ImageWithFallback src={img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="p-2.5">
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#2D4238", margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: "10px", color: "#9ca3af", margin: "1px 0 4px" }}>{subtitle}</p>
                      <div className="flex items-center gap-1 mb-1.5">
                        <Clock size={9} color="#C84B31" />
                        <span style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}>{darshan}</span>
                      </div>
                      <div className="inline-flex rounded-full px-2 py-0.5 items-center gap-1" style={{ background: crowdBg }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: crowdColor }} />
                        <span style={{ fontSize: "9px", fontWeight: 700, color: crowdColor }}>{crowd}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2D4238", margin: "0 0 12px 0" }}>{t("home.quickActions")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const label = 
                action.id === "queue" ? t("home.actionBooking") :
                action.id === "live" ? t("home.actionQueue") :
                action.id === "map" ? t("home.actionMap") :
                action.id === "sos" ? t("home.actionSos") : action.label;

              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id === "live" ? "live" : action.id)}
                  className="rounded-2xl p-4 text-left flex flex-col items-start gap-2"
                  style={{
                    background: action.color,
                    border: `1.5px solid ${action.border}`,
                    boxShadow: action.sos ? "0 4px 16px rgba(239,68,68,0.15)" : "0 2px 8px rgba(45, 66, 56,0.06)",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{action.icon}</span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: action.sos ? "#DC2626" : "#2D4238",
                    lineHeight: 1.3,
                  }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's schedule */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)", border: "1px solid rgba(45, 66, 56,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238", margin: 0 }}>Today's Schedule · Somnath</h3>
            <ChevronRight size={16} color="#9ca3af" />
          </div>
          {[
            { time: "6:00 AM", event: "Mangala Aarti", status: "done" },
            { time: "12:00 PM", event: "Madhyanha Aarti", status: "done" },
            { time: "7:00 PM", event: "Sandhya Aarti", status: "active" },
            { time: "10:30 PM", event: "Shayan Aarti", status: "upcoming" },
          ].map((item) => (
            <div key={item.time} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: item.status === "active" ? "#C84B31" : item.status === "done" ? "#22C55E" : "#d1d5db", flexShrink: 0 }}
              />
              <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500, minWidth: "60px" }}>{item.time}</span>
              <span style={{ fontSize: "12px", color: item.status === "active" ? "#C84B31" : "#374151", fontWeight: item.status === "active" ? 700 : 500 }}>{item.event}</span>
              {item.status === "active" && (
                <span className="ml-auto rounded-full px-2 py-0.5" style={{ background: "#FFF3E8", color: "#C84B31", fontSize: "9px", fontWeight: 700 }}>LIVE</span>
              )}
            </div>
          ))}
        </div>

        {/* Announcement */}
        <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
          <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", margin: "0 0 2px 0" }}>Special Darshan Advisory</p>
            <p style={{ fontSize: "11px", color: "#78350F", margin: 0 }}>Due to Mahashivratri, extended hours from 5:00 AM – 11:00 PM today. Pre-book your slot to avoid long waits.</p>
          </div>
        </div>

        <div style={{ height: "8px" }} />
      </div>

      {/* Floating SOS */}
      <button
        onClick={() => onNavigate("emergency")}
        className="absolute rounded-full flex items-center gap-1.5"
        style={{
          bottom: "80px",
          right: "16px",
          background: "#EF4444",
          color: "#fff",
          border: "3px solid #fff",
          boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
          padding: "10px 14px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          fontSize: "12px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        🆘 SOS
      </button>
    </div>
  );
}
