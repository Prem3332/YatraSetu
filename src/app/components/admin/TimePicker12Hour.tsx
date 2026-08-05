import { useState, useRef, useEffect } from "react";

export const TimePicker12Hour = ({ value, onChange, id }: { value: string; onChange: (val: string) => void; id?: string }) => {
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
