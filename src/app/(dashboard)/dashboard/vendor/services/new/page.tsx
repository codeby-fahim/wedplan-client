import AddServiceForm from "@/components/shared/add-service-form";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Add Service" };

export default function VendorAddServicePage() {
  return (
    <DashboardPage
      title="Add Service"
      description="Publish a new wedding service for couples to discover."
    >
      <AddServiceForm />
    </DashboardPage>
  );
}
