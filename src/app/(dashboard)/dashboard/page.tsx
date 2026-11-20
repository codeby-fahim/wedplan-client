import { redirect } from "next/navigation";

import { getDashboardHref } from "@/lib/dashboard-routes";
import { requireRole } from "@/lib/dashboard";

export default async function DashboardIndexPage() {
  const { role } = await requireRole("vendor", "customer", "admin");
  redirect(getDashboardHref(role));
}
