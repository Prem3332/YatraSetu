import { useState } from "react";
import { ArrowLeft, Navigation, Accessibility } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface TempleMapScreenProps {
  onBack: () => void;
}

const zones = [
  { id: "entry", label: "Entry Gate", x: 50, y: 280, w: 80, h: 40, color: "#22C55E", crowd: "Low", pct: 28, type: "gate" },
  { id: "shrine", label: "Main Shrine", x: 130, y: 150, w: 100, h: 90, color: "#F59E0B", crowd: "Moderate", pct: 64, type: "shrine" },
  { id: "prasad", label: "Prasad Counter", x: 240, y: 180, w: 70, h: 50, color: "#EF4444", crowd: "High", pct: 89, type: "food" },
  { id: "restroom", label: "Restrooms", x: 40, y: 160, w: 55, h: 40, color: "#3B82F6", crowd: "Low", pct: 20, type: "restroom" },
  { id: "firstaid", label: "First Aid", x: 240, y: 80, w: 55, h: 40, color: "#ffffff", crowd: "—", pct: 0, type: "firstaid", border: "#EF4444" },
  { id: "parking", label: "Parking", x: 50, y: 340, w: 110, h: 50, color: "#9ca3af", crowd: "Moderate", pct: 55, type: "parking" },
  { id: "corridor", label: "Corridor", x: 130, y: 260, w: 100, h: 35, color: "#F59E0B", crowd: "Moderate", pct: 58, type: "path" },
];

const zoneEmoji: Record<string, string> = {
  gate: "🚪",
  shrine: "🛕",
  food: "🍱",
  restroom: "🚻",
  firstaid: "➕",
  parking: "🅿️",
  path: "〰️",
};

