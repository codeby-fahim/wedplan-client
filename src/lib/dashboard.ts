import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  getDashboardHref,
  isDashboardRole,
  type DashboardRole,
} from "@/lib/dashboard-routes";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

/** Read the current better-auth session on the server. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Require any signed-in user. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/** Require a signed-in user with one of the allowed roles.
 *  A role mismatch redirects to that user's own dashboard instead of
 *  rendering anything from the requested page. */
export async function requireRole(...allowed: DashboardRole[]) {
  const session = await requireSession();
  const role = session.user.role;

  if (!isDashboardRole(role)) redirect("/");
  if (!allowed.includes(role)) redirect(getDashboardHref(role));

  return {
    role,
    user: session.user as SessionUser,
  };
}
