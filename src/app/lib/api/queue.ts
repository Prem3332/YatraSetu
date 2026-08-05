import { request } from "./client";

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

export interface DailyTraffic {
  totalCapacity: number;
  totalBooked: number;
  totalAvailable: number;
}

export async function fetchMonthlyAvailability(
  templeId: string,
  year: number,
  month: number
): Promise<Record<string, DailyTraffic>> {
  const data = await request<{ success: boolean; dailyTraffic: Record<string, DailyTraffic> }>(
    `/queues/monthly-availability?templeId=${encodeURIComponent(templeId)}&year=${year}&month=${month}`
  );
  return data.dailyTraffic;
}

export async function fetchTodayTrafficForAll(): Promise<Record<string, DailyTraffic>> {
  const data = await request<{ success: boolean; todayTraffic: Record<string, DailyTraffic> }>(
    `/queues/today-traffic`
  );
  return data.todayTraffic;
}

export interface BookingPayload {
  templeId: string;
  date: string;
  timeSlot: string;
  peopleCount: number;
  name: string;
  phone: string;
}

export interface BookSlotResponse {
  success: boolean;
  message: string;
  booking: {
    id: string;
    tokenNumber: number;
    peopleCount: number;
    status: string;
    slotDate: string;
    slotTime: string;
    bookingTime: string;
  };
}

export async function bookDarshanSlot(payload: BookingPayload): Promise<BookSlotResponse> {
  return await request<BookSlotResponse>("/queues/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface BookingQueueInfo {
  id: string;
  totalCapacity: number;
  bookedCount: number;
  availableSpots: number;
  currentToken: number;
  status: "open" | "full" | "closed";
}

export interface BookingTempleInfo {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

export interface BookingDetail {
  id: string;
  tokenNumber: number;
  peopleCount: number;
  status: "booked" | "serving" | "completed" | "cancelled" | "expired";
  slotDate: string;
  slotTime: string;
  bookingTime: string;
  temple: BookingTempleInfo;
  queue: BookingQueueInfo;
}

export interface NearbyToken {
  tokenNumber: number;
  status: string;
  isYou?: boolean;
}

export interface MyBookingResponse {
  booking: BookingDetail | null;
  position: number;
  estimatedWaitMinutes: number;
  nearbyTokens: NearbyToken[];
}

export async function fetchMyBooking(slotId: string): Promise<MyBookingResponse> {
  const data = await request<{ success: boolean } & MyBookingResponse>(
    `/queues/my-booking/${encodeURIComponent(slotId)}`
  );
  return {
    booking: data.booking,
    position: data.position,
    estimatedWaitMinutes: data.estimatedWaitMinutes,
    nearbyTokens: data.nearbyTokens,
  };
}

export async function fetchMyActiveBooking(): Promise<MyBookingResponse | null> {
  const data = await request<{ success: boolean; booking: BookingDetail | null; position?: number; estimatedWaitMinutes?: number; nearbyTokens?: NearbyToken[] }>(
    "/queues/my-active-booking"
  );
  if (!data.booking) return null;
  return {
    booking: data.booking,
    position: data.position ?? 0,
    estimatedWaitMinutes: data.estimatedWaitMinutes ?? 0,
    nearbyTokens: data.nearbyTokens ?? [],
  };
}

export async function cancelMyBooking(slotId: string): Promise<void> {
  await request<{ success: boolean; message: string }>(
    `/queues/booking/${encodeURIComponent(slotId)}`,
    { method: "DELETE" }
  );
}
