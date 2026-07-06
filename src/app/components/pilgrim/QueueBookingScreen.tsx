import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Calendar, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTemple } from "../../context/TempleContext";
import { fetchSlotAvailability, bookDarshanSlot, SlotAvailability } from "../../lib/api";

interface QueueBookingScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

function CalendarMonth({
  year,
  month,
  selectedDate,
  onSelectDate,
  today,
}: {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  today: Date;
}) {
  const monthName = new Date(year, month, 1).toLocaleString("en-IN", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ textAlign: "center", fontWeight: 700, fontSize: "15px", color: "#2D4238", margin: "0 0 10px 0", fontFamily: "Georgia, serif" }}>
        {monthName} {year}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
        {dayLabels.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#9ca3af", fontFamily: "Poppins, sans-serif", padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} style={{ aspectRatio: "1" }} />;
          const cellDate = new Date(year, month, day);
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isUnavailable = isPast;
          const isSelected = selectedDate === dateStr;

          let bg = "#ffffff";
          let color = "#4caf50";
          let border = "1px solid #4caf50";
          
          if (isUnavailable) { bg = "#f3f4f6"; color = "#b0b7c3"; border = "1px solid transparent"; }
          if (isSelected) { bg = "#ea580c"; color = "#fff"; border = "1px solid #ea580c"; }

          return (
            <button
              key={dateStr}
              disabled={isUnavailable}
              onClick={() => onSelectDate(dateStr)}
              style={{
                background: bg, border, borderRadius: "6px",
                cursor: isUnavailable ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                aspectRatio: "1", padding: 0,
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: isSelected ? 800 : 700, color, lineHeight: 1 }}>{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QueueBookingScreen({ onBack, onConfirm }: QueueBookingScreenProps) {
  const { t } = useLanguage();
  const today = new Date();

  const { selectedTemple } = useTemple();

  // Step 1 = calendar, Step 2 = time + details
  const [step, setStep] = useState<1 | 2>(1);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Auto-advance to step 2 when a date is selected
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

  useEffect(() => {
    if (templeId && selectedDate) {
      setLoadingSlots(true);
      setAvailableSlots([]);  // Reset before fetch to avoid stale data
      setSlotError(null);     // Clear previous errors
      fetchSlotAvailability(templeId, selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
        })
        .catch((err) => {
          console.error("Failed to fetch slots:", err);
          setAvailableSlots([]);
          setSlotError(err instanceof Error ? err.message : "Failed to load slots. Please try again.");
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [templeId, selectedDate]);

  const handleConfirmBooking = async () => {
    if (!selectedTemple || !selectedDate || !selectedSlot) return;
    
    setBookingLoading(true);
    try {
      await bookDarshanSlot({
        templeId: selectedTemple._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        peopleCount: people,
        name,
        phone
      });
      setBookingLoading(false);
      onConfirm(); // Navigate to success / live queue screen
    } catch (err: any) {
      setBookingLoading(false);
      alert("Booking failed: " + err.message);
    }
  };

  const baseMonth = today.getMonth() + calendarOffset * 2;
  const month1 = ((baseMonth % 12) + 12) % 12;
  const year1 = today.getFullYear() + Math.floor(baseMonth / 12);
  const month2 = ((baseMonth + 1) % 12 + 12) % 12;
  const year2 = today.getFullYear() + Math.floor((baseMonth + 1) / 12);

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
          {/* Step indicator */}
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

        {/* Step tabs */}
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

      {/* ── STEP 1: Calendar ── */}
      {step === 1 && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "16px", gap: "12px" }}>

          {/* Calendar card */}
          <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 2px 16px rgba(45, 66, 56,0.08)", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>

            {/* Calendar header */}
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px 0" }}>
                Select a Date
              </p>
              <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                Choose your preferred darshan date
              </p>
            </div>

            {/* Two-month calendars */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 4px", display: "flex", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", maxWidth: "560px", width: "100%" }}>
                <div style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "250px" }}>
                  <CalendarMonth year={year1} month={month1} selectedDate={selectedDate} onSelectDate={handleDateSelect} today={today} />
                </div>
                <div style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "250px" }}>
                  <CalendarMonth year={year2} month={month2} selectedDate={selectedDate} onSelectDate={handleDateSelect} today={today} />
                </div>
              </div>
            </div>

            {/* Navigation + Legend */}
            <div style={{ padding: "10px 14px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6" }}>
              <button
                onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))}
                disabled={calendarOffset === 0}
                style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: calendarOffset === 0 ? "#f3f4f6" : "#C84B31",
                  border: "none", cursor: calendarOffset === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: calendarOffset === 0 ? "none" : "0 2px 8px rgba(200, 75, 49,0.3)",
                  transition: "all 0.2s",
                }}
              >
                <ChevronLeft size={15} color={calendarOffset === 0 ? "#9ca3af" : "#fff"} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {[
                  { color: "#4caf50", label: "Available" },
                  { color: "#b0b7c3", label: "Not Available" },
                  { color: "#C84B31", label: "Selected" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, color: "#6b7280" }}>{label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCalendarOffset(calendarOffset + 1)}
                style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: "#C84B31", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(200, 75, 49,0.3)", transition: "all 0.2s",
                }}
              >
                <ChevronRight size={15} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Time + Details ── */}
      {step === 2 && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Selected date chip */}
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

          {/* Time slots */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                {t("queue.selectTime")}
              </p>
              {loadingSlots && <Loader2 size={14} color="#C84B31" style={{ animation: "spin 1s linear infinite" }} />}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {availableSlots.length > 0 ? availableSlots.map((slot) => {
                const isFull = slot.status === "full" || slot.available === 0;
                const isSelected = selectedSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    onClick={() => !isFull && setSelectedSlot(slot.time)}
                    disabled={isFull}
                    style={{
                      background: isSelected ? "#C84B31" : isFull ? "#f4f2ee" : "#FFF3E8",
                      border: isSelected ? "2px solid #C84B31" : isFull ? "2px solid #e5e7eb" : "2px solid #FED7AA",
                      cursor: isFull ? "not-allowed" : "pointer",
                      borderRadius: "12px", padding: "8px 4px",
                      fontFamily: "Poppins, sans-serif", opacity: isFull ? 0.6 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    <p style={{ fontSize: "11px", fontWeight: 700, color: isSelected ? "#fff" : isFull ? "#9ca3af" : "#2D4238", margin: 0 }}>{slot.time}</p>
                    <p style={{ fontSize: "9px", color: isSelected ? "rgba(255,255,255,0.8)" : isFull ? "#9ca3af" : "#C84B31", margin: 0, fontWeight: 600 }}>
                      {isFull ? "FULL" : `${slot.available} Left`}
                    </p>
                  </button>
                );
              }) : !loadingSlots && (
                <div style={{ gridColumn: "span 3", textAlign: "center", padding: "16px 0" }}>
                  {slotError ? (
                    <>
                      <p style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600, margin: "0 0 4px 0" }}>
                        ⚠️ {slotError}
                      </p>
                      <button
                        onClick={() => {
                          if (templeId && selectedDate) {
                            setLoadingSlots(true);
                            setSlotError(null);
                            fetchSlotAvailability(templeId, selectedDate)
                              .then((slots) => setAvailableSlots(slots))
                              .catch((err) => {
                                setAvailableSlots([]);
                                setSlotError(err instanceof Error ? err.message : "Failed to load slots.");
                              })
                              .finally(() => setLoadingSlots(false));
                          }
                        }}
                        style={{
                          fontSize: "11px", fontWeight: 700, color: "#C84B31",
                          background: "rgba(200,75,49,0.1)", border: "1px solid rgba(200,75,49,0.2)",
                          borderRadius: "8px", padding: "6px 16px", cursor: "pointer",
                          fontFamily: "Poppins, sans-serif", marginTop: "6px",
                        }}
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                      No slots configured for this date.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pilgrim details */}
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

          {/* Confirm CTA */}
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
