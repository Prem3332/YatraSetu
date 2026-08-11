import { request } from "./client";

export interface AdminBooking {
  id: string;
  tokenNumber: number;
  userName: string;
  userPhone: string;
  peopleCount: number;
  status: "booked" | "serving" | "completed" | "cancelled";
  bookingTime: string;
  templeName: string;
  templeId?: string;
  slotTime: string;
  slotDate: string;
  queueId?: string;
  currentToken?: number;
}

export interface AdminBookingsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminBookingsResponse {
  success: boolean;
  bookings: AdminBooking[];
  pagination: AdminBookingsPagination;
}

export interface AdminQueue {
  id: string;
  temple: { id: string; name: string };
  date: string;
  timeSlot: string;
  totalCapacity: number;
  bookedCount: number;
  availableSlots: number;
  currentToken: number;
  status: "open" | "full" | "closed";
}

export interface AdminQueueSlot {
  id: string;
  tokenNumber: number;
  userName: string;
  userPhone: string;
  peopleCount: number;
  status: string;
  bookingTime: string;
}

export interface AdminStatistics {
  todaysBookings: number;
  totalCapacity: number;
  availableSlots: number;
  completed: number;
  cancelled: number;
  serving: number;
  currentToken: number;
  nextToken: number | null;
}

export interface BookingFilters {
  temple?: string;
  date?: string;
  status?: string;
  slot?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export async function fetchAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingsResponse> {
  const queryParams = new URLSearchParams();
  if (filters.temple) queryParams.append("temple", filters.temple);
  if (filters.date) queryParams.append("date", filters.date);
  if (filters.status && filters.status !== "All") queryParams.append("status", filters.status.toLowerCase());
  if (filters.slot) queryParams.append("slot", filters.slot);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.sort) queryParams.append("sort", filters.sort);
  if (filters.order) queryParams.append("order", filters.order);

  const queryStr = queryParams.toString();
  const url = `/admin/bookings${queryStr ? `?${queryStr}` : ""}`;
  return await request<AdminBookingsResponse>(url);
}

export async function fetchAdminQueues(filters: { templeId?: string; date?: string; status?: string } = {}): Promise<AdminQueue[]> {
  const queryParams = new URLSearchParams();
  if (filters.templeId) queryParams.append("templeId", filters.templeId);
  if (filters.date) queryParams.append("date", filters.date);
  if (filters.status) queryParams.append("status", filters.status);

  const queryStr = queryParams.toString();
  const data = await request<{ success: boolean; queues: AdminQueue[] }>(`/admin/queues${queryStr ? `?${queryStr}` : ""}`);
  return data.queues;
}

export async function fetchAdminQueueSlots(queueId: string): Promise<AdminQueueSlot[]> {
  const data = await request<{ success: boolean; queue: any; slots: AdminQueueSlot[] }>(`/admin/queues/${encodeURIComponent(queueId)}/slots`);
  return data.slots;
}

export async function updateSlotStatus(slotId: string, status: "booked" | "serving" | "completed" | "cancelled"): Promise<AdminBooking> {
  const data = await request<{ success: boolean; message: string; booking: AdminBooking }>(`/admin/slots/${encodeURIComponent(slotId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.booking;
}

export async function fetchAdminStatistics(templeId?: string): Promise<AdminStatistics> {
  const queryStr = templeId ? `?templeId=${encodeURIComponent(templeId)}` : "";
  const data = await request<{ success: boolean; statistics: AdminStatistics }>(`/admin/statistics${queryStr}`);
  return data.statistics;
}

export async function deleteAdminSlot(slotId: string): Promise<void> {
  await request<{ success: boolean; message: string }>(`/admin/slots/${encodeURIComponent(slotId)}`, {
    method: "DELETE",
  });
}
