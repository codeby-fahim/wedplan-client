import { requireSession } from "@/lib/dashboard";

// Session checks read headers(), so this tree must be allowed to block
// instead of producing a static shell during prerendering.
export const instant = false;

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First gate: every /dashboard route requires a valid server session.
  await requireSession();

  return <>{children}</>;
}
