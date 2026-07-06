const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getAuthToken(): string | null {
  return localStorage.getItem("yatrasetu_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    // Attach extra fields from the response to the error for downstream handling
    const error = new Error(data.message || "Request failed") as any;
    error.requiresVerification = data.requiresVerification || false;
    error.email = data.email || null;
    throw error;
  }

  return data;
}

export interface TempleTiming {
  day: string;
  open: string;
  close: string;
}

export interface SlotConfiguration {
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface Temple {
  _id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  totalCapacity?: number;
  timings?: TempleTiming[];
  slotConfigurations?: SlotConfiguration[];
  zones?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplePayload {
  name: string;
  slug: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  totalCapacity?: number;
  timings?: TempleTiming[];
  slotConfigurations?: SlotConfiguration[];
}

export async function fetchTemples(): Promise<Temple[]> {
  const data = await request<{ success: boolean; temples: Temple[] }>("/temples");
  return data.temples;
}

export async function createTemple(payload: CreateTemplePayload): Promise<Temple> {
  const data = await request<{ success: boolean; temple: Temple }>("/temples", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.temple;
}

export async function updateTemple(id: string, payload: Partial<CreateTemplePayload>): Promise<Temple> {
  const data = await request<{ success: boolean; temple: Temple }>(`/temples/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.temple;
}

export async function deleteTemple(id: string): Promise<void> {
  await request<{ success: boolean; message: string }>(`/temples/${id}`, {
    method: "DELETE",
  });
}

/**
 * Fetch the currently authenticated user's profile.
 * Calls GET /api/auth/me — requires a valid JWT in localStorage.
 */
export interface ApiUser {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: "devotee" | "temple_admin" | "police" | "medical";
  templeAssigned?: string | null;
  isAccessible: boolean;
  isVerified: boolean;
  language: "en" | "gu" | "hi";
  fcmToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const data = await request<{ success: boolean; user: ApiUser }>("/auth/me");
  return data.user;
}

export interface SlotAvailability {
  time: string;
  capacity: number;
  booked: number;
  available: number;
  status: "open" | "full";
}

export async function fetchSlotAvailability(templeId: string, date: string): Promise<SlotAvailability[]> {
  const data = await request<{ success: boolean; slots: SlotAvailability[] }>(
    `/queues/availability?templeId=${encodeURIComponent(templeId)}&date=${encodeURIComponent(date)}`
  );
  return data.slots;
}

export interface BookingPayload {
  templeId: string;
  date: string;
  timeSlot: string;
  peopleCount: number;
  name: string;
  phone: string;
}

export async function bookDarshanSlot(payload: BookingPayload): Promise<any> {
  return await request<{ success: boolean; message: string; booking: any }>("/queues/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── System Settings (Maintenance Mode) ─────────────────────

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  estimatedCompletion: string | null;
  updatedAt: string | null;
}

export async function fetchSystemSettings(): Promise<SystemSettings> {
  const data = await request<{ success: boolean; settings: SystemSettings }>("/system/settings");
  return data.settings;
}

export async function updateSystemSettings(
  payload: Partial<Pick<SystemSettings, "maintenanceMode" | "maintenanceMessage" | "estimatedCompletion">>
): Promise<SystemSettings> {
  const data = await request<{ success: boolean; settings: SystemSettings }>("/system/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.settings;
}

// ── Auth (Signup / Login / OTP Verification) ───────────────

export interface SignupPayload {
  fullName: string;
  gender: string;
  age: number;
  mobile: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  const data = await request<SignupResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.fullName,
      phone: payload.mobile,
      email: payload.email,
      password: payload.password,
      gender: payload.gender,
      age: payload.age,
    }),
  });
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

// ── OTP Verification ───────────────────────────────────────

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export async function verifyEmail(email: string, otp: string): Promise<VerifyEmailResponse> {
  const data = await request<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  return data;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export async function resendOtp(email: string): Promise<ResendOtpResponse> {
  const data = await request<ResendOtpResponse>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data;
}
