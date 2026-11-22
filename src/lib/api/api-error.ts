/** A 401 from a single API call does NOT mean the user is signed out — the
 *  JWT endpoint can fail transiently on serverless. Dashboard access is
 *  already guarded by the proxy + server layouts, so just log and let the
 *  component show its error/retry state instead of bouncing to /sign-in.
 *  An explicitly blocked account IS a hard access revocation, so redirect. */
export function guardResponse(status: number, message?: unknown): void {
  if (typeof window === "undefined") return;

  const text = typeof message === "string" ? message : "";

  if (status === 401) {
    console.warn("[api] unauthorized response:", text || "no message");
    return;
  }

  if (status === 403 && /blocked/i.test(text)) {
    window.location.assign(
      new URL("/sign-in?error=blocked", window.location.origin).toString()
    );
  }
}

/** Kept for callers that know they have no token at all. */
export function missingToken(): void {
  console.warn("[api] no JWT available for this request");
}
