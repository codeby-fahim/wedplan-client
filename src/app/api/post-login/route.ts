import { auth } from "@/lib/auth";

/** Shared post-authentication landing: resolves the role server-side and
 *  redirects vendors and customers to their own areas. Used by the Google
 *  OAuth callback (and safe to use for credential login too). */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.redirect(new URL("/sign-in?error=session", request.url));
  }

  const role = (session.user as { role?: string }).role;
  const destination = role === "vendor" ? "/dashboard" : "/";

  return Response.redirect(new URL(destination, request.url));
}
