import DashboardShell from "@/components/shared/dashboard-shell";
import { requireRole } from "@/lib/dashboard";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRole("admin");

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  );
}
