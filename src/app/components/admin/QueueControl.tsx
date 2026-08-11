import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  CheckCircle,
  Play,
  XCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useTemple } from "../../context/TempleContext";
import { useAdminData } from "../../lib/useAdminData";

const statusColor: Record<string, string> = {
  booked: "#C84B31",
  serving: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#6B7280",
};

const statusBg: Record<string, string> = {
  booked: "#FFF3E8",
  serving: "#EFF6FF",
  completed: "#F0FDF4",
  cancelled: "#F3F4F6",
};

const statusLabel: Record<string, string> = {
  booked: "Booked",
  serving: "Serving",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function QueueControl() {
  const { selectedTemple } = useTemple();
  const templeId = selectedTemple?._id;

  const {
    bookings,
    pagination,
    statistics,
    filters,
    loading,
    error,
    updatingId,
    setFilter,
    changePage,
    changeLimit,
    updateStatus,
    deleteBooking,
    refresh,
  } = useAdminData(templeId);

  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        setFilter("search", searchInput);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, setFilter]);

  const activeStatus = filters.status || "All";

  const nextWaiting = bookings.find((b) => b.status === "booked");
  const currentlyServing = bookings.find((b) => b.status === "serving");

  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "#F5F0E6",
        fontFamily: "Poppins, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Announcement bar */}
      <div
        className="flex items-center justify-between px-6 py-2.5"
        style={{ background: "#2D4238", flexShrink: 0 }}
      >
        <div className="flex items-center gap-2">
          <Volume2 size={14} color="#C84B31" />
          <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>
            Currently Serving:{" "}
          </span>
          <span style={{ fontSize: "12px", color: "#C84B31", fontWeight: 800 }}>
            {statistics?.currentToken ? `Token #${statistics.currentToken}` : currentlyServing ? `Token #${currentlyServing.tokenNumber}` : "None"}
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            {" "}
            at {selectedTemple?.name ?? "Temple Gate"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
            Main Gate Open
          </span>
        </div>
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(45, 66, 56,0.08)",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#2D4238",
              margin: 0,
            }}
          >
            Queue Control Panel
          </h1>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
            {selectedTemple?.name ?? "All Temples"} · Live Queue & Booking Operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{
              background: "#f0ede8",
              color: "#2D4238",
              border: "none",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#f0ede8" }}
          >
            <span
              style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}
            >
              {todayStr}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-5 p-5">
        {/* Main content */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Filters & Search */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="flex items-center gap-1 rounded-xl p-1"
              style={{
                background: "#fff",
                boxShadow: "0 2px 8px rgba(45, 66, 56,0.06)",
              }}
            >
              {["All", "booked", "serving", "completed", "cancelled"].map(
                (f) => {
                  const label = f === "All" ? "All" : statusLabel[f] || f;
                  const isSelected = activeStatus.toLowerCase() === f.toLowerCase();
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter("status", f)}
                      className="rounded-lg px-3 py-1.5"
                      style={{
                        background: isSelected ? "#2D4238" : "transparent",
                        color: isSelected ? "#fff" : "#6b7280",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "12px",
                        fontWeight: isSelected ? 700 : 500,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>

            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1"
              style={{
                background: "#fff",
                boxShadow: "0 2px 8px rgba(45, 66, 56,0.06)",
              }}
            >
              <Search size={14} color="#9ca3af" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by devotee name, phone, or token #"
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "12px",
                  color: "#374151",
                  fontFamily: "Poppins, sans-serif",
                  background: "transparent",
                  width: "100%",
                }}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div
            className="flex-1 flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: "#fff",
              boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)",
            }}
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
                <Loader2 size={32} className="animate-spin text-emerald-700 mb-2" />
                <p style={{ fontSize: "14px", fontWeight: 600 }}>Loading live queue data...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-rose-600">
                <AlertCircle size={32} className="mb-2" />
                <p style={{ fontSize: "14px", fontWeight: 600 }}>{error}</p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-xl px-4 py-2 bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200"
                >
                  Retry
                </button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
                <p style={{ fontSize: "15px", fontWeight: 600 }}>No bookings found</p>
                <p style={{ fontSize: "12px" }}>
                  Try adjusting your search query or status filter.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F5F0E6", position: "sticky", top: 0, zIndex: 10 }}>
                      {[
                        "Token #",
                        "Devotee Name",
                        "Phone",
                        "Temple",
                        "Date & Slot",
                        "People",
                        "Status",
                        "Booking Time",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontFamily: "Poppins, sans-serif",
                            borderBottom: "1px solid rgba(45, 66, 56,0.06)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, i) => {
                      const isUpdating = updatingId === booking.id;
                      const status = booking.status.toLowerCase();
                      const dateDisplay = booking.slotDate
                        ? new Date(booking.slotDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—";

                      const bookingTimeDisplay = booking.bookingTime
                        ? new Date(booking.bookingTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";

                      return (
                        <tr
                          key={booking.id}
                          style={{
                            background:
                              status === "serving"
                                ? "#EFF6FF"
                                : i % 2 === 0
                                ? "#fff"
                                : "#fafafa",
                            borderBottom: "1px solid rgba(45, 66, 56,0.04)",
                          }}
                        >
                          {/* Token Number */}
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                color: status === "serving" ? "#3B82F6" : "#2D4238",
                              }}
                            >
                              #{booking.tokenNumber}
                            </span>
                            {status === "serving" && (
                              <span
                                className="ml-2 rounded-full px-1.5 py-0.5"
                                style={{
                                  background: "#3B82F6",
                                  color: "#fff",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                }}
                              >
                                SERVING
                              </span>
                            )}
                          </td>

                          {/* Devotee Name */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              color: "#374151",
                              fontWeight: 600,
                            }}
                          >
                            {booking.userName}
                          </td>

                          {/* Phone */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {booking.userPhone}
                          </td>

                          {/* Temple */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "12px",
                              color: "#374151",
                              fontWeight: 500,
                            }}
                          >
                            {booking.templeName}
                          </td>

                          {/* Date & Slot */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            <span className="font-semibold text-gray-700">{dateDisplay}</span>
                            <span className="text-gray-400 block text-xs">{booking.slotTime}</span>
                          </td>

                          {/* People Count */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#2D4238",
                            }}
                          >
                            {booking.peopleCount}
                          </td>

                          {/* Status */}
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              className="rounded-full px-2.5 py-1"
                              style={{
                                background: statusBg[status] || "#F3F4F6",
                                color: statusColor[status] || "#6B7280",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {statusLabel[status] || status}
                            </span>
                          </td>

                          {/* Booking Time */}
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "11px",
                              color: "#9ca3af",
                            }}
                          >
                            {bookingTimeDisplay}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "12px 16px" }}>
                            <div className="flex items-center gap-1.5">
                              {isUpdating ? (
                                <Loader2 size={14} className="animate-spin text-gray-400" />
                              ) : (
                                <>
                                  {status === "booked" && (
                                    <button
                                      onClick={() => updateStatus(booking.id, "serving")}
                                      className="flex items-center gap-1 rounded-lg px-2 py-1"
                                      style={{
                                        background: "#EFF6FF",
                                        border: "1px solid #BFDBFE",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        color: "#2563EB",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <Play size={11} /> Serve
                                    </button>
                                  )}

                                  {(status === "booked" || status === "serving") && (
                                    <button
                                      onClick={() => updateStatus(booking.id, "completed")}
                                      className="flex items-center gap-1 rounded-lg px-2 py-1"
                                      style={{
                                        background: "#F0FDF4",
                                        border: "1px solid #BBF7D0",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        color: "#16A34A",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <CheckCircle size={11} /> Complete
                                    </button>
                                  )}

                                  {status !== "cancelled" && status !== "completed" && (
                                    <button
                                      onClick={() => updateStatus(booking.id, "cancelled")}
                                      className="flex items-center gap-1 rounded-lg px-2 py-1"
                                      style={{
                                        background: "#FEF2F2",
                                        border: "1px solid #FECACA",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        color: "#DC2626",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <XCircle size={11} /> Cancel
                                    </button>
                                  )}

                                  {(status === "completed" || status === "cancelled") && (
                                    <button
                                      onClick={() => deleteBooking(booking.id)}
                                      className="flex items-center gap-1 rounded-lg px-2 py-1"
                                      style={{
                                        background: "transparent",
                                        border: "1px solid #E5E7EB",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        color: "#6B7280",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <Trash2 size={11} /> Delete
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!loading && !error && bookings.length > 0 && (
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  borderTop: "1px solid rgba(45, 66, 56,0.06)",
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-800">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-800">{pagination.total}</span>{" "}
                  bookings
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Show:</span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => changeLimit(Number(e.target.value))}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "2px 6px",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => changePage(pagination.page - 1)}
                      className="p-1.5 rounded-lg border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: "#d1d5db", cursor: "pointer" }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, padding: "0 4px" }}>
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => changePage(pagination.page + 1)}
                      className="p-1.5 rounded-lg border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: "#d1d5db", cursor: "pointer" }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div
          className="flex flex-col gap-4"
          style={{ width: "240px", flexShrink: 0 }}
        >
          {/* Next Token Call */}
          <div
            className="rounded-2xl p-4 flex flex-col items-center gap-3"
            style={{
              background: "#fff",
              boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: 0,
              }}
            >
              Next Token
            </p>
            <div className="text-center">
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  color: "#C84B31",
                  margin: 0,
                }}
              >
                {statistics?.nextToken ? `#${statistics.nextToken}` : nextWaiting ? `#${nextWaiting.tokenNumber}` : "—"}
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                {nextWaiting ? nextWaiting.userName : "No waiting devotee"}
              </p>
            </div>
            {nextWaiting && (
              <button
                onClick={() => updateStatus(nextWaiting.id, "serving")}
                disabled={updatingId === nextWaiting.id}
                className="w-full rounded-xl py-3 flex items-center justify-center gap-2"
                style={{
                  background: "#C84B31",
                  color: "#fff",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(200, 75, 49,0.3)",
                }}
              >
                <Volume2 size={16} /> Serve Token #{nextWaiting.tokenNumber}
              </button>
            )}
          </div>

          {/* Dynamic Statistics */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "#fff",
              boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 12px 0",
              }}
            >
              Live Statistics (Today)
            </p>
            {[
              {
                label: "Today's Bookings",
                value: statistics?.todaysBookings ?? "—",
                color: "#2D4238",
              },
              {
                label: "Total Capacity",
                value: statistics?.totalCapacity ?? "—",
                color: "#374151",
              },
              {
                label: "Available Slots",
                value: statistics?.availableSlots ?? "—",
                color: "#16A34A",
              },
              {
                label: "Currently Serving",
                value: statistics?.serving ?? "—",
                color: "#3B82F6",
              },
              {
                label: "Completed",
                value: statistics?.completed ?? "—",
                color: "#22C55E",
              },
              {
                label: "Cancelled",
                value: statistics?.cancelled ?? "—",
                color: "#EF4444",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(45, 66, 56,0.06)" }}
              >
                <span
                  style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}
                >
                  {s.label}
                </span>
                <span
                  style={{ fontSize: "13px", fontWeight: 800, color: s.color }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Gate status */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "#fff",
              boxShadow: "0 2px 12px rgba(45, 66, 56,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 12px 0",
              }}
            >
              Gate Status
            </p>
            {[
              { gate: "Gate 1 — Main Entry", status: "Open", color: "#22C55E" },
              { gate: "Gate 2 — North Exit", status: "Open", color: "#22C55E" },
              { gate: "Gate 3 — South", status: "Closed", color: "#9ca3af" },
            ].map((g) => (
              <div
                key={g.gate}
                className="flex items-center justify-between py-2"
                style={{
                  borderBottom: "1px solid rgba(45, 66, 56,0.04)",
                }}
              >
                <span
                  style={{ fontSize: "11px", color: "#374151", fontWeight: 500 }}
                >
                  {g.gate}
                </span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: g.color }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: g.color,
                    }}
                  >
                    {g.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
