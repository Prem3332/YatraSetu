import { useState } from "react";
import { ArrowLeft, Clock, Bell } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface LiveQueueScreenProps {
  onBack: () => void;
}

const recentTokens = [
  { token: "A244", status: "called" },
  { token: "A245", status: "called" },
  { token: "A246", status: "called" },
  { token: "A247", status: "you" },
  { token: "A248", status: "waiting" },
  { token: "A249", status: "waiting" },
  { token: "A250", status: "waiting" },
];

export function LiveQueueScreen({ onBack }: LiveQueueScreenProps) {
  const { t } = useLanguage();
  const [notifyToggle, setNotifyToggle] = useState(true);
  const total = 76;
  const ahead = 38;
  const progress = ((total - ahead) / total) * 100;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
      {/* Header */}
      <div style={{ background: "#2D4238", paddingTop: "52px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>{t("live.title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: 0 }}>{t("queue.temple")} · Main Entry</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#fff", fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Token + circular progress */}
        <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>{t("live.yourToken")}</p>
          <h1 style={{ fontSize: "40px", fontWeight: 900, color: "#C84B31", margin: "0 0 16px 0", letterSpacing: "-1px" }}>#A247</h1>

          {/* Circular progress */}
          <div className="relative flex items-center justify-center" style={{ width: "160px", height: "160px" }}>
            <svg width="160" height="160" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f0ede8" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="60"
                fill="none"
                stroke="#C84B31"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span style={{ fontSize: "32px", fontWeight: 900, color: "#2D4238", lineHeight: 1 }}>{ahead}</span>
              <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, textAlign: "center" }}>{t("live.peopleAhead")}</span>
            </div>
          </div>

          {/* Wait time */}
          <div className="flex items-center gap-2 mt-4 rounded-xl px-4 py-2" style={{ background: "#FFF3E8" }}>
            <Clock size={16} color="#C84B31" />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238" }}>{t("live.estWait")}: </span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#C84B31" }}>~25 minutes</span>
          </div>
        </div>

        {/* Status stages */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <div className="flex items-center">
            {[
              { label: "Booked", done: true },
              { label: "In Queue", done: true, active: true },
              { label: "Your Turn", done: false },
            ].map((stage, i, arr) => (
              <div key={stage.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: stage.active ? "#C84B31" : stage.done ? "#22C55E" : "#f0ede8",
                      border: stage.active ? "3px solid #FED7AA" : "none",
                    }}
                  >
                    {stage.done && !stage.active && <span style={{ color: "#fff", fontSize: "14px" }}>✓</span>}
                    {stage.active && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    {!stage.done && !stage.active && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: stage.active ? 700 : 500, color: stage.active ? "#C84B31" : stage.done ? "#22C55E" : "#9ca3af", marginTop: "4px", textAlign: "center" }}>{stage.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-5" style={{ background: i === 0 ? "#22C55E" : "#e5e7eb" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live token feed */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>{t("live.feed")}</p>
          <div className="flex flex-col gap-2">
            {recentTokens.map((item) => (
              <div
                key={item.token}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{
                  background: item.status === "you" ? "#FFF3E8" : item.status === "called" ? "#F0FDF4" : "#F5F0E6",
                  border: item.status === "you" ? "2px solid #C84B31" : item.status === "called" ? "1.5px solid #BBF7D0" : "1.5px solid transparent",
                }}
              >
                <span style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: item.status === "you" ? "#C84B31" : item.status === "called" ? "#16A34A" : "#9ca3af",
                }}>
                  {item.token}
                </span>
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{
                  background: item.status === "you" ? "#C84B31" : item.status === "called" ? "#22C55E" : "#e5e7eb",
                }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                    {item.status === "you" ? "YOU 👤" : item.status === "called" ? `✓ ${t("live.called")}` : t("live.waiting")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} color="#2D4238" />
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#2D4238", margin: 0 }}>Notify 5 tokens before</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>Push notification + SMS</p>
              </div>
            </div>
            <div
              onClick={() => setNotifyToggle(!notifyToggle)}
              className="rounded-full cursor-pointer"
              style={{ width: "44px", height: "24px", background: notifyToggle ? "#C84B31" : "#d1d5db", position: "relative", transition: "background 0.2s" }}
            >
              <div className="absolute rounded-full bg-white" style={{ width: "20px", height: "20px", top: "2px", left: notifyToggle ? "22px" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-2xl py-3"
          style={{ background: "transparent", color: "#EF4444", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 700, border: "2px solid #EF4444", cursor: "pointer" }}
        >
          {t("live.cancel")}
        </button>
        <div style={{ height: "8px" }} />
      </div>
    </div>
  );
}
