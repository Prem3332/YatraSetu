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
    throw new Error(data.message || "Request failed");
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

export async function deleteTemple(id: string): Promise<void> {
  await request<{ success: boolean; message: string }>(`/temples/${id}`, {
    method: "DELETE",
  });
}
