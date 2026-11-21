import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { ServiceApiError } from "@/lib/api/service-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function authHeader(): Promise<HeadersInit> {
  const token = await getTokenFromClient();

  if (!token) {
    throw new ServiceApiError("Your session has expired. Please sign in again.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function createCheckoutSession(): Promise<string> {
  const response = await fetch(`${BASE_URL}/vendor/subscription/checkout`, {
    method: "POST",
    headers: await authHeader(),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    url?: string;
  } | null;

  if (!response.ok || !result?.success || !result.url) {
    throw new ServiceApiError(
      result?.message ?? "Could not start checkout. Please try again."
    );
  }

  return result.url;
}

export async function verifyPayment(sessionId: string): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/vendor/subscription/verify?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: await authHeader(), cache: "no-store" }
  );

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!response.ok || !result?.success) {
    throw new ServiceApiError(
      result?.message ?? "Could not verify your payment. Please try again."
    );
  }
}
