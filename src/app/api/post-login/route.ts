import { getAuth } from "@/lib/auth";
import { getSafeCallbackHref } from "@/lib/dashboard-routes";

/** Shared post-authentication landing: resolves the role server-side and
 *  redirects vendors and customers to their own areas. Used by the Google
 *  OAuth callback (and safe to use for credential login too). */
export async function GET(request: Request) {
  let session: Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>> = null;

  try {
    session = await getAuth().api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("[post-login] session read failed:", error);
  }

  if (!session?.user) {
    return Response.redirect(new URL("/sign-in?error=session", request.url));
  }

  if ((session.user as { isBlocked?: boolean }).isBlocked) {
    return Response.redirect(new URL("/sign-in?error=blocked", request.url));
  }

  const role = (session.user as { role?: string }).role;
  const callbackUrl = new URL(request.url).searchParams.get("callbackUrl");
  const destination = getSafeCallbackHref(callbackUrl, role);

  return Response.redirect(new URL(destination, request.url));
}
