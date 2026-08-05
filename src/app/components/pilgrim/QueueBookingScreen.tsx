import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Calendar, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTemple } from "../../context/TempleContext";
import { fetchSlotAvailability, bookDarshanSlot, SlotAvailability } from "../../lib/api";

// Extracted sub-components and hooks
import { useMonthlyTraffic } from "./QueueBooking/useMonthlyTraffic";
import { CalendarMonth } from "./QueueBooking/CalendarMonth";
import { Legend } from "./QueueBooking/Legend";
import { SlotList } from "./QueueBooking/SlotList";

/** Hook to track viewport width for responsive layout */
function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

interface QueueBookingScreenProps {
  onBack: () => void;
  onConfirm: (bookingId: string) => void;
}

export function QueueBookingScreen({ onBack, onConfirm }: QueueBookingScreenProps) {
  const { t } = useLanguage();
  const today = new Date();
  const { selectedTemple } = useTemple();

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const [step, setStep] = useState<1 | 2>(1);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTimeout(() => setStep(2), 350);
  };
  
  const [people, setPeople] = useState(2);
  const [accessibility, setAccessibility] = useState(false);
  const [name, setName] = useState("Ramesh Patel");
  const [phone, setPhone] = useState("+91 98765 43210");
  
  const [availableSlots, setAvailableSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const templeId = selectedTemple?._id ?? null;

  const monthStep = isMobile ? 1 : 2;
  const baseMonth = today.getMonth() + calendarOffset * monthStep;
  const month1 = ((baseMonth % 12) + 12) % 12;
  const year1 = today.getFullYear() + Math.floor(baseMonth / 12);
  const month2 = ((baseMonth + 1) % 12 + 12) % 12;
  const year2 = today.getFullYear() + Math.floor((baseMonth + 1) / 12);

  const { dailyTrafficMonth1, dailyTrafficMonth2 } = useMonthlyTraffic(templeId, year1, month1, year2, month2);

  const loadSlots = () => {
    if (templeId && selectedDate) {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSlotError(null);
      fetchSlotAvailability(templeId, selectedDate)
        .then((slots) => setAvailableSlots(slots))
        .catch((err) => setSlotError(err instanceof Error ? err.message : "Failed to load slots."))
        .finally(() => setLoadingSlots(false));
    }
  };

  useEffect(() => {
    loadSlots();
  }, [templeId, selectedDate]);

  const handleConfirmBooking = async () => {
    if (!selectedTemple || !selectedDate || !selectedSlot) return;

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const chosen = new Date(selectedDate + "T00:00:00");
    if (chosen < tomorrow) {
      alert("Bookings can only be made from tomorrow onward. Please select a future date.");
      return;
    }
    
    setBookingLoading(true);
    try {
      const result = await bookDarshanSlot({
        templeId: selectedTemple._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        peopleCount: people,
        name,
        phone
      });
      localStorage.setItem("yatrasetu_active_booking", result.booking.id);
      setBookingLoading(false);
      onConfirm(result.booking.id);
    } catch (err: any) {
      setBookingLoading(false);
      alert("Booking failed: " + err.message);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Poppins, sans-serif", background: "#F5F0E6" }}>

      {/* Header */}
      <div style={{ background: "#2D4238", paddingTop: "16px", paddingBottom: "14px", paddingLeft: "16px", paddingRight: "16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={step === 2 ? () => setStep(1) : onBack}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px", padding: "7px", cursor: "pointer", display: "flex" }}
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>{t("queue.title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: 0 }}>{t("queue.temple")}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                width: s === step ? "20px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: s === step ? "#C84B31" : "rgba(255,255,255,0.3)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button
            onClick={() => setStep(1)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "20px", border: "none",
              background: step === 1 ? "#C84B31" : "rgba(255,255,255,0.12)",
              color: step === 1 ? "#fff" : "rgba(255,255,255,0.6)",
              fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <Calendar size={12} />
            Select Date
          </button>
          <button
            onClick={() => selectedDate && setStep(2)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "20px", border: "none",
              background: step === 2 ? "#C84B31" : "rgba(255,255,255,0.12)",
              color: step === 2 ? "#fff" : selectedDate ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
              fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700,
              cursor: selectedDate ? "pointer" : "not-allowed", transition: "all 0.2s",
            }}
          >
            <Clock size={12} />
            Time & Details
          </button>
        </div>
      </div>

      {step === 1 && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: isMobile ? "12px" : "16px", gap: "12px" }}>
          <div style={{
            background: "#fff", borderRadius: "20px",
            boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px 0" }}>
                Select a Date
              </p>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                Choose your preferred darshan date
              </p>
            </div>

            <div style={{ padding: isMobile ? "12px 10px 4px" : "12px 16px 4px" }}>
              {isMobile ? (
                <div style={{ width: "100%" }}>
                  <CalendarMonth year={year1} month={month1} selectedDate={selectedDate} onSelectDate={handleDateSelect} today={today} dailyTraffic={dailyTrafficMonth1} />
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr 1fr",
                  gap: isDesktop ? "32px" : "20px",
                  width: "100%",
                  maxWidth: isDesktop ? "720px" : "600px",
                  margin: "0 auto",
                }}>
                  <div style={{ width: "100%" }}>
                    <CalendarMonth year={year1} month={month1} selectedDate={selectedDate} onSelectDate={handleDateSelect} today={today} dailyTraffic={dailyTrafficMonth1} />
                  </div>
                  <div style={{ width: "100%" }}>
                    <CalendarMonth year={year2} month={month2} selectedDate={selectedDate} onSelectDate={handleDateSelect} today={today} dailyTraffic={dailyTrafficMonth2} />
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: isMobile ? "8px 10px" : "8px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderTop: "1px solid #f3f4f6",
            }}>
              <button
                onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))}
                disabled={calendarOffset === 0}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: calendarOffset === 0 ? "#f3f4f6" : "#C84B31",
                  border: "none", cursor: calendarOffset === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: calendarOffset === 0 ? "none" : "0 2px 8px rgba(200, 75, 49,0.3)",
                  transition: "all 0.2s",
                }}
              >
                <ChevronLeft size={16} color={calendarOffset === 0 ? "#9ca3af" : "#fff"} />
              </button>

              <button
                onClick={() => setCalendarOffset(calendarOffset + 1)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#C84B31", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(200, 75, 49,0.3)", transition: "all 0.2s",
                }}
              >
                <ChevronRight size={16} color="#fff" />
              </button>
            </div>

            <Legend isMobile={isMobile} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {selectedDate && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #FFF3E8, #FFF7ED)",
              border: "1.5px solid #FED7AA",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>📅</span>
                <div>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0, fontWeight: 600 }}>SELECTED DATE</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#2D4238", margin: 0 }}>{formattedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                style={{
                  fontSize: "10px", fontWeight: 700, color: "#C84B31",
                  background: "rgba(200, 75, 49,0.1)", border: "1px solid rgba(200, 75, 49,0.2)",
                  borderRadius: "8px", padding: "4px 10px", cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Change
              </button>
            </div>
          )}

          <SlotList
            title={t("queue.selectTime")}
            availableSlots={availableSlots}
            loadingSlots={loadingSlots}
            slotError={slotError}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onRetry={loadSlots}
          />

          <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
              {t("queue.pilgrimDetails")}
            </p>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>{t("queue.fullName")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#2D4238", background: "#F5F0E6", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>{t("queue.phone")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#2D4238", background: "#F5F0E6", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>{t("queue.numDevotees")}</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={() => setPeople(Math.max(1, people - 1))}
                  style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f4f2ee", border: "1.5px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Minus size={16} color="#2D4238" />
                </button>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#2D4238", minWidth: "28px", textAlign: "center" }}>{people}</span>
                <button onClick={() => setPeople(Math.min(10, people + 1))}
                  style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#C84B31", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={16} color="#fff" />
                </button>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>Max 10</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "12px", padding: "12px", background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>♿</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#2D4238", margin: 0 }}>{t("queue.priorityAccess")}</p>
                  <p style={{ fontSize: "10px", color: "#6b7280", margin: 0 }}>{t("queue.priorityDesc")}</p>
                </div>
              </div>
              <div onClick={() => setAccessibility(!accessibility)} style={{ width: "44px", height: "24px", background: accessibility ? "#C84B31" : "#d1d5db", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: accessibility ? "22px" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={!selectedSlot || bookingLoading}
            style={{
              width: "100%", padding: "15px", borderRadius: "16px", border: "none",
              background: selectedSlot ? "#C84B31" : "#d1d5db",
              color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: "15px", fontWeight: 700,
              cursor: selectedSlot && !bookingLoading ? "pointer" : "not-allowed",
              boxShadow: selectedSlot ? "0 4px 20px rgba(200, 75, 49,0.35)" : "none",
              transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
            }}
          >
            {bookingLoading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {bookingLoading ? "Confirming..." : t("queue.confirm")}
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", margin: "-4px 0 8px" }}>
            📱 Your token will be sent via SMS
          </p>
        </div>
      )}
    </div>
  );
}
