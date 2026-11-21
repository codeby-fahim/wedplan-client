import AdminOverview from "@/components/shared/admin-overview";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Admin Overview" };

export default function AdminOverviewPage() {
  return (
    <DashboardPage
      title="Overview"
      description="A snapshot of everything happening across WedPlan."
    >
      <AdminOverview />
    </DashboardPage>
  );
}