export function TempleMapScreen({ onBack }: TempleMapScreenProps) {
  const { t } = useLanguage();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);

  const getZoneLabel = (id: string, defaultLabel: string) => {
    switch (id) {
      case "entry": return t("map.entryGate");
      case "shrine": return t("map.shrine");
      case "prasad": return t("map.prasad");
      case "restroom": return t("map.restroom");
      case "firstaid": return t("map.firstAid");
      case "parking": return t("map.parking");
      case "corridor": return t("map.corridor");
      default: return defaultLabel;
    }
  };

  const getZoneCrowd = (crowd: string) => {
    if (crowd === "—") return "—";
    switch (crowd) {
      case "Low": return t("map.crowdLow");
      case "Moderate": return t("map.crowdMod");
      case "High": return t("map.crowdHigh");
      default: return crowd;
    }
  };

  const hovered = zones.find((z) => z.id === hoveredZone);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Poppins, sans-serif", background: "#1a1a2e", position: "relative" }}>
      {/* Header overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: "52px",
          paddingBottom: "12px",
          paddingLeft: "16px",
          paddingRight: "16px",
          background: "linear-gradient(to bottom, rgba(45, 66, 56,0.95) 0%, transparent 100%)",
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>{t("map.title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: 0 }}>{t("queue.temple")}</p>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 relative" style={{ overflow: "hidden" }}>
        <svg
          viewBox="0 0 390 480"
          style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a2e4a 0%, #0f1e30 100%)" }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="390" height="480" fill="url(#grid)" />

          {/* Temple boundary */}
          <rect x="30" y="60" width="320" height="350" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Accessibility route */}
          {showAccessibility && (
            <path d="M 90 320 L 90 260 L 185 260 L 185 195 L 230 195" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round" />
          )}

          {/* Zones */}
          {zones.map((zone) => {
            const isHovered = hoveredZone === zone.id;
            return (
              <g key={zone.id} onClick={() => setHoveredZone(isHovered ? null : zone.id)} style={{ cursor: "pointer" }}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx="10"
                  fill={zone.color}
                  fillOpacity={isHovered ? 0.95 : 0.8}
                  stroke={zone.border || zone.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s", filter: isHovered ? "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" : "none" }}
                />
                {/* Cross for first aid */}
                {zone.type === "firstaid" && (
                  <>
                    <rect x={zone.x + zone.w / 2 - 2} y={zone.y + 10} width="4" height="20" rx="1" fill="#EF4444" />
                    <rect x={zone.x + zone.w / 2 - 10} y={zone.y + 18} width="20" height="4" rx="1" fill="#EF4444" />
                  </>
                )}
                <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 - 4} textAnchor="middle" fill={zone.type === "firstaid" ? "#1a1a2e" : "#1a1a2e"} fontSize="14" fontWeight="bold" fontFamily="Poppins, sans-serif">
                  {zoneEmoji[zone.type]}
                </text>
                <text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 12} textAnchor="middle" fill={zone.type === "firstaid" ? "#374151" : "rgba(0,0,0,0.8)"} fontSize="8" fontWeight="700" fontFamily="Poppins, sans-serif">
                  {getZoneLabel(zone.id, zone.label).length > 12 ? getZoneLabel(zone.id, zone.label).slice(0, 11) + "…" : getZoneLabel(zone.id, zone.label)}
                </text>
              </g>
            );
          })}

          {/* My Location pin */}
          <circle cx="185" cy="310" r="8" fill="#C84B31" stroke="#fff" strokeWidth="2" />
          <circle cx="185" cy="310" r="16" fill="rgba(200, 75, 49,0.2)" />
          <text x="185" y="314" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="Poppins, sans-serif">📍</text>

          {/* Compass */}
          <g transform="translate(340, 90)">
            <circle r="18" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text textAnchor="middle" y="-6" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Poppins, sans-serif">N</text>
            <path d="M 0 -12 L 3 0 L 0 -2 L -3 0 Z" fill="#EF4444" />
            <path d="M 0 12 L 3 0 L 0 2 L -3 0 Z" fill="rgba(255,255,255,0.5)" />
          </g>

          {/* Tooltip */}
          {hovered && (
            <g>
              <rect x="95" y="30" width="200" height="56" rx="12" fill="#2D4238" stroke="rgba(200, 75, 49,0.5)" strokeWidth="1.5" />
              <text x="115" y="54" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Poppins, sans-serif">{getZoneLabel(hovered.id, hovered.label)}</text>
              <rect x="115" y="62" width={hovered.pct * 1.5} height="6" rx="3" fill={hovered.color} />
              <rect x="115" y="62" width="150" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
              <rect x="115" y="62" width={hovered.pct * 1.5} height="6" rx="3" fill={hovered.color} />
              <text x="272" y="70" fill={hovered.color} fontSize="10" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="end">{hovered.pct}%</text>
            </g>
          )}
        </svg>

        {/* Floating buttons */}
        <button
          onClick={() => {}}
          className="absolute rounded-full flex items-center justify-center"
          style={{ top: "80px", right: "16px", width: "40px", height: "40px", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", border: "none", cursor: "pointer", zIndex: 10 }}
        >
          <Navigation size={18} color="#2D4238" />
        </button>

        <button
          onClick={() => setShowAccessibility(!showAccessibility)}
          className="absolute rounded-2xl flex items-center gap-2 px-3 py-2"
          style={{
            bottom: sheetOpen ? "220px" : "80px",
            right: "16px",
            background: showAccessibility ? "#a855f7" : "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            transition: "bottom 0.3s",
          }}
        >
          <span style={{ fontSize: "14px" }}>♿</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: showAccessibility ? "#fff" : "#2D4238" }}>{t("map.routes")}</span>
        </button>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div className="rounded-t-3xl" style={{ background: "#fff", padding: "12px 16px 24px", zIndex: 20 }}>
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full" style={{ background: "#e5e7eb" }} />
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>{t("map.legend")}</p>
          <div className="grid grid-cols-2 gap-2">
            {zones.map((z) => (
              <div key={z.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: z.color, border: z.border ? `1.5px solid ${z.border}` : "none" }} />
                <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500 }}>{getZoneLabel(z.id, z.label)}</span>
                {z.crowd !== "—" && (
                  <span style={{ fontSize: "9px", fontWeight: 700, color: z.color === "#22C55E" ? "#16a34a" : z.color === "#F59E0B" ? "#d97706" : z.color === "#EF4444" ? "#dc2626" : "#6b7280" }} className="ml-auto">
                    {getZoneCrowd(z.crowd)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
