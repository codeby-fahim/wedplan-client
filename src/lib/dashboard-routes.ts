/** Pure, client-safe dashboard route helpers. No server imports here. */

export const DASHBOARD_ROLES = ["vendor", "customer", "admin"] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export function isDashboardRole(value: unknown): value is DashboardRole {
  return (
    typeof value === "string" &&
    (DASHBOARD_ROLES as readonly string[]).includes(value)
  );
}

export const DASHBOARD_LABELS: Record<DashboardRole, string> = {
  vendor: "Vendor Dashboard",
  customer: "Customer Dashboard",
  admin: "Admin Dashboard",
};

/** Always send a user to their own dashboard, never to another role's. */
export function getDashboardHref(role: unknown): string {
  if (role === "vendor") return "/dashboard/vendor";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}

/** Keep only internal deep links inside the signed-in user's own dashboard.
 *  Anything else falls back to that role's dashboard overview. */
export function getSafeCallbackHref(callbackUrl: unknown, role: unknown): string {
  const home = getDashboardHref(role);

  if (typeof callbackUrl !== "string") return home;

  // Service details and the profile shortcut are valid for any signed-in role.
  if (
    /^\/services\/[A-Za-z0-9]+$/.test(callbackUrl) ||
    callbackUrl === "/profile"
  ) {
    return callbackUrl;
  }

  if (
    !/^\/dashboard\/[A-Za-z0-9/_-]*$/.test(callbackUrl) ||
    (callbackUrl !== home && !callbackUrl.startsWith(`${home}/`))
  ) {
    return home;
  }

  return callbackUrl;
}
