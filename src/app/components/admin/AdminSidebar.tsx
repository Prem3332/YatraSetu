import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, Users, Bell, BarChart2, FileText, Settings, Shield, LogOut, Building2 } from "lucide-react";
import { useTemple } from "../../context/TempleContext";
import { fetchCurrentUser, ApiUser } from "../../lib/api";

const navItems = [
  { id: "crowd", label: "Dashboard", icon: LayoutDashboard },
  { id: "queuecontrol", label: "Queue Control", icon: Users },
  { id: "temples", label: "Manage Temples", icon: Building2 },
  { id: "emergency", label: "Emergency", icon: Bell, alert: true },
  { id: "traffic", label: "Traffic", icon: BarChart2 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  active: string;
  onChange: (id: string) => void;
}

export function AdminSidebar({ active, onChange }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { selectedTemple } = useTemple();
  const [adminUser, setAdminUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(user => setAdminUser(user))
      .catch(err => console.error("Failed to load admin profile:", err));
  }, []);

  const adminName = adminUser?.name || "System Admin";
  const adminInitials = adminName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div
      className="flex flex-col"
      style={{ width: "220px", background: "#2D4238", height: "100%", flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#C84B31" }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <p style={{ color: "#fff", fontSize: "14px", fontWeight: 800, margin: 0, fontFamily: "Poppins, sans-serif" }}>YatraSetu</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", margin: 0, fontFamily: "Poppins, sans-serif" }}>Admin Console</p>
          </div>
        </div>
      </div>

      {/* Temple selector */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0", fontFamily: "Poppins, sans-serif" }}>Current Temple</p>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "14px" }}>🛕</span>
          <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: "Poppins, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedTemple?.name ?? "No Temple Selected"}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map(({ id, label, icon: Icon, alert }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 relative text-left w-full"
              style={{
                background: isActive ? "rgba(200, 75, 49,0.15)" : "transparent",
                border: isActive ? "1px solid rgba(200, 75, 49,0.3)" : "1px solid transparent",
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              <Icon
                size={18}
                color={isActive ? "#C84B31" : "rgba(255,255,255,0.5)"}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span style={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#C84B31" : "rgba(255,255,255,0.7)" }}>
                {label}
              </span>
              {alert && (
                <span
                  className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#EF4444", fontSize: "10px", color: "#fff", fontWeight: 700 }}
                >
                  1
                </span>
              )}
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("yatrasetu_token");
            localStorage.removeItem("yatrasetu_app_mode");
            navigate("/login");
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left w-full"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
            marginTop: "8px",
          }}
        >
          <LogOut size={18} color="#EF4444" strokeWidth={1.8} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#EF4444" }}>
            Logout
          </span>
        </button>
      </nav>

      {/* User info */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#C84B31", fontSize: "12px", fontWeight: 700, color: "#fff", fontFamily: "Poppins, sans-serif" }}>
            {adminInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: "#fff", fontSize: "12px", fontWeight: 600, margin: 0, fontFamily: "Poppins, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminName}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", margin: 0, fontFamily: "Poppins, sans-serif" }}>
              {adminUser?.role === "temple_admin" ? "Temple Admin" : "System Admin"}
            </p>
          </div>
          <LogOut size={14} color="rgba(255,255,255,0.4)" style={{ cursor: "pointer" }} onClick={() => {
            localStorage.removeItem("yatrasetu_token");
            window.location.reload();
          }} />
        </div>
      </div>
    </div>
  );
}
