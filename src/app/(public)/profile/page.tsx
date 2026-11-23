import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { getDashboardHref, isDashboardRole } from "@/lib/dashboard-routes";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your WedPlan account settings.",
};

// This page verifies the session on the server before redirecting, so it is
// allowed to block instead of producing an instant navigation.
export const instant = false;

export default async function ProfilePage() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  if (!isDashboardRole(session.user.role)) {
    redirect("/sign-in?error=session");
  }

  redirect(`${getDashboardHref(session.user.role)}/profile`);
}
