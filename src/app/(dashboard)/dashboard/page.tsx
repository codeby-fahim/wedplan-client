import { redirect } from "next/navigation";

import { getDashboardHref } from "@/lib/dashboard-routes";
import { requireRole } from "@/lib/dashboard";

// Role verification reads the session on the server; allow this route to block.
export const instant = false;

export default async function DashboardIndexPage() {
  const { role } = await requireRole("vendor", "customer", "admin");
  redirect(getDashboardHref(role));
}
