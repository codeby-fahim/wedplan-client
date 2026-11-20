import { requireSession } from "@/lib/dashboard";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First gate: every /dashboard route requires a valid server session.
  await requireSession();

  return <>{children}</>;
}
