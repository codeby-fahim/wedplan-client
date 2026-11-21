/** A 401 means the session is gone — send the user back to sign in rather
 *  than leaving them staring at a stale dashboard with failing requests. */
export function handleUnauthorized(status: number): void {
  if (typeof window !== "undefined" && status === 401) {
    window.location.assign(
      new URL("/sign-in?error=session", window.location.origin).toString()
    );
  }
}

export function missingToken(): void {
  if (typeof window !== "undefined") {
    window.location.assign(
      new URL("/sign-in?error=session", window.location.origin).toString()
    );
  }
}
