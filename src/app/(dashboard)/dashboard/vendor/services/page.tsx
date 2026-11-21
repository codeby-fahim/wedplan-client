import DashboardPage from "@/components/shared/dashboard-page";
import VendorServicesList from "@/components/shared/vendor-services-list";

export const metadata = { title: "My Services" };

export default function VendorServicesPage() {
  return (
    <DashboardPage
      title="My Services"
      description="Manage the wedding services you have published and track approval status."
    >
      <VendorServicesList />
    </DashboardPage>
  );
}
