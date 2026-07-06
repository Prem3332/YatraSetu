/**
 * Shared types for YatraSetu frontend.
 * Canonical Temple type lives in api.ts — re-exported here for convenience.
 */

export type { Temple, TempleTiming, SlotConfiguration } from "./api";

/**
 * User object returned by GET /api/auth/me (after sanitizeUser on backend).
 * The backend maps Prisma `id` → `_id`.
 */
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: "devotee" | "temple_admin" | "police" | "medical";
  templeAssigned?: string | null;
  isAccessible: boolean;
  language: "en" | "gu" | "hi";
  fcmToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
