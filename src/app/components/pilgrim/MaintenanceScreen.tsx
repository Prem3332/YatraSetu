import { useState } from "react";
import { Construction, RefreshCw, Clock, Heart } from "lucide-react";

interface MaintenanceScreenProps {
  message: string;
  estimatedCompletion: string | null;
  onRefresh: () => void;
}

export function MaintenanceScreen({ message, estimatedCompletion, onRefresh }: MaintenanceScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    // The parent will re-fetch and either remove this screen or keep it.
    // Reset spinner after a short delay in case the parent doesn't unmount us.
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Format the estimated completion time
  const formatEstimated = (iso: string | null) => {
    if (!iso) return null;
    try {
      const date = new Date(iso);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = isToday ? "Today" : date.toLocaleDateString([], { month: "short", day: "numeric" });
      return { dateStr, timeStr };
    } catch {
      return null;
    }
  };

  const estimated = formatEstimated(estimatedCompletion);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "linear-gradient(180deg, #F5F0E6 0%, #EDE5D4 100%)",
        fontFamily: "Poppins, sans-serif",
        padding: "32px",
        boxSizing: "border-box",
        textAlign: "center",
        overflow: "auto",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "28px",
          background: "linear-gradient(135deg, #C84B31 0%, #A33A23 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          boxShadow: "0 12px 40px rgba(200, 75, 49, 0.3)",
          animation: "pulse 3s ease-in-out infinite",
        }}
      >
        <Construction size={44} color="#fff" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#2D4238",
          margin: "0 0 12px 0",
          letterSpacing: "-0.5px",
        }}
      >
        We'll Be Back Soon
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "15px",
          color: "#6b7280",
          margin: "0 0 24px 0",
          maxWidth: "420px",
          lineHeight: "1.6",
        }}
      >
        The YatraSetu Devotee App is currently under scheduled maintenance.
      </p>

      {/* Message card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px 28px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(45, 66, 56, 0.08)",
          marginBottom: "24px",
          border: "1px solid rgba(45, 66, 56, 0.06)",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "#374151",
            margin: 0,
            lineHeight: "1.7",
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      </div>

      {/* Estimated completion */}
      {estimated && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(200, 75, 49, 0.08)",
            borderRadius: "12px",
            padding: "14px 24px",
            marginBottom: "28px",
            border: "1px solid rgba(200, 75, 49, 0.15)",
          }}
        >
          <Clock size={18} color="#C84B31" strokeWidth={2} />
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#C84B31",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 2px 0",
              }}
            >
              Expected Completion
            </p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#2D4238", margin: 0 }}>
              {estimated.dateStr} · {estimated.timeStr}
            </p>
          </div>
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#C84B31",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "12px 28px",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "Poppins, sans-serif",
          cursor: refreshing ? "not-allowed" : "pointer",
          opacity: refreshing ? 0.7 : 1,
          transition: "all 0.2s",
          boxShadow: "0 4px 16px rgba(200, 75, 49, 0.25)",
          marginBottom: "28px",
        }}
      >
        <RefreshCw
          size={16}
          style={{
            animation: refreshing ? "spin 1s linear infinite" : "none",
          }}
        />
        {refreshing ? "Checking..." : "Refresh"}
      </button>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Heart size={14} color="#C84B31" fill="#C84B31" />
        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            margin: 0,
            fontWeight: 500,
          }}
        >
          Thank you for your patience.
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
