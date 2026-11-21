import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { ServiceApiError } from "@/lib/api/service-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type CustomerStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

export type BookingRecord = {
  id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  serviceImage: string | null;
  vendorName?: string | null;
  vendorBusinessName?: string | null;
  vendorImage?: string | null;
  price: number;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingPayload = {
  serviceId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
};

async function getAuthHeader(): Promise<HeadersInit> {
  const token = await getTokenFromClient();

  if (!token) {
    throw new ServiceApiError("Your session has expired. Please sign in again.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function getVendorBookings(): Promise<BookingRecord[]> {
  const response = await fetch(`${BASE_URL}/vendor/bookings`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    bookings?: BookingRecord[];
  } | null;

  if (!response.ok || !result?.success || !result.bookings) {
    throw new ServiceApiError(
      result?.message ?? "Could not load booking requests. Please try again."
    );
  }

  return result.bookings;
}

export async function updateBookingStatus(
  id: string,
  status: Extract<BookingStatus, "accepted" | "rejected">
): Promise<BookingRecord> {
  const response = await fetch(`${BASE_URL}/vendor/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ status }),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    booking?: BookingRecord;
  } | null;

  if (!response.ok || !result?.success || !result.booking) {
    throw new ServiceApiError(
      result?.message ?? "Could not update the request. Please try again."
    );
  }

  return result.booking;
}

export async function createBooking(payload: BookingPayload): Promise<BookingRecord> {
  const response = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    errors?: string[];
    booking?: BookingRecord;
  } | null;

  if (!response.ok || !result?.success || !result.booking) {
    throw new ServiceApiError(
      result?.message ?? "Could not send your request. Please try again.",
      result?.errors
    );
  }

  return result.booking;
}

export async function getCustomerStats(): Promise<CustomerStats> {
  const response = await fetch(`${BASE_URL}/customer/stats`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    stats?: CustomerStats;
  } | null;

  if (!response.ok || !result?.success || !result.stats) {
    throw new ServiceApiError(
      result?.message ?? "Could not load your dashboard. Please try again."
    );
  }

  return result.stats;
}

export async function cancelBooking(id: string): Promise<BookingRecord> {
  const response = await fetch(`${BASE_URL}/customer/bookings/${id}/cancel`, {
    method: "PATCH",
    headers: await getAuthHeader(),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    booking?: BookingRecord;
  } | null;

  if (!response.ok || !result?.success || !result.booking) {
    throw new ServiceApiError(
      result?.message ?? "Could not cancel your request. Please try again."
    );
  }

  return result.booking;
}

export async function getCustomerBookings(): Promise<BookingRecord[]> {
  const response = await fetch(`${BASE_URL}/customer/bookings`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    bookings?: BookingRecord[];
  } | null;

  if (!response.ok || !result?.success || !result.bookings) {
    throw new ServiceApiError(
      result?.message ?? "Could not load your bookings. Please try again."
    );
  }

  return result.bookings;
}
