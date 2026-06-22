import { useState, useEffect } from "react";
import { Plus, Trash2, Building2, Loader2, MapPin, Users, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";

import {
  fetchTemples as apiFetchTemples,
  createTemple as apiCreateTemple,
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

export function TempleManager() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async () => {
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
      await apiCreateTemple(payload);
      toast.success(`Temple "${formName}" created successfully`);
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
          onClick={() => setAddOpen(true)}
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
            onClick={() => setAddOpen(true)}
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
                    style={{ padding: "16px", textAlign: "right" }}
                  >
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
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            fontFamily: "Poppins, sans-serif",
            maxHeight: "85vh",
            overflow: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#fff",
                fontSize: "18px",
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
                  background: "linear-gradient(135deg, #C84B31, #ea580c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={16} color="#fff" />
              </div>
              Add New Temple
            </DialogTitle>
            <DialogDescription
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Fill in the temple details below. Name and slug are required.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "8px" }}>
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label
                htmlFor="temple-name"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Name <span style={{ color: "#C84B31" }}>*</span>
              </Label>
              <Input
                id="temple-name"
                placeholder="e.g. Somnath Temple"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </div>

            {/* Slug */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label
                htmlFor="temple-slug"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Slug <span style={{ color: "#C84B31" }}>*</span>
              </Label>
              <Input
                id="temple-slug"
                placeholder="e.g. somnath"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                }}
              />
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "11px",
                  margin: 0,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                lowercase, no spaces — e.g. &apos;somnath&apos;
              </p>
            </div>

            {/* City */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label
                htmlFor="temple-city"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                City
              </Label>
              <Input
                id="temple-city"
                placeholder="e.g. Veraval"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </div>

            {/* Lat / Lng row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label
                  htmlFor="temple-lat"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Latitude
                </Label>
                <Input
                  id="temple-lat"
                  type="number"
                  step="any"
                  placeholder="20.8880"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label
                  htmlFor="temple-lng"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Longitude
                </Label>
                <Input
                  id="temple-lng"
                  type="number"
                  step="any"
                  placeholder="70.4012"
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Capacity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label
                htmlFor="temple-capacity"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Total Capacity
              </Label>
              <Input
                id="temple-capacity"
                type="number"
                placeholder="5000"
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </div>

            {/* Timings row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label
                  htmlFor="temple-open"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock size={12} /> Opening Time
                </Label>
                <Input
                  id="temple-open"
                  placeholder="6:00 AM"
                  value={formOpenTime}
                  onChange={(e) => setFormOpenTime(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label
                  htmlFor="temple-close"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock size={12} /> Closing Time
                </Label>
                <Input
                  id="temple-close"
                  placeholder="9:30 PM"
                  value={formCloseTime}
                  onChange={(e) => setFormCloseTime(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Custom Slots row */}
            <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <Label
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Custom Booking Slots
                </Label>
                <Button 
                  onClick={handleAddSlot}
                  variant="outline"
                  size="sm"
                  style={{ height: "24px", padding: "0 8px", fontSize: "11px", background: "rgba(255,255,255,0.06)", color: "#C84B31", border: "1px solid rgba(200, 75, 49, 0.3)" }}
                >
                  + Add Slot
                </Button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                {formSlots.map((slot, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Input
                      placeholder="e.g. 5:00 AM"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", height: "30px" }}
                    />
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>-</span>
                    <Input
                      placeholder="e.g. 7:00 AM"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", height: "30px" }}
                    />
                    <Input
                      placeholder="Capacity"
                      type="number"
                      value={slot.capacity}
                      onChange={(e) => handleSlotChange(idx, "capacity", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", height: "30px", width: "80px" }}
                    />
                    <button onClick={() => handleRemoveSlot(idx)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                ))}
                {formSlots.length === 0 && (
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, fontStyle: "italic" }}>No custom slots. Default slots will be used.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter style={{ marginTop: "8px" }}>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={submitting}
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
            </Button>
            <Button
              id="submit-add-temple"
              onClick={handleCreate}
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #C84B31, #ea580c)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 4px 15px rgba(200, 75, 49, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Creating…
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create Temple
                </>
              )}
            </Button>
          </DialogFooter>
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
