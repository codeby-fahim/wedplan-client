import CustomerOverview from "@/components/shared/customer-overview";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Customer Overview" };

export default function CustomerOverviewPage() {
  return (
    <DashboardPage
      title="Overview"
      description="Welcome back. Let's keep planning your perfect day."
    >
      <CustomerOverview />
    </DashboardPage>
  );
}
