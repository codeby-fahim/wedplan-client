import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { ServiceApiError } from "@/lib/api/service-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type SubscriptionStatus = {
  plan: "free" | "premium";
  transaction: {
    plan: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  } | null;
};

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

/** Read-only — the browser cannot activate a plan through this endpoint. */
export async function getSubscriptionStatus(
  sessionId?: string
): Promise<SubscriptionStatus> {
  const query = sessionId
    ? `?sessionId=${encodeURIComponent(sessionId)}`
    : "";
  const response = await fetch(
    `${BASE_URL}/vendor/subscription/status${query}`,
    { headers: await authHeader(), cache: "no-store" }
  );

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    plan?: "free" | "premium";
    transaction?: SubscriptionStatus["transaction"];
  } | null;

  if (!response.ok || !result?.success) {
    throw new ServiceApiError(
      result?.message ?? "Could not load your payment status. Please try again."
    );
  }

  return {
    plan: result.plan ?? "free",
    transaction: result.transaction ?? null,
  };
}
