import DashboardShell from "@/components/shared/dashboard-shell";
import { requireRole } from "@/lib/dashboard";

// Role verification reads the session on the server; allow this route to block.
export const instant = false;

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRole("vendor");

  return (
    <DashboardShell role="vendor" user={user}>
      {children}
    </DashboardShell>
  );
}
