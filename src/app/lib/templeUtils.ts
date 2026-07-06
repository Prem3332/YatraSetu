/**
 * Temple selection utilities for YatraSetu Admin Dashboard.
 *
 * These helpers read from localStorage so they can be used outside
 * React components (e.g. in data-fetching functions).
 */

const STORAGE_KEY = "yatrasetu_selected_temple";

/**
 * Get the currently selected temple ID from localStorage.
 * All future dashboard API calls should use this value to filter data
 * by the active temple.
 *
 * @returns The selected temple's `_id`, or `null` if none is stored.
 */
export function getSelectedTempleId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist a temple ID to localStorage.
 * Called internally by TempleContext — prefer using `setSelectedTemple`
 * from the context rather than calling this directly.
 */
export function setStoredTempleId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
}

/**
 * Clear the stored temple selection.
 */
export function clearStoredTempleId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
