import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDashboardHref, isDashboardRole } from "@/lib/dashboard-routes";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your WedPlan account settings.",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  if (!isDashboardRole(session.user.role)) {
    redirect("/sign-in?error=session");
  }

  redirect(`${getDashboardHref(session.user.role)}/profile`);
}
