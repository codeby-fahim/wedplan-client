"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { getSafeCallbackHref } from "@/lib/dashboard-routes";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [message, setMessage] = useState("Redirecting...");

  useEffect(() => {
    queueMicrotask(() => {
      if (isPending) return;

      if (!session) {
        router.replace("/sign-in?callbackUrl=/profile");
        return;
      }

      const role = (session.user as { role?: string }).role;
      setMessage("Opening your profile settings...");
      router.replace(`${getSafeCallbackHref(null, role)}/profile`);
    });
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <p className="muted-text text-sm">{message}</p>
    </main>
  );
}
