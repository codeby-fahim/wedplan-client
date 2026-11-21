import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { ServiceApiError } from "@/lib/api/service-api";
import { guardResponse, missingToken } from "@/lib/api/api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
};

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "admin" | "vendor" | "customer";
  isBlocked: boolean;
  businessName?: string | null;
  subscriptionPlan: "free" | "premium";
  image?: string | null;
  createdAt?: string;
};

export type AdminTransaction = {
  id: string;
  vendorId: string | null;
  vendorName: string;
  vendorEmail: string | null;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string | null;
};

async function getAuthHeader(): Promise<HeadersInit> {
  const token = await getTokenFromClient();

  if (!token) {
    missingToken();
    throw new ServiceApiError("Your session has expired. Please sign in again.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${BASE_URL}/admin/stats`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    stats?: AdminStats;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.stats) {
    throw new ServiceApiError(result?.message ?? "Could not load admin dashboard.");
  }
  return result.stats;
}

export async function getAdminUsers(filters: {
  search?: string;
  role?: string;
}): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.role) params.set("role", filters.role);

  const query = params.toString();
  const response = await fetch(`${BASE_URL}/admin/users${query ? `?${query}` : ""}`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    users?: AdminUser[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.users) {
    throw new ServiceApiError(result?.message ?? "Could not load users.");
  }
  return result.users;
}

export async function setUserBlocked(
  id: string,
  isBlocked: boolean
): Promise<AdminUser> {
  const response = await fetch(`${BASE_URL}/admin/users/${id}/block`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ isBlocked }),
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    user?: AdminUser;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.user) {
    throw new ServiceApiError(result?.message ?? "Could not update the user.");
  }
  return result.user;
}

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/admin/services/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success) {
    throw new ServiceApiError(result?.message ?? "Could not delete the service.");
  }
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const response = await fetch(`${BASE_URL}/admin/transactions`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    transactions?: AdminTransaction[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.transactions) {
    throw new ServiceApiError(result?.message ?? "Could not load transactions.");
  }
  return result.transactions;
}
