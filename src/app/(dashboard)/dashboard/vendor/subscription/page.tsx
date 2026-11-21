import DashboardPage from "@/components/shared/dashboard-page";
import VendorSubscription from "@/components/shared/vendor-subscription";

export const metadata = { title: "Subscription" };

export default function VendorSubscriptionPage() {
  return (
    <DashboardPage
      title="Subscription"
      description="Manage your WedPlan plan, billing and premium benefits."
    >
      <VendorSubscription />
    </DashboardPage>
  );
}
