import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Building2, Loader2, MapPin, Users, Clock, Edit2, Save } from "lucide-react";
import { toast, Toaster } from "sonner";

import {
  fetchTemples as apiFetchTemples,
  createTemple as apiCreateTemple,
  updateTemple as apiUpdateTemple,
  deleteTemple as apiDeleteTemple,
  Temple,
  CreateTemplePayload,
} from "../../lib/api";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";

const TimePicker12Hour = ({ value, onChange, id }: { value: string; onChange: (val: string) => void; id?: string }) => {
  // Parse the incoming value prop to seed internal state
  const parseValue = (v: string) => {
    const m = v ? v.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i) : null;
    return {
      h: m ? m[1] : "",
      m: m ? m[2] : "",
      p: m && m[3] ? m[3].toUpperCase() : "AM",
    };
  };

  // Internal state — persists partial selections across renders
  const [localHour, setLocalHour] = useState(() => parseValue(value).h);
  const [localMinute, setLocalMinute] = useState(() => parseValue(value).m);
  const [localAmpm, setLocalAmpm] = useState(() => parseValue(value).p);

  // Track previous value prop to detect external changes (e.g., editing an existing temple)
  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      const parsed = parseValue(value);
      setLocalHour(parsed.h);
      setLocalMinute(parsed.m);
      setLocalAmpm(parsed.p);
    }
  }, [value]);

  // Emit to parent whenever both hour and minute are set
  const emitIfComplete = (h: string, m: string, p: string) => {
    if (h && m) {
      onChange(`${h}:${m} ${p}`);
    }
  };

  const handleHourChange = (h: string) => {
    setLocalHour(h);
    emitIfComplete(h, localMinute, localAmpm);
  };

  const handleMinuteChange = (m: string) => {
    setLocalMinute(m);
    emitIfComplete(localHour, m, localAmpm);
  };

  const handleAmpmChange = (p: string) => {
    setLocalAmpm(p);
    emitIfComplete(localHour || "12", localMinute || "00", p);
  };

  const selectStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
    height: "38px",
    padding: "0 8px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif"
  };
  
  const optionStyle = { color: "#000", fontFamily: "Poppins, sans-serif" };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "nowrap" }} id={id}>
      <select value={localHour} onChange={e => handleHourChange(e.target.value)} style={selectStyle}>
        <option value="" disabled style={optionStyle}>HH</option>
        {Array.from({length: 12}, (_, i) => i + 1).map(h => (
          <option key={h} value={String(h)} style={optionStyle}>{h}</option>
        ))}
      </select>
      <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>:</span>
      <select value={localMinute} onChange={e => handleMinuteChange(e.target.value)} style={selectStyle}>
        <option value="" disabled style={optionStyle}>MM</option>
        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, "0")).map(m => (
          <option key={m} value={m} style={optionStyle}>{m}</option>
        ))}
      </select>
      <select value={localAmpm} onChange={e => handleAmpmChange(e.target.value)} style={selectStyle}>
        <option value="AM" style={optionStyle}>AM</option>
        <option value="PM" style={optionStyle}>PM</option>
      </select>
    </div>
  );
};

