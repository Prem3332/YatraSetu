import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, AlertCircle, Loader2, RefreshCw, Lock, Search } from "lucide-react";
import { useTemple } from "../../context/TempleContext";
import type { Temple } from "../../lib/api";

export function TempleSelector() {
  const {
    temples,
    selectedTemple,
    setSelectedTemple,
    refreshTemples,
    loading,
    error,
    isTempleAssigned,
  } = useTemple();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = "temple-selector-listbox";

  // ── Filtered temples ──────────────────────────────────────

  const filteredTemples = temples.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.city && t.city.toLowerCase().includes(q)) ||
      (t.state && t.state.toLowerCase().includes(q))
    );
  });

  // ── Click outside to close ────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Focus search on open ──────────────────────────────────

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // ── Keyboard navigation ───────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          if (!isTempleAssigned) setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredTemples.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredTemples.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredTemples.length) {
            handleSelect(filteredTemples[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, filteredTemples, highlightedIndex, isTempleAssigned]
  );

  // ── Select handler ────────────────────────────────────────

  const handleSelect = (temple: Temple) => {
    setSelectedTemple(temple);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  // ── Toggle ────────────────────────────────────────────────

  const toggleDropdown = () => {
    if (isTempleAssigned) return;
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  };

  // ── Format temple subtitle ────────────────────────────────

  const getSubtitle = (temple: Temple): string => {
    const parts: string[] = [];
    if (temple.city) parts.push(temple.city);
    if (temple.state) parts.push(temple.state);
    return parts.join(", ");
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative" }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        id="temple-selector-trigger"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={selectedTemple ? `Selected temple: ${selectedTemple.name}` : "Select a temple"}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2"
        style={{
          background: "#FFF3E8",
          border: "1px solid #FED7AA",
          cursor: isTempleAssigned ? "default" : "pointer",
          opacity: isTempleAssigned ? 0.85 : 1,
          transition: "all 0.15s",
          position: "relative",
        }}
        title={isTempleAssigned ? "Temple assigned by system administrator" : undefined}
      >
        {loading ? (
          <>
            <Loader2
              size={14}
              color="#C84B31"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31" }}>
              Loading…
            </span>
          </>
        ) : error ? (
          <>
            <AlertCircle size={14} color="#EF4444" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#EF4444" }}>
              Error
            </span>
          </>
        ) : selectedTemple ? (
          <>
            <span style={{ fontSize: "12px" }}>🛕</span>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31", display: "block", lineHeight: 1.2 }}>
                {selectedTemple.name}
              </span>
              {getSubtitle(selectedTemple) && (
                <span style={{ fontSize: "9px", color: "#9ca3af", display: "block", lineHeight: 1.2 }}>
                  {getSubtitle(selectedTemple)}
                </span>
              )}
            </div>
            {isTempleAssigned ? (
              <Lock size={12} color="#9ca3af" />
            ) : (
              <ChevronDown
                size={14}
                color="#C84B31"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            )}
          </>
        ) : (
          <>
            <span style={{ fontSize: "12px" }}>🛕</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C84B31" }}>
              No Temple
            </span>
            <ChevronDown size={14} color="#C84B31" />
          </>
        )}
      </button>

      {/* Tooltip for assigned temple */}
      {isTempleAssigned && (
        <style>{`
          #temple-selector-trigger:hover::after {
            content: "Temple assigned by system administrator";
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #2D4238;
            color: #fff;
            font-size: 10px;
            font-family: Poppins, sans-serif;
            padding: 4px 10px;
            border-radius: 6px;
            white-space: nowrap;
            z-index: 9999;
            pointer-events: none;
          }
        `}</style>
      )}

      {/* Spin keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "300px",
            maxHeight: "360px",
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(45, 66, 56,0.08)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "dropdownFadeIn 0.15s ease-out",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Search */}
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid rgba(45, 66, 56, 0.08)",
            }}
          >
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: "#F5F0E6",
                border: "1px solid rgba(45, 66, 56, 0.08)",
              }}
            >
              <Search size={14} color="#9ca3af" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search temple..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search temples"
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "12px",
                  color: "#2D4238",
                  fontFamily: "Poppins, sans-serif",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Temple list */}
          <div
            id={listboxId}
            role="listbox"
            aria-label="Temple list"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px",
            }}
          >
            {error ? (
              /* Error state */
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <AlertCircle
                  size={28}
                  color="#EF4444"
                  style={{ margin: "0 auto 8px" }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#EF4444",
                    margin: "0 0 4px 0",
                  }}
                >
                  Unable to load temples
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    margin: "0 0 12px 0",
                  }}
                >
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => refreshTemples()}
                  className="flex items-center gap-1.5"
                  style={{
                    margin: "0 auto",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "#FEE2E2",
                    color: "#EF4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : loading ? (
              /* Loading state */
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                }}
              >
                <Loader2
                  size={24}
                  color="#C84B31"
                  style={{ margin: "0 auto", animation: "spin 1s linear infinite" }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    margin: "8px 0 0 0",
                  }}
                >
                  Loading temples…
                </p>
              </div>
            ) : filteredTemples.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>
                  🛕
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2D4238",
                    margin: "0 0 4px 0",
                  }}
                >
                  {searchQuery.trim()
                    ? "No temples found"
                    : "No temples exist"}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    margin: 0,
                  }}
                >
                  {searchQuery.trim()
                    ? `No results for "${searchQuery}"`
                    : "Add a temple from Manage Temples"}
                </p>
              </div>
            ) : (
              /* Temple options */
              filteredTemples.map((temple, index) => {
                const isSelected = selectedTemple?._id === temple._id;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={temple._id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`temple-option-${temple._id}`}
                    onClick={() => handleSelect(temple)}
                    className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-2.5"
                    style={{
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Poppins, sans-serif",
                      background: isSelected
                        ? "rgba(200, 75, 49, 0.08)"
                        : isHighlighted
                        ? "rgba(45, 66, 56, 0.05)"
                        : "transparent",
                      borderLeft: isSelected
                        ? "3px solid #C84B31"
                        : "3px solid transparent",
                      transition: "all 0.1s",
                      marginBottom: "2px",
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isSelected
                          ? "linear-gradient(135deg, #FFF3E8, #FED7AA)"
                          : "#F5F0E6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      🛕
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? "#C84B31" : "#2D4238",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {temple.name}
                      </p>
                      {getSubtitle(temple) && (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#9ca3af",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSubtitle(temple)}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#C84B31",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
