import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Clock, Bell, Loader2, Calendar, Users, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  fetchMyActiveBooking,
  fetchMyBooking,
  cancelMyBooking,
  type MyBookingResponse,
  type BookingDetail,
  type NearbyToken,
} from "../../lib/api";

interface LiveQueueScreenProps {
  onBack: () => void;
}

// ── Polling interval (ms) ──────────────────────────────────
const POLL_INTERVAL = 15000;

// ── Status badge helpers ───────────────────────────────────
function statusLabel(status: string, isYou: boolean): string {
  if (isYou) return "YOU 👤";
  if (status === "serving") return "✓ Called";
  if (status === "completed") return "✓ Done";
  return "Waiting";
}

function statusBadgeBg(status: string, isYou: boolean): string {
  if (isYou) return "#C84B31";
  if (status === "serving") return "#22C55E";
  if (status === "completed") return "#9ca3af";
  return "#e5e7eb";
}

function statusRowBg(status: string, isYou: boolean): string {
  if (isYou) return "#FFF3E8";
  if (status === "serving") return "#F0FDF4";
  return "#F5F0E6";
}

function statusRowBorder(status: string, isYou: boolean): string {
  if (isYou) return "2px solid #C84B31";
  if (status === "serving") return "1.5px solid #BBF7D0";
  return "1.5px solid transparent";
}

function statusTextColor(status: string, isYou: boolean): string {
  if (isYou) return "#C84B31";
  if (status === "serving") return "#16A34A";
  return "#9ca3af";
}

// ── Stage derivation from booking status ───────────────────
function getStages(bookingStatus: string) {
  const stages = [
    { label: "Booked", done: false, active: false },
    { label: "In Queue", done: false, active: false },
    { label: "Your Turn", done: false, active: false },
  ];

  if (bookingStatus === "booked") {
    stages[0].done = true;
    stages[1].done = true;
    stages[1].active = true;
  } else if (bookingStatus === "serving") {
    stages[0].done = true;
    stages[1].done = true;
    stages[2].done = true;
    stages[2].active = true;
  } else if (bookingStatus === "completed") {
    stages[0].done = true;
    stages[1].done = true;
    stages[2].done = true;
  }

  return stages;
}

// ── Main component ─────────────────────────────────────────