export function TempleManager() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTemple, setEditingTemple] = useState<Temple | null>(null);

  // Time conversion helpers
  const parseTime24 = (timeStr: string) => {
    if (!timeStr) return "";
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const modifier = match[3] ? match[3].toUpperCase() : null;
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, "0")}:${mins}`;
  };

  const formatTime12 = (time24: string) => {
    if (!time24) return "";
    const match = time24.match(/^(\d{2}):(\d{2})$/);
    if (!match) return time24;
    
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const modifier = hours >= 12 ? "PM" : "AM";
    
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    
    return `${hours}:${mins} ${modifier}`;
  };

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formOpenTime, setFormOpenTime] = useState("");
  const [formCloseTime, setFormCloseTime] = useState("");
  const [formSlots, setFormSlots] = useState<{startTime: string, endTime: string, capacity: string}[]>([]);

  const handleAddSlot = () => setFormSlots([...formSlots, { startTime: "", endTime: "", capacity: "" }]);
  const handleRemoveSlot = (idx: number) => setFormSlots(formSlots.filter((_, i) => i !== idx));
  const handleSlotChange = (idx: number, field: "startTime" | "endTime" | "capacity", value: string) => {
    const newSlots = [...formSlots];
    newSlots[idx][field] = value;
    setFormSlots(newSlots);
  };

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Temple | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTemples = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetchTemples();
      setTemples(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load temples";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemples();
  }, []);

  const resetForm = () => {
    setEditingTemple(null);
    setFormName("");
    setFormSlug("");
    setFormCity("");
    setFormLat("");
    setFormLng("");
    setFormCapacity("");
    setFormOpenTime("");
    setFormCloseTime("");
    setFormSlots([]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const handleOpenEdit = (temple: Temple) => {
    setEditingTemple(temple);
    setFormName(temple.name);
    setFormSlug(temple.slug);
    setFormCity(temple.city || "");
    setFormLat(temple.lat ? String(temple.lat) : "");
    setFormLng(temple.lng ? String(temple.lng) : "");
    setFormCapacity(temple.totalCapacity ? String(temple.totalCapacity) : "");
    if (temple.timings && temple.timings.length > 0) {
      setFormOpenTime(temple.timings[0].open || "");
      setFormCloseTime(temple.timings[0].close || "");
    } else {
      setFormOpenTime("");
      setFormCloseTime("");
    }
    if (temple.slotConfigurations && temple.slotConfigurations.length > 0) {
      setFormSlots(temple.slotConfigurations.map(sc => ({
        startTime: sc.startTime,
        endTime: sc.endTime,
        capacity: String(sc.capacity)
      })));
    } else {
      setFormSlots([]);
    }
    setAddOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      toast.error("Temple name and slug are required");
      return;
    }

    const payload: CreateTemplePayload = {
      name: formName.trim(),
      slug: formSlug.trim().toLowerCase(),
    };

    if (formCity.trim()) payload.city = formCity.trim();
    if (formLat) payload.lat = parseFloat(formLat);
    if (formLng) payload.lng = parseFloat(formLng);
    if (formCapacity) payload.totalCapacity = parseInt(formCapacity, 10);

    if (formOpenTime.trim() && formCloseTime.trim()) {
      payload.timings = [
        { day: "All", open: formOpenTime.trim(), close: formCloseTime.trim() },
      ];
    }

    const validSlots = formSlots.filter(s => s.startTime.trim() && s.endTime.trim() && s.capacity.trim());
    if (validSlots.length > 0) {
      payload.slotConfigurations = validSlots.map(s => ({
        startTime: s.startTime.trim(),
        endTime: s.endTime.trim(),
        capacity: parseInt(s.capacity, 10) || 0
      }));
    }

    try {
      setSubmitting(true);
      if (editingTemple) {
        await apiUpdateTemple(editingTemple._id, payload);
        toast.success(`Temple "${formName}" updated successfully`);
      } else {
        await apiCreateTemple(payload);
        toast.success(`Temple "${formName}" created successfully`);
      }
      resetForm();
      setAddOpen(false);
      await loadTemples();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create temple";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await apiDeleteTemple(deleteTarget._id);
      setTemples((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      toast.success(`Temple "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete temple";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "32px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #C84B31, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(200, 75, 49, 0.3)",
            }}
          >
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Manage Temples
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                margin: 0,
              }}
            >
              {temples.length} temple{temples.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>
        <Button
          id="add-temple-btn"
          onClick={handleOpenAdd}
          style={{
            background: "linear-gradient(135deg, #C84B31, #ea580c)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "10px 20px",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(200, 75, 49, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={16} />
          Add Temple
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
            gap: "16px",
          }}
        >
          <Loader2
            size={36}
            color="#C84B31"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>
            Loading temples…
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "rgba(239, 68, 68, 0.08)",
            borderRadius: "16px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <p style={{ color: "#EF4444", fontSize: "15px", fontWeight: 600, margin: "0 0 8px 0" }}>
            Failed to load temples
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 16px 0" }}>
            {error}
          </p>
          <Button
            onClick={loadTemples}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "8px 20px",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && temples.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "20px",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <Building2
            size={48}
            color="rgba(255,255,255,0.15)"
            style={{ marginBottom: "16px" }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 8px 0",
            }}
          >
            No temples yet
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              margin: "0 0 24px 0",
            }}
          >
            Add your first temple to get started
          </p>
          <Button
            onClick={handleOpenAdd}
            style={{
              background: "linear-gradient(135deg, #C84B31, #ea580c)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "10px 24px",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(200, 75, 49, 0.3)",
            }}
          >
            <Plus size={16} />
            Add First Temple
          </Button>
        </div>
      )}

      {/* Temple Table */}
      {!loading && !error && temples.length > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <TableHead
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Poppins, sans-serif",
                    padding: "14px 20px",
                  }}
                >
                  Temple
                </TableHead>
                <TableHead
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Poppins, sans-serif",
                    padding: "14px 16px",
                  }}
                >
                  Slug
                </TableHead>
                <TableHead
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Poppins, sans-serif",
                    padding: "14px 16px",
                  }}
                >
                  City
                </TableHead>
                <TableHead
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Poppins, sans-serif",
                    padding: "14px 16px",
                  }}
                >
                  Capacity
                </TableHead>
                <TableHead
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Poppins, sans-serif",
                    padding: "14px 16px",
                    textAlign: "right",
                  }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temples.map((temple) => (
                <TableRow
                  key={temple._id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s",
                  }}
                >
                  <TableCell
                    style={{
                      padding: "16px 20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, rgba(200, 75, 49,0.15), rgba(200, 75, 49,0.05))",
                          border: "1px solid rgba(200, 75, 49,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      >
                        🛕
                      </div>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 600,
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {temple.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    style={{ padding: "16px" }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "12px",
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                        background: "rgba(255,255,255,0.05)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {temple.slug}
                    </span>
                  </TableCell>
                  <TableCell
                    style={{ padding: "16px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={13} color="rgba(255,255,255,0.4)" />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "13px",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {temple.city || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    style={{ padding: "16px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={13} color="rgba(255,255,255,0.4)" />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "13px",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {temple.totalCapacity?.toLocaleString() || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    style={{ padding: "16px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenEdit(temple)}
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#3B82F6",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      <Edit2 size={13} />
                      Edit
                    </Button>
                    <Button
                      id={`delete-temple-${temple.slug}`}
                      variant="ghost"
                      onClick={() => setDeleteTarget(temple)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      <Trash2 size={13} />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Temple Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="admin-modal" // Adding a class so we can add scrollbar CSS in index.css if needed
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            fontFamily: "Poppins, sans-serif",
            maxWidth: "760px",
            width: "90vw",
            padding: 0,
            overflow: "hidden", // We handle overflow internally for sticky footer
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Sticky Header */}
          <div style={{ padding: "28px 32px 20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <DialogHeader>
              <DialogTitle
                style={{
                  color: "#fff",
                  fontSize: "20px",
                  fontWeight: 700,
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #C84B31, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(200, 75, 49, 0.3)",
                  }}
                >
                  <Plus size={18} color="#fff" />
                </div>
                {editingTemple ? "Edit Temple" : "Add New Temple"}
              </DialogTitle>
              <DialogDescription
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  fontFamily: "Poppins, sans-serif",
                  marginTop: "8px",
                }}
              >
                Fill in the temple details below. Name and slug are required.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div
            style={{
              padding: "24px 32px",
              overflowY: "auto",
              overflowX: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "36px",
            }}
          >
            {/* Section 1: Temple Information */}
            <div>
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "20px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Temple Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="temple-name" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                    Name <span style={{ color: "#C84B31" }}>*</span>
                  </Label>
                  <Input
                    id="temple-name"
                    placeholder="e.g. Somnath Temple"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", height: "42px", padding: "0 14px" }}
                  />
                </div>

                {/* Slug */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="temple-slug" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                    Slug <span style={{ color: "#C84B31" }}>*</span>
                  </Label>
                  <Input
                    id="temple-slug"
                    placeholder="e.g. somnath"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", fontFamily: "'Fira Code', 'Consolas', monospace", height: "42px", padding: "0 14px" }}
                  />
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0, marginTop: "4px" }}>
                    lowercase, no spaces — e.g. &apos;somnath&apos;
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div>
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "20px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Location
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* City */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="temple-city" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                    City
                  </Label>
                  <Input
                    id="temple-city"
                    placeholder="e.g. Veraval"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", height: "42px", padding: "0 14px" }}
                  />
                </div>

                {/* Lat / Lng row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="temple-lat" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                      Latitude
                    </Label>
                    <Input
                      id="temple-lat"
                      type="number"
                      step="any"
                      placeholder="20.8880"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", height: "42px", padding: "0 14px" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="temple-lng" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                      Longitude
                    </Label>
                    <Input
                      id="temple-lng"
                      type="number"
                      step="any"
                      placeholder="70.4012"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", height: "42px", padding: "0 14px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Capacity & Schedule */}
            <div>
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "20px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Capacity & Schedule
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Capacity */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="temple-capacity" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600 }}>
                      Total Capacity
                    </Label>
                    <Input
                      id="temple-capacity"
                      type="number"
                      placeholder="5000"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", height: "42px", padding: "0 14px" }}
                    />
                  </div>
                  <div></div> {/* Empty column for alignment */}
                </div>

                {/* Timings row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="temple-open" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} /> Opening Time
                    </Label>
                    <TimePicker12Hour
                      id="temple-open"
                      value={formOpenTime}
                      onChange={(val) => setFormOpenTime(val)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="temple-close" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} /> Closing Time
                    </Label>
                    <TimePicker12Hour
                      id="temple-close"
                      value={formCloseTime}
                      onChange={(val) => setFormCloseTime(val)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Custom Booking Slots */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, margin: 0, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Custom Booking Slots
                </h3>
                <Button
                  onClick={handleAddSlot}
                  variant="outline"
                  size="sm"
                  style={{ height: "32px", padding: "0 12px", fontSize: "13px", background: "rgba(255,255,255,0.04)", color: "#C84B31", border: "1px solid rgba(200, 75, 49, 0.3)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Add Slot
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.02)", padding: formSlots.length > 0 ? "16px" : "0", borderRadius: "12px", border: formSlots.length > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                {formSlots.map((slot, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "nowrap" }}>
                    <div style={{ flex: 1, display: "flex", gap: "12px", alignItems: "center" }}>
                      <TimePicker12Hour
                        value={slot.startTime}
                        onChange={(val) => handleSlotChange(idx, "startTime", val)}
                      />
                      <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>to</span>
                      <TimePicker12Hour
                        value={slot.endTime}
                        onChange={(val) => handleSlotChange(idx, "endTime", val)}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Input
                        placeholder="Capacity"
                        type="number"
                        value={slot.capacity}
                        onChange={(e) => handleSlotChange(idx, "capacity", e.target.value)}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", height: "40px", width: "100px", padding: "0 12px", textAlign: "center" }}
                      />
                      <button onClick={() => handleRemoveSlot(idx)} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} title="Remove Slot">
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))}
                {formSlots.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>No custom slots configured.</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "4px 0 0 0" }}>The default slots will be automatically generated.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: "16px", background: "rgba(30, 41, 59, 0.95)" }}>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={submitting}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                height: "44px",
                padding: "0 24px",
              }}
            >
              Cancel
            </Button>
            <Button
              id="submit-add-temple"
              onClick={handleSave}
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #C84B31, #ea580c)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                height: "44px",
                padding: "0 24px",
                boxShadow: "0 4px 15px rgba(200, 75, 49, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  {editingTemple ? "Saving Changes..." : "Creating Temple..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editingTemple ? "Save Changes" : "Create Temple"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          style={{
            background: "#1e293b",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "20px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                color: "#fff",
                fontSize: "17px",
                fontWeight: 800,
                fontFamily: "Poppins, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={16} color="#EF4444" />
              </div>
              Delete Temple
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                fontFamily: "Poppins, sans-serif",
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#fff" }}>
                {deleteTarget?.name}
              </strong>
              ? This will also remove all associated zone data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-temple"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "linear-gradient(135deg, #EF4444, #dc2626)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {deleting ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Temple
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
