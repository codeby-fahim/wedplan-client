import { getTokenFromClient } from "@/lib/getTokenFromClient";

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

  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not submit your service. Please try again.",
      result?.errors
    );
  }

  return result.service;
}

export async function getAdminServices(): Promise<ServiceRecord[]> {
  const response = await fetch(`${BASE_URL}/admin/services`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

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

  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not update the service. Please try again."
    );
  }

  return result.service;
}

export async function getPublicServices(): Promise<ServiceRecord[]> {
  const response = await fetch(`${BASE_URL}/services`, {
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    services?: ServiceRecord[];
  } | null;

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

  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not update availability. Please try again."
    );
  }

  return result.service;
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

  if (!response.ok || !result?.success || !result.service) {
    throw new ServiceApiError(
      result?.message ?? "Could not load the service. Please try again."
    );
  }

  return result.service;
}