export function LiveQueueScreen({ onBack }: LiveQueueScreenProps) {
  const { t } = useLanguage();

  // Core state
  const [bookingData, setBookingData] = useState<MyBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifyToggle, setNotifyToggle] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Refs for polling lifecycle
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // ── Fetch booking data ─────────────────────────────────────
  const loadBooking = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      // Try localStorage first (set after booking), then fall back to API discovery
      const storedId = localStorage.getItem("yatrasetu_active_booking");
      let data: MyBookingResponse | null = null;

      if (storedId) {
        try {
          data = await fetchMyBooking(storedId);
        } catch {
          // Stored ID might be invalid/expired — fall through to active booking
          localStorage.removeItem("yatrasetu_active_booking");
        }
      }

      // If no stored ID or it failed, discover the user's active booking
      if (!data) {
        data = await fetchMyActiveBooking();
      }

      if (isMountedRef.current) {
        setBookingData(data);
        setError(null);

        // If we found a booking, persist its ID for future refreshes
        if (data?.booking) {
          localStorage.setItem("yatrasetu_active_booking", data.booking.id);
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load booking data");
      }
    } finally {
      if (isMountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  }, []);

  // ── Should we keep polling? ────────────────────────────────
  const shouldPoll = useCallback((booking: BookingDetail | null | undefined): boolean => {
    if (!booking) return false;
    // Only poll for active statuses
    return booking.status === "booked" || booking.status === "serving";
  }, []);

  // ── Polling with visibility awareness ──────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    loadBooking(true);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadBooking]);

  // Start/stop polling based on booking status and page visibility
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!shouldPoll(bookingData?.booking)) return;

    // Start polling
    intervalRef.current = setInterval(() => {
      if (!document.hidden) {
        loadBooking(false);
      }
    }, POLL_INTERVAL);

    // Visibility change handler: pause when hidden, resume when visible
    const handleVisibility = () => {
      if (!document.hidden && shouldPoll(bookingData?.booking)) {
        loadBooking(false); // Immediate fetch when returning
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [bookingData?.booking?.status, loadBooking, shouldPoll]);

  // ── Cancel booking ─────────────────────────────────────────
  const handleCancel = async () => {
    if (!bookingData?.booking) return;
    setCancelling(true);
    try {
      await cancelMyBooking(bookingData.booking.id);
      localStorage.removeItem("yatrasetu_active_booking");
      onBack();
    } catch (err: any) {
      setCancelling(false);
      setCancelConfirm(false);
      alert("Failed to cancel: " + (err?.message || "Unknown error"));
    }
  };

  // ── Derived values ─────────────────────────────────────────
  const booking = bookingData?.booking ?? null;
  const position = bookingData?.position ?? 0;
  const estimatedWait = bookingData?.estimatedWaitMinutes ?? 0;
  const nearbyTokens = bookingData?.nearbyTokens ?? [];
  const totalInQueue = booking?.queue?.bookedCount ?? 0;

  // Circular progress
  const progressPct = totalInQueue > 0
    ? Math.min(100, ((totalInQueue - position) / totalInQueue) * 100)
    : 0;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (progressPct / 100) * circumference;

  const stages = booking ? getStages(booking.status) : [];

  // ── RENDER: Loading state ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <Loader2 size={36} color="#C84B31" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>Loading your booking...</p>
      </div>
    );
  }

  // ── RENDER: Error state ────────────────────────────────────
  if (error && !booking) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", maxWidth: "340px" }}>
          <AlertTriangle size={40} color="#EF4444" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2D4238", margin: "0 0 8px 0" }}>Something went wrong</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>{error}</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button onClick={() => loadBooking(true)} style={{ padding: "10px 20px", borderRadius: "12px", background: "#C84B31", color: "#fff", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              Retry
            </button>
            <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: "12px", background: "#f0ede8", color: "#2D4238", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: No active booking ──────────────────────────────
  if (!booking) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", maxWidth: "340px" }}>
          <Calendar size={40} color="#C84B31" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2D4238", margin: "0 0 8px 0" }}>No Active Booking</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
            You don't have any active darshan booking. Book a slot to see your live queue status.
          </p>
          <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: "14px", background: "#C84B31", color: "#fff", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(200, 75, 49,0.3)" }}>
            Book Darshan Slot
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Cancelled booking ──────────────────────────────
  if (booking.status === "cancelled") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", maxWidth: "340px" }}>
          <XCircle size={40} color="#EF4444" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2D4238", margin: "0 0 8px 0" }}>Booking Cancelled</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Your booking at <strong>{booking.temple.name}</strong> has been cancelled.
          </p>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 16px 0" }}>
            Token #{booking.tokenNumber} · {booking.slotTime}
          </p>
          <button onClick={() => { localStorage.removeItem("yatrasetu_active_booking"); onBack(); }} style={{ padding: "12px 28px", borderRadius: "14px", background: "#C84B31", color: "#fff", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(200, 75, 49,0.3)" }}>
            Book Again
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Expired booking ────────────────────────────────
  if (booking.status === "expired") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", maxWidth: "340px" }}>
          <Clock size={40} color="#F59E0B" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2D4238", margin: "0 0 8px 0" }}>Booking Expired</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Your booking at <strong>{booking.temple.name}</strong> has expired.
          </p>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 16px 0" }}>
            Token #{booking.tokenNumber} · {new Date(booking.slotDate).toLocaleDateString("en-IN")}
          </p>
          <button onClick={() => { localStorage.removeItem("yatrasetu_active_booking"); onBack(); }} style={{ padding: "12px 28px", borderRadius: "14px", background: "#C84B31", color: "#fff", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(200, 75, 49,0.3)" }}>
            Book Again
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Completed booking ──────────────────────────────
  if (booking.status === "completed") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", maxWidth: "340px" }}>
          <CheckCircle2 size={40} color="#22C55E" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2D4238", margin: "0 0 8px 0" }}>Darshan Complete</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Your darshan at <strong>{booking.temple.name}</strong> is complete. 🙏
          </p>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 16px 0" }}>
            Token #{booking.tokenNumber} · {booking.slotTime}
          </p>
          <button onClick={() => { localStorage.removeItem("yatrasetu_active_booking"); onBack(); }} style={{ padding: "12px 28px", borderRadius: "14px", background: "#C84B31", color: "#fff", border: "none", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(200, 75, 49,0.3)" }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Active booking (booked / serving) ──────────────
  const formattedDate = new Date(booking.slotDate).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>
      {/* Header */}
      <div style={{ background: "#2D4238", paddingTop: "52px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => { localStorage.removeItem("yatrasetu_active_booking"); onBack(); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>{t("live.title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: 0 }}>{booking.temple.name}{booking.temple.city ? ` · ${booking.temple.city}` : ""}</p>
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
          <h1 style={{ fontSize: "40px", fontWeight: 900, color: "#C84B31", margin: "0 0 16px 0", letterSpacing: "-1px" }}>#{booking.tokenNumber}</h1>

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
              <span style={{ fontSize: "32px", fontWeight: 900, color: "#2D4238", lineHeight: 1 }}>{position}</span>
              <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, textAlign: "center" }}>{t("live.peopleAhead")}</span>
            </div>
          </div>

          {/* Wait time + booking info */}
          <div className="flex items-center gap-2 mt-4 rounded-xl px-4 py-2" style={{ background: "#FFF3E8" }}>
            <Clock size={16} color="#C84B31" />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#2D4238" }}>{t("live.estWait")}: </span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#C84B31" }}>
              {estimatedWait > 0 ? `~${estimatedWait} min` : "Your turn is near!"}
            </span>
          </div>

          {/* Slot info chips */}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "#F5F0E6", fontSize: "10px", fontWeight: 600, color: "#6b7280" }}>
              <Calendar size={10} /> {formattedDate}
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "#F5F0E6", fontSize: "10px", fontWeight: 600, color: "#6b7280" }}>
              <Clock size={10} /> {booking.slotTime}
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "#F5F0E6", fontSize: "10px", fontWeight: 600, color: "#6b7280" }}>
              <Users size={10} /> {booking.peopleCount} {booking.peopleCount === 1 ? "person" : "people"}
            </div>
          </div>
        </div>

        {/* Status stages */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
          <div className="flex items-center">
            {stages.map((stage, i, arr) => (
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
                  <div className="flex-1 h-0.5 mx-1 mb-5" style={{ background: stage.done && arr[i + 1].done ? "#22C55E" : "#e5e7eb" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live token feed */}
        {nearbyTokens.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>{t("live.feed")}</p>
            <div className="flex flex-col gap-2">
              {nearbyTokens.map((token: NearbyToken) => (
                <div
                  key={token.tokenNumber}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{
                    background: statusRowBg(token.status, !!token.isYou),
                    border: statusRowBorder(token.status, !!token.isYou),
                  }}
                >
                  <span style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: statusTextColor(token.status, !!token.isYou),
                  }}>
                    #{token.tokenNumber}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{
                    background: statusBadgeBg(token.status, !!token.isYou),
                  }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                      {statusLabel(token.status, !!token.isYou)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Cancel booking */}
        {booking.status === "booked" && (
          <>
            {cancelConfirm ? (
              <div className="rounded-2xl p-4" style={{ background: "#FEF2F2", border: "2px solid #FECACA" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#991B1B", margin: "0 0 8px 0" }}>Cancel your booking?</p>
                <p style={{ fontSize: "11px", color: "#7F1D1D", margin: "0 0 12px 0" }}>
                  This will release your slot at {booking.temple.name}. This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="rounded-xl py-2.5 flex-1 flex items-center justify-center gap-2"
                    style={{ background: "#EF4444", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 700, border: "none", cursor: cancelling ? "not-allowed" : "pointer", opacity: cancelling ? 0.7 : 1 }}
                  >
                    {cancelling && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    disabled={cancelling}
                    className="rounded-xl py-2.5 flex-1"
                    style={{ background: "#fff", color: "#374151", fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 700, border: "1.5px solid #e5e7eb", cursor: "pointer" }}
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCancelConfirm(true)}
                className="w-full rounded-2xl py-3"
                style={{ background: "transparent", color: "#EF4444", fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 700, border: "2px solid #EF4444", cursor: "pointer" }}
              >
                {t("live.cancel")}
              </button>
            )}
          </>
        )}

        <div style={{ height: "8px" }} />
      </div>
    </div>
  );
}
