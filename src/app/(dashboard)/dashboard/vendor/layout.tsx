import DashboardShell from "@/components/shared/dashboard-shell";
import { requireRole } from "@/lib/dashboard";

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
