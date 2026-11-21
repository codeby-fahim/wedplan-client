import DashboardPage from "@/components/shared/dashboard-page";
import VendorOverview from "@/components/shared/vendor-overview";

export const metadata = { title: "Vendor Overview" };

export default function VendorOverviewPage() {
  return (
    <DashboardPage
      title="Overview"
      description="Welcome back. Here's what's happening with your wedding business."
    >
      <VendorOverview />
    </DashboardPage>
  );
}
