"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { getSafeCallbackHref } from "@/lib/dashboard-routes";

/** Safety net for auth pages: if a session already exists (e.g. after a
 *  redirect race), send the user straight to their role dashboard. */
export default function AuthRedirectGuard() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user) return;

    const role = (session.user as { role?: string }).role;
    const destination = getSafeCallbackHref(null, role);

    window.location.assign(
      new URL(destination, window.location.origin).toString()
    );
  }, [session, isPending]);

  return null;
}
