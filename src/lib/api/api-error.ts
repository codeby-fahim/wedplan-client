/** A 401 means the session is gone — send the user back to sign in rather
 *  than leaving them staring at a stale dashboard with failing requests.
 *  A 403 with a "blocked" message means an admin revoked access. */
export function guardResponse(status: number, message?: unknown): void {
  if (typeof window === "undefined") return;

  const text = typeof message === "string" ? message : "";
  const go = (path: string) =>
    window.location.assign(new URL(path, window.location.origin).toString());

  if (status === 401) {
    go("/sign-in?error=session");
  } else if (status === 403 && /blocked/i.test(text)) {
    go("/sign-in?error=blocked");
  }
}

/** Kept for callers that know they have no token at all. */
export function missingToken(): void {
  guardResponse(401);
}
