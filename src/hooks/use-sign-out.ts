"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

/** Signs out and returns the visitor to the public home page. The auth
 *  atom updates as part of signOut(), so the navbar switches instantly. */
export function useSignOut() {
  const router = useRouter();

  return async function signOut() {
    await authClient.signOut();
    router.replace("/");
  };
}
