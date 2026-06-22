import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Shield, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface EmergencyAlertScreenProps {
  onBack: () => void;
}

export function EmergencyAlertScreen({ onBack }: EmergencyAlertScreenProps) {
  const { t } = useLanguage();
  const [pulse, setPulse] = useState(true);
  const [safe, setSafe] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 700);
    return () => clearInterval(interval);
  }, []);

  if (safe) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8" style={{ fontFamily: "Poppins, sans-serif", background: "#F0FDF4" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#22C55E" }}>
          <Shield size={40} color="#fff" />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#15803D", textAlign: "center", margin: "0 0 8px" }}>{t("sos.markedSafe")}</h2>
        <p style={{ fontSize: "13px", color: "#4B7C59", textAlign: "center", margin: "0 0 24px" }}>{t("sos.markedSafeDesc")}</p>
        <button
          onClick={onBack}
          className="w-full rounded-2xl py-3"
          style={{ background: "#22C55E", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}
        >
          {t("live.back")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#FEF2F2",
        position: "relative",
        border: pulse ? "4px solid #EF4444" : "4px solid #FCA5A5",
        transition: "border-color 0.7s ease",
      }}
    >
      {/* Header */}
      <div style={{ paddingTop: "52px", paddingBottom: "12px", paddingLeft: "16px", paddingRight: "16px", background: "#EF4444" }}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.2)" }}>
            <div className="w-2 h-2 rounded-full bg-white" style={{ opacity: pulse ? 1 : 0.4, transition: "opacity 0.7s" }} />
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>BROADCAST ACTIVE</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>2:34 PM</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", textAlign: "center", marginTop: "4px" }}>Issued by Temple Admin · Somnath Control Room</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Main alert */}
        <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(239,68,68,0.15)", border: "2px solid #FECACA" }}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{
              background: pulse ? "#EF4444" : "#FCA5A5",
              transition: "background 0.7s",
              boxShadow: "0 0 0 12px rgba(239,68,68,0.1), 0 0 0 24px rgba(239,68,68,0.05)",
            }}
          >
            <AlertTriangle size={40} color="#fff" />
          </div>
          <div className="rounded-full px-3 py-1 mb-3" style={{ background: "#FEE2E2" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.5px" }}>⚠ Stampede Alert</span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#DC2626", textAlign: "center", margin: "0 0 8px" }}>Exit via Gate 3</h2>
          <p style={{ fontSize: "13px", color: "#374151", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            Move calmly toward the <strong>northern exit</strong>. Follow staff instructions. Do not rush. Help elderly and children first.
          </p>
        </div>

        {/* Map snippet */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <div className="p-3 border-b" style={{ borderColor: "#FEE2E2" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626", margin: 0 }}>📍 Nearest Exit Routes</p>
          </div>
          <div style={{ position: "relative", height: "140px", background: "#1a2e4a" }}>
            <svg viewBox="0 0 340 140" style={{ width: "100%", height: "100%" }}>
              <rect width="340" height="140" fill="#1a2e4a" />
              {/* Temple outline */}
              <rect x="60" y="20" width="220" height="100" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Zones */}
              <rect x="110" y="40" width="80" height="60" rx="8" fill="rgba(200, 75, 49,0.4)" stroke="#C84B31" strokeWidth="1" />
              <text x="150" y="75" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Poppins, sans-serif">Main Shrine</text>
              {/* Exit gates with arrows */}
              {[
                { x: 60, y: 70, dir: "←", label: "Gate 1" },
                { x: 250, y: 70, dir: "→", label: "Gate 3 ✓" },
                { x: 160, y: 110, dir: "↓", label: "Gate 2" },
              ].map((g) => (
                <g key={g.label}>
                  <circle cx={g.x + (g.dir === "→" ? 25 : 0)} cy={g.y} r="14" fill={g.label.includes("✓") ? "#22C55E" : "rgba(255,255,255,0.1)"} />
                  <text x={g.x + (g.dir === "→" ? 25 : 0)} y={g.y + 4} textAnchor="middle" fill="#fff" fontSize="12" fontFamily="Poppins, sans-serif">{g.dir}</text>
                  <text x={g.x + (g.dir === "→" ? 25 : 0)} y={g.y + 22} textAnchor="middle" fill={g.label.includes("✓") ? "#22C55E" : "rgba(255,255,255,0.5)"} fontSize="8" fontWeight="700" fontFamily="Poppins, sans-serif">{g.label}</text>
                </g>
              ))}
              {/* Recommended path */}
              <path d="M 150 95 L 150 110 L 250 110 L 265 70" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>{t("sos.contacts")}</p>
          {[
            { label: "Police Control", number: "100" },
            { label: "Medical Team", number: "108" },
          ].map((c) => (
            <div key={c.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>{c.label}</span>
              <button className="flex items-center gap-1.5 rounded-xl px-3 py-1" style={{ background: "#EFF6FF", border: "none", cursor: "pointer" }}>
                <Phone size={12} color="#3B82F6" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#3B82F6" }}>{c.number}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <button
          onClick={() => setSafe(true)}
          className="w-full rounded-2xl py-4"
          style={{ background: "#22C55E", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "15px", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
        >
          ✅ {t("sos.imSafe")}
        </button>
        <button
          className="w-full rounded-2xl py-4"
          style={{ background: "transparent", color: "#DC2626", fontFamily: "Poppins, sans-serif", fontSize: "15px", fontWeight: 800, border: "3px solid #DC2626", cursor: "pointer" }}
        >
          {t("sos.needHelp")}
        </button>
        <div style={{ height: "8px" }} />
      </div>
    </div>
  );
}
