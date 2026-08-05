import { request } from "./client";

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
