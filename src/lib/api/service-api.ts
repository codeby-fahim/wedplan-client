import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { guardResponse, missingToken } from "@/lib/api/api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ServiceStatus = "pending" | "approved" | "rejected";

export type ServicePayload = {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
};

export type ServiceVendor = {
  name: string | null;
  businessName: string | null;
  image: string | null;
  subscriptionPlan: "free" | "premium";
};

export type ServiceRecord = ServicePayload & {
  id: string;
  vendorId: string;
  vendor?: ServiceVendor | null;
  status: ServiceStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorStats = {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  subscriptionPlan: "free" | "premium";
  activeServiceLimit: number | null;
};

export class ServiceApiError extends Error {
  readonly errors?: string[];

  constructor(message: string, errors?: string[]) {
    super(message);
    this.name = "ServiceApiError";
    this.errors = errors;
  }
}

async function getAuthHeader(): Promise<HeadersInit> {
  const token = await getTokenFromClient();

  if (!token) {
    missingToken();
    throw new ServiceApiError("Your session has expired. Please sign in again.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function addService(payload: ServicePayload): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/add-service`, {
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
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not submit your service. Please try again.",
      result?.errors
    );
  }

  return result.service;
}

export async function getAdminServices(
  filters: { search?: string; category?: string; status?: string } = {}
): Promise<ServiceRecord[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.status?.trim()) params.set("status", filters.status.trim());

  const query = params.toString();
  const response = await fetch(`${BASE_URL}/admin/services${query ? `?${query}` : ""}`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.services) {
    throw new ServiceApiError(
      result?.message ?? "Could not load services. Please try again."
    );
  }

  return result.services;
}

export async function updateServiceStatus(
  id: string,
  status: ServiceStatus
): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/admin/services/${id}/status`, {
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
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not update the service. Please try again."
    );
  }

  return result.service;
}

export type ServiceFilters = {
  search?: string;
  category?: string;
  location?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getPublicServices(
  filters: ServiceFilters = {}
): Promise<ServiceRecord[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.location?.trim()) params.set("location", filters.location.trim());
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);

  const query = params.toString();
  const response = await fetch(`${BASE_URL}/services${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.services) {
    throw new ServiceApiError(
      result?.message ?? "Could not load services. Please try again."
    );
  }

  return result.services;
}

export async function getMyServices(): Promise<ServiceRecord[]> {
  const response = await fetch(`${BASE_URL}/my-services`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.services) {
    throw new ServiceApiError(
      result?.message ?? "Could not load your services. Please try again."
    );
  }

  return result.services;
}

export async function getVendorStats(): Promise<VendorStats> {
  const response = await fetch(`${BASE_URL}/vendor/stats`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    stats?: VendorStats;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.stats) {
    throw new ServiceApiError(
      result?.message ?? "Could not load your dashboard. Please try again."
    );
  }

  return result.stats;
}

export async function getVendorServiceById(id: string): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/vendor/services/${id}`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not load the service. Please try again."
    );
  }

  return result.service;
}

export async function updateService(
  id: string,
  payload: ServicePayload
): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/vendor/services/${id}`, {
    method: "PATCH",
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
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not update the service. Please try again.",
      result?.errors
    );
  }

  return result.service;
}

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/vendor/services/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success) {
    throw new ServiceApiError(
      result?.message ?? "Could not delete the service. Please try again."
    );
  }
}

export async function setServiceAvailability(
  id: string,
  isActive: boolean
): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/vendor/services/${id}/availability`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ isActive }),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not update availability. Please try again."
    );
  }

  return result.service;
}

export async function getFeaturedServices(): Promise<ServiceRecord[]> {
  const response = await fetch(`${BASE_URL}/featured-services`, {
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.services) {
    throw new ServiceApiError(
      result?.message ?? "Could not load featured services. Please try again."
    );
  }

  return result.services;
}

export async function getPublicServiceById(id: string): Promise<ServiceRecord> {
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    service?: ServiceRecord;
  } | null;

  guardResponse(response.status, result?.message);
  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not load the service. Please try again."
    );
  }

  return result.service;
}
