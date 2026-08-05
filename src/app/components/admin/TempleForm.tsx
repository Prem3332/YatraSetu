import { useState, useEffect } from "react";
import { Plus, Loader2, Save, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  createTemple as apiCreateTemple,
  updateTemple as apiUpdateTemple,
  type Temple,
  type CreateTemplePayload,
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
} from "../ui/dialog";
import { TimePicker12Hour } from "./TimePicker12Hour";

interface TempleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templeToEdit: Temple | null;
  onSuccess: () => void;
}

export function TempleForm({ isOpen, onOpenChange, templeToEdit, onSuccess }: TempleFormProps) {
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

  useEffect(() => {
    if (isOpen) {
      if (templeToEdit) {
        setFormName(templeToEdit.name);
        setFormSlug(templeToEdit.slug);
        setFormCity(templeToEdit.city || "");
        setFormLat(templeToEdit.lat ? String(templeToEdit.lat) : "");
        setFormLng(templeToEdit.lng ? String(templeToEdit.lng) : "");
        setFormCapacity(templeToEdit.totalCapacity ? String(templeToEdit.totalCapacity) : "");
        if (templeToEdit.timings && templeToEdit.timings.length > 0) {
          setFormOpenTime(templeToEdit.timings[0].open || "");
          setFormCloseTime(templeToEdit.timings[0].close || "");
        } else {
          setFormOpenTime("");
          setFormCloseTime("");
        }
        if (templeToEdit.slotConfigurations && templeToEdit.slotConfigurations.length > 0) {
          setFormSlots(templeToEdit.slotConfigurations.map(sc => ({
            startTime: sc.startTime,
            endTime: sc.endTime,
            capacity: String(sc.capacity),
          })));
        } else {
          setFormSlots([]);
        }
      } else {
        // Reset form for new temple
        setFormName("");
        setFormSlug("");
        setFormCity("");
        setFormLat("");
        setFormLng("");
        setFormCapacity("");
        setFormOpenTime("");
        setFormCloseTime("");
        setFormSlots([]);
      }
    }
  }, [isOpen, templeToEdit]);

  const handleAddSlot = () => setFormSlots([...formSlots, { startTime: "", endTime: "", capacity: "" }]);
  const handleRemoveSlot = (idx: number) => setFormSlots(formSlots.filter((_, i) => i !== idx));
  const handleSlotChange = (idx: number, field: "startTime" | "endTime" | "capacity", value: string) => {
    const newSlots = [...formSlots];
    newSlots[idx][field] = value;
    setFormSlots(newSlots);
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
    payload.slotConfigurations = validSlots.map(s => ({
      startTime: s.startTime.trim(),
      endTime: s.endTime.trim(),
      capacity: parseInt(s.capacity, 10) || 0
    }));

    try {
      setSubmitting(true);
      if (templeToEdit) {
        await apiUpdateTemple(templeToEdit._id, payload);
        toast.success(`Temple "${formName}" updated successfully`);
      } else {
        await apiCreateTemple(payload);
        toast.success(`Temple "${formName}" created successfully`);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save temple";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="admin-modal"
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          fontFamily: "Poppins, sans-serif",
          maxWidth: "760px",
          width: "90vw",
          padding: 0,
          overflow: "hidden",
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
              {templeToEdit ? "Edit Temple" : "Add New Temple"}
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
                <div></div>
              </div>

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
            onClick={() => onOpenChange(false)}
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
                {templeToEdit ? "Saving Changes..." : "Creating Temple..."}
              </>
            ) : (
              <>
                <Save size={16} />
                {templeToEdit ? "Save Changes" : "Create Temple"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
