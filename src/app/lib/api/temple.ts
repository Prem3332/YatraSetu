import { request } from "./client";

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
