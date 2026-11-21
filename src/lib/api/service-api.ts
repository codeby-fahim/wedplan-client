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

export type ServiceRecord = ServicePayload & {
  id: string;
  vendorId: string;
  status: ServiceStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
