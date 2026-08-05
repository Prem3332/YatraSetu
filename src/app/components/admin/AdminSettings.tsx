import { useState, useEffect } from "react";
import { Settings, Shield, Loader2, Power, MessageSquare, Clock, Save, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  updateSystemSettings as apiUpdateSystemSettings,
  SystemSettings,
} from "../../lib/api";
import { useSettings } from "../../context/SettingsContext";

export function AdminSettings() {
  const { settings, loading: contextLoading, refreshSettings, error: contextError } = useSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local form state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Track if anything changed to enable save button
  const [original, setOriginal] = useState<{ mode: boolean; message: string; est: string }>({
    mode: false,
    message: "",
    est: "",
  });

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setMaintenanceMessage(settings.maintenanceMessage);

      const estStr = settings.estimatedCompletion
        ? new Date(settings.estimatedCompletion).toISOString().slice(0, 16)
        : "";
      setEstimatedCompletion(estStr);
      setLastUpdated(settings.updatedAt);
      setOriginal({
        mode: settings.maintenanceMode,
        message: settings.maintenanceMessage,
        est: estStr,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  const hasChanges =
    maintenanceMode !== original.mode ||
    maintenanceMessage !== original.message ||
    estimatedCompletion !== original.est;

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        maintenanceMode,
        maintenanceMessage,
      };
      if (estimatedCompletion) {
        payload.estimatedCompletion = new Date(estimatedCompletion).toISOString();
      } else {
        payload.estimatedCompletion = null;
      }

      const updated = await apiUpdateSystemSettings(
        payload as Parameters<typeof apiUpdateSystemSettings>[0]
      );

      setLastUpdated(updated.updatedAt);
      const estStr = updated.estimatedCompletion
        ? new Date(updated.estimatedCompletion).toISOString().slice(0, 16)
        : "";
      setOriginal({ mode: updated.maintenanceMode, message: updated.maintenanceMessage, est: estStr });

      toast.success(
        maintenanceMode
          ? "Maintenance Mode Enabled — Devotees will see the maintenance screen."
          : "Maintenance Mode Disabled — Devotees can now access the app."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
    fontFamily: "Poppins, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "#1a2e25",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div
        style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(200, 75, 49, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={20} color="#C84B31" />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>Settings</h1>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Manage system-wide configuration
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px", maxWidth: "640px" }}>
        {contextLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} color="#C84B31" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: "13px", margin: "0 0 12px 0" }}>⚠️ {error}</p>
            <button
              onClick={refreshSettings}
              style={{
                background: "rgba(200,75,49,0.15)",
                color: "#C84B31",
                border: "1px solid rgba(200,75,49,0.3)",
                borderRadius: "8px",
                padding: "8px 20px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* ── System Maintenance Card ───────────────────── */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Shield size={18} color="#C84B31" />
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>
                  System Maintenance
                </h2>
              </div>

              {/* Toggle row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: maintenanceMode ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                  border: `1px solid ${maintenanceMode ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "20px",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Power
                    size={20}
                    color={maintenanceMode ? "#EF4444" : "#22C55E"}
                    strokeWidth={2.5}
                  />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>
                      Maintenance Mode
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: maintenanceMode ? "#EF4444" : "#22C55E",
                        margin: "2px 0 0 0",
                      }}
                    >
                      {maintenanceMode ? "🔴 ON — Devotee app is blocked" : "🟢 OFF — Devotee app is live"}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    background: maintenanceMode ? "#EF4444" : "rgba(255,255,255,0.15)",
                    transition: "background 0.3s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: "3px",
                      left: maintenanceMode ? "25px" : "3px",
                      transition: "left 0.3s",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Confirmation banner when enabled */}
              {maintenanceMode && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <CheckCircle2 size={16} color="#EF4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#EF4444", margin: "0 0 4px 0" }}>
                      Maintenance Mode Enabled
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: "1.5" }}>
                      Devotees will temporarily see the maintenance screen. Admins can continue using the dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* Message field */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <MessageSquare size={12} color="rgba(255,255,255,0.5)" />
                  <p style={labelStyle}>Maintenance Message</p>
                </div>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "70px",
                  }}
                  placeholder="Message shown to devotees..."
                />
              </div>

              {/* Estimated completion */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Clock size={12} color="rgba(255,255,255,0.5)" />
                  <p style={labelStyle}>Estimated Completion (Optional)</p>
                </div>
                <input
                  type="datetime-local"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  background: hasChanges ? "#C84B31" : "rgba(255,255,255,0.08)",
                  color: hasChanges ? "#fff" : "rgba(255,255,255,0.3)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "Poppins, sans-serif",
                  cursor: hasChanges && !saving ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: hasChanges ? "0 4px 16px rgba(200,75,49,0.25)" : "none",
                }}
              >
                {saving ? (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Last updated */}
              {lastUpdated && (
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: "12px 0 0 0", textAlign: "center" }}>
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
