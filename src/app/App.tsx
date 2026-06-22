import { useState, useEffect } from "react";
import { Shield, Smartphone, Monitor, Menu, X } from "lucide-react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

import { HomeScreen } from "./components/pilgrim/HomeScreen";
import { QueueBookingScreen } from "./components/pilgrim/QueueBookingScreen";
import { LiveQueueScreen } from "./components/pilgrim/LiveQueueScreen";
import { TempleMapScreen } from "./components/pilgrim/TempleMapScreen";
import { EmergencyAlertScreen } from "./components/pilgrim/EmergencyAlertScreen";
import { BottomNav } from "./components/pilgrim/BottomNav";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { CrowdMonitor } from "./components/admin/CrowdMonitor";
import { QueueControl } from "./components/admin/QueueControl";
import { EmergencyPanel } from "./components/admin/EmergencyPanel";
import { TempleManager } from "./components/admin/TempleManager";

type AppMode = "devotee" | "admin";
type DevoteeScreen = "home" | "queue" | "live" | "map" | "emergency" | "alerts" | "profile";
type AdminScreen = "crowd" | "queuecontrol" | "emergency" | "temples";

export function AppContent() {
  const [mode, setMode] = useState<AppMode>("devotee");
  const [devoteeScreen, setDevoteeScreen] = useState<DevoteeScreen>("home");
  const { t } = useLanguage();
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("crowd");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDevoteeNav = (screen: string) => {
    setDevoteeScreen(screen as DevoteeScreen);
  };

  const currentDevoteeScreens: [DevoteeScreen, string][] = [
    ["home", `🏠 ${t("nav.home")}`],
    ["queue", `🗓️ ${t("queue.title")}`],
    ["live", `🔴 ${t("live.title")}`],
    ["map", `🗺️ ${t("map.title")}`],
    ["emergency", `🆘 ${t("sos.title")}`],
  ];

  const currentAdminScreens: [AdminScreen, string][] = [
    ["crowd", "📊 Monitor"],
    ["queuecontrol", "👥 Queue Control"],
    ["temples", "🛕 Temples"],
    ["emergency", "🚨 Emergency"],
  ];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}
    >
      {/* Top mode switcher bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          background: "#2D4238",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0,
          gap: "16px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#C84B31", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <span style={{ color: "#fff", fontSize: "15px", fontWeight: 800 }}>YatraSetu</span>
          </div>
        </div>

        {/* Mode toggle - hidden on very small screens, or we can keep it */}
        <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", borderRadius: "12px", padding: "4px", background: "rgba(255,255,255,0.08)" }}>
          {(["devotee", "admin"] as AppMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "7px 16px",
                background: mode === m ? "#C84B31" : "transparent",
                color: mode === m ? "#fff" : "rgba(255,255,255,0.45)",
                fontFamily: "Poppins, sans-serif",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {m === "devotee" ? <Smartphone size={14} /> : <Monitor size={14} />}
              {m === "devotee" ? "Devotee App" : "Admin Dashboard"}
            </button>
          ))}
        </div>

        {/* Screen picker */}
        {!isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {mode === "devotee"
              ? currentDevoteeScreens.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setDevoteeScreen(id)}
                  style={{
                    borderRadius: "8px",
                    padding: "6px 12px",
                    background: devoteeScreen === id ? "rgba(200, 75, 49,0.18)" : "rgba(255,255,255,0.05)",
                    color: devoteeScreen === id ? "#C84B31" : "rgba(255,255,255,0.45)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "11px",
                    fontWeight: devoteeScreen === id ? 700 : 500,
                    border: devoteeScreen === id ? "1px solid rgba(200, 75, 49,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              ))
              : currentAdminScreens.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setAdminScreen(id)}
                  style={{
                    borderRadius: "8px",
                    padding: "6px 12px",
                    background: adminScreen === id ? "rgba(200, 75, 49,0.18)" : "rgba(255,255,255,0.05)",
                    color: adminScreen === id ? "#C84B31" : "rgba(255,255,255,0.45)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "11px",
                    fontWeight: adminScreen === id ? 700 : 500,
                    border: adminScreen === id ? "1px solid rgba(200, 75, 49,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              ))}
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px",
                padding: "8px", color: "#fff", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {menuOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: "12px",
                background: "#2D4238", borderRadius: "12px", padding: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 1000,
                display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {/* Mode toggle for mobile inside menu */}
                <div style={{ display: "flex", borderRadius: "8px", padding: "4px", background: "rgba(255,255,255,0.08)", marginBottom: "8px" }}>
                  {(["devotee", "admin"] as AppMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        borderRadius: "6px", padding: "8px 4px",
                        background: mode === m ? "#C84B31" : "transparent",
                        color: mode === m ? "#fff" : "rgba(255,255,255,0.45)",
                        fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700,
                        border: "none", cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {m === "devotee" ? <Smartphone size={12} /> : <Monitor size={12} />}
                      {m === "devotee" ? "Devotee" : "Admin"}
                    </button>
                  ))}
                </div>

                {mode === "devotee"
                  ? currentDevoteeScreens.map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => { setDevoteeScreen(id); setMenuOpen(false); }}
                      style={{
                        textAlign: "left", borderRadius: "8px", padding: "10px 12px",
                        background: devoteeScreen === id ? "rgba(200, 75, 49,0.18)" : "transparent",
                        color: devoteeScreen === id ? "#C84B31" : "#fff",
                        fontFamily: "Poppins, sans-serif", fontSize: "13px",
                        fontWeight: devoteeScreen === id ? 700 : 500, border: "none", cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))
                  : currentAdminScreens.map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => { setAdminScreen(id); setMenuOpen(false); }}
                      style={{
                        textAlign: "left", borderRadius: "8px", padding: "10px 12px",
                        background: adminScreen === id ? "rgba(200, 75, 49,0.18)" : "transparent",
                        color: adminScreen === id ? "#C84B31" : "#fff",
                        fontFamily: "Poppins, sans-serif", fontSize: "13px",
                        fontWeight: adminScreen === id ? 700 : 500, border: "none", cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main canvas */}
      <div
        style={{ flex: 1, overflow: "hidden", display: "flex" }}
      >
        {mode === "devotee" ? (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#F5F0E6" }}>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              {devoteeScreen === "home" && <HomeScreen onNavigate={handleDevoteeNav} />}
              {devoteeScreen === "queue" && (
                <QueueBookingScreen
                  onBack={() => setDevoteeScreen("home")}
                  onConfirm={() => setDevoteeScreen("live")}
                />
              )}
              {devoteeScreen === "live" && <LiveQueueScreen onBack={() => setDevoteeScreen("home")} />}
              {devoteeScreen === "map" && <TempleMapScreen onBack={() => setDevoteeScreen("home")} />}
              {devoteeScreen === "emergency" && (
                <EmergencyAlertScreen onBack={() => setDevoteeScreen("home")} />
              )}
            </div>
            {devoteeScreen !== "emergency" && devoteeScreen !== "map" && (
              <div style={{ flexShrink: 0, background: "#fff" }}>
                <BottomNav
                  active={devoteeScreen === "queue" || devoteeScreen === "live" ? "queue" : devoteeScreen}
                  onChange={handleDevoteeNav}
                />
              </div>
            )}
          </div>
        ) : (
          /* Admin dashboard */
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <AdminSidebar active={adminScreen} onChange={(id) => setAdminScreen(id as AdminScreen)} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              {adminScreen === "crowd" && <CrowdMonitor />}
              {adminScreen === "queuecontrol" && <QueueControl />}
              {adminScreen === "temples" && <TempleManager />}
              {adminScreen === "emergency" && <EmergencyPanel />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
